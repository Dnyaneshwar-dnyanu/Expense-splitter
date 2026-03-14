import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from "framer-motion";

function AddExpense({ group, members, expenses, refreshData }) {
    const groupID = useParams().groupID;
    const [spentFor, setSpentFor] = useState("");
    const [paidBy, setPaidBy] = useState("");
    const [participants, setParticipants] = useState([]);
    const [totalExpense, setTotalExpense] = useState(0);
    const [splitType, setSplitType] = useState("equal"); // "equal" | "custom"
    const [customAmounts, setCustomAmounts] = useState({});

    // Auto-calculate Total Expense when in 'custom' mode
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
            // Remove the amount if the person is unselected
            const newCustomAmounts = { ...customAmounts };
            delete newCustomAmounts[id];
            setCustomAmounts(newCustomAmounts);
        }
        else {
            setParticipants(prev => [...prev, id]);
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (!spentFor || !paidBy || Number(totalExpense) <= 0 || participants.length === 0) {
                return toast.error("Please fill all fields, select participants, and ensure total is greater than 0.");
            }

            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/user/expense/${groupID}/addExpense`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ spentFor, paidBy, totalExpense, splitType, participants, customAmounts })
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                toast.error(errorData.message || "Failed to add expense.");
                return;
            }

            const data = await res.json();

            if (data.success) {
                toast.success(data.message);
                if (refreshData) refreshData();
                setSpentFor("");
                setPaidBy("");
                setParticipants([]);
                setTotalExpense(0);
                setCustomAmounts({});
            }
            else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error("Add expense failed:", error);
            toast.error("Network error, could not add expense.");
        }
    }

    return (
        <div className="space-y-6">
            {/* Summary */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">
                        Expenses Overview 💸
                    </h2>
                    <p className="text-sm text-gray-500">
                        Total Group Expense
                    </p>
                </div>
                <div className="text-2xl font-extrabold text-emerald-600">
                    ₹ {group.totalGroupExpense}
                </div>
            </div>

            {/* Add Expense Form */}
            <div className="rounded-2xl shadow-lg bg-white/80 backdrop-blur-xl border border-white/50 p-6">
                <h3 className="text-lg font-bold text-gray-900">
                    Add Expense ➕
                </h3>
                <form onSubmit={handleSubmit} className="mt-5 space-y-4" >
                    {/* Spent for */}
                    <div>
                        <label className="text-sm font-medium text-gray-700">
                            Spent For
                        </label>
                        <input
                            value={spentFor}
                            onChange={(e) => setSpentFor(e.target.value)}
                            type="text"
                            placeholder="Example: Lunch / Taxi / Hotel"
                            className="mt-2 w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-4 focus:ring-sky-200 focus:border-sky-400 transition"
                        />
                    </div>

                    {/* Paid by */}
                    <div>
                        <label className="text-sm font-medium text-gray-700">
                            Paid By
                        </label>
                        <select
                            value={paidBy}
                            onChange={(e) => setPaidBy(e.target.value)}
                            className="mt-2 w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-4 focus:ring-sky-200 focus:border-sky-400 transition"
                        >
                            <option value="">Paid By</option>
                            {members?.map((m, i) => (
                                <option key={i} value={m._id}>
                                    {m.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Split Type */}
                    <div>
                        <label className="text-sm font-medium text-gray-700">
                            Split Type
                        </label>
                        <div className="mt-2 flex gap-3">
                            {/* Equal */}
                            <label className="cursor-pointer">
                                <input
                                    type="radio"
                                    name="splitType"
                                    value="equal"
                                    onChange={(e) => setSplitType(e.target.value)}
                                    className="peer hidden"
                                    checked={splitType === "equal"}
                                />
                                <div className="px-5 py-1.5 rounded-xl border border-gray-200 bg-white/80 backdrop-blur-xl
                                    text-gray-700 font-semibold shadow-sm peer-checked:bg-gradient-to-r peer-checked:from-sky-500 peer-checked:to-emerald-500 peer-checked:text-white peer-checked:border-transparent hover:bg-gray-50 transition"
                                >
                                    Equal
                                </div>
                            </label>

                            {/* Custom */}
                            <label className="cursor-pointer">
                                <input
                                    type="radio"
                                    name="splitType"
                                    value="custom"
                                    onChange={(e) => setSplitType(e.target.value)}
                                    className="peer hidden"
                                    checked={splitType === "custom"}
                                />
                                <div className="px-5 py-1.5 rounded-xl border border-gray-200 bg-white/80 backdrop-blur-xl
                      text-gray-700 font-semibold shadow-sm peer-checked:bg-gradient-to-r peer-checked:from-sky-500 peer-checked:to-emerald-500 peer-checked:text-white peer-checked:border-transparent hover:bg-gray-50 transition">
                                    Custom
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Participants Selection */}
                    <div>
                        <label className="text-sm font-medium text-gray-700">
                            Participants (split among)
                        </label>
                        <p className='text-sm text-gray-500 px-1'>Select members involved in this expense:</p>
                        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {members?.map((m, i) => (
                                <button
                                    type="button"
                                    key={i}
                                    onClick={() => toggleParticipant(m._id)}
                                    className={`text-left p-3 rounded-xl border transition ${participants.includes(m._id)
                                        ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                                        : "border-gray-200 bg-white text-gray-400 hover:bg-gray-50"
                                        }`}
                                >
                                    {m.name}
                                    <span className="block text-xs font-normal text-gray-500">
                                        {m.email}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Amount Input Section */}
                    <div className="pt-4 border-t border-gray-100">
                        {splitType === 'equal' ? (
                            <div>
                                <label className="text-sm font-medium text-gray-700">
                                    Total Expense (₹)
                                </label>
                                <input
                                    value={totalExpense}
                                    onChange={(e) => setTotalExpense(e.target.value)}
                                    type="number"
                                    min={0}
                                    placeholder="Example: 1200"
                                    className="mt-2 w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-4 focus:ring-emerald-200 focus:border-emerald-400 transition"
                                />
                                <p className="text-xs text-gray-500 mt-2">
                                    Each participant will pay: ₹{participants.length > 0 ? (totalExpense / participants.length).toFixed(2) : 0}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <label className="text-sm font-medium text-gray-700">
                                    Individual Custom Amounts
                                </label>
                                {participants.length === 0 ? (
                                    <p className="text-sm text-red-500 italic">Select participants above to enter custom amounts.</p>
                                ) : (
                                    participants.map((id) => {
                                        const member = members.find(m => m._id === id);
                                        return (
                                            <div key={id} className="flex items-center justify-between p-3 rounded-xl border border-emerald-100 bg-emerald-50/30">
                                                <div>
                                                    <p className="font-semibold text-gray-800">{member?.name}</p>
                                                    <p className="text-xs text-gray-500">{member?.email}</p>
                                                </div>
                                                <input
                                                    type="number"
                                                    placeholder="Amount ₹"
                                                    min={0}
                                                    value={customAmounts[id] || ""}
                                                    onChange={(e) => setCustomAmounts((prev) => ({
                                                        ...prev,
                                                        [id]: e.target.value
                                                    }))}
                                                    className="w-32 px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-4 focus:ring-emerald-200 focus:border-emerald-400 transition font-semibold"
                                                />
                                            </div>
                                        );
                                    })
                                )}
                                <div className="mt-4 p-4 rounded-xl bg-gray-50 border border-gray-200 flex justify-between items-center">
                                    <span className="font-bold text-gray-700">Calculated Total Expense:</span>
                                    <span className="text-xl font-extrabold text-emerald-600">₹{totalExpense}</span>
                                </div>
                            </div>
                        )}
                    </div>
{/* Submit */}
<motion.button
    whileTap={{ scale: 0.95 }}
    type="submit"
    className="w-full py-3 rounded-xl bg-gradient-to-r from-sky-500 to-emerald-500 text-white font-semibold shadow-lg hover:opacity-90 transition"
>
    Save Expense ✅
</motion.button>
                </form>
            </div>
        </div>
    )
}

export default AddExpense