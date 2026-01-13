import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../styles/Login.css";
import Alert from "../components/Alert";   
import { loginUser } from "../api/auth.api";
import useAuth from "../utils/useAuth";

function Login() {
    const [alertMsg, setAlertMsg] = useState("");
  const [formData, setFormData] = useState({
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
      const data = await loginUser({
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
      setAlertMsg(err.message || "Login failed");
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
        <h2>Login Account</h2>
        <br />

        <form className="login-form" onSubmit={onSubmitHandler}>

  {/* Role */}
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

  {/* Email */}
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

  {/* Password */}
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

  <button type="submit">Sign In</button>
</form>
        <p className="signup-redirect">
          Don’t have an account? <Link to="/signup">Sign Up</Link>
        </p>
      </div>
    </div>
</>
  );
}

export default Login;
