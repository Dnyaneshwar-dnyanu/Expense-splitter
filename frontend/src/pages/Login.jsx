import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

export default function Login() {
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

  const [form, setForm] = useState({ email: "", password: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const login = async () => {
    try {
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

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        toast.error(errorData.message || "Login failed on server.");
        return;
      }

      let data = await res.json();

      if (data.auth) {
        navigate(`/${data.user._id}/dashboard`);
        toast.success("logged in successfully!");
      }
      else {
        toast.error(data.message);
        setForm({ ...form, password: "" });
      }
    } catch (error) {
      console.error("Login failed:", error);
      toast.error("Network error, please try again later.");
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f7faf9] px-4 py-10 sm:px-6">
      {/* Background decoration */}
      <div className="pointer-events-none absolute -left-40 -top-40 h-[450px] w-[450px] rounded-full bg-sky-200/40 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-[450px] w-[450px] rounded-full bg-emerald-200/40 blur-[120px]" />

      {/* Main layout */}
      <motion.div
        initial={{ opacity: 0, y: 25, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative grid w-full max-w-6xl overflow-hidden rounded-[2rem] border border-white bg-white/90 shadow-[0_30px_100px_-35px_rgba(15,23,42,0.25)] backdrop-blur-xl lg:grid-cols-[1fr_0.9fr]"
      >
        {/* LEFT - BRANDING */}
        <div className="relative hidden min-h-[680px] flex-col justify-between overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950 p-10 text-white lg:flex xl:p-14">
          {/* Decorative orbs */}
          <div className="absolute -right-24 top-10 h-72 w-72 rounded-full border-[45px] border-white/[0.035]" /> 
          <div className="absolute -bottom-36 -left-24 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
          <div className="absolute right-10 top-1/2 h-64 w-64 rounded-full bg-sky-500/[0.08] blur-[90px]" />

          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="relative z-10"
          >
            <Link to="/" className="inline-flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-emerald-400 text-2xl font-black text-white shadow-lg shadow-emerald-500/20">
                ₹
              </div>
              <span className="text-2xl font-black tracking-tight">
                Split<span className="text-emerald-400">Wise.</span>
              </span>
            </Link>

            <div className="mt-24 max-w-md">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-xs font-bold tracking-widest text-emerald-300">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                YOUR MONEY, IN SYNC
              </span>

              <h1 className="mt-7 text-5xl font-black leading-[1.12] tracking-tight xl:text-6xl">
                Good to see
                <br />
                <span className="bg-gradient-to-r from-sky-300 to-emerald-300 bg-clip-text text-transparent">
                  you again.
                </span>
              </h1>

              <p className="mt-6 max-w-sm text-base leading-8 text-slate-300">
                Pick up right where you left off.
                Your groups, shared expenses, and balances
                are just one step away.
              </p>
            </div>
          </motion.div>

          {/* Decorative dashboard preview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.7 }}
            className="relative z-10 mt-12"
          >
            <div className="rounded-3xl border border-white/10 bg-white/[0.07] p-5 shadow-2xl backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-400">
                    GROUP EXPENSES
                  </p>
                  <p className="mt-2 text-2xl font-black">₹8,450</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-400/10 text-2xl">
                  💸
                </div>
              </div>

              <div className="my-5 h-px bg-white/10" />

              <div className="flex items-center justify-between">
                <div className="flex -space-x-3">
                  {[
                    { letter: "A", color: "bg-sky-500" },
                    { letter: "S", color: "bg-orange-400" },
                    { letter: "J", color: "bg-violet-500" },
                    { letter: "+", color: "bg-emerald-500" },
                  ].map((person, i) => (
                    <div
                      key={i}
                      className={`flex h-10 w-10 items-center justify-center rounded-full border-[3px] border-slate-800 text-xs font-black text-white ${person.color}`}
                    >
                      {person.letter}
                    </div>
                  ))}
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium text-slate-400">
                    Friends together
                  </p>
                  <p className="mt-1 text-sm font-bold text-emerald-300">
                    All in one place
                  </p>
                </div>
              </div>
            </div>

            <p className="mt-6 text-xs font-medium tracking-wide text-slate-500">
              © {new Date().getFullYear()} SplitWise. Split bills, keep friends.
            </p>
          </motion.div>
        </div>

        {/* RIGHT - LOGIN */}
        <div className="relative flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-14 xl:px-16">
          {/* Mobile brand */}
          <div className="mb-12 flex items-center justify-between lg:hidden">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-emerald-500 text-xl font-black text-white">
                ₹
              </div>
              <span className="text-xl font-black tracking-tight">
                Split<span className="text-emerald-500">Wise.</span>
              </span>
            </Link>
            <Link
              to="/"
              className="text-sm font-semibold text-slate-500 transition hover:text-emerald-600"
            >
              Home ↗
            </Link>
          </div>

          {/* Heading */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-3xl">
              👋
            </div>

            <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-600">
              Welcome back
            </p>

            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
              Sign in to your
              <br />
              account.
            </h2>

            <p className="mt-4 text-sm leading-7 text-slate-500">
              Your expenses aren't going to split themselves.
              Let's get you back in.
            </p>
          </motion.div>

          {/* FORM */}
          <div className="mt-10 space-y-6">
            {/* Email */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
            >
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-bold text-slate-700"
              >
                Email address
              </label>

              <div className="group relative">
                <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-slate-400 transition group-focus-within:text-emerald-500">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-5 w-5"
                  >
                    <rect x="3" y="5" width="18" height="14" rx="3" />
                    <path d="m4 7 8 6 8-6" />
                  </svg>
                </div>

                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  onChange={handleChange}
                  name="email"
                  value={form.email}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 py-4 pl-12 pr-4 text-sm font-medium text-slate-900 outline-none transition-all duration-300 placeholder:text-slate-400 hover:border-slate-300 focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-400/10"
                />
              </div>
            </motion.div>

            {/* Password */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
            >
              <div className="mb-2 flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="text-sm font-bold text-slate-700"
                >
                  Password
                </label>
              </div>

              <div className="group relative">
                <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-slate-400 transition group-focus-within:text-emerald-500">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-5 w-5"
                  >
                    <rect x="5" y="10" width="14" height="11" rx="2" />
                    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                    <path d="M12 14v3" />
                  </svg>
                </div>

                <input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  onChange={handleChange}
                  name="password"
                  value={form.password}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 py-4 pl-12 pr-4 text-sm font-medium text-slate-900 outline-none transition-all duration-300 placeholder:text-slate-400 hover:border-slate-300 focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-400/10"
                />
              </div>
            </motion.div>

            {/* Login button */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
              className="pt-2"
            >
              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => login()}
                className="group flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 py-4 text-sm font-black text-white shadow-lg shadow-emerald-500/20 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/30 focus:outline-none focus:ring-4 focus:ring-emerald-400/30"
              >
                Sign in to account
                <span className="text-lg transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
              </motion.button>
            </motion.div>
          </div>

          {/* Register */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-9 text-center"
          >
            <p className="text-sm font-medium text-slate-500">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="font-black text-emerald-600 underline decoration-emerald-300 underline-offset-4 transition hover:text-emerald-700"
              >
                Create one
              </Link>
            </p>
          </motion.div>

          {/* Security footer */}
          <div className="mt-12 flex items-center justify-center gap-2 border-t border-slate-100 pt-6 text-xs font-semibold tracking-wide text-slate-400">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="h-4 w-4 text-emerald-500"
            >
              <rect x="5" y="10" width="14" height="11" rx="2" />
              <path d="M8 10V7a4 4 0 0 1 8 0v3" />
            </svg>
            SECURE · SIMPLE · SMART
          </div>
        </div>
      </motion.div>
    </div>
  );

}

