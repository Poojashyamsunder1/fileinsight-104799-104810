import React, { useState } from "react";
import "./App.css";
import LoginPage from "./LoginPage";
import SignupPage from "./SignupPage";
import ResetPasswordPage from "./ResetPasswordPage";
import FileUpload from "./FileUpload";

/**
 * PUBLIC_INTERFACE
 * App (root component)
 * Handles in-memory navigation between login, signup, and password reset views.
 * After login/signup, takes user to file upload UI
 */
function App() {
  // 'login' | 'signup' | 'reset' | 'upload'
  const [view, setView] = useState("login");
  const [userObj, setUserObj] = useState(null);

  // After login/signup, transition to upload
  const toUpload = (u) => {
    setUserObj(u || true); // just flag
    setView("upload");
  };

  return (
    <>
      {view === "login" && (
        <LoginPage
          onLogin={toUpload}
          onSignupLink={() => setView("signup")}
          onPasswordReset={() => setView("reset")}
        />
      )}
      {view === "signup" && (
        <SignupPage
          onSignup={toUpload}
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
      {view === "upload" &&
        <div>
          <FileUpload />
        </div>
      }
    </>
  );
}

export default App;
