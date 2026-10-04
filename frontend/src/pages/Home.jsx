import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function Home() {
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };


  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen overflow-hidden bg-[#f7faf9] text-slate-900"
    >
      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 border-b border-slate-200/60 bg-white/80 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-emerald-500 text-xl text-white shadow-lg shadow-emerald-500/20">
              <span>₹</span>
            </div>
            <span className="text-xl font-black tracking-tight">
              Split<span className="text-emerald-500">Wise.</span>
            </span>
          </Link>

          <div className="hidden items-center gap-8 text-sm font-semibold text-slate-600 md:flex">
            <a href="#features" className="transition hover:text-emerald-600">Features</a>
            <a href="#how-it-works" className="transition hover:text-emerald-600">How it works</a>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/login"
              className="rounded-xl px-3 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-100 sm:px-5"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-slate-900/10 transition duration-300 hover:-translate-y-0.5 hover:bg-emerald-600 sm:px-5"
            >
              Get Started <span className="ml-1">↗</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative mx-auto max-w-7xl px-5 pb-20 pt-16 md:px-8 md:pb-28 md:pt-24">
        <div className="pointer-events-none absolute -right-40 top-0 h-96 w-96 rounded-full bg-emerald-200/40 blur-[110px]" />
        <div className="pointer-events-none absolute -left-40 top-40 h-72 w-72 rounded-full bg-sky-200/40 blur-[100px]" />

        <div className="relative grid items-center gap-16 lg:grid-cols-2">
          {/* LEFT */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-4 py-2 text-xs font-bold tracking-wide text-emerald-700">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
              MONEY MANAGEMENT, MADE SOCIAL
            </div>

            <h1 className="max-w-2xl text-5xl font-black leading-[1.1] tracking-[-0.045em] sm:text-6xl lg:text-[4.5rem]">
              Good times.
              <br />
              <span className="bg-gradient-to-r from-sky-500 via-teal-500 to-emerald-500 bg-clip-text text-transparent">
                Fair splits.
              </span>
              <br />
              Zero awkwardness.
            </h1>

            <p className="mt-7 max-w-lg text-base leading-8 text-slate-500 sm:text-lg">
              Trips, dinners, rent, and everything in between.
              Split expenses with friends, track every rupee,
              and settle up without the headache.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-4">
              <motion.div whileHover={{ y: -3 }} whileTap={{ scale: 0.97 }}>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 px-7 py-4 font-bold text-white shadow-xl shadow-emerald-500/25 transition hover:shadow-emerald-500/40"
                >
                  Start splitting
                  <span className="text-xl">→</span>
                </Link>
              </motion.div>

              <motion.div whileHover={{ y: -3 }} whileTap={{ scale: 0.97 }}>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-7 py-4 font-bold text-slate-700 shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50/50"
                >
                  Explore your account
                </Link>
              </motion.div>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm font-medium text-slate-500">
              <span className="flex items-center gap-2">
                <span className="text-emerald-500">✓</span> Easy group expenses
              </span>
              <span className="flex items-center gap-2">
                <span className="text-emerald-500">✓</span> Clear balances
              </span>
            </div>
          </motion.div>

          {/* RIGHT - DASHBOARD PREVIEW */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, x: 30 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.15, type: "spring", stiffness: 90 }}
            className="relative mx-auto w-full max-w-xl"
          >
            <div className="absolute -inset-5 rounded-[3rem] bg-gradient-to-br from-emerald-200/50 to-sky-200/50 blur-2xl" />

            <div className="relative rounded-[2rem] border border-white bg-white p-5 shadow-[0_30px_100px_-35px_rgba(15,23,42,0.25)] sm:p-7">
              {/* Dashboard heading */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                    Your overview
                  </p>
                  <h3 className="mt-1 text-xl font-black tracking-tight">
                    Hey, Alex 👋
                  </h3>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-xl">
                  👤
                </div>
              </div>

              {/* Balance card */}
              <div className="relative mt-7 overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 p-6 text-white">
                <div className="absolute -right-12 -top-16 h-52 w-52 rounded-full border-[35px] border-white/[0.04]" />
                <div className="absolute -bottom-20 right-20 h-48 w-48 rounded-full bg-emerald-500/10 blur-2xl" />

                <div className="relative">
                  <p className="text-sm font-medium text-slate-300">
                    Total group expenses
                  </p>
                  <h3 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
                    ₹12,450
                  </h3>
                  <div className="mt-5 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-xs font-semibold text-emerald-300">
                    <span>↗</span> Shared across 4 friends
                  </div>
                </div>
              </div>

              {/* Mini stats */}
              <div className="mt-5 grid grid-cols-2 gap-4">
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">↙</span>
                    You are owed
                  </div>
                  <p className="mt-3 text-2xl font-black text-emerald-600">₹2,800</p>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-100 text-rose-500">↗</span>
                    You owe
                  </div>
                  <p className="mt-3 text-2xl font-black text-rose-500">₹950</p>
                </div>
              </div>

              {/* Recent expenses */}
              <div className="mt-7">
                <div className="mb-4 flex items-center justify-between">
                  <h4 className="font-black tracking-tight">Recent activity</h4>
                  <span className="text-xs font-bold text-emerald-600">View all ↗</span>
                </div>

                <div className="space-y-4">
                  {[
                    { icon: "🍕", name: "Dinner night", detail: "Alex paid · 4 people", amount: "₹1,600", color: "bg-orange-50" },
                    { icon: "🚕", name: "Cab ride", detail: "Sam paid · 3 people", amount: "₹450", color: "bg-sky-50" },
                    { icon: "🏡", name: "Weekend stay", detail: "You paid · 4 people", amount: "₹4,800", color: "bg-violet-50" },
                  ].map((item, i) => (
                    <motion.div
                      key={item.name}
                      initial={{ opacity: 0, x: 15 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + i * 0.15 }}
                      className="flex items-center justify-between gap-3"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-lg ${item.color}`}>
                          {item.icon}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-slate-800">{item.name}</p>
                          <p className="mt-1 truncate text-xs text-slate-400">{item.detail}</p>
                        </div>
                      </div>
                      <p className="shrink-0 text-sm font-black text-slate-800">{item.amount}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Floating badge */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="absolute -right-3 top-24 hidden items-center gap-3 rounded-2xl border border-white/80 bg-white/95 p-3 shadow-xl sm:flex md:-right-8"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-xl">
                ✓
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400">Settlement</p>
                <p className="text-sm font-black text-emerald-600">All clear!</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="relative bg-white py-24">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6 }}
            className="mx-auto mb-16 max-w-2xl text-center"
          >
            <span className="text-xs font-black uppercase tracking-[0.25em] text-emerald-600">
              Built for real life
            </span>
            <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">
              Less calculating.
              <br />
              <span className="text-slate-400">More living.</span>
            </h2>
            <p className="mt-5 leading-7 text-slate-500">
              Everything you need to keep shared expenses organized,
              without turning friendships into spreadsheets.
            </p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                icon: "👥",
                number: "01",
                title: "Groups that get it",
                desc: "Create groups for trips, flatmates, dinners, or any shared experience. Keep everyone's expenses in one place.",
                bg: "bg-sky-50",
                accent: "text-sky-600",
              },
              {
                icon: "⚡",
                number: "02",
                title: "Splitting made simple",
                desc: "Track who paid and who participated. Let the app handle the calculations while you enjoy the moment.",
                bg: "bg-emerald-50",
                accent: "text-emerald-600",
              },
              {
                icon: "💸",
                number: "03",
                title: "Balances without confusion",
                desc: "See who owes whom and understand outstanding balances at a glance. No more awkward money conversations.",
                bg: "bg-violet-50",
                accent: "text-violet-600",
              },
            ].map((feature, i) => (
              <motion.div
                key={feature.number}
                initial={{ opacity: 0, y: 35 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                whileHover={{ y: -8 }}
                className="group relative overflow-hidden rounded-[2rem] border border-slate-100 bg-white p-8 shadow-[0_10px_40px_-30px_rgba(15,23,42,0.3)] transition-shadow duration-300 hover:shadow-xl hover:shadow-slate-200/60"
              >
                <div className="mb-9 flex items-start justify-between">
                  <div className={`flex h-16 w-16 items-center justify-center rounded-2xl text-3xl transition duration-300 group-hover:rotate-6 group-hover:scale-110 ${feature.bg}`}>
                    {feature.icon}
                  </div>
                  <span className="text-sm font-black tracking-widest text-slate-300">
                    {feature.number}
                  </span>
                </div>

                <h3 className="text-xl font-black tracking-tight">
                  {feature.title}
                </h3>
                <p className="mt-4 text-sm leading-7 text-slate-500">
                  {feature.desc}
                </p>

                <div className={`mt-7 h-1 w-12 rounded-full transition-all duration-500 group-hover:w-24 ${feature.bg.replace("bg-", "bg-").replace("50", "400")}`} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="relative overflow-hidden bg-[#f7faf9] py-24">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="grid items-center gap-14 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, x: -25 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <span className="text-xs font-black uppercase tracking-[0.25em] text-emerald-600">
                Simple by design
              </span>
              <h2 className="mt-4 text-3xl font-black leading-tight tracking-tight sm:text-5xl">
                From shared plans
                <br />
                to settled bills.
              </h2>
              <p className="mt-6 max-w-lg leading-8 text-slate-500">
                A straightforward way to manage group expenses.
                Spend less time working out the numbers and more time
                making memories.
              </p>

              <div className="mt-10 space-y-8">
                {[
                  { n: "01", title: "Create your group", desc: "Bring your friends together in a shared space." },
                  { n: "02", title: "Add shared expenses", desc: "Record payments and select who participated." },
                  { n: "03", title: "Settle up", desc: "Review balances and simplify who owes whom." },
                ].map((step, i) => (
                  <div key={step.n} className="flex gap-5">
                    <div className="flex flex-col items-center">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-emerald-100 bg-white text-sm font-black text-emerald-600 shadow-sm">
                        {step.n}
                      </div>
                      {i !== 2 && <div className="mt-2 h-8 w-px bg-emerald-200" />}
                    </div>
                    <div className="pt-1">
                      <h3 className="font-black">{step.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-500">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Visual card */}
            <motion.div
              initial={{ opacity: 0, x: 30, scale: 0.95 }}
              whileInView={{ opacity: 1, x: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="relative mx-auto w-full max-w-md"
            >
              <div className="absolute -inset-5 rounded-[3rem] bg-gradient-to-br from-sky-200/50 to-emerald-200/60 blur-2xl" />
              <div className="relative rounded-[2rem] border border-white bg-white p-7 shadow-2xl shadow-slate-200/70">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-slate-400">Weekend getaway</p>
                    <h3 className="mt-1 text-xl font-black">Group balance</h3>
                  </div>
                  <span className="rounded-xl bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-600">Active</span>
                </div>

                <div className="mt-8 space-y-6">
                  {[
                    { name: "Alex", amount: "₹1,200", initial: "A", color: "bg-sky-100 text-sky-700", width: "w-[85%]" },
                    { name: "Sam", amount: "₹800", initial: "S", color: "bg-orange-100 text-orange-700", width: "w-[60%]" },
                    { name: "Jordan", amount: "₹1,500", initial: "J", color: "bg-violet-100 text-violet-700", width: "w-full" },
                  ].map((person, i) => (
                    <div key={person.name}>
                      <div className="mb-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`flex h-10 w-10 items-center justify-center rounded-xl text-sm font-black ${person.color}`}>
                            {person.initial}
                          </div>
                          <span className="text-sm font-bold">{person.name}</span>
                        </div>
                        <span className="text-sm font-black">{person.amount}</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: i === 0 ? "80%" : i === 1 ? "53%" : "100%" }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, delay: 0.2 + i * 0.2 }}
                          className={`h-full rounded-full ${i === 0 ? "bg-sky-400" : i === 1 ? "bg-orange-400" : "bg-emerald-500"}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 rounded-2xl bg-emerald-50 p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-xl shadow-sm">✨</div>
                    <div>
                      <p className="text-sm font-black text-emerald-800">Everything adds up.</p>
                      <p className="mt-1 text-xs text-emerald-700">Keep your group's expenses organized.</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="px-5 py-20 md:px-8 md:py-28">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 px-6 py-16 text-center text-white sm:px-12 sm:py-20"
        >
          <div className="pointer-events-none absolute -right-20 -top-32 h-80 w-80 rounded-full border-[50px] border-white/[0.04]" />
          <div className="pointer-events-none absolute -bottom-40 -left-20 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />

          <div className="relative">
            <span className="inline-flex rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-bold tracking-widest text-emerald-300">
              YOUR NEXT GROUP ADVENTURE STARTS HERE
            </span>
            <h2 className="mx-auto mt-7 max-w-3xl text-3xl font-black leading-tight tracking-tight sm:text-5xl">
              Make memories,
              <br />
              <span className="text-emerald-400">not money problems.</span>
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-base leading-7 text-slate-300">
              Get your expenses organized and keep the good times rolling.
            </p>
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} className="mt-9 inline-block">
              <Link
                to="/register"
                className="inline-flex items-center gap-3 rounded-2xl bg-emerald-400 px-8 py-4 font-black text-slate-950 shadow-xl shadow-emerald-500/20 transition hover:bg-emerald-300"
              >
                Create your free account <span>↗</span>
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 px-5 py-8 sm:flex-row md:px-8">
          <Link to="/" className="text-lg font-black tracking-tight">
            Split<span className="text-emerald-500">Wise.</span>
          </Link>
          <p className="text-center text-xs font-medium text-slate-400">
            © {new Date().getFullYear()} SplitWise. Split bills, keep friends.
          </p>
          <div className="flex gap-5 text-sm font-semibold text-slate-500">
            <Link to="/login" className="transition hover:text-emerald-600">Login</Link>
            <Link to="/register" className="transition hover:text-emerald-600">Register</Link>
          </div>
        </div>
      </footer>
    </motion.div>
  );

}
