import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.email || !formData.password) {
      setError("Please fill in both fields.");
      return;
    }

    setIsSubmitting(true);

    try {
      await login(formData);
      navigate("/");
    } catch (err) {
      setError(err.message);
      setIsSubmitting(false);
    }
  };

  return (
    <main className="gradient-bg-services flex min-h-[75vh] w-full items-center justify-center px-5 py-12 sm:px-8">
      <div className="blue-glassmorphism w-full max-w-sm rounded-xl p-5 sm:p-8">
        <h1 className="mb-6 text-center text-2xl font-semibold text-white sm:text-3xl">Log In</h1>

        {error && <p role="alert" className="mb-4 text-center text-sm text-red-400">{error}</p>}

        <form onSubmit={handleSubmit} className="flex flex-col">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="white-glassmorphism my-2 min-h-[48px] w-full rounded-lg bg-transparent p-3 text-base text-white outline-none"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="white-glassmorphism my-2 min-h-[48px] w-full rounded-lg bg-transparent p-3 text-base text-white outline-none"
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-4 min-h-[48px] w-full cursor-pointer rounded-full border border-[#3d4f7c] px-5 py-3 font-semibold text-white hover:bg-[#3d4f7c] disabled:opacity-50"
          >
            {isSubmitting ? "Logging in..." : "Log In"}
          </button>
        </form>

        <p className="text-gray-400 text-sm text-center mt-6">
          Don&apos;t have an account?{" "}
          <Link to="/signup" className="text-[#2952e3] hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </main>
  );
};

export default LoginPage;
