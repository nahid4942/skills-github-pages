/**
 * BLKPAPER Google Sheets Integration
 * Google Apps Script to receive orders from website and save to spreadsheet
 * 
 * SETUP INSTRUCTIONS:
 * 1. Go to https://script.google.com/
 * 2. Create a new project
 * 3. Replace the default code with this script
 * 4. Set up the spreadsheet (see setupSpreadsheet function)
 * 5. Deploy as web app
 * 6. Copy the web app URL to your website's GOOGLE_SHEETS_CONFIG.scriptURL
 */

// Configuration
const CONFIG = {
    SHEET_NAME: 'BLKPAPER Orders',
    TIMEZONE: 'Asia/Dhaka'
};

// Get spreadsheet ID from script properties (persistent storage)
function getSpreadsheetId() {
    return PropertiesService.getScriptProperties().getProperty('BLKPAPER_SPREADSHEET_ID');
}

// Set spreadsheet ID in script properties
function setSpreadsheetId(spreadsheetId) {
    PropertiesService.getScriptProperties().setProperty('BLKPAPER_SPREADSHEET_ID', spreadsheetId);
}

/**
 * Main function to handle incoming POST requests from website
 */
function doPost(e) {
    try {
        // Parse incoming payload
        const data = e.postData && e.postData.contents ? JSON.parse(e.postData.contents) : {};

        // If this is a sendReport action, handle server-side PDF/email
        if(data.action === 'sendReport'){
            const recipients = Array.isArray(data.recipients) ? data.recipients : (typeof data.recipients === 'string' ? data.recipients.split(',').map(s=>s.trim()) : []);
            const rangeDays = Number(data.rangeDays) || 7;
            try{
                const raw = getAllOrders();
                const normalized = raw.map(normalizeOrderRow);
                const now = new Date();
                const since = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (rangeDays - 1));
                const recent = normalized.filter(o=>{ const d = o.createdAt ? new Date(o.createdAt) : null; return d && d >= since; });
                const reportHtml = buildReportHtmlForNormalized(recent, since, now);
                const pdfBlob = HtmlService.createHtmlOutput(reportHtml).getAs('application/pdf').setName('BLKPAPER_report.pdf');
                const subject = 'BLKPAPER Report '+ Utilities.formatDate(since, Session.getScriptTimeZone(), 'yyyy-MM-dd') + ' - ' + Utilities.formatDate(now, Session.getScriptTimeZone(), 'yyyy-MM-dd');
                const options = {htmlBody: reportHtml, attachments: [pdfBlob]};
                let sent = 0;
                recipients.forEach(r=>{ if(r && r.indexOf('@')>-1){ try{ MailApp.sendEmail(r, subject, 'Please find attached the BLKPAPER report.', options); sent++; }catch(e){ console.log('sendReport failure to %s: %s', r, e.message); } } });
                return ContentService.createTextOutput(JSON.stringify({status:'ok',sentTo:sent})).setMimeType(ContentService.MimeType.JSON);
            }catch(err){ return ContentService.createTextOutput(JSON.stringify({status:'error',message:err.message})).setMimeType(ContentService.MimeType.JSON); }
        }

        // Otherwise treat as order payload (original behavior)
        const sheet = getOrCreateSheet();
        addOrderToSheet(sheet, data);
        return ContentService.createTextOutput(JSON.stringify({status:'success',message:'Order saved successfully',orderId:data.orderId})).setMimeType(ContentService.MimeType.JSON);
    } catch (error) {
        console.error('Error processing order:', error);
        return ContentService.createTextOutput(JSON.stringify({status:'error',message:error.toString()})).setMimeType(ContentService.MimeType.JSON);
    }
}

/**
 * Handle GET requests (for testing)
 */
function doGet(e) {
    try{
        const action = (e && e.parameter && e.parameter.action) ? String(e.parameter.action) : '';
        if(action === 'getOrders'){
            // Return normalized orders as JSON. Support optional ?since=YYYY-MM-DD
            const raw = getAllOrders();
            const normalized = raw.map(normalizeOrderRow);
            const sinceParam = (e && e.parameter && e.parameter.since) ? String(e.parameter.since) : '';
            if(sinceParam){
                let sinceDate = null;
                try{ sinceDate = new Date(sinceParam); if(isNaN(sinceDate.getTime())) sinceDate = null; }catch(_){ sinceDate = null; }
                if(sinceDate){
                    const filtered = normalized.filter(o=>{ const d = o.createdAt ? new Date(o.createdAt) : null; return d && d >= sinceDate; });
                    return ContentService.createTextOutput(JSON.stringify({orders:filtered})).setMimeType(ContentService.MimeType.JSON);
                }
            }
            return ContentService.createTextOutput(JSON.stringify({orders:normalized})).setMimeType(ContentService.MimeType.JSON);
        }
        if(action === 'info'){
            const info = getSpreadsheetInfo();
            return ContentService.createTextOutput(JSON.stringify(info)).setMimeType(ContentService.MimeType.JSON);
        }
        return ContentService
            .createTextOutput(JSON.stringify({status:'ok',message:'BLKPAPER Order System running'}))
            .setMimeType(ContentService.MimeType.JSON);
    }catch(err){
        return ContentService.createTextOutput(JSON.stringify({status:'error',message:err.message})).setMimeType(ContentService.MimeType.JSON);
    }
}

// Normalize a row object (as returned by getAllOrders) into the shape expected by admin UI
function normalizeOrderRow(row){
    // row keys are header names like 'Order ID','Order Date','Total (৳)','Timestamp', etc.
    const get = key => (row[key] !== undefined && row[key] !== null) ? row[key] : '';
    const createdAt = get('Timestamp') || get('Order Date') || get('orderDate') || new Date().toISOString();
    const totalRaw = get('Total (৳)') || get('Total') || get('total') || 0;
    const total = Number(String(totalRaw).toString().replace(/[^0-9.\-]/g,'')) || 0;
    const customer = { name: get('Customer Name') || get('customerName') || '', email: get('Customer Email') || get('customerEmail') || '', phone: get('Customer Phone') || get('customerPhone') || '', address: get('Customer Address') || '' };
    return {
        orderId: get('Order ID') || get('orderId') || '',
        createdAt: createdAt,
        payment: get('Payment Method') || get('payment') || '',
        subtotal: Number(get('Subtotal (৳)') || get('subtotal') || 0) || 0,
        tax: 0,
        total: total,
        profit: 0,
        customer: customer,
        items: []
    };
}

/**
 * Get existing sheet or create new one (FIXED: Uses persistent storage)
 */
function getOrCreateSheet() {
    let spreadsheet;
    let spreadsheetId = getSpreadsheetId();
    
    // Try to get existing spreadsheet
    if (spreadsheetId) {
        try {
            spreadsheet = SpreadsheetApp.openById(spreadsheetId);
            console.log('Using existing spreadsheet:', spreadsheetId);
        } catch (error) {
            console.log('Stored spreadsheet not accessible, creating new one...');
            spreadsheet = null;
        }
    }
    
    // Create new spreadsheet only if none exists or is accessible
    if (!spreadsheet) {
        spreadsheet = SpreadsheetApp.create('BLKPAPER Orders Database');
        const newSpreadsheetId = spreadsheet.getId();
        
        // Store the spreadsheet ID persistently
        setSpreadsheetId(newSpreadsheetId);
        
        console.log('Created new spreadsheet:', newSpreadsheetId);
        console.log('All future orders will use this spreadsheet');
    }
    
    // Get or create the orders sheet
    let sheet = spreadsheet.getSheetByName(CONFIG.SHEET_NAME);
    
    if (!sheet) {
        sheet = spreadsheet.insertSheet(CONFIG.SHEET_NAME);
        setupSpreadsheetHeaders(sheet);
        console.log('Created new sheet:', CONFIG.SHEET_NAME);
    }
    
    return sheet;
}

/**
 * Set up the spreadsheet headers
 */
function setupSpreadsheetHeaders(sheet) {
    const headers = [
        'Order ID',
        'Order Date',
        'Status',
        'Customer Name',
        'Customer Phone',
        'Customer Email',
        'Customer Address',
        'Customer City',
        'Payment Method',
        'Order Notes',
        'Items Count',
        'Items Details',
        'Subtotal (৳)',
        'Shipping (৳)',
        'Total (৳)',
        'Estimated Delivery',
        'Source',
        'Timestamp',
        'Actions'
    ];
    
    // Set headers in row 1
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setValues([headers]);
    
    // Format headers
    headerRange.setBackground('#000000');
    headerRange.setFontColor('#FFFFFF');
    headerRange.setFontWeight('bold');
    headerRange.setFontSize(11);
    
    // Set column widths
    sheet.setColumnWidths(1, headers.length, 120);
    sheet.setColumnWidth(1, 150); // Order ID
    sheet.setColumnWidth(4, 200); // Customer Name
    sheet.setColumnWidth(7, 300); // Customer Address
    sheet.setColumnWidth(12, 400); // Items Details
    
    // Freeze header row
    sheet.setFrozenRows(1);
    
    // Add data validation and formatting
    setupDataValidation(sheet);
    
    console.log('Spreadsheet headers set up successfully');
}

/**
 * Add data validation and conditional formatting
 */
function setupDataValidation(sheet) {
    // Status column validation
    const statusRule = SpreadsheetApp.newDataValidation()
        .requireValueInList(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'])
        .setAllowInvalid(false)
        .build();
    
    // Apply to status column (column 3) starting from row 2
    sheet.getRange('C2:C1000').setDataValidation(statusRule);
    
    // Add conditional formatting for status
    const conditionalRules = [
        // Pending - Yellow
        SpreadsheetApp.newConditionalFormatRule()
            .whenTextEqualTo('pending')
            .setBackground('#FFF3CD')
            .setRanges([sheet.getRange('C2:C1000')])
            .build(),
        
        // Confirmed - Light Blue
        SpreadsheetApp.newConditionalFormatRule()
            .whenTextEqualTo('confirmed')
            .setBackground('#D1ECF1')
            .setRanges([sheet.getRange('C2:C1000')])
            .build(),
        
        // Processing - Orange
        SpreadsheetApp.newConditionalFormatRule()
            .whenTextEqualTo('processing')
            .setBackground('#FCE4EC')
            .setRanges([sheet.getRange('C2:C1000')])
            .build(),
        
        // Shipped - Purple
        SpreadsheetApp.newConditionalFormatRule()
            .whenTextEqualTo('shipped')
            .setBackground('#E1BEE7')
            .setRanges([sheet.getRange('C2:C1000')])
            .build(),
        
        // Delivered - Green
        SpreadsheetApp.newConditionalFormatRule()
            .whenTextEqualTo('delivered')
            .setBackground('#D4EDDA')
            .setRanges([sheet.getRange('C2:C1000')])
            .build(),
        
        // Cancelled - Red
        SpreadsheetApp.newConditionalFormatRule()
            .whenTextEqualTo('cancelled')
            .setBackground('#F8D7DA')
            .setRanges([sheet.getRange('C2:C1000')])
            .build()
    ];
    
    sheet.setConditionalFormatRules(conditionalRules);
}

/**
 * Add order data to spreadsheet
 */
function addOrderToSheet(sheet, orderData) {
    // Prepare row data
    const rowData = [
        orderData.orderId,
        orderData.orderDate,
        orderData.status,
        orderData.customerName,
        orderData.customerPhone,
        orderData.customerEmail,
        orderData.customerAddress,
        orderData.customerCity,
        orderData.paymentMethod,
        orderData.orderNotes,
        orderData.itemsCount,
        orderData.itemsDetails,
        orderData.subtotal,
        orderData.shipping,
        orderData.total,
        orderData.estimatedDelivery,
        orderData.source,
        orderData.timestamp,
        'New Order' // Actions column
    ];
    
    // Find the next empty row
    const lastRow = sheet.getLastRow();
    const nextRow = lastRow + 1;
    
    // Insert the data
    const range = sheet.getRange(nextRow, 1, 1, rowData.length);
    range.setValues([rowData]);
    
    // Format the new row
    formatOrderRow(sheet, nextRow);
    
    // Sort by timestamp (newest first)
    if (lastRow > 1) {
        const dataRange = sheet.getRange(2, 1, lastRow - 1, rowData.length);
        dataRange.sort([{column: 18, ascending: false}]); // Sort by timestamp column
    }
    
    console.log(`Order ${orderData.orderId} added to row ${nextRow}`);
    
    // Send notification email (optional)
    sendOrderNotificationEmail(orderData);
}

/**
 * Format a new order row
 */
function formatOrderRow(sheet, row) {
    const range = sheet.getRange(row, 1, 1, 19);
    
    // Alternate row colors
    if (row % 2 === 0) {
        range.setBackground('#F8F9FA');
    }
    
    // Set borders
    range.setBorder(true, true, true, true, false, false);
    
    // Format currency columns
    sheet.getRange(row, 13, 1, 3).setNumberFormat('#,##0" ৳"');
    
    // Format date columns
    sheet.getRange(row, 2).setNumberFormat('dd/mm/yyyy hh:mm');
    sheet.getRange(row, 16).setNumberFormat('dd/mm/yyyy');
    
    // Highlight new orders
    sheet.getRange(row, 19).setBackground('#FFEB3B').setFontWeight('bold');
}

/**
 * Send email notification for new orders (optional)
 */
function sendOrderNotificationEmail(orderData) {
    try {
        // Get email settings from script properties
        const notificationEmail = PropertiesService.getScriptProperties().getProperty('NOTIFICATION_EMAIL');
        
        if (!notificationEmail) {
            console.log('No notification email configured');
            return;
        }
        
        const subject = `🖤 New BLKPAPER Order: ${orderData.orderId}`;
        
        const htmlBody = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: #000; color: #fff; padding: 20px; text-align: center;">
                    <h1>🖤 New Order Received</h1>
                </div>
                
                <div style="padding: 20px; background: #f8f9fa;">
                    <h2>Order Details</h2>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr><td><strong>Order ID:</strong></td><td>${orderData.orderId}</td></tr>
                        <tr><td><strong>Date:</strong></td><td>${orderData.orderDate}</td></tr>
                        <tr><td><strong>Customer:</strong></td><td>${orderData.customerName}</td></tr>
                        <tr><td><strong>Phone:</strong></td><td>${orderData.customerPhone}</td></tr>
                        <tr><td><strong>Email:</strong></td><td>${orderData.customerEmail}</td></tr>
                        <tr><td><strong>Address:</strong></td><td>${orderData.customerAddress}, ${orderData.customerCity}</td></tr>
                        <tr><td><strong>Payment:</strong></td><td>${orderData.paymentMethod}</td></tr>
                        <tr><td><strong>Total:</strong></td><td>৳${orderData.total}</td></tr>
                    </table>
                    
                    <h3>Items Ordered</h3>
                    <p>${orderData.itemsDetails}</p>
                    
                    ${orderData.orderNotes ? `<h3>Notes</h3><p>${orderData.orderNotes}</p>` : ''}
                </div>
                
                <div style="padding: 20px; text-align: center; background: #000; color: #fff;">
                    <p>Visit your <a href="https://docs.google.com/spreadsheets/d/${getSpreadsheetId()}" style="color: #fff;">Google Sheets</a> to manage this order.</p>
                </div>
            </div>
        `;
        
        GmailApp.sendEmail(notificationEmail, subject, '', {
            htmlBody: htmlBody
        });
        
        console.log('Order notification email sent');
        
    } catch (error) {
        console.error('Failed to send notification email:', error);
    }
}

/**
 * Setup function - run this once to configure the system
 * IMPORTANT: Run this function first to create the main spreadsheet
 */
function setupBLKPAPEROrderSystem() {
    // Create spreadsheet and set up headers
    const sheet = getOrCreateSheet();
    
    // Get the spreadsheet ID for reference
    const spreadsheetId = getSpreadsheetId();
    
    // Set notification email (optional)
    const email = Browser.inputBox('Setup', 'Enter email for order notifications (optional):', Browser.Buttons.OK_CANCEL);
    if (email && email !== 'cancel') {
        PropertiesService.getScriptProperties().setProperty('NOTIFICATION_EMAIL', email);
    }
    
    console.log('BLKPAPER Order System setup complete!');
    console.log('Spreadsheet ID:', spreadsheetId);
    console.log('Spreadsheet URL:', 'https://docs.google.com/spreadsheets/d/' + spreadsheetId);
    console.log('ALL ORDERS will be saved to this single spreadsheet');
    console.log('Deploy this script as a web app and copy the URL to your website.');
    
    // Display setup confirmation
    Browser.msgBox('Setup Complete!', 
        'BLKPAPER Order System is ready!\\n\\n' +
        'Spreadsheet ID: ' + spreadsheetId + '\\n\\n' +
        'All orders will be saved to this single spreadsheet.\\n' +
        'Deploy as web app and update your website with the script URL.',
        Browser.Buttons.OK);
}

/**
 * Test function to verify the system is working
 */
function testOrderSystem() {
    const testData = {
        orderId: 'TEST' + Date.now(),
        orderDate: new Date().toLocaleString('en-GB', {timeZone: CONFIG.TIMEZONE}),
        status: 'test',
        customerName: 'Test Customer',
        customerPhone: '01700000000',
        customerEmail: 'test@example.com',
        customerAddress: 'Test Address',
        customerCity: 'Dhaka',
        paymentMethod: 'COD',
        orderNotes: 'This is a test order',
        itemsCount: 2,
        itemsDetails: 'Test Product 1 (Qty: 1, Price: ৳500) | Test Product 2 (Qty: 1, Price: ৳300)',
        subtotal: 800,
        shipping: 100,
        total: 900,
        estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB'),
        source: 'Test System',
        timestamp: new Date().toISOString()
    };
    
    const sheet = getOrCreateSheet();
    addOrderToSheet(sheet, testData);
    
    console.log('Test order added successfully!');
}

/**
 * Utility function to get all orders (for analysis)
 */
function getAllOrders() {
    const sheet = getOrCreateSheet();
    const data = sheet.getDataRange().getValues();
    
    // Convert to array of objects
    const headers = data[0];
    const orders = data.slice(1).map(row => {
        const order = {};
        headers.forEach((header, index) => {
            order[header] = row[index];
        });
        return order;
    });
    
    return orders;
}

/**
 * Generate daily sales report
 */
function generateDailySalesReport() {
    const orders = getAllOrders();
    const today = new Date().toDateString();
    
    const todayOrders = orders.filter(order => {
        const orderDate = new Date(order['Order Date']).toDateString();
        return orderDate === today;
    });
    
    const totalSales = todayOrders.reduce((sum, order) => {
        return sum + (parseFloat(order['Total (৳)']) || 0);
    }, 0);
    
    console.log(`Daily Sales Report for ${today}:`);
    console.log(`Orders: ${todayOrders.length}`);
    console.log(`Total Sales: ৳${totalSales.toLocaleString()}`);
    
    return {
        date: today,
        orderCount: todayOrders.length,
        totalSales: totalSales,
        orders: todayOrders
    };
}

/**
 * Get current spreadsheet information
 */
function getSpreadsheetInfo() {
    const spreadsheetId = getSpreadsheetId();
    
    if (!spreadsheetId) {
        console.log('No spreadsheet configured. Run setupBLKPAPEROrderSystem() first.');
        return null;
    }
    
    try {
        const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
        const sheet = spreadsheet.getSheetByName(CONFIG.SHEET_NAME);
        const orderCount = sheet ? sheet.getLastRow() - 1 : 0; // Subtract header row
        
        return {
            spreadsheetId: spreadsheetId,
            spreadsheetName: spreadsheet.getName(),
            spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${spreadsheetId}`,
            sheetName: CONFIG.SHEET_NAME,
            orderCount: orderCount,
            lastUpdated: new Date().toISOString()
        };
    } catch (error) {
        console.error('Error accessing spreadsheet:', error);
        return null;
    }
}

/**
 * Reset the system (creates new spreadsheet)
 * WARNING: This will create a new spreadsheet and lose reference to the old one
 */
function resetSystem() {
    const confirmation = Browser.msgBox('Reset System', 
        'This will create a NEW spreadsheet for orders.\\n\\n' +
        'Your existing orders will NOT be deleted, but future orders will go to the new spreadsheet.\\n\\n' +
        'Are you sure?', 
        Browser.Buttons.YES_NO);
    
    if (confirmation === Browser.Buttons.YES) {
        // Clear stored spreadsheet ID
        PropertiesService.getScriptProperties().deleteProperty('BLKPAPER_SPREADSHEET_ID');
        
        // Create new spreadsheet
        const sheet = getOrCreateSheet();
        const newSpreadsheetId = getSpreadsheetId();
        
        console.log('System reset complete!');
        console.log('New Spreadsheet ID:', newSpreadsheetId);
        console.log('New Spreadsheet URL:', 'https://docs.google.com/spreadsheets/d/' + newSpreadsheetId);
        
        Browser.msgBox('Reset Complete!', 
            'New spreadsheet created!\\n\\n' +
            'Spreadsheet ID: ' + newSpreadsheetId + '\\n\\n' +
            'All future orders will use this new spreadsheet.',
            Browser.Buttons.OK);
    }
}

/**
 * Check system status
 */
function checkSystemStatus() {
    console.log('🖤 BLKPAPER Order System Status');
    console.log('================================');
    
    const info = getSpreadsheetInfo();
    
    if (info) {
        console.log('✅ System is properly configured');
        console.log('Spreadsheet Name:', info.spreadsheetName);
        console.log('Spreadsheet ID:', info.spreadsheetId);
        console.log('Sheet Name:', info.sheetName);
        console.log('Total Orders:', info.orderCount);
        console.log('Spreadsheet URL:', info.spreadsheetUrl);
    } else {
        console.log('❌ System not configured properly');
        console.log('Run setupBLKPAPEROrderSystem() to initialize');
    }
    
    // Check email notifications
    const notificationEmail = PropertiesService.getScriptProperties().getProperty('NOTIFICATION_EMAIL');
    console.log('Email Notifications:', notificationEmail || 'Not configured');
    
    console.log('================================');
    
    return info;
}

function buildReportHtmlForNormalized(orders, sinceDate, toDate){
    const totalOrders = orders.length;
    const totalSales = orders.reduce((s,o)=>s + (Number(o.total)||0),0);
    const totalProfit = orders.reduce((s,o)=>s + (Number(o.profit)||0),0);
    // top products not available (items empty), so show empty table if no data
    const topProducts = [];
    const pay = {};
    orders.forEach(o=>{ const m = (o.payment||'unknown').toString().toLowerCase(); pay[m] = (pay[m]||0) + (Number(o.total)||0); });
    const customers = {};
    orders.forEach(o=>{ const c = o.customer||{}; const key = (c.email && c.email.trim()) || (c.name && c.name.trim()) || ('guest-'+(o.orderId||Math.random())); customers[key] = (customers[key]||0) + 1; });
    let newCust=0, returningCust=0; Object.values(customers).forEach(cnt=> cnt>1 ? returningCust++ : newCust++);
    const tz = Session.getScriptTimeZone();
    const period = Utilities.formatDate(sinceDate, tz, 'yyyy-MM-dd') + ' — ' + Utilities.formatDate(toDate, tz, 'yyyy-MM-dd');

    const rows = topProducts.map(p=> `<tr><td>${p.name}</td><td style="text-align:right">${p.qty}</td></tr>`).join('') || '<tr><td colspan="2">No product-level data available</td></tr>';
    const payRows = Object.keys(pay).map(k=>`<tr><td>${k.toUpperCase()}</td><td style="text-align:right">${pay[k].toFixed(2)}</td></tr>`).join('') || '<tr><td colspan="2">No payments</td></tr>';
    const recentRows = orders.slice().reverse().slice(0,30).map(o=>`<tr><td>${o.orderId||''}</td><td>${(o.customer && (o.customer.name||o.customer.email))||'Guest'}</td><td style="text-align:right">${(Number(o.total)||0).toFixed(2)}</td><td>${o.createdAt||''}</td></tr>`).join('') || '<tr><td colspan="4">No orders</td></tr>';

    return `<!doctype html><html><head><meta charset="utf-8"><title>BLKPAPER Report</title><style>body{font-family:Arial,Helvetica,sans-serif;color:#111;padding:18px}h1{font-size:18px}table{width:100%;border-collapse:collapse}th,td{padding:6px;border:1px solid #ddd;text-align:left}th{background:#f6f7f9}</style></head><body>` +
    `<h1>BLKPAPER — Business Report</h1><div><strong>Period:</strong> ${period}</div>` +
    `<div style="margin-top:12px"><strong>Total Orders:</strong> ${totalOrders} &nbsp; <strong>Total Sales:</strong> ${totalSales.toFixed(2)} &nbsp; <strong>Total Profit:</strong> ${totalProfit.toFixed(2)}</div>` +
    `<h3 style="margin-top:14px">Top Products</h3><table><thead><tr><th>Product</th><th>Qty</th></tr></thead><tbody>${rows}</tbody></table>` +
    `<h3 style="margin-top:14px">Payment Summary</h3><table><thead><tr><th>Method</th><th>Total</th></tr></thead><tbody>${payRows}</tbody></table>` +
    `<h3 style="margin-top:14px">Recent Orders</h3><table><thead><tr><th>Order</th><th>Customer</th><th>Total</th><th>Date</th></tr></thead><tbody>${recentRows}</tbody></table>` +
    `<div style="margin-top:18px;font-size:12px;color:#666">Generated: ${Utilities.formatDate(new Date(), tz, 'yyyy-MM-dd HH:mm')}</div></body></html>`;
}