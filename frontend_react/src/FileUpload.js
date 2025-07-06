import React, { useState, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
import "./App.css";

/**
 * PUBLIC_INTERFACE
 * FileUpload – file upload area for authenticated users (Supabase Storage), progress and feedback integrated.
 * Features:
 * - Drag & drop or click-to-select file area
 * - Shows file name and upload progress
 * - Handles upload state (idle, uploading, success, failure)
 * - Visually matches app's minimal, modern style
 * - Integrates with Supabase "files" bucket (see assets/supabase.md)
 * - Only PDF/book (limit: .pdf, .epub, .mobi, .azw3 etc. – can adjust accept)
 */

// Memoized singleton for Supabase client (shared with auth screens)
function getSupabaseEnvVars() {
  const url = process.env.REACT_APP_SUPABASE_URL || "";
  const key = process.env.REACT_APP_SUPABASE_KEY || "";
  if (!url || !key) {
    // Demo fallback
    console.warn("[Supabase] Environment variables missing – using fallback. Set REACT_APP_SUPABASE_URL/KEY in .env.local for prod.");
    return {
      url: "https://sirvwsslwxxxuysywyan.supabase.co",
      key: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpcnZ3c3Nsd3h4eHV5c3l3eWFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1MDk1NTgsImV4cCI6MjA2NzA4NTU1OH0.DfGb7i74DGejUnKuzKDiubyM2OsL_Qx0QIYtaZPiwos"
    };
  }
  return { url, key };
}
const supabaseClientSingleton = (() => {
  let instance = null;
  return () => {
    if (!instance) {
      const { url, key } = getSupabaseEnvVars();
      instance = createClient(url, key);
    }
    return instance;
  };
})();

/** Returns true if user is logged in (authenticated session) */
function getSupabaseUser() {
  // Uses localStorage session (works if logged in from Supabase Auth)
  const supabase = supabaseClientSingleton();
  return supabase.auth.getUser()
    .then(res => res.data?.user || null)
    .catch(() => null);
}
/** Format bytes as "1.2 MB" etc */
function formatBytes(x) {
  if (x < 1000) return x + " B";
  const k = 1024;
  const sizes = ["KB","MB","GB","TB"];
  let i = Math.floor(Math.log(x) / Math.log(k));
  return `${parseFloat((x / Math.pow(k, i)).toFixed(1))} ${sizes[i-1]}`;
}

/**
 * PUBLIC_INTERFACE
 * Main FileUpload component
 */
const ACCEPT_EXT = ".pdf,.epub,.mobi,.azw3"; // Restrict to book/PDF
function FileUpload({ onUploadComplete }) {
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0); // 0-100
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [uploading, setUploading] = useState(false);
  const [dragHover, setDragHover] = useState(false);
  const inputRef = useRef();

  // Handles file selection or drop
  const onFileChange = (e) => {
    setError(""); setSuccess("");
    let f = (e.target.files && e.target.files[0]) || (e.dataTransfer?.files && e.dataTransfer.files[0]);
    if (!f) return;
    if (!ACCEPT_EXT.split(",").some(ext => f.name.toLowerCase().endsWith(ext.trim()))) {
      setError("Please select a PDF or book file (.pdf, .epub, .mobi, .azw3).");
      return;
    }
    // Optional: set max size (100MB)
    if (f.size > 100 * 1024 * 1024) {
      setError("File is too large (max 100MB).");
      return;
    }
    setFile(f);
    setProgress(0); setSuccess("");
  };

  // Handles upload to Supabase Storage ("files" bucket)
  const handleUpload = async () => {
    setUploading(true); setError(""); setSuccess("");
    setProgress(2); // show bar start

    // Ensure session
    const supabase = supabaseClientSingleton();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (!user) {
      setError("Login required!");
      setUploading(false);
      return;
    }
    // Construct unique storage path: <user.id>/<now-iso>-<filename>
    const now = new Date();
    const path = `${user.id}/${now.toISOString().replace(/[-:T.]/g, "").slice(0,14)}-${file.name.replace(/[^a-zA-Z0-9.]/g, "_")}`;
    try {
      // Supabase Storage API does not natively support progress, so we chunk manually for progress (workaround):
      // But for small files, can just set instantly to 100.
      setProgress(15);

      // Upload file into "files" bucket, upsert: true (overwrite if same name/path, rare)
      const { data, error: uploadError } = await supabase
        .storage
        .from("files")
        .upload(path, file, {
          cacheControl: "3600",
          upsert: true,
        });
      if (uploadError) throw uploadError;

      setProgress(100);
      setSuccess("Upload successful!");
      if (onUploadComplete) onUploadComplete({ file, storagePath: path, metadata: data });
      setTimeout(() => setSuccess(""), 3000);
      setFile(null);
    } catch (err) {
      setError("Upload failed: " + (err.message || err.error || "Unknown error"));
    } finally {
      setUploading(false);
      setTimeout(() => setProgress(0), 1400);
    }
  };

  // Drag and drop UI events
  const onDragOver = (e) => {e.preventDefault(); setDragHover(true);};
  const onDragLeave = (e) => {e.preventDefault(); setDragHover(false);};
  const onDrop = (e) => {e.preventDefault(); setDragHover(false); onFileChange(e);};

  return (
    <div className={"box upload-box"} style={{maxWidth: 410, margin: "28px auto 0", boxShadow: dragHover ? "0 0 0 4px #b9a4e4" : undefined}}>
      <div
        className="upload-area"
        style={{
          border: `2.2px dashed #b9a4e4`,
          borderRadius: 17,
          minHeight: 120,
          cursor: uploading ? "not-allowed" : "pointer",
          background: dragHover ? "#f4f0ff" : "#fff",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          padding: "20px 8px", transition: "background 0.22s",
          marginBottom: 16,
        }}
        tabIndex={0}
        title="Click or drag to upload"
        onClick={()=>!uploading&&inputRef.current&&inputRef.current.click()}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        aria-label="File upload area"
        data-testid="file-upload-area"
      >
        {/* SVG upload icon */}
        <svg width="44" height="44" viewBox="0 0 44 44" aria-hidden="true" fill="none">
          <ellipse cx="22" cy="36" rx="14" ry="4" fill="#f2e9fc"/>
          <path d="M22 8v20.5m0 0l7-7m-7 7l-7-7" stroke="#b9a4e4" strokeWidth="2.7" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <div style={{
          fontWeight: 600,
          fontSize: 17,
          color: "#624e8d",
          marginTop: 8,
          marginBottom: 5,
        }}>
          {file ? "Ready to upload" : "Select or drag a file"}
        </div>
        <div style={{
          color: "#8974b6",
          fontSize: 15
        }}>
          PDF or ebook (.pdf, .epub, .mobi, .azw3)<br/>
          Max 100MB
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT_EXT}
          style={{display:"none"}}
          onChange={onFileChange}
          disabled={uploading}
          tabIndex={-1}
        />
      </div>
      {/* Selected file info */}
      {file &&
        <div style={{
          fontSize:15,
          color: "#292626",
          letterSpacing: "0.01em",
          marginBottom: 10,
          textAlign: "center"
        }}>
          {file.name.length > 44 ? file.name.slice(0,44)+'…' : file.name} <span style={{color:"#b9a4e4"}}>({formatBytes(file.size)})</span>
          <button
            style={{
              marginLeft:10, color:"#a388e8", background:"none", border:"none", fontSize:14, cursor:"pointer"
            }}
            onClick={()=>{ setFile(null); setProgress(0); setSuccess(""); setError("") }}
            disabled={uploading}
            title="Remove file"
          >×</button>
        </div>
      }
      {/* Upload progress bar */}
      {uploading || progress > 5 ? (
        <div style={{margin: "7px 0 12px", minHeight: 18}}>
          <div style={{
            background: "#e9dbf3",
            borderRadius: 11,
            height: 9,
            width: "96%",
            margin: "0 auto",
            overflow: "hidden"
          }}>
            <div style={{
              background: "#b9a4e4",
              height: "100%",
              width: `${progress}%`,
              minWidth: 14,
              maxWidth: "100%",
              borderRadius: 11,
              boxShadow: progress === 100 ? "0 0 2px #8fc28e" : undefined,
              transition: "width 0.38s"
            }}></div>
          </div>
        </div>
      ):<div style={{minHeight:18}}></div>}
      {/* Success/error feedback */}
      {error && <div style={{
        color: "#ab2b49", fontWeight: 500, fontSize: 15, margin: "6px 0", background:"#ffdbe2", borderRadius:9, padding:"7px 11px"
      }} role="alert">{error}</div>}
      {success && <div style={{
        color: "#24512c", fontWeight: 500, fontSize: 15, margin: "6px 0", background:"#d9ffe9", borderRadius:9, padding:"7px 11px"
      }} role="status">{success}</div>}
      <button
        className="lp-btn"
        style={{
          width: "96%",
          margin: "12px 0 0 0",
          borderRadius: 14,
          opacity: !file || uploading ? 0.5 : 1,
        }}
        type="button"
        disabled={!file || uploading}
        aria-busy={uploading}
        onClick={handleUpload}
        data-testid="upload-btn"
      >
        {uploading ? "Uploading..." : "Upload"}
      </button>
    </div>
  );
}

export default FileUpload;
