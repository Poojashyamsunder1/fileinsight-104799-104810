import React, { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import "./LoginPage.css";

/**
 * PUBLIC_INTERFACE
 * SignupPage component – for new user registration (email/password) with Supabase,
 * matching LoginPage design and with navigation to login/reset screens.
 */
function getSupabaseEnvVars() {
  const url = process.env.REACT_APP_SUPABASE_URL || "";
  const key = process.env.REACT_APP_SUPABASE_KEY || "";
  if (!url || !key) {
    // Fallback for dev
    console.warn("[Supabase] Env missing – using demo. Set REACT_APP_SUPABASE_URL/KEY in .env.local for production.");
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
function PasswordIcon() {
  return (
    <svg width="18" height="18" aria-hidden="true" fill="none" viewBox="0 0 20 20">
      <rect x="3.1" y="8.5" width="13.8" height="7.2" rx="2.2" stroke="#fff" strokeOpacity="0.65" strokeWidth="1.5"/>
      <ellipse cx="10" cy="12.3" rx="1.6" ry="1.5" fill="#fff" fillOpacity="0.62"/>
      <path d="M5.8 8.5V6.8C5.8 4.3 8.2 2.4 10 2.4c1.8 0 4.2 1.9 4.2 4.4v1.8"
        stroke="#fff" strokeOpacity="0.74" strokeWidth="1.5"/>
    </svg>
  );
}
function EyeIcon({ shown }) {
  return shown ? (
    <svg width="19" height="19" viewBox="0 0 20 20" fill="none">
      <ellipse cx="10" cy="10" rx="7.3" ry="4.8" stroke="#fff" strokeOpacity="0.66" strokeWidth="1.5"/>
      <circle cx="10" cy="10" r="2.1" fill="#fff" fillOpacity="0.62"/>
    </svg>
  ) : (
    <svg width="19" height="19" viewBox="0 0 20 20" fill="none">
      <ellipse cx="10" cy="10" rx="7.3" ry="4.8" stroke="#fff" strokeOpacity="0.66" strokeWidth="1.5"/>
      <circle cx="10" cy="10" r="2.1" fill="#fff" fillOpacity="0.62"/>
      <line x1="4" y1="16" x2="16" y2="4" stroke="#fff" strokeWidth="1.3" strokeOpacity="0.7"/>
    </svg>
  );
}

// PUBLIC_INTERFACE
function SignupPage({ onSignup, onLoginLink, onPasswordReset }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pw2, setPw2] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // PUBLIC_INTERFACE: handles signup form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    if (!email.match(/^[^@\s]+@[^@\s]+\.[^@\s]+$/)) {
      setErrorMsg("Enter a valid email address.");
      return;
    }
    if (password.length < 6 || pw2.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }
    if (password !== pw2) {
      setErrorMsg("Passwords do not match.");
      return;
    }
    setLoading(true);

    try {
      const supabase = supabaseClientSingleton();
      const { error, data } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) {
        setErrorMsg(error.message || "Signup failed.");
        setSuccessMsg("");
        return;
      }
      setSuccessMsg(
        "Signup successful! Please check your email to confirm your account."
      );
      if (onSignup) setTimeout(() => onSignup(data?.user), 600);
    } catch (e) {
      setErrorMsg(e?.message || "Signup failed. Try again later.");
      setSuccessMsg("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lp-bg">
      <div className="lp-container">
        <Logo />
        <div className="lp-title">Create Account</div>
        <form className="lp-form" onSubmit={handleSubmit} autoComplete="on">
          {/* Email input */}
          <div className="lp-input-group lp-input-email">
            <span className="lp-icon-left"><EmailIcon /></span>
            <input
              type="email"
              autoComplete="email"
              placeholder="Email address"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="lp-input"
              aria-label="Email address"
              disabled={loading}
              spellCheck={false}
            />
          </div>
          {/* Password input */}
          <div className="lp-input-group lp-input-password">
            <span className="lp-icon-left"><PasswordIcon /></span>
            <input
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="lp-input"
              aria-label="Password"
              disabled={loading}
              spellCheck={false}
              minLength={6}
            />
            <span
              className="lp-icon-right"
              role="button"
              tabIndex={0}
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              <EyeIcon shown={showPassword} />
            </span>
          </div>
          {/* Confirm password */}
          <div className="lp-input-group lp-input-password">
            <span className="lp-icon-left"><PasswordIcon /></span>
            <input
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Confirm password"
              required
              value={pw2}
              onChange={e => setPw2(e.target.value)}
              className="lp-input"
              aria-label="Confirm password"
              disabled={loading}
              spellCheck={false}
              minLength={6}
            />
          </div>
          {/* Error or Success message */}
          {errorMsg && <div className="lp-error" role="alert">{errorMsg}</div>}
          {successMsg && <div className="lp-error" style={{background:"#d9ffe9",color:"#355141"}} role="status">{successMsg}</div>}
          {/* Signup button */}
          <button
            className="lp-btn"
            type="submit"
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? "Creating account..." : "Sign up"}
          </button>
        </form>
        {/* Navigation links */}
        <div className="lp-signup" style={{marginTop:16}}>
          <span className="lp-signup-hint">Already have an account? </span>
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
          <span className="lp-signup-hint">Forgot password? </span>
          <span
            className="lp-signup-link"
            onClick={onPasswordReset}
            role="link"
            tabIndex={0}
            aria-label="Reset password"
            style={{ pointerEvents: loading ? "none" : undefined, opacity: loading ? 0.7 : 1 }}
          >Reset</span>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;
