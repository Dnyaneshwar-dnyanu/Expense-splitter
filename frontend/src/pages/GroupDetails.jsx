import { useEffect, useState } from "react";
import { Link, redirect, useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Invoice from "../components/settlements/Invoice";
import AddExpense from "../components/expenses/AddExpense";
import AddMember from "../components/groups/AddMember";
import ExpenseList from "../components/expenses/ExpenseList";
import { motion, AnimatePresence } from "framer-motion";
import ConfirmModal from "../components/common/ConfirmModal";


export default function GroupDetails() {
  const navigate = useNavigate();
  const groupID = useParams().groupID;
  const userID = useParams().userID;

  useEffect(() => {
    fetchGroup();
  }, []);

  const [group, setGroup] = useState();
  const [members, setMembers] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [activeTab, setActiveTab] = useState("plan"); // "plan" | "add_expense" | "expenses_list" | "invoice"

  const [expenses, setExpenses] = useState([]);


  async function fetchGroup() {
    try {
      // 1. Fetch current logged in user to verify isAdmin safely
      const userRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/getUser`, {
        method: 'GET',
        credentials: 'include'
      });
      let loggedInUserId = null;
      if (userRes.ok) {
        const userData = await userRes.json();
        if (userData.success && userData.user) {
          loggedInUserId = userData.user._id;
        }
      }

      // 2. Fetch group details
      let res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/user/group/${groupID}/getGroup`, {
        method: 'GET',
        credentials: 'include'
      });

      if (!res.ok) {
        throw new Error("Failed to fetch group");
      }

      let data = await res.json();
      if (data.success) {
        let formattedGroup = {
          ...data.group,
          createdAt: new Date(data.group?.createdAt).toLocaleDateString(),
        };
        setGroup(formattedGroup);
        setMembers(data.group.members);
        setExpenses(data.group.expenses);
        
        // Check if current logged-in user is admin
        const groupAdminId = data.group.admin?._id || data.group.admin;
        if (groupAdminId && loggedInUserId && loggedInUserId.toString() === groupAdminId.toString()) {
          setIsAdmin(true);
        }
      }
      else {
        toast.error('Failed to fetch group details');
        navigate(`/${userID}/dashboard`);
      }
    } catch (error) {
      console.error("Fetch group failed:", error);
      toast.error("Network error, could not fetch group details.");
      navigate(`/${userID}/dashboard`);
    }
  }

  const handleDeleteGroup = async () => {
    try {
      let res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/user/group/${groupID}/deleteGroup`, {
        method: 'DELETE',
        credentials: 'include'
      });

      let data = await res.json();
      if (data.success) {
        toast.success("Group deleted successfully");
        navigate(`/${userID}/dashboard`);
      } else {
        toast.error(data.message || "Failed to delete group");
      }
    } catch (error) {
      toast.error("Network error, failed to delete group");
    }
  }

  const tabVariants = {
    hidden: { opacity: 0, x: 10 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -10 }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-sky-200 via-white to-emerald-200 px-4 py-10"
    >
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteGroup}
        title="Delete Group?"
        message="Are you sure you want to delete this group? All expenses will be permanently removed. This action cannot be undone."
        confirmText="Delete Group"
        type="danger"
      />

      <div className="max-w-6xl mx-auto text-black">
        {/* Top Bar */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
            <h1 className="text-3xl font-bold text-gray-900">
              {group?.groupName} 👥
            </h1>
            <p className="text-gray-600 mt-1 font-medium italic">
              {group?.description}
            </p>
          </motion.div>

          <motion.div whileHover={{ x: -5 }}>
            <Link
              to={`/${userID}/dashboard`}
              className="px-5 py-2.5 rounded-xl bg-white/80 border border-white/50 shadow-sm hover:bg-white transition font-bold text-gray-700 flex items-center gap-2"
            >
              ← <span className="hidden sm:inline">Back to Dashboard</span>
            </Link>
          </motion.div>
        </div>

        {/* Group Info Card */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 p-4 md:p-6">
            {/* Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-3 scrollbar-hide no-scrollbar">
              {[
                { id: "plan", label: "Summary 📋" },
                { id: "add_expense", label: "Add Expense ➕" },
                { id: "expenses_list", label: "History 💰" },
                { id: "invoice", label: "Settlement 🧾" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-5 py-2.5 rounded-xl font-bold transition whitespace-nowrap text-sm md:text-base ${activeTab === tab.id
                    ? "bg-gradient-to-r from-sky-500 to-emerald-500 text-white shadow-md scale-105"
                    : "bg-white/50 border border-gray-100 text-gray-600 hover:bg-white hover:shadow-sm"
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="mt-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  variants={tabVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  transition={{ duration: 0.2 }}
                >
                  {/* Trip Plan */}
                  {activeTab === "plan" && (
                    <div className="space-y-4">
                      <h2 className="text-xl font-bold text-gray-900">
                        Group Summary 📊
                      </h2>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-5 rounded-2xl bg-white/60 border border-white shadow-sm">
                          <p className="text-sm text-gray-500 font-bold uppercase tracking-wider">Group</p>
                          <p className="font-black text-gray-900 mt-1 text-lg">
                            {group?.groupName}
                          </p>
                        </div>

                        <div className="p-5 rounded-2xl bg-white/60 border border-white shadow-sm">
                          <p className="text-sm text-gray-500 font-bold uppercase tracking-wider">Description</p>
                          <p className="font-bold text-gray-900 mt-1">
                            {group?.description}
                          </p>
                        </div>

                        <div className="p-5 rounded-2xl bg-white/60 border border-white shadow-sm">
                          <p className="text-sm text-gray-500 font-bold uppercase tracking-wider">Members</p>
                          <p className="font-black text-emerald-600 mt-1 text-2xl">
                            {members?.length}
                          </p>
                        </div>

                        <div className="p-5 rounded-2xl bg-white/60 border border-white shadow-sm">
                          <p className="text-sm text-gray-500 font-bold uppercase tracking-wider">Created On</p>
                          <p className="font-bold text-gray-900 mt-1">
                            {group?.createdAt}
                          </p>
                        </div>
                      </div>

                      <div className="rounded-2xl p-6 bg-gradient-to-br from-sky-500 to-emerald-500 text-white shadow-lg relative overflow-hidden">
                        <div className="relative z-10">
                          <h3 className="font-bold text-lg">Pro Tip ✨</h3>
                          <p className="text-white/90 mt-2 text-sm leading-relaxed">
                            Add expenses as soon as they happen. This keeps group balances fair, transparent, and avoids confusion later.
                          </p>
                        </div>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10" />
                      </div>

                      {isAdmin && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8 pt-6 border-t border-gray-100">
                           <button
                             onClick={() => setIsDeleteModalOpen(true)}
                             className="w-full py-4 rounded-2xl border-2 border-red-100 text-red-600 font-black hover:bg-red-50 transition-colors"
                           >
                             Delete This Group 🗑️
                           </button>
                           <p className="text-center text-xs text-gray-400 mt-3 font-medium">
                             Warning: This action cannot be undone.
                           </p>
                        </motion.div>
                      )}
                    </div>
                  )}

                  {/* Add Expense */}
                  {activeTab === "add_expense" && (
                    <AddExpense group={group} members={members} expenses={expenses} refreshData={fetchGroup} />
                  )}

                  {/* Expenses List */}
                  {activeTab === "expenses_list" && (
                      <ExpenseList expenses={expenses} members={members} refreshData={fetchGroup} isAdmin={isAdmin} />
                  )}

                  {/* Invoice */}
                  {activeTab === "invoice" && (
                    <Invoice group={group} isAdmin={isAdmin} />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Members Side */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 p-6 self-start">
            <h2 className="text-xl font-bold text-gray-900">
              Members 👥 ({members?.length})
            </h2>

            {/* Add member */}
            {isAdmin && (
              <div className="mt-4">
                <AddMember refreshData={fetchGroup} existingMembers={members} />
              </div>
            )}

            {/* list */}
            <div className="mt-6 space-y-3">
              {members?.map((m, idx) => (
                <motion.div
                  key={m._id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="p-4 rounded-2xl border border-gray-100 bg-white/50 hover:bg-white hover:shadow-sm transition cursor-default"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-gray-900">{m.name}</p>
                    {group?.admin === m._id || (typeof group?.admin === 'object' && group?.admin?._id === m._id) ? (
                      <span className="text-[10px] font-black bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Admin
                      </span>
                    ) : null}
                  </div>
                  <p className="text-xs text-gray-500 font-medium truncate">{m.email}</p>
                </motion.div>
              ))}
            </div>

            <p className="mt-6 text-xs text-gray-400 text-center font-bold uppercase tracking-widest">
              Fair splitting, better relations 🤝
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

