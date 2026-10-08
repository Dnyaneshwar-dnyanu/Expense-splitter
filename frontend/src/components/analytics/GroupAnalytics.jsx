import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";

const CATEGORY_COLORS = {
  "Food & Dining": { bg: "bg-amber-500", text: "text-amber-500", light: "bg-amber-50", stroke: "#f59e0b", icon: "🍔" },
  "Transportation": { bg: "bg-sky-500", text: "text-sky-500", light: "bg-sky-50", stroke: "#0ea5e9", icon: "🚕" },
  "Entertainment": { bg: "bg-purple-500", text: "text-purple-500", light: "bg-purple-50", stroke: "#a855f7", icon: "🎬" },
  "Shopping": { bg: "bg-pink-500", text: "text-pink-500", light: "bg-pink-50", stroke: "#ec4899", icon: "🛍️" },
  "Utilities": { bg: "bg-yellow-500", text: "text-yellow-500", light: "bg-yellow-50", stroke: "#eab308", icon: "💡" },
  "Lodging": { bg: "bg-indigo-500", text: "text-indigo-500", light: "bg-indigo-50", stroke: "#6366f1", icon: "🏨" },
  "Other": { bg: "bg-emerald-500", text: "text-emerald-500", light: "bg-emerald-50", stroke: "#10b981", icon: "📦" }
};

export default function GroupAnalytics({ groupID }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, [groupID]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/user/expense/${groupID}/analytics`,
        {
          method: "GET",
          credentials: "include"
        }
      );

      const json = await res.json();
      if (res.ok && json.success) {
        setData(json);
      } else {
        toast.error(json.message || "Failed to load analytics");
      }
    } catch (err) {
      console.error("Analytics fetch error:", err);
      toast.error("Network error while loading analytics");
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (num) => `₹${Number(num || 0).toFixed(2)}`;

  if (loading) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="inline-block w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-3 text-sm text-gray-500 font-semibold">Aggregating group metrics across MongoDB pipeline...</p>
      </div>
    );
  }

  if (!data) return null;

  const { summary, categoryBreakdown, monthlyTrends, memberContributions } = data;
  const hasExpenses = summary.totalExpensesCount > 0;

  if (!hasExpenses) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="text-4xl mb-3">📊</div>
        <h3 className="text-lg font-black text-gray-900">No Expenses Recorded Yet</h3>
        <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
          Add some expenses to this group to see automatic category breakdowns, spending trends, and member contribution analytics!
        </p>
      </div>
    );
  }

  // Calculate highest monthly value for trend chart scaling
  const maxMonthAmount = Math.max(...monthlyTrends.map((m) => m.totalAmount), 1);

  // Calculate highest member paid/consumed for matrix scaling
  const maxContribution = Math.max(
    ...memberContributions.map((m) => Math.max(m.totalPaid, m.totalConsumed)),
    1
  );

  return (
    <div className="space-y-6">
      {/* Top Banner & Refresh */}
      <div className="flex items-center justify-between flex-wrap gap-4 bg-gradient-to-r from-sky-600 via-indigo-600 to-emerald-600 p-6 rounded-2xl text-white shadow-xl">
        <div>
          <h3 className="text-2xl font-black mt-2">Spending Intelligence & Analytics 📈</h3>
          <p className="text-white/80 text-sm mt-0.5">
            Real-time financial breakdown, category distribution, and member participation balance.
          </p>
        </div>
        <button
          onClick={fetchAnalytics}
          className="px-4 py-2 rounded-xl text-xs font-black bg-white text-gray-300 shadow-md hover:bg-gray-100 transition"
        >
          ↻ Refresh Data
        </button>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Spending */}
        <motion.div whileHover={{ y: -3 }} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Total Group Spend</p>
          <p className="text-2xl font-black text-gray-900 mt-1">{formatAmount(summary.totalSpending)}</p>
          <p className="text-[11px] text-gray-400 mt-1">Across {summary.totalExpensesCount} recorded expenses</p>
        </motion.div>

        {/* Avg Per Member */}
        <motion.div whileHover={{ y: -3 }} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Average Per Member</p>
          <p className="text-2xl font-black text-sky-600 mt-1">{formatAmount(summary.averagePerMember)}</p>
          <p className="text-[11px] text-gray-400 mt-1">Equal share benchmark</p>
        </motion.div>

        {/* Top Category */}
        <motion.div whileHover={{ y: -3 }} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Top Category</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-2xl">
              {CATEGORY_COLORS[categoryBreakdown[0]?.category]?.icon || "📦"}
            </span>
            <div className="truncate">
              <p className="text-lg font-black text-gray-900 truncate">
                {categoryBreakdown[0]?.category || "None"}
              </p>
              <p className="text-[11px] text-gray-400">
                {categoryBreakdown[0]?.percentage || 0}% of total
              </p>
            </div>
          </div>
        </motion.div>

        {/* Highest Single Expense */}
        <motion.div whileHover={{ y: -3 }} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Largest Expense</p>
          {summary.highestExpense ? (
            <div className="mt-1">
              <p className="text-lg font-black text-emerald-600 truncate">
                {formatAmount(summary.highestExpense.totalExpense)}
              </p>
              <p className="text-[11px] text-gray-500 font-semibold truncate">
                "{summary.highestExpense.spentFor}" by {summary.highestExpense.payerName}
              </p>
            </div>
          ) : (
            <p className="text-sm font-bold text-gray-400 mt-1">None</p>
          )}
        </motion.div>
      </div>

      {/* Main Analytics: Category Distribution & Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-lg font-black text-gray-900 flex items-center gap-2">
                Category Distribution 🏷️
              </h4>
              <p className="text-xs text-gray-500 font-semibold">
                Where the group's money goes.
              </p>
            </div>
            <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
              {categoryBreakdown.length} Categories
            </span>
          </div>

          {/* Category Bars */}
          <div className="space-y-3.5 mt-5">
            {categoryBreakdown.map((cat) => {
              const style = CATEGORY_COLORS[cat.category] || CATEGORY_COLORS["Other"];
              const isHovered = activeCategory === cat.category;

              return (
                <div
                  key={cat.category}
                  onMouseEnter={() => setActiveCategory(cat.category)}
                  onMouseLeave={() => setActiveCategory(null)}
                  className={`p-3 rounded-xl border transition cursor-default ${isHovered ? "border-gray-300 bg-gray-50 shadow-xs" : "border-gray-100 bg-white"
                    }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{style.icon}</span>
                      <span className="text-sm font-black text-gray-800">{cat.category}</span>
                      <span className="text-[11px] text-gray-400">({cat.count} {cat.count === 1 ? 'item' : 'items'})</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-black text-gray-900">{formatAmount(cat.totalAmount)}</span>
                      <span className="text-xs font-bold text-gray-400 ml-1.5">{cat.percentage}%</span>
                    </div>
                  </div>

                  {/* Visual Bar */}
                  <div className="mt-2 w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${cat.percentage}%` }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                      className={`h-full rounded-full ${style.bg}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Monthly Spending Trends */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-lg font-black text-gray-900 flex items-center gap-2">
                Monthly Spending Trajectory 📅
              </h4>
              <p className="text-xs text-gray-500 font-semibold">
                Expenditure trajectory over time.
              </p>
            </div>
            <span className="text-xs font-black text-sky-600 bg-sky-50 px-2.5 py-1 rounded-lg">
              {monthlyTrends.length} {monthlyTrends.length === 1 ? "Month" : "Months"}
            </span>
          </div>

          {/* Timeline Bar Chart */}
          <div className="mt-6 flex items-end justify-between gap-3 h-52 pt-8 pb-2 px-2 border-b border-gray-200">
            {monthlyTrends.map((item) => {
              const heightPercent = Math.max(12, Math.round((item.totalAmount / maxMonthAmount) * 100));

              return (
                <div key={item.month} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                  {/* Tooltip on hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 bg-gray-900 text-white text-[11px] px-2 py-1 rounded-lg font-bold whitespace-nowrap shadow pointer-events-none z-10">
                    {formatAmount(item.totalAmount)} ({item.count} items)
                  </div>

                  {/* Bar */}
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${heightPercent}%` }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="w-full max-w-[48px] rounded-t-xl bg-gradient-to-t from-sky-600 to-emerald-500 shadow-sm group-hover:brightness-110 transition"
                  />
                  <p className="text-[11px] font-black text-gray-600 mt-2 truncate w-full text-center">
                    {item.month}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex items-center justify-between text-xs text-gray-400 font-bold px-2">
            <span>Historical Flow</span>
            <span>Total: {formatAmount(summary.totalSpending)}</span>
          </div>
        </div>
      </div>

      {/* Member Contribution Matrix (Paid vs Consumed) */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-lg">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
          <div>
            <h4 className="text-lg font-black text-gray-900 flex items-center gap-2">
              Individual Member Contributions ⚖️
            </h4>
            <p className="text-xs text-gray-500 font-semibold">
              Comparing what each member paid upfront vs what they consumed.
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-bold">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" /> Paid Upfront
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-sky-500 inline-block" /> Consumed Share
            </span>
          </div>
        </div>

        <div className="space-y-4 mt-6">
          {memberContributions.map((member) => {
            const isCreditor = member.netBalance > 0;
            const isZero = Math.abs(member.netBalance) < 0.01;
            const paidWidth = Math.round((member.totalPaid / maxContribution) * 100);
            const consumedWidth = Math.round((member.totalConsumed / maxContribution) * 100);

            return (
              <div
                key={member.user._id}
                className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:border-gray-200 transition"
              >
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sky-500 to-emerald-500 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                      {member.user.name ? member.user.name.charAt(0).toUpperCase() : "U"}
                    </div>
                    <div>
                      <p className="text-sm font-black text-gray-900 leading-tight">{member.user.name}</p>
                      <p className="text-xs text-gray-400">{member.user.email}</p>
                    </div>
                  </div>

                  {/* Net Badge */}
                  <div className="text-right">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-black inline-block ${isZero
                          ? "bg-gray-200 text-gray-700"
                          : isCreditor
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-rose-100 text-rose-800"
                        }`}
                    >
                      {isZero ? "Balanced (₹0.00)" : `${isCreditor ? "+" : ""}${formatAmount(member.netBalance)} Net`}
                    </span>
                  </div>
                </div>

                {/* Double Bar Comparison */}
                <div className="mt-3 space-y-1.5">
                  {/* Paid Bar */}
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-gray-500 w-16">Paid:</span>
                    <div className="flex-1 bg-gray-200 h-2 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${paidWidth}%` }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="bg-emerald-500 h-full rounded-full"
                      />
                    </div>
                    <span className="text-xs font-black text-gray-700 w-24 text-right">
                      {formatAmount(member.totalPaid)}
                    </span>
                  </div>

                  {/* Consumed Bar */}
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-gray-500 w-16">Consumed:</span>
                    <div className="flex-1 bg-gray-200 h-2 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${consumedWidth}%` }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="bg-sky-500 h-full rounded-full"
                      />
                    </div>
                    <span className="text-xs font-black text-gray-700 w-24 text-right">
                      {formatAmount(member.totalConsumed)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
