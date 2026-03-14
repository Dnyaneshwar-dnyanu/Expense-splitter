import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";

export default function EditExpenseModal({ expense, members, onClose, onUpdate }) {
    const [spentFor, setSpentFor] = useState(expense.spentFor);
    const [paidBy, setPaidBy] = useState(expense.paidBy._id);
    const [participants, setParticipants] = useState(expense.participants.map(p => p.userID._id));
    const [totalExpense, setTotalExpense] = useState(expense.totalExpense);
    const [splitType, setSplitType] = useState(expense.splitType || "equal");
    const [customAmounts, setCustomAmounts] = useState({});

    useEffect(() => {
        if (expense.splitType === 'custom') {
            const amounts = {};
            expense.participants.forEach(p => {
                amounts[p.userID._id] = p.sharedAmount;
            });
            setCustomAmounts(amounts);
        }
    }, [expense]);

    useEffect(() => {
        if (splitType === 'custom') {
            const sum = participants.reduce((acc, id) => {
                return acc + (Number(customAmounts[id]) || 0);
            }, 0);
            setTotalExpense(sum);
        }
    }, [customAmounts, participants, splitType]);

    const toggleParticipant = (id) => {
        if (participants.includes(id)) {
            setParticipants(participants.filter((mId) => mId !== id));
            const newCustomAmounts = { ...customAmounts };
            delete newCustomAmounts[id];
            setCustomAmounts(newCustomAmounts);
        } else {
            setParticipants(prev => [...prev, id]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (!spentFor || !paidBy || Number(totalExpense) <= 0 || participants.length === 0) {
                return toast.error("Please fill all fields correctly.");
            }

            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/user/expense/${expense._id}/editExpense`, {
                method: 'PUT',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ spentFor, paidBy, totalExpense, splitType, participants, customAmounts })
            });

            const data = await res.json();
            if (data.success) {
                toast.success(data.message);
                onUpdate();
                onClose();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error("Failed to update expense");
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
        >
            <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 md:p-8 relative no-scrollbar"
            >
                <button onClick={onClose} className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition p-2 hover:bg-gray-100 rounded-full">
                    <span className="text-2xl leading-none">&times;</span>
                </button>
                
                <h2 className="text-2xl font-black text-gray-900 mb-8">Edit Expense ✏️</h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="text-sm font-bold text-gray-700 ml-1">Spent For</label>
                        <input
                            value={spentFor}
                            onChange={(e) => setSpentFor(e.target.value)}
                            className="mt-2 w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-4 focus:ring-sky-100 transition focus:border-sky-400 outline-none"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="text-sm font-bold text-gray-700 ml-1">Paid By</label>
                            <select
                                value={paidBy}
                                onChange={(e) => setPaidBy(e.target.value)}
                                className="mt-2 w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:ring-4 focus:ring-sky-100 outline-none"
                            >
                                {members.map(m => (
                                    <option key={m._id} value={m._id}>{m.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="text-sm font-bold text-gray-700 ml-1">Split Type</label>
                            <div className="flex gap-2 mt-2">
                                <button
                                    type="button"
                                    onClick={() => setSplitType("equal")}
                                    className={`flex-1 py-2.5 rounded-xl border font-bold transition ${splitType === 'equal' ? 'bg-sky-500 text-white border-transparent shadow-md' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-white'}`}
                                >Equal</button>
                                <button
                                    type="button"
                                    onClick={() => setSplitType("custom")}
                                    className={`flex-1 py-2.5 rounded-xl border font-bold transition ${splitType === 'custom' ? 'bg-sky-500 text-white border-transparent shadow-md' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-white'}`}
                                >Custom</button>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-bold text-gray-700 ml-1">Participants</label>
                        <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {members.map(m => (
                                <button
                                    type="button"
                                    key={m._id}
                                    onClick={() => toggleParticipant(m._id)}
                                    className={`text-left p-3 rounded-xl border text-xs font-bold transition ${participants.includes(m._id) ? 'bg-emerald-50 border-emerald-300 text-emerald-700 shadow-sm' : 'bg-white text-gray-400 border-gray-100 hover:border-gray-200'}`}
                                >
                                    {m.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100">
                        {splitType === 'equal' ? (
                            <div>
                                <label className="text-sm font-bold text-gray-700 ml-1">Total Expense (₹)</label>
                                <input
                                    type="number"
                                    value={totalExpense}
                                    onChange={(e) => setTotalExpense(e.target.value)}
                                    className="mt-2 w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-4 focus:ring-emerald-100 outline-none"
                                />
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <label className="text-sm font-bold text-gray-700 ml-1">Custom Amounts</label>
                                {participants.map(id => {
                                    const m = members.find(member => member._id === id);
                                    return (
                                        <div key={id} className="flex items-center justify-between p-3 bg-gray-50/50 rounded-2xl border border-gray-100">
                                            <span className="text-sm font-bold text-gray-700">{m?.name}</span>
                                            <input
                                                type="number"
                                                value={customAmounts[id] || ""}
                                                onChange={(e) => setCustomAmounts(prev => ({ ...prev, [id]: e.target.value }))}
                                                placeholder="0.00"
                                                className="w-28 px-3 py-2 rounded-xl border border-gray-200 bg-white text-right font-black text-emerald-600 outline-none focus:ring-4 focus:ring-emerald-100"
                                            />
                                        </div>
                                    );
                                })}
                                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 flex justify-between items-center mt-4">
                                    <span className="font-bold text-emerald-800 uppercase tracking-widest text-xs">Total Calculated</span>
                                    <span className="text-xl font-black text-emerald-600">₹{totalExpense}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-4 pt-6">
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            type="submit"
                            className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-sky-500 text-white font-black shadow-xl hover:opacity-90 transition active:shadow-inner"
                        >Update Expense ✅</motion.button>
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-4 rounded-2xl border-2 border-gray-100 text-gray-500 font-bold hover:bg-gray-50 transition"
                        >Cancel</motion.button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
}