# 📊 BLKPAPER Google Sheets Integration Setup Guide

This guide will help you set up automatic order collection from your BLKPAPER website directly into Google Sheets for easy order management.

## 🚀 Quick Setup (5 minutes)

### Step 1: Create Google Apps Script

1. **Go to Google Apps Script**: https://script.google.com/
2. **Sign in** with your Google account
3. **Click "New Project"**
4. **Replace the default code** with the contents of `google-apps-script.js`
5. **Save the project** (Ctrl+S) and name it "BLKPAPER Order System"

### Step 2: Set Up the Spreadsheet

1. **In the script editor**, click the **"Run"** button next to `setupBLKPAPEROrderSystem`
2. **Grant permissions** when prompted (click "Advanced" → "Go to BLKPAPER Order System")
3. **Enter your email** for order notifications (optional)
4. **A new spreadsheet** will be created automatically
5. **IMPORTANT**: The system will remember this spreadsheet - all future orders will go to this same sheet!

> **Note**: The script uses persistent storage to ensure all orders go to the same spreadsheet. Once set up, you don't need to worry about multiple spreadsheets being created.

### Step 3: Deploy as Web App

1. **Click "Deploy"** → **"New deployment"**
2. **Choose type**: Web app
3. **Description**: "BLKPAPER Order Collection"
4. **Execute as**: Me
5. **Who has access**: Anyone
6. **Click "Deploy"**
7. **Copy the Web App URL** (it looks like: `https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec`)

### Step 4: Update Your Website

1. **Open** `blkpapershop/script.js`
2. **Find this line** (around line 15):
   ```javascript
   scriptURL: 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec',
   ```
3. **Replace `YOUR_SCRIPT_ID`** with your actual script URL from Step 3
4. **Save the file**

### Step 5: Test the Integration

1. **Open your website** (`blkpapershop/index.html`)
2. **Add items to cart** and proceed to checkout
3. **Fill out the form** and place a test order
4. **Check your Google Sheets** - the order should appear automatically!

---

## 📋 What You'll Get

### 📊 **Automatic Order Spreadsheet**
Your Google Sheet will have columns for:
- Order ID, Date, Status
- Customer Information (Name, Phone, Email, Address)
- Payment Method
- Item Details and Quantities
- Pricing (Subtotal, Shipping, Total)
- Delivery Information
- Order Notes

### 🎨 **Beautiful Formatting**
- **Color-coded status** (Pending, Confirmed, Shipped, etc.)
- **Automatic sorting** by newest orders first
- **Data validation** for status updates
- **Mobile-friendly** viewing

### 📧 **Email Notifications** (Optional)
- Get instant email alerts for new orders
- Complete order details in the email
- Direct link to manage orders in Google Sheets

### 🔄 **Reliability Features**
- **Local backup** - orders saved to browser storage
- **Retry system** - failed uploads automatically retry
- **Error handling** - graceful fallbacks if connection fails

---

## � Advanced Configuration

### System Management Functions

**Check System Status:**
```javascript
checkSystemStatus()  // Shows current configuration and order count
```

**Get Spreadsheet Info:**
```javascript
getSpreadsheetInfo()  // Returns spreadsheet details and URL
```

**Reset System (if needed):**
```javascript
resetSystem()  // Creates new spreadsheet (use with caution)
```

### Email Notifications Setup

1. **In Google Apps Script**, go to **Project Settings**
2. **Add Script Property**:
   - Property: `NOTIFICATION_EMAIL`
   - Value: `your-email@example.com`

### Custom Status Workflow

Edit the status validation in the script:
```javascript
const statusRule = SpreadsheetApp.newDataValidation()
    .requireValueInList([
        'pending', 'confirmed', 'processing', 
        'shipped', 'delivered', 'cancelled'
    ])
```

### WhatsApp Integration

For automatic WhatsApp notifications:
1. **Sign up** for WhatsApp Business API
2. **Add webhook URL** in the script
3. **Configure message templates**

---

## 🔧 Troubleshooting

### ❌ Multiple Spreadsheets Being Created

**FIXED**: The system now uses persistent storage to ensure all orders go to one spreadsheet.

1. **Run** `checkSystemStatus()` in Google Apps Script to verify configuration
2. **If you have multiple spreadsheets**, choose the main one and note its ID
3. **Run** `resetSystem()` if you want to start fresh with a new single spreadsheet
4. **Verify** by placing test orders and confirming they go to the same sheet

### ❌ Orders Not Appearing in Sheets

1. **Check the script URL** in your website code
2. **Verify permissions** in Google Apps Script
3. **Test the script** by running `testOrderSystem()` function
4. **Check browser console** for error messages

### ❌ Permission Errors

1. **Re-run authorization** in Google Apps Script
2. **Make sure deployment** is set to "Anyone" access
3. **Check Google account** has Sheets and Scripts enabled

### ❌ Formatting Issues

1. **Run setup function again**: `setupBLKPAPEROrderSystem()`
2. **Check timezone setting** in script configuration
3. **Verify column headers** match the expected format

---

## 📱 Managing Orders

### Status Updates
- **Click any status cell** to change order status
- **Colors automatically update** based on status
- **Use filters** to view specific order types

### Daily Reports
- **Run** `generateDailySalesReport()` in Apps Script
- **View console** for daily statistics
- **Export data** for external analysis

### Bulk Operations
- **Select multiple rows** for bulk status updates
- **Use Google Sheets filters** for advanced sorting
- **Export to CSV** for external processing

---

## 🔐 Security & Privacy

- **Data stays in your Google account** - no third-party access
- **HTTPS encryption** for all data transmission
- **Access controls** through Google permissions
- **Audit trail** with timestamps and source tracking

---

## 📞 Support

If you need help:

1. **Check console logs** in browser (F12 → Console)
2. **Test with admin functions**:
   ```javascript
   // In browser console:
   BLKPAPER_ADMIN.testGoogleSheets()
   BLKPAPER_ADMIN.viewOrders()
   ```
3. **Verify Google Apps Script** execution logs
4. **Contact support** with error details

---

## 🎉 You're All Set!

Your BLKPAPER website now automatically:
- ✅ **Saves all orders** to Google Sheets
- ✅ **Sends email notifications** 
- ✅ **Provides order management** interface
- ✅ **Handles errors gracefully**
- ✅ **Works on all devices**

Start taking orders and watch them appear in your Google Sheets automatically! 🖤