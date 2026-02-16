const axios = require("axios");

/**
 * Fetch data from ANY Google Sheet safely
 */
const fetchSheetData = async (sheetId, sheetName = "Form responses 1") => {
  if (!sheetId) {
    throw new Error("Sheet ID is required");
  }

  const SHEET_URL = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(
    sheetName
  )}`;

  const response = await axios.get(SHEET_URL);

  const raw = response.data;
  const json = JSON.parse(raw.substring(47, raw.length - 2));

  if (!json.table || !json.table.rows) {
    throw new Error("Invalid Google Sheet format");
  }

  const headers = json.table.cols.map((c, i) =>
    c.label?.trim() || `Column_${i + 1}`
  );

  const students = json.table.rows.map((row) => {
    const student = { extraFields: {} };

    row.c.forEach((cell, index) => {
      const key = headers[index];
      const value = cell?.v?.toString().trim() || "";

      const lower = key.toLowerCase();

      if (lower.includes("name")) student.name = value;
      else if (lower.includes("roll")) student.rollNo = value;
      else if (lower.includes("department")) student.department = value;
      else if (lower.includes("year")) student.year = value;
      else if (lower.includes("phone")) student.phoneNo = value;
      else if (lower.includes("email")) student.email = value;
      else student.extraFields[key] = value;
    });

    return student;
  });

  return students.filter(
    (s) => s.name && s.rollNo && s.department && s.year
  );
};

module.exports = fetchSheetData;
