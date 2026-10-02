import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import ConfirmModal from "../common/ConfirmModal";

export default function SmartSettlement({ groupID, currentUserId, isAdmin, onSettlementComplete }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [settleTarget, setSettleTarget] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchOptimizedSettlements();
  }, [groupID]);

  const fetchOptimizedSettlements = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/user/expense/${groupID}/optimizedSettlements`,
        {
          method: "GET",
          credentials: "include"
        }
      );

      const json = await res.json();
      if (res.ok && json.success) {
        setData(json);
      } else {
        toast.error(json.message || "Failed to calculate simplified debts");
      }
    } catch (err) {
      console.error("Error fetching optimized settlements:", err);
      toast.error("Network error fetching simplified settlements");
    } finally {
      setLoading(false);
    }
  };

  const handleSettle = async () => {
    if (!settleTarget) return;

    try {
      // In a simplified transfer, debtor pays creditor.
      // Settle between the debtor and creditor.
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/user/expense/${groupID}/settle/${settleTarget.withUserId}`,
        {
          method: "POST",
          credentials: "include"
        }
      );

      const resData = await res.json();
      if (resData.success) {
        toast.success(resData.message || "Settled up successfully!");
        setSettleTarget(null);
        setIsModalOpen(false);
        fetchOptimizedSettlements();
        if (onSettlementComplete) onSettlementComplete();
      } else {
        toast.error(resData.message || "Failed to settle up");
      }
    } catch (err) {
      console.error("Settlement error:", err);
      toast.error("Failed to settle transaction");
    }
  };

  const formatAmount = (num) => `₹${Number(num).toFixed(2)}`;

  if (loading) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="inline-block w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-3 text-sm text-gray-500 font-semibold">Running greedy cash flow optimization...</p>
      </div>
    );
  }

  if (!data) return null;

  const { settlements, netBalances, rawTransactionsCount, optimizedTransactionsCount, transactionsSaved } = data;
  const isAllSettled = settlements.length === 0;

  return (
    <div className="space-y-6">
      <ConfirmModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSettleTarget(null);
        }}
        onConfirm={handleSettle}
        title="Confirm Settlement"
        message={
          settleTarget
            ? `Mark transfer of ${formatAmount(settleTarget.amount)} between ${settleTarget.fromName} and ${settleTarget.toName} as settled?`
            : ""
        }
        confirmText="Confirm & Settle"
        type="success"
      />

      {/* Algorithmic Efficiency Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-600 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden"
      >
        <div className="absolute -right-8 -bottom-8 w-36 h-36 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-white/20 text-xs font-black uppercase tracking-wider backdrop-blur-sm">
                Greedy Cash Flow Algorithm
              </span>
              {transactionsSaved > 0 && (
                <span className="px-2.5 py-1 rounded-full bg-emerald-400 text-emerald-950 text-xs font-black uppercase tracking-wider animate-pulse">
                  ⚡ Saves {transactionsSaved} {transactionsSaved === 1 ? "Payment" : "Payments"}!
                </span>
              )}
            </div>
            <h3 className="text-2xl font-black mt-2">Smart Debt Simplification</h3>
            <p className="text-white/80 text-sm mt-1 max-w-xl">
              Calculates the minimum directed transfers required to settle all debts across the group in at most{" "}
              <span className="font-bold underline decoration-emerald-300">N - 1</span> steps.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-black/20 backdrop-blur-md px-5 py-3 rounded-xl border border-white/10 self-start md:self-auto">
            <div className="text-center">
              <p className="text-xs text-white/70 uppercase font-bold">Raw Debts</p>
              <p className="text-xl font-black text-rose-300 line-through">{rawTransactionsCount}</p>
            </div>
            <div className="text-lg font-bold text-white/50">➔</div>
            <div className="text-center">
              <p className="text-xs text-white/70 uppercase font-bold">Optimized</p>
              <p className="text-2xl font-black text-emerald-300">{optimizedTransactionsCount}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Suggested Minimised Transfers */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-lg font-black text-gray-900 flex items-center gap-2">
              Optimal Settlement Plan 🎯
            </h4>
            <p className="text-xs text-gray-500 font-semibold">
              Complete these transfers to bring all members' balances to zero.
            </p>
          </div>
          <button
            onClick={fetchOptimizedSettlements}
            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 hover:bg-emerald-100 transition"
          >
            ↻ Recalculate
          </button>
        </div>

        {isAllSettled ? (
          <div className="p-8 rounded-xl bg-emerald-50/50 border border-dashed border-emerald-200 text-center">
            <div className="text-4xl mb-2">🎉</div>
            <p className="text-base font-black text-emerald-800">All Settled Up!</p>
            <p className="text-xs text-emerald-600 mt-1 font-semibold">
              Nobody in this group owes any money. Every balance is currently ₹0.00.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {settlements.map((tx, idx) => {
              const isUserSender = currentUserId && (tx.from._id === currentUserId || tx.from.id === currentUserId);
              const isUserReceiver = currentUserId && (tx.to._id === currentUserId || tx.to.id === currentUserId);
              const canSettle = isAdmin || isUserSender || isUserReceiver;

              return (
                <motion.div
                  key={`${tx.from._id}-${tx.to._id}-${idx}`}
                  whileHover={{ scale: 1.01 }}
                  className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                    isUserSender
                      ? "border-red-200 bg-red-50/40"
                      : isUserReceiver
                      ? "border-emerald-200 bg-emerald-50/40"
                      : "border-gray-200 bg-gray-50/60"
                  }`}
                >
                  {/* From -> To Flow Visual */}
                  <div className="flex items-center gap-3 flex-1 flex-wrap">
                    <div className="flex items-center gap-2 min-w-[120px]">
                      <div className="w-8 h-8 rounded-full bg-rose-500 text-white flex items-center justify-center font-bold text-xs shadow">
                        {tx.from.name ? tx.from.name.charAt(0).toUpperCase() : "U"}
                      </div>
                      <div>
                        <p className="text-sm font-black text-gray-900 leading-tight">
                          {tx.from.name} {isUserSender && <span className="text-[10px] text-red-600 font-extrabold">(You)</span>}
                        </p>
                        <p className="text-[11px] text-gray-400">Debtor</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-gray-200 shadow-xs">
                      <span className="text-xs font-bold text-gray-500">pays</span>
                      <span className="text-sm font-black text-emerald-600">{formatAmount(tx.amount)}</span>
                      <span className="text-gray-400 font-bold">➔</span>
                    </div>

                    <div className="flex items-center gap-2 min-w-[120px]">
                      <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs shadow">
                        {tx.to.name ? tx.to.name.charAt(0).toUpperCase() : "U"}
                      </div>
                      <div>
                        <p className="text-sm font-black text-gray-900 leading-tight">
                          {tx.to.name} {isUserReceiver && <span className="text-[10px] text-emerald-600 font-extrabold">(You)</span>}
                        </p>
                        <p className="text-[11px] text-gray-400">Creditor</p>
                      </div>
                    </div>
                  </div>

                  {/* Settle Action Button */}
                  {canSettle && (
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => {
                        const targetId = isUserSender ? tx.to._id : tx.from._id;
                        setSettleTarget({
                          withUserId: targetId,
                          fromName: tx.from.name,
                          toName: tx.to.name,
                          amount: tx.amount
                        });
                        setIsModalOpen(true);
                      }}
                      className="px-4 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-sm hover:opacity-95 transition whitespace-nowrap self-end sm:self-auto"
                    >
                      Mark Settled ✓
                    </motion.button>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Member Net Balances Overview */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <h4 className="text-lg font-black text-gray-900 mb-1 flex items-center gap-2">
          Group Net Balances Matrix ⚖️
        </h4>
        <p className="text-xs text-gray-500 font-semibold mb-4">
          Sum of amount paid minus sum of shares owed across all unsettled expenses.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {netBalances.map((item) => {
            const isPos = item.netBalance > 0;
            const isZero = Math.abs(item.netBalance) < 0.01;
            return (
              <div
                key={item.user._id}
                className={`p-3.5 rounded-xl border flex items-center justify-between ${
                  isZero
                    ? "border-gray-200 bg-gray-50/50"
                    : isPos
                    ? "border-emerald-200 bg-emerald-50/40"
                    : "border-red-200 bg-red-50/40"
                }`}
              >
                <div>
                  <p className="text-sm font-black text-gray-900">{item.user.name}</p>
                  <p className="text-[11px] text-gray-400 truncate max-w-[120px]">{item.user.email}</p>
                </div>
                <div className="text-right">
                  <p
                    className={`text-sm font-black ${
                      isZero ? "text-gray-400" : isPos ? "text-emerald-600" : "text-red-500"
                    }`}
                  >
                    {isZero ? "₹0.00" : `${isPos ? "+" : ""}${formatAmount(item.netBalance)}`}
                  </p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    {isZero ? "Settled" : isPos ? "Gets Back" : "Owes"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
