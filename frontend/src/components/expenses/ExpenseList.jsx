import React from 'react'

function ExpenseList({ expenses }) {
    return (
        <div>
            <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900">
                    Recent Expenses 📌
                </h3>

                {expenses?.length === 0 ? (
                    <div className="p-6 rounded-2xl bg-white border border-gray-200 text-gray-500">
                        No expenses yet.
                    </div>
                ) : (
                    expenses?.map((e, i) => (
                        <div
                            key={i}
                            className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm"
                        >
                            <div className="flex items-start justify-between gap-4 relative">
                                <div>
                                    <p className="font-bold text-gray-900 text-lg">
                                        {e.spentFor}
                                    </p>
                                    <p className="text-sm text-gray-600 mt-1">
                                        Paid by: {e.paidBy.name}
                                        <span className="font-semibold">

                                        </span>
                                    </p>

                                    <p className="text-sm text-gray-500 mt-2">
                                        Participants: {e.participants.map((p, i) => <span key={i} className="mr-2">• {p.userID.name}</span>)}
                                    </p>
                                </div>

                                <div className="">
                                    <p className="text-emerald-600 font-extrabold text-xl">₹ {e.totalExpense}</p>
                                    <p className="absolute -bottom-2 right-0 text-sm text-zinc-500">{new Date(e.addedAt).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}

export default ExpenseList