import { useEffect, useState } from "react";
import api from "../services/api";
import "./StudentCertificates.css";

const BACKEND_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace("/api", "")
  : "http://localhost:5000";

const PAGE_SIZE = 5;

function StudentCertificates() {
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [certificates, setCertificates] = useState([]);
  const [preview, setPreview] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  // ================= LOAD CERTIFICATES =================
  useEffect(() => {
    const loadCertificates = async () => {
      try {
        setLoading(true);
        const res = await api.get("/certificates/my"); // ✅ CORRECT ROUTE
        console.log("Student certs:", res.data); // DEBUG
        setCertificates(res.data || []);
      } catch (err) {
        console.error("Failed to load certificates", err);
        setCertificates([]);
      } finally {
        setLoading(false);
      }
    };

    loadCertificates();
  }, []);

  // ================= UPLOAD =================
  const uploadCertificate = async (e) => {
    e.preventDefault();
    if (!file || !title) return;

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("certificate", file);

      await api.post("/certificates/upload", formData);

      setTitle("");
      setFile(null);

      const res = await api.get("/certificates/my"); // ✅ FIXED
      setCertificates(res.data || []);
      setPage(1);
    } catch (err) {
      console.error("Upload failed", err);
    }
  };

  // ================= DELETE =================
  const deleteCertificate = async (id) => {
    if (!window.confirm("Are you sure you want to delete this certificate?"))
      return;

    try {
      await api.delete(`/certificates/${id}`);
      setCertificates((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  // ================= DRAG & DROP =================
  const handleDrop = (e) => {
    e.preventDefault();
    setFile(e.dataTransfer.files[0]);
  };

  // ================= HELPERS =================
  const isPDF = (url = "") => url.toLowerCase().endsWith(".pdf");

  // ================= SEARCH + PAGINATION =================
  const filtered = certificates.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  return (
    <div className="cert-container">
      <h2>Upload Certificate</h2>

      <div
        className="drop-zone"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        {file ? file.name : "Drag & drop certificate here"}
      </div>

      <form onSubmit={uploadCertificate} className="upload-form">
        <input
          type="text"
          placeholder="Certificate Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <input
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={(e) => setFile(e.target.files[0])}
          required
        />

        <button type="submit">Upload</button>
      </form>

      <h3>My Certificates</h3>

      <input
        className="search"
        placeholder="Search certificates..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
      />

      {loading && <p className="empty">Loading certificates...</p>}

      {!loading && paginated.length === 0 && (
        <p className="empty">No certificates found</p>
      )}

      <div className="cert-list">
        {paginated.map((c) => (
          <div key={c._id} className="cert-card fade-slide">
            <div className="cert-info">
              <span className="icon">
                {isPDF(c.fileUrl) ? "📄" : "🖼️"}  {/* ✅ FIXED */}
              </span>
              <span className="title">{c.title}</span>
            </div>

            <span className={`status ${c.status || "pending"}`}>
              {(c.status || "pending").toUpperCase()}
            </span>

            <div className="actions">
              <button onClick={() => setPreview(c)}>Preview</button>
              <button
                className="delete"
                onClick={() => deleteCertificate(c._id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button disabled={page === 1} onClick={() => setPage(page - 1)}>
            Prev
          </button>
          <span>
            {page} / {totalPages}
          </span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
          >
            Next
          </button>
        </div>
      )}

      {/* ================= MODAL PREVIEW ================= */}
      {preview && (
        <div className="modal-overlay" onClick={() => setPreview(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h4>{preview.title}</h4>

            {isPDF(preview.fileUrl) ? (   // ✅ FIXED
              <iframe
                src={`${BACKEND_URL}${preview.fileUrl}`}
                title="PDF Preview"
              />
            ) : (
              <img
                src={`${BACKEND_URL}${preview.fileUrl}`}
                alt="Certificate"
              />
            )}

            <button onClick={() => setPreview(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentCertificates;