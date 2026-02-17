import { useEffect, useState } from "react";
import api from "../services/api";

function IVYear() {
  const [subjects, setSubjects] = useState([]);
  const year = "IV Year";

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await api.get(
          `/subjects/${encodeURIComponent(year)}`
        );
        setSubjects(res.data);
      } catch (err) {
        console.error("Error fetching subjects", err);
      }
    };

    fetchSubjects();
  }, [year]);

  return (
    <div>
      <h2>📘 IV Year Subjects</h2>

      {subjects.length === 0 && <p>No subjects found</p>}

      <ul>
        {subjects.map((sub) => (
          <li key={sub._id} style={{ marginBottom: "12px" }}>
            <strong>{sub.subjectName}</strong>

            {/* ✅ DOWNLOAD BUTTON */}
            {sub.materialLink ? (
              <a
                href={sub.materialLink}
                target="_blank"
                rel="noreferrer"
                style={{ marginLeft: "10px" }}
              >
                <button>⬇ Download</button>
              </a>
            ) : (
              <span style={{ marginLeft: "10px", color: "gray" }}>
                No material uploaded
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default IVYear;