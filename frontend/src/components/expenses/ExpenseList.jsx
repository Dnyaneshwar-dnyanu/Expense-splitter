import React, { useState, useMemo } from 'react'
import { toast } from 'react-toastify';
import EditExpenseModal from './EditExpenseModal';
import { motion, AnimatePresence } from 'framer-motion';

function ExpenseList({ expenses, members, refreshData }) {
    const [editingExpense, setEditingExpense] = useState(null);
    const [isManageMode, setIsManageMode] = useState(false);
    const [selectedExpenses, setSelectedExpenses] = useState([]);

    const toggleManageMode = () => {
        setIsManageMode(!isManageMode);
        setSelectedExpenses([]);
    };

    const toggleSelection = (id) => {
        if (selectedExpenses.includes(id)) {
            setSelectedExpenses(selectedExpenses.filter(expId => expId !== id));
        } else {
            setSelectedExpenses([...selectedExpenses, id]);
        }
    };

    const handleBulkDelete = async () => {
        if (selectedExpenses.length === 0) return;
        if (!window.confirm(`Are you sure you want to delete ${selectedExpenses.length} selected expenses?`)) return;

        try {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/user/expense/bulkDelete`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ expenseIDs: selectedExpenses })
            });

            const data = await res.json();
            if (data.success) {
                toast.success(data.message);
                setSelectedExpenses([]);
                setIsManageMode(false);
                if (refreshData) refreshData();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error("Failed to delete expenses");
        }
    };

    const handleDelete = async (expenseID) => {
        if (!window.confirm("Are you sure you want to delete this expense?")) return;

        try {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/user/expense/${expenseID}/deleteExpense`, {
                method: 'DELETE',
                credentials: 'include'
            });

            const data = await res.json();
            if (data.success) {
                toast.success(data.message);
                if (refreshData) refreshData();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error("Failed to delete expense");
        }
    };

    // Group expenses by Month & Year
    const groupedExpenses = useMemo(() => {
        if (!expenses) return {};
        
        const groups = {};
        
        // Sort expenses by date descending first
        const sortedExpenses = [...expenses].sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt));

        sortedExpenses.forEach(expense => {
            const date = new Date(expense.addedAt);
            const monthYear = date.toLocaleString('default', { month: 'long', year: 'numeric' });
            
            if (!groups[monthYear]) {
                groups[monthYear] = [];
            }
            groups[monthYear].push(expense);
        });
        
        return groups;
    }, [expenses]);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.05 }
        }
    };

    const itemVariants = {
        hidden: { y: 10, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                    <h3 className="text-2xl font-black text-gray-900">
                        Expense History 📊
                    </h3>
                    <p className="text-sm text-gray-500 font-medium">
                        Track and manage your shared bills
                    </p>
                </div>
                
                <div className="flex items-center gap-2">
                    {isManageMode ? (
                        <>
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={handleBulkDelete}
                                disabled={selectedExpenses.length === 0}
                                className={`px-4 py-2 rounded-xl font-bold text-sm transition ${selectedExpenses.length > 0 ? 'bg-red-500 text-white shadow-lg shadow-red-100' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                            >
                                Delete Selected ({selectedExpenses.length})
                            </motion.button>
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={toggleManageMode}
                                className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition"
                            >
                                Cancel
                            </motion.button>
                        </>
                    ) : (
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={toggleManageMode}
                            className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-gray-700 font-bold text-sm shadow-sm hover:bg-gray-50 transition"
                        >
                            Manage History ⚙️
                        </motion.button>
                    )}
                </div>
            </div>

            {Object.keys(groupedExpenses).length === 0 ? (
                <div className="p-16 rounded-3xl bg-white border-2 border-dashed border-gray-100 text-gray-400 text-center">
                    <p className="text-4xl mb-4">🧊</p>
                    <p className="font-bold">No expenses found yet.</p>
                    <p className="text-sm">Start adding expenses to see them here.</p>
                </div>
            ) : (
                Object.entries(groupedExpenses).map(([monthYear, monthExpenses]) => (
                    <div key={monthYear} className="space-y-4">
                        {/* Month Header */}
                        <div className="flex items-center gap-4">
                            <h4 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em] whitespace-nowrap">
                                {monthYear}
                            </h4>
                            <div className="h-[1px] w-full bg-gray-100" />
                        </div>

                        <motion.div 
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            className="space-y-4"
                        >
                            {monthExpenses.map((e) => (
                                <motion.div
                                    key={e._id}
                                    variants={itemVariants}
                                    whileHover={{ scale: 1.01 }}
                                    onClick={() => isManageMode && toggleSelection(e._id)}
                                    className={`p-5 rounded-2xl border transition group cursor-pointer ${isManageMode && selectedExpenses.includes(e._id) 
                                        ? 'bg-red-50/50 border-red-200 shadow-md ring-2 ring-red-100' 
                                        : 'bg-white border-gray-100 shadow-sm hover:shadow-md'}`}
                                >
                                    <div className="flex items-start gap-4">
                                        {/* Checkbox for Manage Mode */}
                                        <AnimatePresence>
                                            {isManageMode && (
                                                <motion.div 
                                                    initial={{ opacity: 0, scale: 0.5 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.5 }}
                                                    className={`mt-1 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition ${selectedExpenses.includes(e._id) ? 'bg-red-500 border-red-500 text-white' : 'bg-white border-gray-200'}`}
                                                >
                                                    {selectedExpenses.includes(e._id) && (
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                                                        </svg>
                                                    )}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <p className="font-black text-gray-900 text-lg group-hover:text-sky-600 transition">
                                                    {e.spentFor}
                                                </p>
                                                <span className={`px-2 py-0.5 rounded-md text-[0.6rem] font-black uppercase tracking-wider ${e.splitType === 'equal' ? 'bg-sky-50 text-sky-600' : 'bg-amber-50 text-amber-600'}`}>
                                                    {e.splitType}
                                                </span>
                                            </div>
                                            
                                            <div className="flex items-center gap-2 mt-1">
                                                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-[0.6rem] font-bold text-gray-500">
                                                    {e.paidBy?.name?.charAt(0)}
                                                </div>
                                                <p className="text-xs text-gray-500 font-medium">
                                                    Paid by <span className="text-gray-800 font-bold">{e.paidBy?.name}</span>
                                                </p>
                                            </div>

                                            <div className="flex flex-wrap gap-1.5 mt-4">
                                                {e.participants.map((p, idx) => (
                                                    <div key={idx} className={`px-2.5 py-1 rounded-lg text-[0.65rem] font-bold border transition ${p.isSettled ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-gray-50 border-gray-100 text-gray-500'}`}>
                                                        {p.userID?.name}: ₹{p.sharedAmount} {p.isSettled && '✓'}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="text-right flex flex-col items-end">
                                            <div className="p-2 rounded-xl bg-gray-50 border border-gray-100">
                                                <p className="text-emerald-600 font-black text-xl tracking-tight">₹{e.totalExpense}</p>
                                            </div>
                                            <p className="text-[0.6rem] text-gray-400 font-black mt-2 uppercase tracking-widest">
                                                {new Date(e.addedAt).getDate()} {new Date(e.addedAt).toLocaleString('default', { month: 'short' })}
                                            </p>
                                            
                                            {!isManageMode && (
                                                <div className="flex gap-2 mt-4 opacity-0 group-hover:opacity-100 transition">
                                                    <motion.button 
                                                        whileTap={{ scale: 0.9 }}
                                                        onClick={(e) => { e.stopPropagation(); setEditingExpense(e); }}
                                                        className="p-2 rounded-lg bg-sky-50 text-sky-600 hover:bg-sky-100 transition shadow-sm"
                                                        title="Edit Expense"
                                                    >
                                                        ✏️
                                                    </motion.button>
                                                    <motion.button 
                                                        whileTap={{ scale: 0.9 }}
                                                        onClick={(e) => { e.stopPropagation(); handleDelete(e._id); }}
                                                        className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition shadow-sm"
                                                        title="Delete Expense"
                                                    >
                                                        🗑️
                                                    </motion.button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                ))
            )}

            {editingExpense && (
                <EditExpenseModal 
                    expense={editingExpense} 
                    members={members} 
                    onClose={() => setEditingExpense(null)} 
                    onUpdate={refreshData}
                />
            )}
        </div>
    )
}

export default ExpenseList