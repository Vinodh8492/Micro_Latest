import React, { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";

const PasswordInputField = ({
  name,
  placeholder,
  value,
  onChange,
  icon,
  isVisible,
  toggleVisibility,
}) => (
  <div className="relative">
    {icon && <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">{icon}</span>}
    <input
      name={name}
      type={isVisible ? "text" : "password"}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
    <span
      onClick={toggleVisibility}
      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer"
    >
      {isVisible ? <FiEyeOff /> : <FiEye />}
    </span>
  </div>
);

const InputField = ({ name, type = "text", placeholder, value, onChange, icon }) => (
  <div className="relative">
    {icon && <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">{icon}</span>}
    <input
      name={name}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  </div>
);

const Login = () => {
  const { user, login } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "operator",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      if (isRegister) {
        const { full_name, username, email, password, confirmPassword, role } = formData;

        if (!username || !email || !password || !confirmPassword) {
          setError("All fields are required");
          return;
        }

        if (password !== confirmPassword) {
          setError("Passwords do not match");
          return;
        }

        await axios.post("http://127.0.0.1:5000/api/users", {
          full_name,
          username,
          email,
          password,
          role,
        });

        setSuccess("Registration successful! You can now log in.");
        setIsRegister(false);
        setFormData({
          full_name: "",
          username: "",
          email: "",
          password: "",
          confirmPassword: "",
          role: "operator",
        });
      } else {
        const { email, password } = formData;

        const res = await axios.post(
          "http://127.0.0.1:5000/api/users/login",
          { email, password },
          { withCredentials: true }
        );

        if (res.data.access_token && res.data.user) {
          login(res.data.user, res.data.access_token);
          navigate("/dashboard", {
            state: { message: `Login successful as ${res.data.user.role}` },
          });
        } else {
          setError("Login failed: Invalid credentials.");
        }
      }
    } catch (err) {
      const msg =
        err.response?.data?.error || err.response?.data?.message || "An error occurred";
      setError(msg);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 transition-colors duration-300 px-4">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h2 className="text-3xl font-extrabold text-center text-gray-800 dark:text-white mb-6">
          {isRegister ? "Create an Account" : "Welcome Back"}
        </h2>

        {error && <p className="text-red-600 dark:text-red-400 text-center mb-2">{error}</p>}
        {success && <p className="text-green-600 dark:text-green-400 text-center mb-2">{success}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <>
              <InputField
                name="full_name"
                placeholder="Full Name"
                value={formData.full_name}
                onChange={handleInputChange}
                icon={<FiUser />}
              />
              <InputField
                name="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleInputChange}
                icon={<FiUser />}
              />
            </>
          )}

          <InputField
            name="email"
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleInputChange}
            icon={<FiMail />}
          />

          <PasswordInputField
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleInputChange}
            icon={<FiLock />}
            isVisible={showPassword}
            toggleVisibility={() => setShowPassword(!showPassword)}
          />

          {isRegister && (
            <>
              <PasswordInputField
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                icon={<FiLock />}
                isVisible={showConfirmPassword}
                toggleVisibility={() => setShowConfirmPassword(!showConfirmPassword)}
              />
              <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="operator">Operator</option>
                <option value="admin">Admin</option>
              </select>
            </>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition-all"
          >
            {isRegister ? "Register" : "Login"}
          </button>
        </form>

        <p className="text-sm text-center text-gray-600 dark:text-gray-300 mt-4">
          {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
          <button
            onClick={() => {
              setIsRegister(!isRegister);
              setError("");
              setSuccess("");
              setShowPassword(false);
              setShowConfirmPassword(false);
            }}
            className="text-blue-500 hover:underline font-medium"
          >
            {isRegister ? "Login here" : "Register here"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
