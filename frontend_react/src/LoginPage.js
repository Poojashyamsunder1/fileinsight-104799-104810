import React, { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import "./LoginPage.css";

/**
 * PUBLIC_INTERFACE
 * LoginPage component – minimal, modern, and responsive login UI matching extracted layout and style,
 * with full Supabase authentication integration, based on assets/login_page_design_notes.md.
 *
 * - Uses single-column, vertically/horizontally centered layout.
 * - Includes logo (SVG), title, email+password with icons, show/hide password, forgot password link, login button, sign up link.
 * - All styles match modern/minimal purple theme – see LoginPage.css for details.
 */

/**
 * SUPABASE CONFIG
 * For security: Expects credentials in REACT_APP_SUPABASE_URL/KEY (set via environment or .env.local and not checked into version control).
 * Fallbacks below for dev, but production should set env vars.
 */
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || "https://sirvwsslwxxxuysywyan.supabase.co";
const SUPABASE_KEY = process.env.REACT_APP_SUPABASE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpcnZ3c3Nsd3h4eHV5c3l3eWFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1MDk1NTgsImV4cCI6MjA2NzA4NTU1OH0.DfGb7i74DGejUnKuzKDiubyM2OsL_Qx0QIYtaZPiwos";

/**
 * Memoized singleton for Supabase client.
 * Do NOT expose SUPABASE_KEY anywhere in the UI/DOM.
 */
const supabaseClientSingleton = (() => {
  let instance = null;
  return () => {
    if (!instance) {
      instance = createClient(SUPABASE_URL, SUPABASE_KEY);
    }
    return instance;
  };
})();

function Logo() {
  // App logo: circular background with SVG wizard-hat icon.
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
          {/* Wizard hat SVG */}
          <ellipse cx="18" cy="22.3" rx="10.6" ry="3.7" fill="#b9a4e4"/>
          <path
            d="M17.5 7C13.5 12 12 22 17.5 22C23 22 21.5 12 17.5 7Z"
            fill="#624e8d"
            stroke="#b9a4e4"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <circle cx="17.5" cy="11.7" r="1.1" fill="#fff"/>
        </svg>
      </div>
    </div>
  );
}

// Email and password field icons.
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
  // Password visibilty toggle: eye open/closed
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
function LoginPage({ onLogin, onSignupLink, onPasswordReset }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // PUBLIC_INTERFACE: handles login form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);

    try {
      const supabase = supabaseClientSingleton();
      // Sign-in attempt:
      const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMsg(error.message || "Invalid email or password.");
        setSuccessMsg("");
        // Optionally, mark input borders red here.
        return;
      }

      // If authenticated: show a transient success, then call onLogin()
      setSuccessMsg("Login successful! Redirecting...");
      if (onLogin) setTimeout(() => onLogin(data?.user), 400); // just a brief msg before redirect

    } catch (e) {
      setErrorMsg(e?.message || "Login failed. Please try again.");
      setSuccessMsg("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lp-bg">
      <div className="lp-container">
        <Logo />
        <div className="lp-title">PDF Wizard</div>
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
              autoComplete="current-password"
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
            <span
              className="lp-forgot"
              onClick={onPasswordReset}
              role="link"
              tabIndex={0}
              aria-label="Forgot password"
              style={{ pointerEvents: loading ? "none" : undefined, opacity: loading ? 0.7 : 1 }}
            >
              Forgot password?
            </span>
          </div>
          {/* Error or Success message */}
          {errorMsg && <div className="lp-error" role="alert">{errorMsg}</div>}
          {successMsg && <div className="lp-error" style={{background:"#d9ffe9",color:"#355141"}} role="status">{successMsg}</div>}
          {/* Log in button */}
          <button
            className="lp-btn"
            type="submit"
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? "Logging in..." : "Log in"}
          </button>
        </form>
        {/* Sign up link */}
        <div className="lp-signup">
          <span className="lp-signup-hint">Don’t have an account? </span>
          <span
            className="lp-signup-link"
            onClick={onSignupLink}
            role="link"
            tabIndex={0}
            aria-label="Sign up"
            style={{ pointerEvents: loading ? "none" : undefined, opacity: loading ? 0.7 : 1 }}
          >
            Sign up
          </span>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
