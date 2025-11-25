# Google Apps Script: Append Contact Form Entries to Google Sheet

This guide contains a simple Google Apps Script (GAS) you can deploy as a Web App to receive POST requests from the contact form on the site and append each submission into a Google Sheet.

Steps (summary):
1. Create a new Google Sheet in your Google Drive. Name it something like `BLKPAPER Contacts`.
2. Copy the spreadsheet ID from the URL (the long string between `/d/` and `/edit`).
3. Open `Extensions → Apps Script` in the spreadsheet to create a new Apps Script project.
4. Replace the default `Code.gs` contents with the code below.
5. Update the `SPREADSHEET_ID` in the script with your spreadsheet ID.
6. Deploy the script as a web app: `Deploy → New deployment` → Select `Web app`.
   - Execute as: `Me` (so the script can write to the Sheet)
   - Who has access: `Anyone` or `Anyone with the link` (or restrict to your domain if needed)
7. Copy the Web App URL and paste it into `script.js` as `GOOGLE_SHEETS_CONFIG.scriptURL`.

Apps Script code (paste into Apps Script editor):

```javascript
const SPREADSHEET_ID = 'REPLACE_WITH_YOUR_SPREADSHEET_ID';

function doPost(e) {
  try {
    var raw = e.postData && e.postData.contents ? e.postData.contents : null;
    var payload = raw ? JSON.parse(raw) : e.parameter;

    // Support payload formats where data is nested
    var data = payload.data || payload;

    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheetName = payload.sheet || 'ContactForm';
    var sheet = ss.getSheetByName(sheetName);
    if (!sheet) sheet = ss.insertSheet(sheetName);

    // Ensure header row exists
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['Timestamp','Name','Email','Phone','Subject','Message']);
    }

    var row = [
      new Date(),
      data.name || '',
      data.email || '',
      data.phone || '',
      data.subject || '',
      data.message || ''
    ];

    sheet.appendRow(row);

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

Notes and security
- For public websites, deploying "Anyone" is common but opens the endpoint to the internet. Consider adding verification (a secret key shared between the site and the script) if you want to reduce spam/abuse.
- The sample script appends a header row automatically and then appends rows with submission data.
- If you prefer to use `Forms` instead of Apps Script, Google Forms writes directly to Sheets automatically, but it's harder to match the site's UI.

Troubleshooting
- If your fetch from the site fails with a CORS error in the browser, set your Apps Script deployment to allow anonymous requests (this usually works), or build a simple proxy server.
- If you see permission errors, make sure the Apps Script was deployed correctly and that you deployed the latest code.

If you'd like, I can:
- Add a secret token check (site includes token in the POST, Apps Script verifies it),
- Add basic anti-spam (honeypot field), or
- Add an admin page to view submissions inside the repo (CSV export).