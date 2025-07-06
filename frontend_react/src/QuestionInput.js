import React, { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import "./App.css";

/**
 * PUBLIC_INTERFACE
 * QuestionInput – displays a textbox for submitting a question about the uploaded PDF/book.
 * Handles input/validation/submission, stores in Supabase 'questions' table with user/file context, and provides user feedback.
 * 
 * Props:
 *   fileId: string (Supabase 'files' row id, required)
 *   fileStoragePath: string (path in Storage, required)
 *   user: {id: string} (user object or at least the user's uuid, required)
 *   onSubmitSuccess: (optional callback after successful submit)
 */
function getSupabaseEnvVars() {
  const url = process.env.REACT_APP_SUPABASE_URL || "";
  const key = process.env.REACT_APP_SUPABASE_KEY || "";
  if (!url || !key) {
    // Demo fallback
    console.warn("[Supabase] Env missing – using demo.");
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

function QuestionInput({ fileId, fileStoragePath, user, onSubmitSuccess }) {
  const [question, setQuestion] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [error, setError] = useState("");

  // Handle question submission
  // PUBLIC_INTERFACE
  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!question.trim()) {
      setError("Question cannot be empty.");
      setStatus("error");
      return;
    }
    if (!user?.id) {
      setError("You must be logged in to ask a question.");
      setStatus("error");
      return;
    }
    if (!fileId) {
      setError("File reference is missing.");
      setStatus("error");
      return;
    }
    setStatus("loading");
    const supabase = supabaseClientSingleton();
    // Insert new row in 'questions' table
    try {
      const { error: qErr } = await supabase
        .from("questions")
        .insert([{
          user_id: user.id,
          file_id: fileId,
          question_text: question.trim(),
          created_at: new Date().toISOString()
        }]);
      if (qErr) throw qErr;
      setStatus("success");
      setQuestion("");
      if (onSubmitSuccess) onSubmitSuccess();
      setTimeout(() => setStatus("idle"), 1500);
    } catch (err) {
      setError("Could not submit question. " + (err?.message || "Try again."));
      setStatus("error");
    }
  }

  // Main render
  return (
    <div className="box question-box"
      style={{
        maxWidth: 460,
        margin: "24px auto 0",
        background: "#f6f0fe",
        boxShadow: "0 2px 8px rgba(98,78,141,0.08)",
        borderRadius: 16,
        border: "1.5px solid #b9a4e4",
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
      }}
    >
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <label htmlFor="ask-question" style={{
          fontWeight: 600, color: "#624e8d", fontSize: 16, marginBottom: 2
        }}>
          Ask a question about your PDF
        </label>
        <textarea
          id="ask-question"
          placeholder="Enter your question..."
          autoFocus={false}
          style={{
            minHeight: 44,
            maxHeight: 96,
            resize: "vertical",
            border: "1.4px solid #b9a4e4",
            borderRadius: 12,
            padding: "10px 13px",
            fontSize: 15.25,
            color: "#31245b",
            background: "#fff",
            outline: "none",
            marginBottom: "0.5em"
          }}
          maxLength={300}
          value={question}
          onChange={e => {
            setQuestion(e.target.value);
            setError(""); setStatus("idle");
          }}
          disabled={status === "loading" || status === "success"}
        />
        {/* Error, loading, or success message */}
        {(error && status === "error") && (
          <div style={{
            color: "#ab2b49",
            background:"#ffdbe2",
            borderRadius: 9,
            padding: "7px 11px",
            fontSize: 15,
            margin: "3px 0 -3px"
          }} role="alert">{error}</div>
        )}
        {status === "success" && (
          <div style={{
            color: "#24512c",
            background:"#d9ffe9",
            borderRadius: 9,
            padding: "7px 11px",
            fontSize: 15,
            margin: "3px 0"
          }} role="status">Question submitted!</div>
        )}
        <button
          className="lp-btn"
          style={{
            width: "100%",
            marginTop: 7,
            borderRadius: 13,
            background: "#b9a4e4",
            color: "#fff",
            fontWeight: 700,
            fontSize: 16.5,
            opacity: question.trim() && status !== "loading" ? 1 : 0.55,
            cursor: status === "loading" ? "not-allowed" : "pointer",
          }}
          type="submit"
          disabled={!question.trim() || status === "loading" || status === "success"}
          aria-busy={status === "loading"}
        >
          {status === "loading" ? "Submitting..." : "Submit Question"}
        </button>
      </form>
    </div>
  );
}

export default QuestionInput;
