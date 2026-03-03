import { useEffect, useState } from "react";
import api from "../services/api";
import "./AdminCertificates.css";

function AdminCertificates() {
  const [certs, setCerts] = useState([]);

  // ================= LOAD CERTIFICATES =================
  useEffect(() => {
    api
      .get("/certificates/admin/all")
      .then((res) => {
        console.log("Admin Certificates:", res.data);
        setCerts(res.data || []);
      })
      .catch((err) => console.error(err));
  }, []);

  // ================= UPDATE STATUS =================
  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/certificates/admin/${id}/status`, { status });

      if (status === "rejected") {
        setCerts((prev) => prev.filter((c) => c._id !== id));
      } else {
        setCerts((prev) =>
          prev.map((c) =>
            c._id === id ? { ...c, status } : c
          )
        );
      }
    } catch (err) {
      console.error("Status update failed:", err);
    }
  };

  // ================= PREVIEW =================
  const handlePreview = (cert) => {
    console.log("Preview clicked:", cert);

    if (!cert.fileUrl) {
      alert("No certificate uploaded");
      return;
    }

    // ✅ FIXED: Do NOT add localhost
    window.open(cert.fileUrl, "_blank");
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
                <p className="cert-email">
                  👨‍🎓 {c.studentId?.email}
                </p>
              </div>

              <div className="cert-actions">
                <span className={`status ${c.status}`}>
                  {c.status?.toUpperCase()}
                </span>

                <button
                  className="preview-btn"
                  onClick={() => handlePreview(c)}
                >
                  👁 Preview
                </button>

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