import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function Home() {
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
      className="min-h-screen bg-gradient-to-br from-sky-200 via-white to-emerald-200"
    >

      {/* NAVBAR */}
      <nav className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
        <motion.h1 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="text-2xl font-bold text-gray-900 font-black tracking-tight"
        >
          SplitWise 💳
        </motion.h1>

        <motion.div 
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="flex items-center gap-3"
        >
          <Link
            to="/login"
            className="px-5 py-2.5 rounded-xl border border-gray-200 bg-white/80 backdrop-blur-xl font-semibold text-gray-800 hover:bg-white transition"
          >
            Login
          </Link>

          <Link
            to="/register"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-emerald-500 text-white font-semibold shadow hover:opacity-90 transition"
          >
            Register
          </Link>
        </motion.div>
      </nav>

      {/* HERO */}
      <section className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">

        {/* LEFT */}
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-4xl md:text-6xl font-black text-gray-900 leading-tight tracking-tight">
            Split Expenses <br />
            <span className="bg-gradient-to-r from-sky-500 to-emerald-500 bg-clip-text text-transparent">
              Without Friction
            </span>
          </h2>

          <p className="mt-6 text-gray-600 text-lg md:text-xl font-medium max-w-lg leading-relaxed">
            The smartest way to manage shared bills, track expenses, and settle debts —
            all in one beautiful place.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/register"
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-sky-500 to-emerald-500 text-white font-black text-lg shadow-xl hover:opacity-90 transition inline-block"
              >
                Get Started 🚀
              </Link>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/login"
                className="px-8 py-4 rounded-2xl border-2 border-gray-100 bg-white/80 backdrop-blur-xl font-black text-lg text-gray-800 hover:bg-white transition inline-block"
              >
                Sign In
              </Link>
            </motion.div>
          </div>
        </motion.div>

        {/* RIGHT ILLUSTRATION */}
        <motion.div 
          initial={{ scale: 0.8, opacity: 0, rotate: -5 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ duration: 0.6, type: "spring" }}
          className="relative h-[400px] rounded-[40px] bg-gradient-to-br from-sky-500 to-emerald-500 shadow-2xl overflow-hidden group"
        >

          <div className="absolute bottom-0 left-0 w-full h-40 bg-black/20 rounded-t-[120px]" />
          <div className="absolute bottom-0 left-10 w-56 h-32 bg-white/20 rounded-t-[100px]" />
          <div className="absolute bottom-0 right-10 w-72 h-40 bg-white/15 rounded-t-[120px]" />
          <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 3 }}
            className="absolute top-12 left-16 w-24 h-24 bg-yellow-200 rounded-full blur-sm" 
          />

          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-white text-3xl font-black tracking-widest uppercase text-center space-y-2 drop-shadow-lg text-shadow">
              <p>Track</p>
              <p className="text-emerald-200">Split</p>
              <p>Settle 🧾</p>
            </div>
          </div>
        </motion.div>

      </section>

      {/* FEATURES */}
      <motion.section 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="max-w-7xl mx-auto px-6 pb-24"
      >

        <h3 className="text-3xl font-black text-gray-900 text-center mb-16">
          Why SplitWise?
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {[
            {
              title: "Create Groups",
              desc: "Organize anything from roommates to events and invite friends in seconds.",
              emoji: "👥"
            },
            {
              title: "Smart Splitting",
              desc: "Add who paid, who joined, and let us handle the complex math automatically.",
              emoji: "⚖️"
            },
            {
              title: "Clear Balances",
              desc: "No more awkward conversations. Know exactly who owes what with ease.",
              emoji: "🧾"
            },
          ].map((f, i) => (
            <motion.div
              key={i}
              variants={itemVariants}
              whileHover={{ y: -10 }}
              className="p-8 rounded-3xl bg-white/80 backdrop-blur-xl shadow-xl border border-white/50 group hover:bg-white transition-all duration-300"
            >
              <div className="text-4xl mb-6 group-hover:scale-110 transition-transform">{f.emoji}</div>
              <h4 className="font-black text-gray-900 text-xl mb-3">
                {f.title}
              </h4>
              <p className="text-gray-600 font-medium leading-relaxed">
                {f.desc}
              </p>
            </motion.div>
          ))}
        </div>

      </motion.section>

      {/* FOOTER ILLUSTRATION */}
      <div className="relative h-56 bg-gradient-to-br from-sky-500 to-emerald-500 overflow-hidden mt-10">

        <div className="absolute bottom-0 left-0 w-full h-32 bg-black/20 rounded-t-[120px]" />
        <div className="absolute bottom-0 left-10 w-64 h-24 bg-white/20 rounded-t-[100px]" />
        <div className="absolute bottom-0 right-10 w-80 h-40 bg-white/15 rounded-t-[120px]" />
        <div className="absolute top-10 left-16 w-20 h-20 bg-yellow-200 rounded-full blur-sm" />

        <div className="absolute inset-0 flex items-center justify-center text-white font-black tracking-wide text-2xl md:text-4xl drop-shadow-lg">
          “Split bills, keep friends.” 🤝
        </div>
      </div>

    </motion.div>
  );
}
