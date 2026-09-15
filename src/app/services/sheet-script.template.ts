export const GOOGLE_APPS_SCRIPT_CODE = `/**
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
`;
