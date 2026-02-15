import { useState } from 'react'
import ExpenseList from './ExpenseList';

function AddExpense({ group, members, expenses }) {
    const [spentFor, setSpentFor] = useState("");
    const [paidBy, setPaidBy] = useState({ id: "", name: "" });
    const [participants, setParticipants] = useState([]);
    const [totalExpense, setTotalExpense] = useState(0);
    const [splitType, setSplitType] = useState("equal"); // "equal" | "custom"

    const toggleParticipant = (id) => {
        if (participants.includes(id)) {
            setParticipants(participants.filter((mId) => mId !== id));
        }
        else {
            setParticipants(prev => [...prev, id]);
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/user/expense/${groupID}/addExpense`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ spentFor, paidBy, totalExpense, participants })
        });

        const data = await res.json();

        if (data.success) {
            toast.success(data.message);
        }
        else {
            toast.error(data.message);
        }

        fetchGroup();

        setSpentFor("");
        setPaidBy("");
        setParticipants([]);
        setTotalExpense(0);
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

                    {/* Total expense */}
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
                                <option key={i} value={m.id}>
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
                                    defaultChecked
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
                                    
                                />
                                <div className="px-5 py-1.5 rounded-xl border border-gray-200 bg-white/80 backdrop-blur-xl
                      text-gray-700 font-semibold shadow-sm peer-checked:bg-gradient-to-r peer-checked:from-sky-500 peer-checked:to-emerald-500 peer-checked:text-white peer-checked:border-transparent hover:bg-gray-50 transition">
                                    Custom
                                </div>
                            </label>

                        </div>
                    </div>


                    {/* Participants */}
                    <div>
                        <label className="text-sm font-medium text-gray-700">
                            Participants (split among)
                        </label>
                        <p className='text-sm text-gray-500 px-3'>Note: Click on buttons to add or add amount (custom split type) </p>

                        {splitType === 'equal' ? (
                            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {members?.map((m, i) => (
                                    <button
                                        type="button"
                                        key={i}
                                        onClick={() => toggleParticipant(m.id)}
                                        className={`text-left ${participants.includes(m.id)
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
                        ) : (
                            < div className="mt-3 space-y-4">
                                {members?.map((m, i) => {
                                    const isSelected = participants.includes(m.id);

                                    return (
                                        <div
                                            key={i}
                                            className={`p-4 rounded-2xl border transition shadow-sm
                                                ${isSelected
                                                    ? "border-emerald-300 bg-emerald-50/70 backdrop-blur-xl"
                                                    : "border-gray-200 bg-white/80 backdrop-blur-xl"
                                                }`}
                                        >
                                            <div className="flex items-center justify-between gap-4 flex-wrap">
                                                <button
                                                    type="button"
                                                    onClick={() => toggleParticipant(m.id)}
                                                    className="text-left"
                                                >
                                                    <p
                                                        className={`font-semibold transition
                                                            ${isSelected
                                                                ? "text-emerald-700"
                                                                : "text-gray-600"
                                                            }`}
                                                    >
                                                        {m.name}
                                                    </p>

                                                    <p className="text-xs text-gray-500">
                                                        {m.email}
                                                    </p>
                                                </button>

                                                {isSelected && (
                                                    <input
                                                        type="number"
                                                        placeholder="Amount ₹"
                                                        className="w-32 px-4 py-2.5 rounded-xl border border-gray-200 bg-white/90 backdrop-blur-xl
                                        focus:outline-none focus:ring-4 focus:ring-emerald-200 focus:border-emerald-400 transition font-semibold 7"
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}

                            </div>

                        )}
                        <p className="text-xs text-gray-500 mt-2">
                            Selected: {participants.length}
                        </p>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-sky-500 to-emerald-500 text-white font-semibold shadow-lg hover:opacity-90 transition"
                    >
                        Save Expense ✅
                    </button>
                </form>
            </div>

            {/* Expenses List */}
            <ExpenseList expenses={expenses} />
        </div>
    )
}

export default AddExpense