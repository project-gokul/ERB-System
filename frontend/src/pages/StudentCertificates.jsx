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
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);

  // ================= LOAD CERTIFICATES =================
  useEffect(() => {
    loadCertificates();
  }, []);

  const loadCertificates = async () => {
    try {
      setLoading(true);
      const res = await api.get("/certificates/my");
      setCertificates(res.data || []);
    } catch (err) {
      console.error("Load failed:", err);
      setCertificates([]);
    } finally {
      setLoading(false);
    }
  };

  // ================= UPLOAD =================
  const uploadCertificate = async (e) => {
    e.preventDefault();

    if (!file) return alert("Select a file");
    if (!title.trim()) return alert("Enter title");

    try {
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("certificate", file);

      setUploadProgress(0);

      await api.post("/certificates/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percent);
        },
      });

      setTitle("");
      setFile(null);
      setUploadProgress(100);

      setTimeout(() => setUploadProgress(0), 1000);

      await loadCertificates();
      setPage(1);
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Upload failed");
      setUploadProgress(0);
    }
  };

  // ================= DELETE =================
  const deleteCertificate = async (id) => {
    if (!window.confirm("Delete this certificate?")) return;

    try {
      await api.delete(`/certificates/${id}`);
      setCertificates((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const isPDF = (url = "") => url.toLowerCase().endsWith(".pdf");

  // ================= SEARCH & PAGINATION =================
  const filtered = certificates.filter((c) =>
    c.title?.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  return (
    <div className="cert-container">
      <h2>Upload Certificate</h2>

      <form onSubmit={uploadCertificate} className="upload-form">

        {/* DRAG + CLICK BOX */}
        <label
          className={`drop-zone ${dragActive ? "active" : ""}`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragActive(false);
            const droppedFile = e.dataTransfer.files[0];
            if (droppedFile) setFile(droppedFile);
          }}
        >
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            hidden
            onChange={(e) => setFile(e.target.files[0])}
          />

          {file ? (
            <span className="file-name">📄 {file.name}</span>
          ) : (
            <span>
              Drag & Drop certificate here <br />
              <small>or Click to browse</small>
            </span>
          )}
        </label>

        <input
          type="text"
          placeholder="Certificate Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <button type="submit">Upload</button>
      </form>

      {/* PROGRESS BAR */}
      {uploadProgress > 0 && (
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${uploadProgress}%` }}
          >
            {uploadProgress}%
          </div>
        </div>
      )}

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
                {isPDF(c.fileUrl) ? "📄" : "🖼️"}
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
          <span>{page} / {totalPages}</span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
          >
            Next
          </button>
        </div>
      )}

      {/* PREVIEW MODAL */}
      {preview && (
        <div className="modal-overlay" onClick={() => setPreview(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h4>{preview.title}</h4>

            {isPDF(preview.fileUrl) ? (
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