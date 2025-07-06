import React, { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import "./LoginPage.css";

/**
 * PUBLIC_INTERFACE
 * ResetPasswordPage component – allows a user to request a reset password email via Supabase Auth.
 */
function getSupabaseEnvVars() {
  const url = process.env.REACT_APP_SUPABASE_URL || "";
  const key = process.env.REACT_APP_SUPABASE_KEY || "";
  if (!url || !key) {
    // Fallback for dev
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

function Logo() {
  return (
    <div className="lp-logo-wrap">
      <div className="lp-logo-circle">
        <svg
          width="36"
          height="36"
          viewBox="0 0 36 36"
          fill="none"
          aria-hidden="true"
        >
          <ellipse cx="18" cy="22.3" rx="10.6" ry="3.7" fill="#b9a4e4" />
          <path
            d="M17.5 7C13.5 12 12 22 17.5 22C23 22 21.5 12 17.5 7Z"
            fill="#624e8d"
            stroke="#b9a4e4"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <circle cx="17.5" cy="11.7" r="1.1" fill="#fff" />
        </svg>
      </div>
    </div>
  );
}

function EmailIcon() {
  return (
    <svg width="18" height="18" aria-hidden="true" fill="none" viewBox="0 0 20 20">
      <rect x="1.9" y="3.1" width="16.2" height="13.8" rx="2.5" stroke="#fff" strokeOpacity="0.6" strokeWidth="1.5"/>
      <path d="M3.2 5.2L10 11.2L16.8 5.2" stroke="#fff" strokeOpacity="0.75" strokeWidth="1.3"/>
    </svg>
  );
}

function ResetPasswordPage({ onLoginLink, onSignupLink }) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // PUBLIC_INTERFACE: handles password reset form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setSent(false);

    if (!email.match(/^[^@\s]+@[^@\s]+\.[^@\s]+$/)) {
      setErrorMsg("Enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      const supabase = supabaseClientSingleton();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin // Guides user back here after link
      });
      if (error) {
        setErrorMsg(error.message || "Could not send password reset email.");
        setSuccessMsg("");
        setSent(false);
        return;
      }
      setSent(true);
      setSuccessMsg("Reset email sent! Please check your inbox and spam folder.");
    } catch (e) {
      setErrorMsg(e?.message || "Reset failed. Try again later.");
      setSuccessMsg("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lp-bg">
      <div className="lp-container">
        <Logo />
        <div className="lp-title">Reset Password</div>
        <form className="lp-form" onSubmit={handleSubmit} autoComplete="off">
          <div className="lp-input-group lp-input-email">
            <span className="lp-icon-left"><EmailIcon /></span>
            <input
              type="email"
              autoComplete="email"
              placeholder="Your email address"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="lp-input"
              aria-label="Email address"
              disabled={loading || sent}
              spellCheck={false}
            />
          </div>
          {errorMsg && <div className="lp-error" role="alert">{errorMsg}</div>}
          {successMsg && <div className="lp-error" style={{background:"#d9ffe9",color:"#355141"}} role="status">{successMsg}</div>}
          <button
            className="lp-btn"
            type="submit"
            disabled={loading || sent}
            aria-busy={loading}
          >
            {loading ? "Sending..." : sent ? "Reset Email Sent" : "Send Reset Email"}
          </button>
        </form>
        {/* navigation links */}
        <div className="lp-signup" style={{marginTop:16}}>
          <span className="lp-signup-hint">Remembered your password? </span>
          <span
            className="lp-signup-link"
            onClick={onLoginLink}
            role="link"
            tabIndex={0}
            aria-label="Back to login"
            style={{ pointerEvents: loading ? "none" : undefined, opacity: loading ? 0.7 : 1 }}
          >Log in</span>
        </div>
        <div className="lp-signup" style={{marginTop:5}}>
          <span className="lp-signup-hint">Need a new account? </span>
          <span
            className="lp-signup-link"
            onClick={onSignupLink}
            role="link"
            tabIndex={0}
            aria-label="Sign up"
            style={{ pointerEvents: loading ? "none" : undefined, opacity: loading ? 0.7 : 1 }}
          >Sign up</span>
        </div>
      </div>
    </div>
  );
}

export default ResetPasswordPage;
