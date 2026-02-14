import { useEffect, useState } from "react";
import api from "../services/api";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "./Student.css";

function Student() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sheetLink, setSheetLink] = useState("");
  const [extraColumns, setExtraColumns] = useState([]);
  const [selectedYear, setSelectedYear] = useState("All");

  // 🔥 Inline edit state
  const [editingCell, setEditingCell] = useState({
    id: null,
    field: null,
  });

  const [form, setForm] = useState({
    name: "",
    rollNo: "",
    department: "",
    year: "",
    phoneNo: "",
    email: "",
    extraFields: {},
  });

  /* ================= FETCH STUDENTS ================= */
  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await api.get("/students");
      const data = res.data;
      setStudents(data);

      const cols = new Set();
      data.forEach((s) => {
        if (s.extraFields) {
          Object.keys(s.extraFields).forEach((k) => cols.add(k));
        }
      });
      setExtraColumns([...cols]);
    } catch (err) {
      console.error("Fetch students error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  /* ================= INLINE EDIT ================= */
 const startEdit = (id, field) => {
  setEditingCell({ id, field });
};

const saveEdit = async (id, field, value) => {
  try {
    await api.put(`/students/${id}`, {
      [field]: value,
    });
    setEditingCell({ id: null, field: null });
    fetchStudents();
  } catch (err) {
    console.error("Inline update failed:", err);
    alert("Update failed");
  }
};

  /* ================= FORM ================= */
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleExtraChange = (key, value) => {
    setForm({
      ...form,
      extraFields: { ...form.extraFields, [key]: value },
    });
  };

  const addStudent = async (e) => {
    e.preventDefault();
    try {
      await api.post("/students", form);
      setForm({
        name: "",
        rollNo: "",
        department: "",
        year: "",
        phoneNo: "",
        email: "",
        extraFields: {},
      });
      fetchStudents();
    } catch (err) {
      console.error("Add student error:", err);
      alert("Failed to add student");
    }
  };

  /* ================= IMPORT ================= */
  const importStudents = async () => {
    if (!sheetLink) return alert("Paste Google Sheet link");
    try {
      await api.post("/students/import", { sheetUrl: sheetLink });
      setSheetLink("");
      fetchStudents();
    } catch (err) {
      console.error("Import error:", err);
      alert("Import failed");
    }
  };

  /* ================= FILTER ================= */
  const filteredStudents =
    selectedYear === "All"
      ? students
      : students.filter((s) => s.year === selectedYear);


   /* ================= DELETE STUDENT ================= */
const deleteStudent = async (id) => {
  const confirmDelete = window.confirm(
    "Are you sure you want to delete this student?"
  );
  if (!confirmDelete) return;

  try {
    await api.delete(`/students/${id}`);
    fetchStudents();
  } catch (err) {
    console.error("Delete student error:", err);
    alert("Failed to delete student");
  }
};


  /* ================= EXPORT ================= */
  const exportExcel = () => {
    if (!filteredStudents.length) {
      alert("No data to export");
      return;
    }

    const rows = filteredStudents.map((s) => {
      const base = {
        Name: s.name,
        RollNo: s.rollNo,
        Department: s.department,
        Year: s.year,
        Phone: s.phoneNo,
        Email: s.email,
      };
      extraColumns.forEach((c) => (base[c] = s.extraFields?.[c] || ""));
      return base;
    });

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Students");
    XLSX.writeFile(wb, "students.xlsx");
  };

  const exportPDF = () => {
    if (!filteredStudents.length) {
      alert("No data to export");
      return;
    }

    const doc = new jsPDF();
    const headers = [
      "Name",
      "Roll",
      "Department",
      "Year",
      "Phone",
      "Email",
      ...extraColumns,
    ];

    const body = filteredStudents.map((s) => [
      s.name,
      s.rollNo,
      s.department,
      s.year,
      s.phoneNo,
      s.email,
      ...extraColumns.map((c) => s.extraFields?.[c] || ""),
    ]);

    autoTable(doc, {
      head: [headers],
      body,
      startY: 20,
    });

    doc.save("students.pdf");
  };

  /* ================= ADD / DELETE COLUMN ================= */
  const addColumn = () => {
    const col = prompt("Enter new column name");
    if (!col || extraColumns.includes(col)) return;

    setExtraColumns((prev) => [...prev, col]);
    setForm((prev) => ({
      ...prev,
      extraFields: { ...prev.extraFields, [col]: "" },
    }));
  };

  const deleteColumn = async () => {
    const col = prompt("Enter column name to delete");
    if (!col || !extraColumns.includes(col)) return;

    try {
      await api.delete(`/students/column/${col}`);
      fetchStudents();
    } catch (err) {
      console.error("Delete column error:", err);
      alert("Failed to delete column");
    }
  };

  return (
    <div className="student-page">
      <h1>🎓 Student Management</h1>

      {/* IMPORT */}
      <div>
        <input
          placeholder="Paste Google Sheet link"
          value={sheetLink}
          onChange={(e) => setSheetLink(e.target.value)}
        />
        <button onClick={importStudents}>➕Import</button>
      </div>

      {/* FILTER */}
      <select
        value={selectedYear}
        onChange={(e) => setSelectedYear(e.target.value)}
      >
        <option value="All">All</option>
        <option value="1st">1st</option>
        <option value="2nd">2nd</option>
        <option value="3rd">3rd</option>
        <option value="4th">4th</option>
      </select>

      {/* EXPORT */}
      <button onClick={exportExcel}>📗Export Excel</button>
      <button onClick={exportPDF}>📄Export PDF</button>

      {/* ADD / DELETE COLUMN */}
      <button onClick={addColumn}>➕ Add Column</button>
      <button onClick={deleteColumn} style={{ color: "red" }}>
        ❌ Delete Column
      </button>

      {/* FORM */}
      <form onSubmit={addStudent} className="student-form">
        <input name="name" placeholder="Name" value={form.name} onChange={handleChange} />
        <input name="rollNo" placeholder="Roll No" value={form.rollNo} onChange={handleChange} />
        <input name="department" placeholder="Department" value={form.department} onChange={handleChange} />
        <input name="year" placeholder="Year" value={form.year} onChange={handleChange} />
        <input name="phoneNo" placeholder="Phone" value={form.phoneNo} onChange={handleChange} />
        <input name="email" placeholder="Email" value={form.email} onChange={handleChange} />

        {extraColumns.map((c) => (
          <input
            key={c}
            placeholder={c}
            value={form.extraFields[c] || ""}
            onChange={(e) => handleExtraChange(c, e.target.value)}
          />
        ))}

        <button type="submit">Add Student</button>
      </form>

     {/* TABLE */}
{loading ? (
  <p>Loading...</p>
) : (
  <table className="student-table">
    <thead>
      <tr>
        <th>Name</th>
        <th>Email</th>
        <th>Department</th>
        <th>Year</th>
        {extraColumns.map((c) => (
          <th key={c}>{c}</th>
        ))}
        <th>Action</th>
      </tr>
    </thead>

    <tbody>
      {filteredStudents.length === 0 ? (
        <tr>
          <td colSpan={5 + extraColumns.length} align="center">
            No students found
          </td>
        </tr>
      ) : (
        filteredStudents.map((f) => (
          <tr key={f._id}>
            {/* NAME */}
            <td onDoubleClick={() => startEdit(f._id, "name")}>
              {editingCell.id === f._id && editingCell.field === "name" ? (
                <input
                  autoFocus
                  defaultValue={f.name}
                  onBlur={(e) =>
                    saveEdit(f._id, "name", e.target.value)
                  }
                  onKeyDown={(e) =>
                    e.key === "Enter" &&
                    saveEdit(f._id, "name", e.target.value)
                  }
                />
              ) : (
                f.name
              )}
            </td>

            {/* EMAIL */}
            <td onDoubleClick={() => startEdit(f._id, "email")}>
              {editingCell.id === f._id && editingCell.field === "email" ? (
                <input
                  autoFocus
                  defaultValue={f.email}
                  onBlur={(e) =>
                    saveEdit(f._id, "email", e.target.value)
                  }
                  onKeyDown={(e) =>
                    e.key === "Enter" &&
                    saveEdit(f._id, "email", e.target.value)
                  }
                />
              ) : (
                f.email
              )}
            </td>

            {/* DEPARTMENT */}
            <td onDoubleClick={() => startEdit(f._id, "department")}>
              {editingCell.id === f._id &&
              editingCell.field === "department" ? (
                <input
                  autoFocus
                  defaultValue={f.department}
                  onBlur={(e) =>
                    saveEdit(f._id, "department", e.target.value)
                  }
                  onKeyDown={(e) =>
                    e.key === "Enter" &&
                    saveEdit(f._id, "department", e.target.value)
                  }
                />
              ) : (
                f.department
              )}
            </td>

            {/* YEAR */}
            <td onDoubleClick={() => startEdit(f._id, "year")}>
              {editingCell.id === f._id &&
              editingCell.field === "year" ? (
                <input
                  autoFocus
                  defaultValue={f.year}
                  onBlur={(e) =>
                    saveEdit(f._id, "year", e.target.value)
                  }
                  onKeyDown={(e) =>
                    e.key === "Enter" &&
                    saveEdit(f._id, "year", e.target.value)
                  }
                />
              ) : (
                f.year
              )}
            </td>

            {/* EXTRA COLUMNS */}
            {extraColumns.map((c) => (
              <td
                key={c}
                onDoubleClick={() =>
                  startEdit(f._id, `extraFields.${c}`)
                }
              >
                {editingCell.id === f._id &&
                editingCell.field === `extraFields.${c}` ? (
                  <input
                    autoFocus
                    defaultValue={f.extraFields?.[c] || ""}
                    onBlur={(e) =>
                      saveEdit(
                        f._id,
                        `extraFields.${c}`,
                        e.target.value
                      )
                    }
                    onKeyDown={(e) =>
                      e.key === "Enter" &&
                      saveEdit(
                        f._id,
                        `extraFields.${c}`,
                        e.target.value
                      )
                    }
                  />
                ) : (
                  f.extraFields?.[c] || "—"
                )}
              </td>
            ))}

            {/* DELETE */}
            <td>
              <button
                className="delete-btn"
                onClick={() => deleteStudent(f._id)}
              >
                Delete
              </button>
            </td>
          </tr>
        ))
      )}
    </tbody>
  </table>
)}
    </div>
  );
} 
export default Student;