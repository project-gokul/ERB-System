import { useEffect, useState } from "react";
import api from "../services/api";

export default function FacultyVerify() {
  const [certs, setCerts] = useState([]);

  useEffect(() => {
    api.get("/certificates")
      .then(res => setCerts(res.data));
  }, []);

  const verify = async (id, status) => {
    await api.put(`/certificates/verify/${id}`, { status });
    alert("Updated");
  };

  return (
    <>
      {certs.map(c => (
        <div key={c._id}>
          <a href={`http://localhost:5000/${c.fileUrl}`} target="_blank">
            View Certificate
          </a>
          <button onClick={() => verify(c._id, "APPROVED")}>Approve</button>
          <button onClick={() => verify(c._id, "REJECTED")}>Reject</button>
        </div>
      ))}
    </>
  );
}