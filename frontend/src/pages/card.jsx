import "./card.css";

function card({ facultyData = [], studentData = [] }) {
  // ===== TOTAL COUNTS =====
  const totalFaculty = facultyData.length;
  const totalStudents = studentData.length;

  // ===== FACULTY YEAR-WISE =====
  const faculty1st = facultyData.filter(f => f.year === "1st").length;
  const faculty2nd = facultyData.filter(f => f.year === "2nd").length;
  const faculty3rd = facultyData.filter(f => f.year === "3rd").length;
  const faculty4th = facultyData.filter(f => f.year === "4th").length;

  // ===== STUDENT YEAR-WISE =====
  const students1st = studentData.filter(s => s.year === "1st").length;
  const students2nd = studentData.filter(s => s.year === "2nd").length;
  const students3rd = studentData.filter(s => s.year === "3rd").length;
  const students4th = studentData.filter(s => s.year === "4th").length;

  return (
    <>
      {/* TOTAL COUNTS */}
      <div className="card-grid">
        <div className="count-card faculty">
          <h3>👨‍🏫 Total Faculty</h3>
          <p>{totalFaculty}</p>
        </div>

        <div className="count-card students">
          <h3>🎓 Total Students</h3>
          <p>{totalStudents}</p>
        </div>
      </div>

      {/* FACULTY YEAR-WISE */}
      <div className="card-grid">
        <div className="count-card">
          <h3>1st Year Faculty</h3>
          <p>{faculty1st}</p>
        </div>
        <div className="count-card">
          <h3>2nd Year Faculty</h3>
          <p>{faculty2nd}</p>
        </div>
        <div className="count-card">
          <h3>3rd Year Faculty</h3>
          <p>{faculty3rd}</p>
        </div>
        <div className="count-card">
          <h3>4th Year Faculty</h3>
          <p>{faculty4th}</p>
        </div>
      </div>

      {/* STUDENT YEAR-WISE */}
      <div className="card-grid">
        <div className="count-card">
          <h3>1st Year Students</h3>
          <p>{students1st}</p>
        </div>
        <div className="count-card">
          <h3>2nd Year Students</h3>
          <p>{students2nd}</p>
        </div>
        <div className="count-card">
          <h3>3rd Year Students</h3>
          <p>{students3rd}</p>
        </div>
        <div className="count-card">
          <h3>4th Year Students</h3>
          <p>{students4th}</p>
        </div>
      </div>
    </>
  );
}

export default card;