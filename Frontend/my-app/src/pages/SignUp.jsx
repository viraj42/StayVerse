import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../styles/Login.css";
import Alert from "../components/Alert"; 
import { registerUser } from "../api/auth.api";
import useAuth from "../utils/useAuth";

function SignUp() {
    const [alertMsg, setAlertMsg] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "guest"
  });

  const navigate = useNavigate();
  const { login } = useAuth();

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setAlertMsg("");

    try {
      const data = await registerUser({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role
      });

      login(data.user, data.token);

      if (data.user.role === "host") {
        navigate("/host/dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setAlertMsg(err.message || "Sign up failed");
    }
  };

  const onChangeHandler = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <>
    <Alert msg={alertMsg} shut={() => setAlertMsg("")} />

    <div className="auth-page-center">
      <div className="login-card">
        <h2>Create Account</h2>
        <br />

        <form className="login-form" onSubmit={onSubmitHandler}>

     
          <div className="field">
            <select
              name="role"
              value={formData.role}
              onChange={onChangeHandler}
              required
            >
              <option value="guest">Guest</option>
              <option value="host">Host</option>
            </select>
          </div>


          <div className="field">
            <span className="input-icon">👤</span>
            <input
              type="text"
              placeholder="Full Name"
              name="name"
              value={formData.name}
              onChange={onChangeHandler}
              required
            />
          </div>

          <div className="field">
            <span className="input-icon">📧</span>
            <input
              type="email"
              placeholder="Email"
              name="email"
              value={formData.email}
              onChange={onChangeHandler}
              required
            />
          </div>

          <div className="field">
            <span className="input-icon">🔒</span>
            <input
              type="password"
              placeholder="Password"
              name="password"
              value={formData.password}
              onChange={onChangeHandler}
              required
            />
          </div>

          <button type="submit">Sign Up</button>
        </form>

        <p className="signup-redirect">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
    </>
  );
}

export default SignUp;
