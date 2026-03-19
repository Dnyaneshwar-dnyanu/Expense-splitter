import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { motion } from "framer-motion";


export default function Register() {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/getUser`, {
          method: 'GET',
          credentials: 'include'
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.user) {
            navigate(`/${data.user._id}/dashboard`);
          }
        }
      } catch (err) {
        console.error("Auth check failed", err);
      }
    };
    checkAuth();
  }, [navigate]);

  const [form, setForm] = useState({ name: "", username: "", email: "", password: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  const register = async () => {
    try {
      if (form.username.trim().length < 3 || form.email.trim().length < 3 || form.password.trim().length < 3) {
        toast.error("Fill the correct details!")
        return;
      }
      
      let res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form)
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        toast.error(errorData.message || "Registration failed on server.");
        return;
      }

      let data = await res.json();

      if (data.auth) {
        navigate(`/login`);
        toast.success("Successfully Registered! Please login");
      }
      else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Registration failed:", error);
      toast.error("Network error, please try again later.");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-200 via-white to-emerald-200 px-4 py-8">
      {/* Card */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-4xl bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden grid md:grid-cols-2"
      >

        {/* Left Branding Side */}
        <div className="hidden md:flex flex-col justify-between p-10 bg-gradient-to-br from-emerald-500 to-sky-500 text-white">
          <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
            <h1 className="text-3xl font-bold tracking-wide">SplitWise 💳</h1>
            <p className="mt-3 text-white/90 font-medium">
              Create your account and start managing your shared expenses.
            </p>
          </motion.div>

          {/* Illustration */}
          <div className="mt-10">
            <div className="relative w-full h-52">
              <div className="absolute bottom-0 left-0 w-full h-28 bg-sky-900/30 rounded-t-[100px]" />
              <div className="absolute bottom-0 left-10 w-40 h-24 bg-white/20 rounded-t-[80px]" />
              <div className="absolute bottom-0 right-10 w-52 h-32 bg-white/15 rounded-t-[100px]" />
              <div className="absolute top-2 left-10 w-16 h-16 bg-yellow-200 rounded-full blur-sm" />
            </div>
            <p className="text-sm text-white/90 mt-4 font-bold italic">
              “Register → Split → Relax 🤝”
            </p>
          </div>

          <p className="text-xs text-white/70 font-medium">
            © {new Date().getFullYear()} SplitWise. All rights reserved.
          </p>
        </div>

        {/* Right Register Form */}
        <div className="p-8 md:p-10 text-black flex flex-col justify-center">
          <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
            <h2 className="text-3xl font-black text-gray-800">Create account 🧾</h2>
            <p className="text-gray-500 mt-2 font-medium">
              Join us and simplify your group finances
            </p>
          </motion.div>

          <div className="mt-10 space-y-5">
            {/* Name */}
            <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}>
              <label className="text-sm font-bold text-gray-700 ml-1">
                Full Name
              </label>
              <input
                type="text"
                placeholder="Your name"
                onChange={handleChange}
                name="name"
                value={form.name}
                className="mt-2 w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-4 focus:ring-sky-200 focus:border-sky-400 transition bg-white/50"
              />
            </motion.div>

            {/* Username */}
            <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.45 }}>
              <label className="text-sm font-bold text-gray-700 ml-1">
                Username
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">@</span>
                <input
                  type="text"
                  placeholder="username"
                  onChange={handleChange}
                  name="username"
                  value={form.username}
                  className="mt-2 w-full pl-9 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-4 focus:ring-sky-200 focus:border-sky-400 transition bg-white/50"
                />
              </div>
            </motion.div>

            {/* Email */}
            <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}>
              <label className="text-sm font-bold text-gray-700 ml-1">
                Email Address
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                onChange={handleChange}
                name="email"
                value={form.email}
                className="mt-2 w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-4 focus:ring-emerald-200 focus:border-emerald-400 transition bg-white/50"
              />
            </motion.div>

            {/* Password */}
            <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }}>
              <label className="text-sm font-bold text-gray-700 ml-1">
                Create Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                onChange={handleChange}
                name="password"
                value={form.password}
                className="mt-2 w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-4 focus:ring-sky-200 focus:border-sky-400 transition bg-white/50"
              />
            </motion.div>

            {/* Button */}
            <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.7 }}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={register}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-sky-500 text-white font-black shadow-lg hover:shadow-xl transition active:shadow-inner"
              >
                Register Account
              </motion.button>
            </motion.div>

            {/* Login link */}
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="text-sm text-gray-600 text-center mt-4">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-bold text-emerald-600 hover:text-emerald-700 underline underline-offset-4"
              >
                Login here
              </Link>
            </motion.p>
          </div>

          {/* Small Footer */}
          <div className="mt-12 text-center text-xs text-gray-400 font-bold uppercase tracking-widest">
            Safe • Easy • Transparent
          </div>
        </div>
      </motion.div>
    </div>
  );
}