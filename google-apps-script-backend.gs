// Google Apps Script backend extension for shop-based login and profile support.
//
// IMPORTANT:
// - Keep the existing bill functions (getShopSheet, createBill, getBills, updateBill, deleteBill) intact.
// - Extend the file with the new login/profile logic below.
// - The All Shops sheet is manually maintained with these fixed headers:
//   Shop ID | Business Name | Owner Name | Phone | Address | GST Number | State | Username | Password
// - This demo intentionally uses direct plain-text password comparison.
//   The Password column stores the actual plain password like "seran0311".
//
// This file is written as a drop-in extension for the existing Apps Script project.

const ALL_SHOPS_SHEET_NAME = "All Shops";
const SHOP_PROFILE_FIELDS = [
  "Shop ID",
  "Business Name",
  "Owner Name",
  "Phone",
  "Address",
  "GST Number",
  "State",
  "Username",
  "Password"
];

function jsonResponse(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

function getSpreadsheet() {
  return SpreadsheetApp.getActiveSpreadsheet();
}

function getAllShopsSheet() {
  const spreadsheet = getSpreadsheet();
  const sheet = spreadsheet.getSheetByName(ALL_SHOPS_SHEET_NAME);
  if (!sheet) {
    throw new Error("All Shops sheet not found");
  }
  return sheet;
}

function getAllShopsHeaderMap(sheet) {
  const values = sheet.getDataRange().getValues();
  if (!values.length) {
    return {};
  }

  const row = values[0];
  const map = {};
  row.forEach((header, index) => {
    const key = normalizeHeader(header);
    if (key) map[key] = index;
  });
  return map;
}

function normalizeHeader(value) {
  return String(value ?? "")
    .replace(/^\uFEFF/, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function getShopRowById(shopId) {
  const shop = String(shopId || "").trim();
  if (!shop) return null;

  const sheet = getAllShopsSheet();
  const values = sheet.getDataRange().getValues();
  if (!values.length) return null;

  const headers = getAllShopsHeaderMap(sheet);
  const shopIdIndex = headers[normalizeHeader("Shop ID")];
  if (shopIdIndex === undefined) return null;

  for (let i = 1; i < values.length; i += 1) {
    const row = values[i];
    if (String(row[shopIdIndex] || "").trim() === shop) {
      return row;
    }
  }

  return null;
}

function getShopRowByUsername(username) {
  const value = String(username ?? "").trim();
  if (!value) return null;

  const sheet = getAllShopsSheet();
  const values = sheet.getDataRange().getValues();
  if (!values.length) return null;

  const headers = getAllShopsHeaderMap(sheet);
  const usernameIndex = headers[normalizeHeader("Username")];
  if (usernameIndex === undefined) return null;

  for (let i = 1; i < values.length; i += 1) {
    const row = values[i];
    if (String(row[usernameIndex] || "").trim() === value) {
      return row;
    }
  }

  return null;
}

function getValueFromRow(row, headers, keyName) {
  if (!row || !headers) return "";
  const index = headers[normalizeHeader(keyName)];
  if (index === undefined || index === null) return "";
  return String(row[index] || "").trim();
}

function getRawValueFromRow(row, headers, keyName) {
  if (!row || !headers) return "";
  const index = headers[normalizeHeader(keyName)];
  if (index === undefined || index === null) return "";
  return String(row[index] ?? "");
}

function getShopProfileFromRow(row, headers) {
  const shopId = getValueFromRow(row, headers, "Shop ID");
  const businessName = getValueFromRow(row, headers, "Business Name");
  const ownerName = getValueFromRow(row, headers, "Owner Name");
  const phone = getValueFromRow(row, headers, "Phone");
  const address = getValueFromRow(row, headers, "Address");
  const gstNumber = getValueFromRow(row, headers, "GST Number");
  const state = getValueFromRow(row, headers, "State");
  const email = getValueFromRow(row, headers, "Email");
  const username = getValueFromRow(row, headers, "Username");
  const password = getRawValueFromRow(row, headers, "Password");

  return {
    shopId,
    businessName,
    ownerName,
    phone,
    address,
    gstNumber,
    state,
    email,
    username,
    password
  };
}

function getShopProfile(shopId) {
  const row = getShopRowById(shopId);
  if (!row) return null;

  const headers = getAllShopsHeaderMap(getAllShopsSheet());
  return getShopProfileFromRow(row, headers);
}

function updateShopProfile(body) {
  const payload = body || {};
  const shopId = String(payload.shopId ?? "").trim();
  const fields = payload.fields && typeof payload.fields === "object" ? payload.fields : {};
  if (!shopId) return { success: false, message: "shopId is required" };

  const sheet = getAllShopsSheet();
  const values = sheet.getDataRange().getValues();
  if (!values.length) return { success: false, message: "Shop not found" };

  const headers = getAllShopsHeaderMap(sheet);
  const shopIdIndex = headers[normalizeHeader("Shop ID")];
  if (shopIdIndex === undefined) return { success: false, message: "Shop ID column not found" };

  let rowNumber = 0;
  for (let i = 1; i < values.length; i += 1) {
    if (String(values[i][shopIdIndex] ?? "").trim() === shopId) {
      rowNumber = i + 1;
      break;
    }
  }
  if (!rowNumber) return { success: false, message: "Shop not found" };

  const row = values[rowNumber - 1];
  Object.keys(fields).forEach((key) => {
    const index = headers[normalizeHeader(key)];
    if (index !== undefined && index !== shopIdIndex) {
      row[index] = fields[key] == null ? "" : String(fields[key]);
    }
  });
  sheet.getRange(rowNumber, 1, 1, values[0].length).setValues([row]);

  return { success: true, profile: getShopProfileFromRow(row, headers) };
}

function buildLoginSuccessPayload(profile) {
  return {
    success: true,
    shopId: profile.shopId,
    businessName: profile.businessName,
    ownerName: profile.ownerName,
    phone: profile.phone,
    address: profile.address,
    gstNumber: profile.gstNumber,
    state: profile.state,
    email: profile.email,
    username: profile.username,
    password: profile.password
  };
}

function normalizePayload(raw) {
  if (!raw) return {};

  if (typeof raw === "string") {
    try {
      return JSON.parse(raw);
    } catch (error) {
      return {};
    }
  }

  if (typeof raw === "object") {
    return raw;
  }

  return {};
}

function loginUser(username, password) {
  const userName = String(username ?? "").trim();
  const enteredPassword = String(password ?? "");

  if (!userName || !enteredPassword) {
    return { success: false, message: "Invalid username or password" };
  }

  const row = getShopRowByUsername(userName);
  if (!row) {
    return { success: false, message: "Invalid username or password" };
  }

  const headers = getAllShopsHeaderMap(getAllShopsSheet());
  const storedPassword = getRawValueFromRow(row, headers, "Password");
  if (!storedPassword) {
    return { success: false, message: "Invalid username or password" };
  }

  const isValid = enteredPassword === storedPassword;
  if (!isValid) {
    return { success: false, message: "Invalid username or password" };
  }

  const profile = getShopProfileFromRow(row, headers);
  if (!profile.shopId) {
    return { success: false, message: "Shop not found" };
  }

  return buildLoginSuccessPayload(profile);
}

function doGet(e) {
  try {
    const params = e && e.parameter ? e.parameter : {};
    const action = String(params.action || "").toLowerCase();
    const shopId = String(params.shopId || "").trim();

    if (action === "profile") {
      if (!shopId) {
        return jsonResponse({ success: false, message: "shopId is required" });
      }

      const profile = getShopProfile(shopId);
      if (!profile || !profile.shopId) {
        return jsonResponse({ success: false, message: "Shop not found" });
      }

      return jsonResponse({
        success: true,
        shopId: profile.shopId,
        businessName: profile.businessName,
        ownerName: profile.ownerName,
        phone: profile.phone,
        address: profile.address,
        gstNumber: profile.gstNumber,
        state: profile.state,
        email: profile.email,
        username: profile.username,
        password: profile.password
      });
    }

    if (!shopId) {
      return jsonResponse({ success: false, message: "shopId is required" });
    }

    if (action === "get" || !action) {
      return jsonResponse(getBills(shopId));
    }

    return jsonResponse({ success: false, message: "Unsupported action" });
  } catch (error) {
    return jsonResponse({
      success: false,
      message: error && error.message ? error.message : "Unable to process request"
    });
  }
}

function doPost(e) {
  try {
    const raw = e && e.postData && e.postData.contents ? e.postData.contents : "{}";
    const body = normalizePayload(raw);
    const action = String((body.action || e.parameter.action || "")).toLowerCase();

    if (action === "login") {
      return jsonResponse(loginUser(body.username, body.password));
    }

    if (action === "profile" || action === "profile/get") {
      const shopId = String(body.shopId ?? e.parameter.shopId ?? "").trim();
      if (!shopId) {
        return jsonResponse({ success: false, message: "shopId is required" });
      }

      const profile = getShopProfile(shopId);
      if (!profile || !profile.shopId) {
        return jsonResponse({ success: false, message: "Shop not found" });
      }

      return jsonResponse({
        success: true,
        shopId: profile.shopId,
        businessName: profile.businessName,
        ownerName: profile.ownerName,
        phone: profile.phone,
        address: profile.address,
        gstNumber: profile.gstNumber,
        state: profile.state,
        email: profile.email,
        username: profile.username,
        password: profile.password
      });
    }

    if (action === "profile/update") {
      return jsonResponse(updateShopProfile(body));
    }

    if (action === "create") {
      return jsonResponse(createBill(body));
    }

    if (action === "update") {
      return jsonResponse(updateBill(body));
    }

    if (action === "delete") {
      return jsonResponse(deleteBill(body));
    }

    return jsonResponse({ success: false, message: "Unsupported action" });
  } catch (error) {
    return jsonResponse({
      success: false,
      message: error && error.message ? error.message : "Unable to process request"
    });
  }
}

// ------------------------------------------------------------------------------
// Existing common bill functions should remain as they are.
// Keep the current getShopSheet(shopId), createBill(body), getBills(shopId),
// updateBill(body), and deleteBill(body) implementations untouched.
// ------------------------------------------------------------------------------

function getShopSheet(shopId) {
  const safeShopId = String(shopId ?? "").trim();
  if (!safeShopId) {
    throw new Error("shopId is required");
  }

  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = spreadsheet.getSheetByName(safeShopId);
  if (!sheet) {
    throw new Error("Shop sheet not found: " + safeShopId);
  }
  return sheet;
}

function getBills(shopId) {
  const sheet = getShopSheet(shopId);
  const lastRow = sheet.getLastRow();
  const lastColumn = sheet.getLastColumn();
  if (lastRow <= 1 || lastColumn <= 0) return { success: true, data: [] };

  const rows = sheet.getRange(1, 1, lastRow, lastColumn).getDisplayValues();
  const headers = rows[0].map((header) => String(header || "").trim());
  const records = [];

  for (let i = 1; i < rows.length; i += 1) {
    const row = rows[i];
    const record = {};
    headers.forEach((header, index) => {
      if (header) {
        record[header] = row[index] ?? "";
      }
    });
    if (Object.keys(record).length > 0 && Object.values(record).some((value) => String(value).trim() !== "")) {
      record.__rowNumber = i + 1;
      records.push(record);
    }
  }

  return { success: true, data: records };
}

function createBill(body) {
  const payload = body || {};
  const fields = payload.fields || {};
  const shopId = String(payload.shopId || "").trim();
  if (!shopId) {
    return { success: false, message: "shopId is required" };
  }

  const sheet = getShopSheet(shopId);
  const headers = sheet.getDataRange().getValues();
  const currentHeaders = headers.length ? headers[0] : [];

  const rowData = [];
  const keys = Object.keys(fields || {});
  keys.forEach((key) => {
    rowData.push(fields[key]);
  });

  if (!currentHeaders.length) {
    sheet.appendRow(["Receipt Number", "Date", "Customer Name", "Amount", ...keys]);
    sheet.appendRow(rowData);
    return { success: true, data: rowData };
  }

  const headerMap = {};
  currentHeaders.forEach((header, index) => {
    headerMap[String(header || "").trim()] = index;
  });

  const output = new Array(currentHeaders.length).fill("");
  keys.forEach((key) => {
    const index = headerMap[key];
    if (index !== undefined) {
      output[index] = fields[key];
    }
  });

  sheet.appendRow(output);
  return { success: true, data: output };
}

function updateBill(body) {
  const payload = body || {};
  const rowNumber = Number(payload.rowNumber || 0);
  const fields = payload.fields || {};
  const shopId = String(payload.shopId || "").trim();

  if (!shopId) {
    return { success: false, message: "shopId is required" };
  }

  const sheet = getShopSheet(shopId);
  if (!rowNumber || rowNumber < 2) {
    return { success: false, message: "A valid sheet row number is required" };
  }

  const range = sheet.getRange(rowNumber, 1, 1, sheet.getLastColumn());
  const values = range.getValues()[0] || [];
  const headers = sheet.getDataRange().getValues()[0] || [];
  const indexMap = {};

  headers.forEach((header, index) => {
    indexMap[String(header || "").trim()] = index;
  });

  Object.keys(fields).forEach((key) => {
    const idx = indexMap[key];
    if (idx !== undefined) {
      values[idx] = fields[key];
    }
  });

  range.setValues([values]);
  return { success: true, data: values };
}

function deleteBill(body) {
  const payload = body || {};
  const rowNumber = Number(payload.rowNumber || 0);
  const shopId = String(payload.shopId || "").trim();

  if (!shopId) {
    return { success: false, message: "shopId is required" };
  }

  const sheet = getShopSheet(shopId);
  if (!rowNumber || rowNumber < 2) {
    return { success: false, message: "A valid sheet row number is required" };
  }

  sheet.deleteRow(rowNumber);
  return { success: true, deletedRow: rowNumber };
}
