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
        // Parse incoming payload. Support both JSON body and form-encoded 'payload' param.
        const raw = (e && e.parameter && e.parameter.payload) ? e.parameter.payload : (e.postData && e.postData.contents ? e.postData.contents : null);
        let data = {};
        if (raw) {
            try { data = JSON.parse(raw); } catch (err) { data = {}; }
        }

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
        // Ensure endpoint: creates spreadsheet and sheet if missing and returns info
        if (action === 'ensure') {
            try {
                const sheet = getOrCreateSheet();
                const info = getSpreadsheetInfo();
                return ContentService.createTextOutput(JSON.stringify({status:'ok',message:'ensured',info:info})).setMimeType(ContentService.MimeType.JSON);
            } catch (err) {
                return ContentService.createTextOutput(JSON.stringify({status:'error',message:err.message})).setMimeType(ContentService.MimeType.JSON);
            }
        }
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
        // Create a new spreadsheet (name optional) and set it as the active BLKPAPER spreadsheet
        if (action === 'createSheet') {
            try {
                const name = (e && e.parameter && e.parameter.name) ? String(e.parameter.name) : null;
                const info = createNewSpreadsheet(name);
                return ContentService.createTextOutput(JSON.stringify({status:'ok',message:'created',info:info})).setMimeType(ContentService.MimeType.JSON);
            } catch (err) {
                return ContentService.createTextOutput(JSON.stringify({status:'error',message:err.message})).setMimeType(ContentService.MimeType.JSON);
            }
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
    // Defensive: if sheet is not provided, try to obtain or create it
    if (!sheet) {
        console.log('setupSpreadsheetHeaders called with undefined sheet — attempting to get or create sheet');
        try {
            sheet = getOrCreateSheet();
        } catch (err) {
            console.error('Failed to obtain sheet in setupSpreadsheetHeaders:', err);
            throw new Error('No sheet available to setup headers: ' + err.message);
        }
    }

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
    try {
        const headerRange = sheet.getRange(1, 1, 1, headers.length);
        headerRange.setValues([headers]);

        // Format headers
        headerRange.setBackground('#000000');
        headerRange.setFontColor('#FFFFFF');
        headerRange.setFontWeight('bold');
        headerRange.setFontSize(11);
    } catch (err) {
        console.error('Error while setting up spreadsheet headers:', err);
        throw err;
    }
    
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
function setNotificationEmail(email) {
  PropertiesService.getScriptProperties().setProperty('NOTIFICATION_EMAIL', email);
}

const email = PropertiesService.getScriptProperties().getProperty('NOTIFICATION_EMAIL');
// use email if present
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
    
    // Send invoice/bill to customer email (if provided)
    try {
        sendBillToCustomer(orderData);
    } catch (err) {
        console.error('Failed to send bill to customer:', err);
    }
}

/**
 * Send a simple HTML invoice to the customer email (if present)
 * @param {Object} orderData
 */
function sendBillToCustomer(orderData) {
    try {
        const to = orderData.customerEmail || orderData.customerEmailAddress || '';
        if (!to || typeof to !== 'string' || to.indexOf('@') === -1) {
            console.log('No valid customer email provided, skipping customer invoice.');
            return;
        }

        const subject = `Your BLKPAPER Order ${orderData.orderId}`;

        // Build a basic HTML invoice
        const html = `<!doctype html><html><head><meta charset="utf-8"><title>Invoice</title><style>body{font-family:Arial,Helvetica,sans-serif;color:#111}h1{background:#000;color:#fff;padding:12px}table{width:100%;border-collapse:collapse;margin-top:12px}th,td{padding:8px;border:1px solid #eee;text-align:left}tfoot td{font-weight:bold}</style></head><body>` +
            `<h1>BLKPAPER — Invoice</h1>` +
            `<p>Order ID: <strong>${orderData.orderId || ''}</strong></p>` +
            `<p>Date: ${orderData.orderDate || ''}</p>` +
            `<h3>Customer</h3><p>${orderData.customerName || ''}<br/>${orderData.customerEmail || ''}<br/>${orderData.customerPhone || ''}</p>` +
            `<h3>Items</h3>` +
            `<table><thead><tr><th>Item</th><th style="text-align:right">Qty</th><th style="text-align:right">Price</th></tr></thead><tbody>` +
            (orderData.itemsDetails ? orderData.itemsDetails.split(' | ').map(function(it){
                // try to parse simple pattern "Name (Qty: x, Price: ৳y)"
                return `<tr><td>${it}</td><td style="text-align:right">-</td><td style="text-align:right">-</td></tr>`;
            }).join('') : '<tr><td colspan="3">No item details</td></tr>') +
            `</tbody><tfoot><tr><td></td><td style="text-align:right">Subtotal</td><td style="text-align:right">৳${orderData.subtotal || 0}</td></tr>` +
            `<tr><td></td><td style="text-align:right">Shipping</td><td style="text-align:right">৳${orderData.shipping || 0}</td></tr>` +
            `<tr><td></td><td style="text-align:right">Total</td><td style="text-align:right">৳${orderData.total || 0}</td></tr></tfoot></table>` +
            `<p style="margin-top:12px">Thank you for shopping with BLKPAPER.</p>` +
            `</body></html>`;

        MailApp.sendEmail({
            to: to,
            subject: subject,
            htmlBody: html
        });

        console.log('Invoice emailed to customer:', to);
    } catch (error) {
        console.error('Error in sendBillToCustomer:', error);
        throw error;
    }
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
    // Non-interactive setup suitable for web-app execution.
    // This will create the spreadsheet (if none exists) and store its ID in script properties.
    const sheet = getOrCreateSheet();

    // Get the spreadsheet ID for reference
    const spreadsheetId = getSpreadsheetId();

    // Do NOT use Browser.inputBox or Browser.msgBox here; those UI methods are only available
    // when running from the Apps Script editor and will fail when the script is executed as a web app.
    // To configure a notification email, call `setNotificationEmail(email)` separately from the editor.

    console.log('BLKPAPER Order System setup complete (non-interactive).');
    console.log('Spreadsheet ID:', spreadsheetId);
    console.log('Spreadsheet URL:', 'https://docs.google.com/spreadsheets/d/' + spreadsheetId);
    console.log('All future orders will use this spreadsheet. To set notification email, run setNotificationEmail(email) from the script editor.');
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
    // Non-interactive reset: to avoid UI calls in web-app mode, require explicit confirmation flag
    // Usage: resetSystem(true) will perform the reset. Calling without `true` will log instructions.
    const force = arguments.length > 0 ? arguments[0] : false;
    if (force !== true) {
        console.log('resetSystem requires explicit confirmation. Call resetSystem(true) to perform the reset.');
        return;
    }

    // Clear stored spreadsheet ID and create a new spreadsheet
    PropertiesService.getScriptProperties().deleteProperty('BLKPAPER_SPREADSHEET_ID');
    const sheet = getOrCreateSheet();
    const newSpreadsheetId = getSpreadsheetId();

    console.log('System reset complete!');
    console.log('New Spreadsheet ID:', newSpreadsheetId);
    console.log('New Spreadsheet URL:', 'https://docs.google.com/spreadsheets/d/' + newSpreadsheetId);
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

/**
 * Create a new spreadsheet and register its ID in script properties.
 * If a sheet with the configured `CONFIG.SHEET_NAME` does not exist, it will be created and headers will be set.
 * @param {string=} name Optional spreadsheet name. If omitted, defaults to 'BLKPAPER Orders Database'.
 * @returns {{spreadsheetId: string, spreadsheetUrl: string}}
 */
function createNewSpreadsheet(name) {
    const title = name && String(name).trim() ? String(name).trim() : 'BLKPAPER Orders Database';
    const ss = SpreadsheetApp.create(title);
    const id = ss.getId();
    // Persist ID
    setSpreadsheetId(id);

    // Ensure orders sheet exists and has headers
    let sheet = ss.getSheetByName(CONFIG.SHEET_NAME);
    if (!sheet) {
        sheet = ss.insertSheet(CONFIG.SHEET_NAME);
        setupSpreadsheetHeaders(sheet);
    }

    console.log('createNewSpreadsheet created:', id);
    return {
        spreadsheetId: id,
        spreadsheetUrl: 'https://docs.google.com/spreadsheets/d/' + id
    };
}