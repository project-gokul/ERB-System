import { useEffect, useState } from "react";
import api from "../services/api";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "./faculty.css";

function Faculty() {
  const [facultyList, setFacultyList] = useState([]);
  const [loading, setLoading] = useState(false);

  // 🔥 Dynamic columns
  const [extraColumns, setExtraColumns] = useState([]);

  // 🔥 Inline editing state
  const [editingCell, setEditingCell] = useState({
    id: null,
    field: null,
  });

  // FORM STATE
  const [form, setForm] = useState({
    name: "",
    email: "",
    department: "",
    year: "",
    extraFields: {},
  });

  /* ================= LOAD FACULTY ================= */
 
const fetchFaculty = async () => {
  try {
    const res = await api.get("/faculty"); // ✅ CORRECT
    setFacultyList(res.data);

    const cols = new Set();
    res.data.forEach((f) => {
      if (f.extraFields) {
        Object.keys(f.extraFields).forEach((k) => cols.add(k));
      }
    });
    setExtraColumns([...cols]);
  } catch (err) {
    console.error("Fetch faculty error:", err);
    alert("Failed to load faculty");
  }
};

  useEffect(() => {
    fetchFaculty();
  }, []);

  /* ================= FORM CHANGE ================= */
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleExtraChange = (key, value) => {
    setForm({
      ...form,
      extraFields: { ...form.extraFields, [key]: value },
    });
  };

  /* ================= ADD FACULTY ================= */
  const addFaculty = async (e) => {
    e.preventDefault();

    const { name, email, department, year } = form;
    if (!name || !email || !department || !year) {
      alert("All fields are required");
      return;
    }

    setLoading(true);
    try {
      await api.post("/faculty", form);
      setForm({
        name: "",
        email: "",
        department: "",
        year: "",
        extraFields: {},
      });
      fetchFaculty();
    } catch (err) {
      console.error("Add faculty error:", err);
      alert(err.response?.data?.message || "Error adding faculty");
    } finally {
      setLoading(false);
    }
  };

  /* ================= DELETE FACULTY ================= */
   const deleteFaculty = async (id) => {
    if (!window.confirm("Delete this faculty?")) return;

    try {
      await api.delete(`/faculty/${id}`); // ✅ FIXED
      fetchFaculty();
    } catch (err) {
      console.error("Delete faculty error:", err);
      alert("Error deleting faculty");
    }
  };

  /* ================= INLINE EDIT ================= */
  const startEdit = (id, field) => {
  setEditingCell({ id, field });
};

const saveEdit = async (id, field, value) => {
  try {
    await api.put(`/faculty/${id}`, {
      [field]: value,
    });
    setEditingCell({ id: null, field: null });
    fetchFaculty();
  } catch (err) {
    console.error("Inline update failed:", err);
    alert("Update failed");
  }
};

  /* ================= ADD COLUMN ================= */
  const addColumn = () => {
    const col = prompt("Enter new column name");
    if (!col || extraColumns.includes(col)) return;

    setExtraColumns((prev) => [...prev, col]);
    setForm((prev) => ({
      ...prev,
      extraFields: { ...prev.extraFields, [col]: "" },
    }));
  };

  /* ================= DELETE COLUMN ================= */
  const deleteColumn = async () => {
  const col = prompt("Enter column name to delete");
  if (!col) return;

  if (!extraColumns.includes(col)) {
    alert("Column not found");
    return;
  }

  if (!window.confirm(`Delete column "${col}" from all faculty?`)) return;

  try {
    // ✅ CORRECT PATH (baseURL already has /api)
    await api.delete(`/faculty/column/${col}`);
    fetchFaculty();
  } catch (err) {
    console.error("Delete column error:", err);
    alert("Failed to delete column");
  }
};

  /* ================= EXPORT TO EXCEL ================= */
  const exportToExcel = () => {
    const rows = facultyList.map((f) => {
      const base = {
        Name: f.name,
        Email: f.email,
        Department: f.department,
        Year: f.year,
      };

      extraColumns.forEach((c) => {
        base[c] = f.extraFields?.[c] || "";
      });

      return base;
    });

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Faculty");
    XLSX.writeFile(wb, "Faculty_List.xlsx");
  };

  /* ================= EXPORT TO PDF ================= */
  const exportToPDF = () => {
    const doc = new jsPDF();

    const headers = ["Name", "Email", "Department", "Year", ...extraColumns];
    const body = facultyList.map((f) => [
      f.name,
      f.email,
      f.department,
      f.year,
      ...extraColumns.map((c) => f.extraFields?.[c] || ""),
    ]);

    doc.text("Faculty List", 14, 10);

    autoTable(doc, {
      head: [headers],
      body,
      startY: 20,
      styles: { fontSize: 8 },
    });

    doc.save("Faculty_List.pdf");
  };

  return (
    <div className="faculty-page">
      <h1>👨‍🏫 Faculty Management</h1>

      {/* ADD FACULTY FORM */}
      <form className="faculty-form" onSubmit={addFaculty}>
        <input name="name" placeholder="Faculty Name" value={form.name} onChange={handleChange} />
        <input name="email" type="email" placeholder="Faculty Email" value={form.email} onChange={handleChange} />
        <input name="department" placeholder="Department" value={form.department} onChange={handleChange} />

        <select name="year" value={form.year} onChange={handleChange}>
          <option value="">Select Year</option>
          <option value="1st">1st</option>
          <option value="2nd">2nd</option>
          <option value="3rd">3rd</option>
          <option value="4th">4th</option>
        </select>

        {extraColumns.map((c) => (
          <input
            key={c}
            placeholder={c}
            value={form.extraFields[c] || ""}
            onChange={(e) => handleExtraChange(c, e.target.value)}
          />
        ))}

        <button type="submit" disabled={loading}>
          {loading ? "Adding..." : "Add Faculty"}
        </button>
      </form>

      {/* COLUMN CONTROLS */}
      <div className="export-buttons">
        <button onClick={addColumn}>➕ Add Column</button>
        <button onClick={deleteColumn} style={{ color: "red" }}>
          ❌ Delete Column
        </button>
      </div>

      {/* EXPORT BUTTONS */}
      <div className="export-buttons">
        <button onClick={exportToExcel}>📗 Export Excel</button>
        <button onClick={exportToPDF}>📄 Export PDF</button>
      </div>

      {/* FACULTY TABLE */}
      <table className="faculty-table">
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
          {facultyList.length === 0 ? (
            <tr>
              <td colSpan={5 + extraColumns.length} align="center">
                No faculty found
              </td>
            </tr>
          ) : (
            facultyList.map((f) => (
              <tr key={f._id}>
                {/* NAME */}
                <td onDoubleClick={() => startEdit(f._id, "name")}>
                  {editingCell.id === f._id && editingCell.field === "name" ? (
                    <input
                      autoFocus
                      defaultValue={f.name}
                      onBlur={(e) => saveEdit(f._id, "name", e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && saveEdit(f._id, "name", e.target.value)
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
                      onBlur={(e) => saveEdit(f._id, "email", e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && saveEdit(f._id, "email", e.target.value)
                      }
                    />
                  ) : (
                    f.email
                  )}
                </td>

                {/* DEPARTMENT */}
                <td onDoubleClick={() => startEdit(f._id, "department")}>
                  {editingCell.id === f._id && editingCell.field === "department" ? (
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
                  {editingCell.id === f._id && editingCell.field === "year" ? (
                    <input
                      autoFocus
                      defaultValue={f.year}
                      onBlur={(e) => saveEdit(f._id, "year", e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && saveEdit(f._id, "year", e.target.value)
                      }
                    />
                  ) : (
                    f.year
                  )}
                </td>

                {/* DYNAMIC COLUMNS */}
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

                <td>
                  <button
                    className="delete-btn"
                    onClick={() => deleteFaculty(f._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Faculty;
