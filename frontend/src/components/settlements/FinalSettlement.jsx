import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { useParams } from "react-router-dom";

function FinalSettlement(props) {
    const { groupID } = useParams();
    let giveExpenses = props.giveExpenses;
    let getExpenses = props.getExpenses;
    let members = props.members;
    let onSettle = props.onSettle;

    const formatAmount = (amount) => {
        // round to 2 decimals cleanly
        return `₹${Number(amount).toFixed(2)}`;
    };

    const handleSettle = async (withUserID, name) => {
        if (!window.confirm(`Are you sure you want to settle all pending payments with ${name}?`)) return;

        try {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/user/expense/${groupID}/settle/${withUserID}`, {
                method: 'POST',
                credentials: 'include'
            });

            const data = await res.json();
            if (data.success) {
                toast.success(data.message);
                if (onSettle) onSettle();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error("Settlement failed:", error);
            toast.error("Failed to settle payment.");
        }
    }

    const hasSettlements = members?.some(member => {
        const give = giveExpenses[member._id]?.totalExpense || 0;
        const get = getExpenses[member._id]?.totalExpense || 0;
        return (get - give) !== 0;
    });

    if (!hasSettlements) return null;

    return (
        <div className="mt-10 bg-white rounded-2xl shadow-xl border border-emerald-100 overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-500 to-sky-500 p-4">
                <h2 className="text-xl font-black text-white flex items-center gap-2">
                    Final Settlements 🧾
                </h2>
                <p className="text-white/80 text-xs font-bold uppercase tracking-widest mt-1">
                    Calculate net balances and settle up
                </p>
            </div>

            <div className="p-6 space-y-4">
                {members?.map((member) => {
                    const give = giveExpenses[member._id]?.totalExpense || 0;
                    const get = getExpenses[member._id]?.totalExpense || 0;

                    const net = get - give;

                    if (net === 0) return null;

                    return (
                        <div
                            key={member._id}
                            className={`p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${net > 0 
                                ? "border-emerald-100 bg-emerald-50/30" 
                                : "border-red-100 bg-red-50/30"}`}
                        >
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-lg font-black text-gray-900">{member.name}</span>
                                    <span className={`px-2 py-0.5 rounded-lg text-[0.65rem] font-black uppercase tracking-tighter ${net > 0 ? "bg-emerald-500 text-white" : "bg-red-500 text-white"}`}>
                                        {net > 0 ? "Owes You" : "You Owe"}
                                    </span>
                                </div>
                                <p className="text-sm font-bold mt-1 text-gray-600">
                                    {net > 0 
                                        ? `You are set to receive ${formatAmount(net)}` 
                                        : `You need to pay ${formatAmount(Math.abs(net))}`}
                                </p>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleSettle(member._id, member.name)}
                                className={`px-6 py-2.5 rounded-xl font-black text-sm shadow-md transition ${net > 0 
                                    ? "bg-emerald-500 text-white hover:bg-emerald-600" 
                                    : "bg-red-500 text-white hover:bg-red-600"}`}
                            >
                                Settle Up ✅
                            </motion.button>
                        </div>
                    );
                })}
            </div>
        </div >
    )
}

export default FinalSettlement