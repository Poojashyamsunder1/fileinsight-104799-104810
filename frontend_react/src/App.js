import React, { useEffect, useState, useRef } from "react";
import "./App.css";

/* 
  PUBLIC_INTERFACE
  Main App component integrating Supabase Auth, PDF upload/preview, and question input.
  Features:
    - User authentication via Supabase (Google or Email)
    - PDF/book file upload to Supabase Storage ('books' bucket)
    - File preview after upload
    - Question input (prepared for future API integration)
    - Responsive, modern/minimalist light theme
    - All UI logic included
*/

/**
 * SUPABASE CONFIG: Uses environment variables for security.
 * Fill in .env or use .env.example as a template.
 */
const SUPABASE_URL =
  process.env.REACT_APP_SUPABASE_URL || "https://sirvwsslwxxxuysywyan.supabase.co";
const SUPABASE_KEY =
  process.env.REACT_APP_SUPABASE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpcnZ3c3Nsd3h4eHV5c3l3eWFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1MDk1NTgsImV4cCI6MjA2NzA4NTU1OH0.DfGb7i74DGejUnKuzKDiubyM2OsL_Qx0QIYtaZPiwos";

// Dynamically import supabase-js for minimal build footprint.
let supabase = null;
const getSupabase = async () => {
  if (!supabase) {
    const { createClient } = await import("@supabase/supabase-js");
    supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  }
  return supabase;
};

/**
 * Button component with accent color and minimalistic style.
 */
function AccentButton({ children, ...props }) {
  return (
    <button
      {...props}
      style={{
        background: "var(--accent-color)",
        color: "#fff",
        border: "none",
        borderRadius: 8,
        padding: "12px 32px",
        fontWeight: 600,
        fontSize: 16,
        cursor: "pointer",
        boxShadow: "0 2px 8px rgba(56,189,248,0.08)",
        transition: "background 0.15s",
      }}
    >
      {children}
    </button>
  );
}

/**
 * Use Supabase Auth and session management
 */
function useSupabaseAuth() {
  const [user, setUser] = useState(null);
  useEffect(() => {
    let sub = null;
    getSupabase().then((client) => {
      client.auth.getUser().then(({ data: { user } }) => setUser(user));
      sub = client.auth.onAuthStateChange((_evt, session) => {
        setUser(session?.user || null);
      });
    });
    return () => sub?.data?.subscription?.unsubscribe?.();
  }, []);
  return user;
}

// PUBLIC_INTERFACE
function App() {
  // Theme: modern, light
  const [theme] = useState("light");

  // Auth
  const user = useSupabaseAuth();
  const [initializing, setInitializing] = useState(true);

  // File upload & preview state
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [fileUrl, setFileUrl] = useState(null);
  const [uploadError, setUploadError] = useState(null);

  // Question input
  const [question, setQuestion] = useState("");
  const [questionSubmitted, setQuestionSubmitted] = useState(false);

  // Scroll to question input after upload
  const questionInputRef = useRef(null);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.style.setProperty("--accent-color", "#38bdf8");
    document.documentElement.style.setProperty("--primary-color", "#2563eb");
    document.documentElement.style.setProperty("--secondary-color", "#64748b");
  }, [theme]);

  // Detect supabase-js load
  useEffect(() => {
    getSupabase().then(() => setInitializing(false));
  }, []);

  // PUBLIC_INTERFACE
  // Start login with Supabase Auth Provider (Google or email, as allowed)
  /**
   * Initiates sign-in using Supabase provider.
   * @param {'google'|'email'} provider - Auth provider to use
   * @param {string} [email] - Email for email sign-in (if applicable)
   */
  async function handleSignIn(provider = "google", email = "") {
    const client = await getSupabase();

    // Supported providers must match what's enabled in Supabase dashboard!
    const enabledProviders = ["google", "email"];
    if (!enabledProviders.includes(provider)) {
      alert(`Auth provider '${provider}' not supported or not enabled.`);
      return;
    }

    try {
      if (provider === "google") {
        await client.auth.signInWithOAuth({ provider: "google" });
      } else if (provider === "email") {
        if (!email) {
          alert("Please enter a valid email address.");
          return;
        }
        // Send link to email for magic link sign-in
        const { error } = await client.auth.signInWithOtp({ email });
        if (error) throw error;
        alert("Check your email for the magic link to sign in.");
      }
    } catch (e) {
      alert(
        e?.error_description ||
          e?.message ||
          "There was a problem signing in. Please try again."
      );
    }
  }

  // PUBLIC_INTERFACE
  // Logout function
  async function handleSignOut() {
    const client = await getSupabase();
    await client.auth.signOut();
    setFile(null);
    setFileUrl(null);
    setUploadError(null);
    setQuestion("");
    setQuestionSubmitted(false);
  }

  // PUBLIC_INTERFACE
  // File select handler (PDFs/books)
  function handleFileSelect(e) {
    setFile(e.target.files[0]);
    setFileUrl(null);
    setUploadError(null);
    setQuestion("");
    setQuestionSubmitted(false);
  }

  // PUBLIC_INTERFACE
  // Upload file to Supabase Storage ('books' bucket)
  async function handleFileUpload() {
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    const supa = await getSupabase();

    // Use user id as prefix for privacy
    const filename = `${user.id}/${Date.now()}_${file.name}`;
    const { data, error } = await supa.storage
      .from("books")
      .upload(filename, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      setUploadError("File upload failed: " + error.message);
      setUploading(false);
      return;
    }
    // Get public URL for preview
    const { data: urlData } = supa.storage.from("books").getPublicUrl(filename);
    setFileUrl(urlData.publicUrl || null);
    setUploading(false);
    if (questionInputRef.current) {
      setTimeout(() => questionInputRef.current.scrollIntoView({ behavior: "smooth" }), 600);
    }
  }

  // PUBLIC_INTERFACE
  // Handle submit question (stub for future API integration)
  async function handleQuestionSubmit(e) {
    e.preventDefault();
    setQuestionSubmitted(true);
    // Prepared for future API integration:
    // Here you would send {fileUrl, question, user} to external backend API.
  }

  // Component: Authentication
  function AuthView() {
    // Email sign-in state
    const [email, setEmail] = useState("");
    const [emailSent, setEmailSent] = useState(false);

    return (
      <div className="box auth-box">
        <h2 style={{ color: "var(--primary-color)", marginBottom: 8 }}>Sign In</h2>
        <p style={{ color: "var(--secondary-color)", fontWeight: 400 }}>
          Please sign in to upload and preview your files.
        </p>
        {/* Google Sign-in (primary) */}
        <AccentButton onClick={() => handleSignIn("google")}>
          Sign in with Google
        </AccentButton>
        <hr style={{ margin: "18px 0", border: "none", borderTop: "1px solid #eee" }} />
        {/* Email Magic Link sign-in */}
        <div style={{ marginBottom: 0 }}>
          <label htmlFor="email-signin" style={{ fontWeight: 500, marginBottom: 2, display: "block" }}>
            Or sign in via email:
          </label>
          <input
            id="email-signin"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setEmailSent(false);
            }}
            placeholder="you@example.com"
            style={{
              fontSize: 15,
              border: "1px solid var(--border-color)",
              borderRadius: 7,
              padding: 10,
              marginBottom: 5,
              color: "var(--primary-color)",
              background: "#f7fafd"
            }}
            disabled={emailSent}
          />
          <AccentButton
            onClick={async () => {
              await handleSignIn("email", email);
              setEmailSent(true);
            }}
            disabled={!email || emailSent}
            style={{ marginTop: 3, width: "100%" }}
          >
            {emailSent ? "Magic Link Sent" : "Sign in with Email"}
          </AccentButton>
          {emailSent && (
            <div
              style={{
                color: "var(--primary-color)",
                background: "#e5f6fd",
                marginTop: 9,
                padding: "5px 9px",
                borderRadius: 4,
                fontSize: 14,
                fontStyle: "italic",
              }}
            >
              Check your email for a link to log in!
            </div>
          )}
        </div>
      </div>
    );
  }

  // Component: File Upload
  function UploadView() {
    return (
      <div className="box upload-box">
        <h2 style={{ color: "var(--primary-color)", marginBottom: 16 }}>
          Upload Book/PDF
        </h2>
        <input
          type="file"
          accept=".pdf,application/pdf"
          onChange={handleFileSelect}
          disabled={uploading}
          style={{
            marginBottom: 16,
            border: "1px solid var(--border-color)",
            borderRadius: 8,
            padding: 12,
            background: "#fff",
            width: "100%",
          }}
          aria-label="Select a PDF file"
        />
        <AccentButton
          onClick={handleFileUpload}
          disabled={!file || uploading}
          style={{
            opacity: file ? 1 : 0.7,
            width: "100%",
            marginBottom: 8,
          }}
        >
          {uploading ? "Uploading..." : "Upload"}
        </AccentButton>
        {uploadError && (
          <div
            style={{
              color: "#d32f2f",
              background: "#fff4f4",
              padding: 8,
              borderRadius: 5,
              marginTop: 8,
              fontSize: 15,
            }}
          >
            {uploadError}
          </div>
        )}
      </div>
    );
  }

  // Component: File Preview (PDF inline)
  function FilePreview() {
    if (!fileUrl) return null;
    return (
      <div className="box preview-box">
        <h3 style={{ color: "var(--primary-color)" }}>Preview</h3>
        <iframe
          title="PDF Preview"
          src={fileUrl}
          style={{
            width: "100%",
            height: 500,
            border: "1px solid var(--border-color)",
            borderRadius: 8,
            background: "#fafbfc",
          }}
        />
        <p style={{ marginTop: 10, fontSize: 15 }}>
          This is a preview of your uploaded file (first few pages).<br />
          Full content is stored securely via Supabase.
        </p>
      </div>
    );
  }

  // Component: Question Input
  function AskQuestion() {
    if (!fileUrl) return null;
    return (
      <form
        className="box question-box"
        style={{
          marginTop: 16,
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
        }}
        onSubmit={handleQuestionSubmit}
        ref={questionInputRef}
      >
        <label htmlFor="question" style={{ fontWeight: 600, marginBottom: 4 }}>
          Ask a question about your book
        </label>
        <textarea
          id="question"
          value={question}
          rows={2}
          placeholder="E.g. What is the main idea of chapter 1?"
          required
          style={{
            fontSize: 16,
            border: "1px solid var(--border-color)",
            borderRadius: 8,
            padding: 12,
            marginBottom: 12,
            resize: "vertical",
            minHeight: 48,
            background: "#fff",
            color: "var(--primary-color)",
          }}
          onChange={(e) => {
            setQuestion(e.target.value);
            setQuestionSubmitted(false);
          }}
          disabled={questionSubmitted}
          autoFocus
        />
        <AccentButton type="submit" disabled={!question || questionSubmitted}>
          {questionSubmitted ? "Submitted" : "Ask Question"}
        </AccentButton>
        {questionSubmitted && (
          <div
            style={{
              color: "var(--primary-color)",
              background: "#e5f6fd",
              marginTop: 10,
              padding: "6px 12px",
              borderRadius: 5,
              fontSize: 15,
              fontStyle: "italic",
            }}
          >
            Question submitted! (Future API integration will process your question.)
          </div>
        )}
      </form>
    );
  }

  return (
    <div
      className="App"
      style={{
        minHeight: "100vh",
        background: "var(--bg-primary)",
        color: "var(--text-primary)",
        fontFamily:
          "Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
        width: "100%",
        letterSpacing: 0.01,
        transition: "background 0.25s",
      }}
    >
      <header
        className="App-header"
        style={{
          width: "100%",
          padding: "8px 0",
          background: "#fff",
          borderBottom: "1px solid var(--border-color)",
          marginBottom: 0,
        }}
      >
        <nav
          style={{
            display: "flex",
            alignItems: "center",
            width: "100%",
            maxWidth: 940,
            margin: "0 auto",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                background: "var(--accent-color)",
                borderRadius: "8px",
                padding: "6px 11px",
                fontWeight: 700,
                color: "#fff",
                fontSize: 18,
                letterSpacing: "0.04em",
              }}
            >
              FileInsight
            </span>
            <span
              style={{
                color: "var(--primary-color)",
                fontSize: 15,
                fontWeight: 600,
                marginLeft: 6,
              }}
            >
              Demo
            </span>
          </div>
          {user && (
            <button
              onClick={handleSignOut}
              style={{
                background: "rgba(36,99,235,0.07)",
                color: "var(--primary-color)",
                border: "none",
                borderRadius: 6,
                fontWeight: 500,
                cursor: "pointer",
                fontSize: 15,
                padding: "6px 18px",
                marginRight: 8,
              }}
              aria-label="Sign out"
            >
              Sign Out
            </button>
          )}
        </nav>
      </header>
      <main
        style={{
          width: "100%",
          minHeight: "92vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
          paddingTop: 20,
          background: "var(--bg-primary)",
        }}
      >
        <div
          className="container"
          style={{
            width: "90vw",
            maxWidth: 480,
            margin: "36px auto 0",
            padding: "32px 18px",
            background: "var(--bg-secondary)",
            borderRadius: 18,
            boxShadow: "0 4px 24px rgba(36,99,235,0.09)",
            display: "flex",
            flexDirection: "column",
            gap: 22,
            alignItems: "stretch",
          }}
        >
          {/* Main UI */}
          <h1
            style={{
              fontWeight: 900,
              fontSize: "2.1rem",
              color: "var(--accent-color)",
              margin: "0 0 4px 0",
              textAlign: "center",
              letterSpacing: "0.04em",
            }}
          >
            FileInsight
          </h1>
          <p
            style={{
              color: "var(--secondary-color)",
              fontSize: 15,
              marginBottom: 14,
              textAlign: "center",
              maxWidth: 360,
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            Instantly upload, preview, and question your PDFs/books. <br />
            All powered by Supabase and a clean UI.
          </p>

          {/* Conditional UI */}
          {initializing ? (
            <div style={{ textAlign: "center", padding: 28, fontSize: 17 }}>Loading...</div>
          ) : !user ? (
            <AuthView />
          ) : (
            <>
              <div
                style={{
                  color: "var(--primary-color)",
                  fontWeight: 500,
                  marginBottom: 6,
                  fontSize: 15,
                }}
              >
                {user.email && (
                  <span>
                    Signed in as <strong>{user.email}</strong>
                  </span>
                )}
              </div>
              <UploadView />
              <FilePreview />
              <AskQuestion />
            </>
          )}
        </div>
        <footer
          style={{
            marginTop: 48,
            color: "var(--secondary-color)",
            fontSize: 15,
            opacity: 0.7,
          }}
        >
          &copy; {new Date().getFullYear()} FileInsight. Modern file Q&amp;A. Powered by Supabase.
        </footer>
      </main>
    </div>
  );
}

export default App;
