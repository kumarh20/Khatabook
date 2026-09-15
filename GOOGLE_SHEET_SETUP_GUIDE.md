# 📊 Google Sheets (Excel) Setup Guide for OkCredit

Aapka pura data user ke **Google Drive / Google Sheets (Excel)** me safely save rahega. Isko setup karna bohot hi aasan hai — sirf **2 minute** ka kaam hai!

---

## 🚀 Step-by-Step Setup Guide (Hindi / English)

### Step 1: Google Sheet Banayein
1. Apne Google Drive ya browser me jayein aur naya Google Sheet kholein: [sheets.new](https://sheets.new)
2. Sheet ka naam rakhein: **"OkCredit Bahi Khata"** (ya apna pasandida naam).
3. *(Sheet me koi manual column banane ki zaroorat nahi hai, script automatically sabhi tabs aur columns bana dega!)*

---

### Step 2: Apps Script Kholein
1. Google Sheet ke top menu me jayein:
   - **Extensions** par click karein -> **Apps Script** chunein.
2. Ek naya Apps Script code editor khulega.
3. Wahan pehle se likha hua `function myFunction() { ... }` code pura **delete** (hata) dein.

---

### Step 3: Script Paste Karein
Niche diya gaya complete code copy karein aur Apps Script editor me paste kar dein:

```javascript
/**
 * ==========================================================
 * OKCREDIT GOOGLE SHEET SYNC SCRIPT
 * Automatic 2-Way Sync for Customers & Transactions
 * ==========================================================
 */

function setupSheets(ss) {
  // Ensure Customers Tab
  var custSheet = ss.getSheetByName("Customers");
  if (!custSheet) {
    custSheet = ss.insertSheet("Customers");
    custSheet.appendRow(["ID", "Name", "Phone", "Address", "CreatedAt"]);
    custSheet.getRange(1, 1, 1, 5).setFontWeight("bold").setBackground("#e2e8f0");
    custSheet.setFrozenRows(1);
  }

  // Ensure Transactions Tab
  var txSheet = ss.getSheetByName("Transactions");
  if (!txSheet) {
    txSheet = ss.insertSheet("Transactions");
    txSheet.appendRow(["ID", "CustomerId", "Type", "Amount", "Note", "Date", "CreatedAt"]);
    txSheet.getRange(1, 1, 1, 7).setFontWeight("bold").setBackground("#e2e8f0");
    txSheet.setFrozenRows(1);
  }

  // Remove default "Sheet1" if empty and other sheets exist
  var defaultSheet = ss.getSheetByName("Sheet1");
  if (defaultSheet && ss.getSheets().length > 1 && defaultSheet.getLastRow() === 0) {
    try { ss.deleteSheet(defaultSheet); } catch (e) {}
  }

  return { custSheet: custSheet, txSheet: txSheet };
}

function doGet(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheets = setupSheets(ss);
  var action = (e && e.parameter && e.parameter.action) ? e.parameter.action : "getData";

  if (action === "test") {
    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Connected to Google Sheet successfully!",
      sheetName: ss.getName()
    })).setMimeType(ContentService.MimeType.JSON);
  }

  // Read Customers
  var custData = [];
  var custValues = sheets.custSheet.getDataRange().getValues();
  if (custValues.length > 1) {
    for (var i = 1; i < custValues.length; i++) {
      var row = custValues[i];
      if (row[0] && row[1]) {
        custData.push({
          id: String(row[0]),
          name: String(row[1]),
          phone: String(row[2] || ""),
          address: String(row[3] || ""),
          createdAt: String(row[4] || "")
        });
      }
    }
  }

  // Read Transactions
  var txData = [];
  var txValues = sheets.txSheet.getDataRange().getValues();
  if (txValues.length > 1) {
    for (var j = 1; j < txValues.length; j++) {
      var tRow = txValues[j];
      if (tRow[0] && tRow[1]) {
        txData.push({
          id: String(tRow[0]),
          customerId: String(tRow[1]),
          type: String(tRow[2] || "gave"),
          amount: Number(tRow[3] || 0),
          note: String(tRow[4] || ""),
          date: String(tRow[5] || ""),
          createdAt: String(tRow[6] || "")
        });
      }
    }
  }

  return ContentService.createTextOutput(JSON.stringify({
    status: "success",
    customers: custData,
    transactions: txData
  })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheets = setupSheets(ss);

  var payload;
  try {
    payload = JSON.parse(e.postData.contents);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: "Invalid JSON payload: " + err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }

  var data = payload.data || {};
  var customers = data.customers || [];
  var transactions = data.transactions || [];

  // 1. Sync Customers
  sheets.custSheet.clearContents();
  sheets.custSheet.appendRow(["ID", "Name", "Phone", "Address", "CreatedAt"]);
  sheets.custSheet.getRange(1, 1, 1, 5).setFontWeight("bold").setBackground("#e2e8f0");
  sheets.custSheet.setFrozenRows(1);

  if (customers.length > 0) {
    var custRows = customers.map(function(c) {
      return [c.id || "", c.name || "", c.phone || "", c.address || "", c.createdAt || new Date().toISOString()];
    });
    sheets.custSheet.getRange(2, 1, custRows.length, 5).setValues(custRows);
  }

  // 2. Sync Transactions
  sheets.txSheet.clearContents();
  sheets.txSheet.appendRow(["ID", "CustomerId", "Type", "Amount", "Note", "Date", "CreatedAt"]);
  sheets.txSheet.getRange(1, 1, 1, 7).setFontWeight("bold").setBackground("#e2e8f0");
  sheets.txSheet.setFrozenRows(1);

  if (transactions.length > 0) {
    var txRows = transactions.map(function(t) {
      return [
        t.id || "",
        t.customerId || "",
        t.type || "gave",
        Number(t.amount || 0),
        t.note || "",
        t.date || new Date().toISOString(),
        t.createdAt || new Date().toISOString()
      ];
    });
    sheets.txSheet.getRange(2, 1, txRows.length, 7).setValues(txRows);
  }

  return ContentService.createTextOutput(JSON.stringify({
    status: "success",
    message: "Data synced successfully with Google Sheet!",
    count: {
      customers: customers.length,
      transactions: transactions.length
    }
  })).setMimeType(ContentService.MimeType.JSON);
}
```

---

### Step 4: Web App Deploy Karein (Keval 3 Clicks)
1. Apps Script editor ke top-right corner me blue button **Deploy** par click karein.
2. **New deployment** chunein.
3. Gear icon (⚙️ Select type) par click karein aur **Web app** select karein.
4. Settings me:
   - **Description**: `OkCredit API`
   - **Execute as**: **Me (apna email)**
   - **Who has access**: **Anyone** *(Important: Taaki app bina permission block ke sync ho sake)*
5. **Deploy** button par click karein.
6. Agar Google "Authorize access" maange, toh:
   - Apna Google account select karein.
   - **Advanced** par click karein -> **Go to Untitled project (unsafe)** par click karein -> **Allow** par click karein.
7. Deployment complete hone ke baad aapko ek **Web app URL** milega (e.g. `https://script.google.com/macros/s/.../exec`).
8. Is **URL ko copy karein**!

---

### Step 5: OkCredit App Me URL Dalein
1. OkCredit app kholein.
2. Top right corner me **"Google Sheet Sync"** ya **⚙️ Settings** icon par click karein.
3. Apni copy ki gayi **Web app URL** ko paste karein.
4. **"Test & Connect"** button dabayein!
5. Bas! Aapka Google Sheet connect ho gaya aur sabhi records realtime aapke Google Drive Sheet me save honge.

---

### 💡 Faayde (Key Benefits):
- **100% Free & Unlimited**: Google Sheets aapke personal Google Drive me rehta hai.
- **Direct Excel Export**: Aap kabhi bhi Google Sheet ko `File -> Download -> Microsoft Excel (.xlsx)` ke roop me download kar sakte hain.
- **Multiple Person Configuration**: Aap alag-alag logon ko alag Google Sheet ka link dekar unka hisab alag manage kar sakte hain!
- **Offline + Cloud**: Agar internet slow ya band ho, toh app local storage me save rakhegi aur connect hote hi sheet me sync kar degi.
