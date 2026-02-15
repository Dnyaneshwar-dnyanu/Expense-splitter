import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "react-toastify";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const login = async () => {

    if (form.email.trim().length < 3 || form.password.trim().length < 3) {
      toast.error("Fill the correct details!")
      return;
    }
    
    let res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(form),
    });

    let data = await res.json();

    if (data.auth) {
      navigate(`/${data.user._id}/dashboard`);
      toast.success("logged in successfully!");
    }
    else {
      toast.error(data.message);
      setForm({ email: "", password: "" });
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-200 via-white to-emerald-200 px-4">
      {/* Card */}
      <div className="w-full max-w-4xl bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden grid md:grid-cols-2">

        {/* Left Side */}
        <div className="hidden md:flex flex-col justify-between p-10 bg-gradient-to-br from-sky-500 to-emerald-500 text-white">
          <div>
            <h1 className="text-3xl font-bold tracking-wide">TripNest 🌍</h1>
            <p className="mt-3 text-white/90">
              Login to explore breathtaking places and plan your next journey.
            </p>
          </div>

          {/* Tourist Illustration */}
          <div className="mt-10">
            <div className="relative w-full h-52">
              <div className="absolute bottom-0 left-0 w-full h-28 bg-emerald-900/30 rounded-t-[100px]" />
              <div className="absolute bottom-0 left-10 w-40 h-24 bg-white/20 rounded-t-[80px]" />
              <div className="absolute bottom-0 right-10 w-52 h-32 bg-white/15 rounded-t-[100px]" />
              <div className="absolute top-2 left-10 w-16 h-16 bg-yellow-200 rounded-full blur-sm" />
            </div>
            <p className="text-sm text-white/90 mt-2">
              “Adventure begins after login.”
            </p>
          </div>

          <p className="text-xs text-white/70">
            © {new Date().getFullYear()} TripNest. All rights reserved.
          </p>
        </div>

        {/* Right Login Form */}
        <div className="p-8 md:p-10 text-black">
          <h2 className="text-2xl font-bold text-gray-800">Welcome back ✈️</h2>
          <p className="text-gray-500 mt-1">
            Login to continue your journey
          </p>

        {/* Login Form */}
          <div className="mt-8 space-y-5">
            {/* Email */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                onChange={handleChange}
                name="email"
                value={form.email}
                className="mt-2 w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-4 focus:ring-sky-200 focus:border-sky-400 transition"
              />
            </div>

            {/* Password */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                onChange={handleChange}
                name="password"
                value={form.password}
                className="mt-2 w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-4 focus:ring-emerald-200 focus:border-emerald-400 transition"
              />
            </div>

            {/* Button */}
            <button
              onClick={() => login()}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-sky-500 to-emerald-500 text-white font-semibold hover:opacity-90 transition shadow-lg"
            >
              Login
            </button>

            {/* Register link */}
            <p className="text-sm text-gray-600 text-center">
              New user?{" "}
              <Link
                to="/register"
                className="font-semibold text-sky-600 hover:text-sky-700"
              >
                Create an account
              </Link>
            </p>
          </div>

          {/* Small Footer */}
          <div className="mt-8 text-center text-xs text-gray-400">
            Secure login • Live happily • Save friendship
          </div>
        </div>
      </div>
    </div>
  );
}
