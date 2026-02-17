const axios = require("axios");

/*
  Returns rows like:
  {
    name, rollNo, department, year, phone, email, extraFields
  }
*/
const fetchSheetData = async (sheetId, sheetName) => {
  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json${
    sheetName ? `&sheet=${encodeURIComponent(sheetName)}` : ""
  }`;

  const res = await axios.get(url);
  const text = res.data.substring(
    res.data.indexOf("{"),
    res.data.lastIndexOf("}") + 1
  );

  const json = JSON.parse(text);
  const cols = json.table.cols.map((c) => c.label);
  const rows = json.table.rows;

  return rows.map((r) => {
    const rowObj = {};

    cols.forEach((col, i) => {
      const key = col.trim();
      rowObj[key] = r.c[i]?.v ?? "";
    });

    return {
      name: rowObj.Name || rowObj.name ||  rowObj.NAME || "",
      rollNo: rowObj.rollNo || rowObj.RollNo || rowObj.ROLLNO || "",
      department: rowObj.department || rowObj.Department || rowObj.DEPARTMENT || "",
      year: rowObj.year || rowObj.Year || rowObj.YEAR || "",
      phone: rowObj.phone || rowObj.Phone || rowObj.PHONE || "",
      email: rowObj.email || rowObj.Email || rowObj.EMAIL || "",
      extraFields: {},
    };
  });
};

module.exports = fetchSheetData;