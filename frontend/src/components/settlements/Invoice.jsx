import React, { useMemo, useState } from "react";
import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "react-toastify";

export default function Invoice() {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-200 via-white to-emerald-200 px-4 py-10">
      <div className="max-w-6xl mx-auto">
        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-2xl bg-white/80 backdrop-blur-xl shadow-xl border border-white/50 p-6">
            <p className="text-sm text-gray-500">You Owe</p>
            <p className="text-2xl font-extrabold text-red-500 mt-2">
              ₹{totalYouOwe.toFixed(2)}
            </p>
          </div>

          <div className="rounded-2xl bg-white/80 backdrop-blur-xl shadow-xl border border-white/50 p-6">
            <p className="text-sm text-gray-500">You Get</p>
            <p className="text-2xl font-extrabold text-emerald-600 mt-2">
              ₹{totalYouGet.toFixed(2)}
            </p>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-sky-500 to-emerald-500 text-white shadow-xl p-6">
            <p className="text-sm text-white/90">Net Balance</p>
            <p className="text-2xl font-extrabold mt-2">
              {totalYouGet - totalYouOwe >= 0 ? "+" : "-"}₹
              {Math.abs(totalYouGet - totalYouOwe).toFixed(2)}
            </p>
            <p className="text-xs text-white/80 mt-2">
              Positive → you will get money. Negative → you must pay.
            </p>
          </div>
        </div>

        {/* Main: Giving & Getting */}
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Giving Money */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 p-6">
            <h2 className="text-xl font-bold text-gray-900">
              Giving Money 💸 (You Owe)
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              Pay these members for expenses they covered.
            </p>

            <div className="mt-6 space-y-4">
              {Object.keys(giveExpenses).length === 0 ? (
                <div className="p-5 rounded-2xl border border-gray-200 bg-white text-gray-500">
                  ✅ You don’t owe anyone.
                </div>
              ) : (
                Object.entries(giveExpenses).map(([payerId, payer]) => (
                  <div
                    key={payerId}
                    className="p-5 rounded-2xl border border-gray-200 bg-white shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-bold text-gray-900">
                          {payer.name || "Unknown"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {payer?.email || "Unknown"}
                        </p>
                      </div>

                      <p className="font-extrabold text-red-500 text-lg">
                        {formatAmount(payer.totalExpense)}
                      </p>
                    </div>

                    {/* expense breakdown */}
                    <div className="mt-4 space-y-2">
                      {payer.expenses.map((expense) => (
                        <div
                          key={expense.expenseId}
                          className="flex justify-between p-3 pb-7 rounded-xl bg-gray-50 border border-gray-200 relative"
                        >
                          <p className="text-md font-semibold text-gray-800">
                            {expense.spentFor}
                          </p>
                          <p className="text-md font-bold text-gray-900">
                            {formatAmount(expense.sharedAmount)}
                          </p>
                          <p className="absolute bottom-1 right-2 text-[0.6rem] font-bold text-gray-500">
                            {new Date(expense.date).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Getting Money */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 p-6">
            <h2 className="text-xl font-bold text-gray-900">
              Getting Money 💰 (You Get)
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              These members have to pay you.
            </p>

            <div className="mt-6 space-y-4">
              {Object.keys(getExpenses).length === 0 ? (
                <div className="p-5 rounded-2xl border border-gray-200 bg-white text-gray-500">
                  No one owes you currently.
                </div>
              ) : (
                Object.entries(getExpenses).map(([giverId, giver]) => (
                  <div
                    key={giverId}
                    className="p-5 rounded-2xl border border-gray-200 bg-white shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-bold text-gray-900">
                          {giver.name || "Unknown"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {giver.email}
                        </p>
                      </div>

                      <p className="font-extrabold text-emerald-600 text-lg">
                        {formatAmount(giver.totalExpense)}
                      </p>
                    </div>

                    {/* expense breakdown */}
                    <div className="mt-4 space-y-2">
                      {giver.expenses.map((expense) => (
                        <div
                          key={expense.expenseId}
                          className="flex items-center justify-between p-3 pb-7 rounded-xl bg-gray-50 border border-gray-200 relative"
                        >
                          <p className="text-md font-semibold text-gray-800">
                            {expense.spentFor}
                          </p>
                          <p className="text-md font-bold text-gray-900">
                            {formatAmount(expense.sharedAmount)}
                          </p>
                          <p className="absolute bottom-1 right-2 text-[0.6rem] font-bold text-gray-500">
                            {new Date(expense.date).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Illustration Footer */}
        <div className="mt-10 relative h-40 overflow-hidden rounded-2xl bg-gradient-to-br from-sky-500 to-emerald-500 shadow-xl">
          <div className="absolute bottom-0 left-0 w-full h-20 bg-black/20 rounded-t-[100px]" />
          <div className="absolute bottom-0 left-10 w-40 h-16 bg-white/20 rounded-t-[80px]" />
          <div className="absolute bottom-0 right-10 w-56 h-28 bg-white/15 rounded-t-[100px]" />
          <div className="absolute top-6 left-10 w-14 h-14 bg-yellow-200 rounded-full blur-sm" />
          <div className="absolute top-10 right-10 text-white/90 font-bold">
            "Split the bill, not the friendship." 🤝
          </div>
        </div>
      </div>
    </div>
  );
}
