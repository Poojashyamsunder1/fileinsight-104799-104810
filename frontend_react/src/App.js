import React, { useState } from "react";
import "./App.css";
import LoginPage from "./LoginPage";
import SignupPage from "./SignupPage";
import ResetPasswordPage from "./ResetPasswordPage";

/**
 * PUBLIC_INTERFACE
 * App (root component)
 * Handles in-memory navigation between login, signup, and password reset views.
 */
function App() {
  // 'login' | 'signup' | 'reset'
  const [view, setView] = useState("login");
  // After login/signup, you would normally set user and transition to the main app/dashboard, etc.

  return (
    <>
      {view === "login" && (
        <LoginPage
          onLogin={() => { /* TODO: proceed to the main app after login (future) */ }}
          onSignupLink={() => setView("signup")}
          onPasswordReset={() => setView("reset")}
        />
      )}
      {view === "signup" && (
        <SignupPage
          onSignup={() => setView("login")}
          onLoginLink={() => setView("login")}
          onPasswordReset={() => setView("reset")}
        />
      )}
      {view === "reset" && (
        <ResetPasswordPage
          onLoginLink={() => setView("login")}
          onSignupLink={() => setView("signup")}
        />
      )}
    </>
  );
}

export default App;
