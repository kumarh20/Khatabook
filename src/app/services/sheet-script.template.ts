export const GOOGLE_APPS_SCRIPT_CODE = `/**
 * ==========================================================
 * OKCREDIT GOOGLE SHEET SYNC SCRIPT (v3.0)
 * 3-Tab Architecture: Customers, Transactions, and Settings
 * Stores User-Specific Settings, UPI ID & Custom QR Code
 * ==========================================================
 */

function setupSheets(ss) {
  // 1. Ensure Customers Tab
  var custSheet = ss.getSheetByName("Customers");
  if (!custSheet) {
    custSheet = ss.insertSheet("Customers");
    custSheet.appendRow(["ID", "Name", "Phone", "Address", "CreatedAt"]);
    custSheet.getRange(1, 1, 1, 5).setFontWeight("bold").setBackground("#e2e8f0");
    custSheet.setFrozenRows(1);
  }

  // 2. Ensure Transactions Tab
  var txSheet = ss.getSheetByName("Transactions");
  if (!txSheet) {
    txSheet = ss.insertSheet("Transactions");
    txSheet.appendRow(["ID", "CustomerId", "Type", "Amount", "Note", "Date", "CreatedAt"]);
    txSheet.getRange(1, 1, 1, 7).setFontWeight("bold").setBackground("#e2e8f0");
    txSheet.setFrozenRows(1);
  }

  // 3. Ensure Settings Tab (User-Specific Store Profile & Payment QR)
  var settingsSheet = ss.getSheetByName("Settings");
  if (!settingsSheet) {
    settingsSheet = ss.insertSheet("Settings");
    settingsSheet.appendRow(["Key", "Value", "Description", "UpdatedAt"]);
    settingsSheet.getRange(1, 1, 1, 4).setFontWeight("bold").setBackground("#e2e8f0");
    settingsSheet.setFrozenRows(1);
  }

  // Remove default "Sheet1" if empty and other sheets exist
  var defaultSheet = ss.getSheetByName("Sheet1");
  if (defaultSheet && ss.getSheets().length > 1 && defaultSheet.getLastRow() === 0) {
    try { ss.deleteSheet(defaultSheet); } catch (e) {}
  }

  return { custSheet: custSheet, txSheet: txSheet, settingsSheet: settingsSheet };
}

function doGet(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheets = setupSheets(ss);
  var action = (e && e.parameter && e.parameter.action) ? e.parameter.action : "getData";

  if (action === "test") {
    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Connected to Google Sheet successfully with 3 Tabs (Customers, Transactions, Settings)!",
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

  // Read Settings
  var settingsData = {};
  var setValues = sheets.settingsSheet.getDataRange().getValues();
  if (setValues.length > 1) {
    for (var k = 1; k < setValues.length; k++) {
      var sRow = setValues[k];
      var key = String(sRow[0] || "").trim();
      var val = String(sRow[1] || "").trim();
      if (key) {
        settingsData[key] = val;
      }
    }
  }

  return ContentService.createTextOutput(JSON.stringify({
    status: "success",
    customers: custData,
    transactions: txData,
    settings: {
      businessName: settingsData["businessName"] || settingsData["Shop_Name"] || "",
      ownerName: settingsData["ownerName"] || settingsData["Owner_Name"] || "",
      phone: settingsData["phone"] || settingsData["Phone"] || "",
      address: settingsData["address"] || settingsData["Address"] || "",
      businessCategory: settingsData["businessCategory"] || settingsData["Category"] || "",
      upiId: settingsData["upiId"] || settingsData["UPI_ID"] || "",
      customQrUrl: settingsData["customQrUrl"] || settingsData["Custom_QR"] || "",
      language: settingsData["language"] || settingsData["Language"] || ""
    }
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
  var settings = data.settings || {};

  // 1. Sync Customers Tab
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

  // 2. Sync Transactions Tab
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

  // 3. Sync Settings Tab (User Profile, Custom QR & UPI ID)
  if (settings && Object.keys(settings).length > 0) {
    sheets.settingsSheet.clearContents();
    sheets.settingsSheet.appendRow(["Key", "Value", "Description", "UpdatedAt"]);
    sheets.settingsSheet.getRange(1, 1, 1, 4).setFontWeight("bold").setBackground("#e2e8f0");
    sheets.settingsSheet.setFrozenRows(1);

    var nowStr = new Date().toISOString();
    var settingsRows = [
      ["businessName", settings.businessName || "", "Shop / Business Display Name", nowStr],
      ["ownerName", settings.ownerName || "", "Owner / Merchant Name", nowStr],
      ["phone", settings.phone || "", "Merchant Registered Contact Phone", nowStr],
      ["address", settings.address || "", "Shop Address / Location", nowStr],
      ["businessCategory", settings.businessCategory || "", "Trade & Industry Category", nowStr],
      ["upiId", settings.upiId || "", "Merchant UPI ID for Payments", nowStr],
      ["customQrUrl", settings.customQrUrl || "", "Merchant Custom Uploaded QR Code Data", nowStr],
      ["language", settings.language || "", "App Language Preference (hi/en)", nowStr]
    ];

    sheets.settingsSheet.getRange(2, 1, settingsRows.length, 4).setValues(settingsRows);
  }

  return ContentService.createTextOutput(JSON.stringify({
    status: "success",
    message: "Customers, Transactions & Settings synced successfully to Google Sheet!",
    count: {
      customers: customers.length,
      transactions: transactions.length,
      settingsSynced: true
    }
  })).setMimeType(ContentService.MimeType.JSON);
}
`;
