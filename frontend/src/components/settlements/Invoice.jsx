import React, { useMemo, useState } from "react";
import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import FinalSettlement from "./FinalSettlement";
import { motion } from "framer-motion";

export default function Invoice({ group }) {
  const userID = useParams().userID;
  const groupID = useParams().groupID;

  const [getExpenses, setGetExpenses] = useState({});
  const [giveExpenses, setGiveExpenses] = useState({});
  const [totalYouOwe, setTotalYouOwe] = useState(0);
  const [totalYouGet, setTotalYouGet] = useState(0);

  useEffect(() => {
    fetchInvoice();
  }, []);

  async function fetchInvoice() {
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/user/expense/${userID}/${groupID}/getInvoice`, {
        method: 'GET',
        credentials: 'include'
      });

      const data = await res.json();

      if (res.status === 200) {
        setGetExpenses(data.getExpenses);
        setGiveExpenses(data.giveExpenses);

        calculateExpense(data.giveExpenses, data.getExpenses);
      }
    } catch (error) {
      console.error("Fetch invoice failed:", error);
      toast.error("Failed to load settlements.");
    }
  }

  const calculateExpense = (giveExpenses, getExpenses) => {
    let getAmount = 0;
    Object.values(getExpenses).map(person => {
      getAmount += parseFloat(person.totalExpense);
    });

    let giveAmount = 0;
    Object.values(giveExpenses).map(person => {
      giveAmount += parseFloat(person.totalExpense);
    });

    setTotalYouOwe(giveAmount);
    setTotalYouGet(getAmount);
  }

  const formatAmount = (amount) => {
    // round to 2 decimals cleanly
    return `₹${Number(amount).toFixed(2)}`;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div variants={itemVariants} className="rounded-2xl bg-white shadow-lg border border-gray-100 p-6">
          <p className="text-sm text-gray-500 font-bold uppercase tracking-wider">You Owe</p>
          <p className="text-2xl font-black text-red-500 mt-2">
            ₹{totalYouOwe.toFixed(2)}
          </p>
        </motion.div>

        <motion.div variants={itemVariants} className="rounded-2xl bg-white shadow-lg border border-gray-100 p-6">
          <p className="text-sm text-gray-500 font-bold uppercase tracking-wider">You Get</p>
          <p className="text-2xl font-black text-emerald-600 mt-2">
            ₹{totalYouGet.toFixed(2)}
          </p>
        </motion.div>

        <motion.div variants={itemVariants} className="rounded-2xl bg-gradient-to-br from-sky-500 to-emerald-500 text-white shadow-xl p-6">
          <p className="text-sm text-white/90 font-bold uppercase tracking-wider">Net Balance</p>
          <p className="text-2xl font-black mt-2">
            {totalYouGet - totalYouOwe >= 0 ? "+" : "-"}₹
            {Math.abs(totalYouGet - totalYouOwe).toFixed(2)}
          </p>
        </motion.div>
      </div>

      {/* Main: Giving & Getting */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Giving Money */}
        <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            Giving Money 💸
          </h2>
          <p className="text-gray-600 text-sm mt-1">
            Pay these members for expenses they covered.
          </p>

          <div className="mt-6 space-y-4">
            {Object.keys(giveExpenses).length === 0 ? (
              <div className="p-5 rounded-2xl border border-dashed border-gray-200 text-gray-400 text-center font-medium">
                ✅ You don’t owe anyone.
              </div>
            ) : (
              Object.entries(giveExpenses).map(([payerId, payer]) => (
                <motion.div
                  whileHover={{ x: 5 }}
                  key={payerId}
                  className="p-5 rounded-2xl border border-gray-100 bg-gray-50/50 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-bold text-gray-900">{payer.name}</p>
                      <p className="text-xs text-gray-500">{payer.email}</p>
                    </div>
                    <p className="font-black text-red-500 text-lg">
                      {formatAmount(payer.totalExpense)}
                    </p>
                  </div>

                  <div className="mt-4 space-y-2">
                    {payer.expenses.map((expense) => (
                      <div
                        key={expense.expenseId}
                        className="flex justify-between p-3 rounded-xl bg-white border border-gray-200"
                      >
                        <p className="text-sm font-semibold text-gray-700">{expense.spentFor}</p>
                        <p className="text-sm font-bold text-gray-900">{formatAmount(expense.sharedAmount)}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>

        {/* Getting Money */}
        <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            Getting Money 💰
          </h2>
          <p className="text-gray-600 text-sm mt-1">
            These members have to pay you.
          </p>

          <div className="mt-6 space-y-4">
            {Object.keys(getExpenses).length === 0 ? (
              <div className="p-5 rounded-2xl border border-dashed border-gray-200 text-gray-400 text-center font-medium">
                No one owes you currently.
              </div>
            ) : (
              Object.entries(getExpenses).map(([giverId, giver]) => (
                <motion.div
                  whileHover={{ x: 5 }}
                  key={giverId}
                  className="p-5 rounded-2xl border border-gray-100 bg-gray-50/50 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-bold text-gray-900">{giver.name}</p>
                      <p className="text-xs text-gray-500">{giver.email}</p>
                    </div>
                    <p className="font-black text-emerald-600 text-lg">
                      {formatAmount(giver.totalExpense)}
                    </p>
                  </div>

                  <div className="mt-4 space-y-2">
                    {giver.expenses.map((expense) => (
                      <div
                        key={expense.expenseId}
                        className="flex justify-between p-3 rounded-xl bg-white border border-gray-200"
                      >
                        <p className="text-sm font-semibold text-gray-700">{expense.spentFor}</p>
                        <p className="text-sm font-bold text-gray-900">{formatAmount(expense.sharedAmount)}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </div>

      {/* Final Settlement */}
      <motion.div variants={itemVariants}>
        <FinalSettlement giveExpenses={giveExpenses} getExpenses={getExpenses} members={group.members} onSettle={fetchInvoice} />
      </motion.div>
    </motion.div>
  );
}
