import { useEffect, useState } from "react";
import api from "../services/api";
import "./AdminCertificates.css";

function AdminCertificates() {
  const [certs, setCerts] = useState([]);

  useEffect(() => {
    api.get("/certificates/admin/all").then((res) => setCerts(res.data));
  }, []);

  const updateStatus = async (id, status) => {
    await api.patch(`/certificates/admin/${id}/status`, { status });
    setCerts(
      certs.map((c) => (c._id === id ? { ...c, status } : c))
    );
  };

  return (
    <div className="admin-container">
      <h2 className="page-title">📄 Certificate Approval</h2>

      {certs.length === 0 ? (
        <p className="empty-text">No certificates found</p>
      ) : (
        <div className="certificate-list">
          {certs.map((c) => (
            <div key={c._id} className="certificate-card">
              <div className="cert-info">
                <h3 className="cert-title">{c.title}</h3>
                <p className="cert-email">👨‍🎓 {c.studentId.email}</p>
              </div>

              <div className="cert-actions">
                <span className={`status ${c.status}`}>
                  {c.status.toUpperCase()}
                </span>

                <button
                  className="approve-btn"
                  onClick={() => {
                    updateStatus(c._id, "approved");
                    alert("Approved Successfully");
                  }}
                >
                  ✔ Approve
                </button>

                <button
                  className="reject-btn"
                  onClick={() => {
                    updateStatus(c._id, "rejected");
                    alert("Rejected Successfully");
                  }}
                >
                  ✖ Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminCertificates;