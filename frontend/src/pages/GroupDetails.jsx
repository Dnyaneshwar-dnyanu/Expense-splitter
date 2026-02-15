import { useEffect, useState } from "react";
import { Link, redirect, useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Invoice from "../components/settlements/Invoice";
import AddExpense from "../components/expenses/AddExpense";
import AddMember from "../components/groups/addMember";


export default function GroupDetails() {
  const navigate = useNavigate();
  const groupID = useParams().groupID;
  const userID = useParams().userID;

  useEffect(() => {
    fetchGroup();
  }, []);

  const [group, setGroup] = useState();
  const [members, setMembers] = useState([]);

  // Tabs
  const [activeTab, setActiveTab] = useState("plan"); // "plan" | "expenses" | "invoice"

  const [expenses, setExpenses] = useState([]);


  async function fetchGroup() {
    let res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/user/group/${groupID}/getGroup`, {
      method: 'GET',
      credentials: 'include'
    });


    let data = await res.json();
    if (data.success) {
      let formattedGroup = {
        ...data.group,
        createdAt: new Date(data.group?.createdAt).toLocaleDateString(),
      };
      setGroup(formattedGroup);
      setMembers(data.group.members);
      setExpenses(data.group.expenses);
    }
    else {
      toast.error('Failed to fetch group details');
      navigate(`/${userID}/dashboard`);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-200 via-white to-emerald-200 px-4 py-10">
      <div className="max-w-6xl mx-auto text-black">
        {/* Top Bar */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {group?.groupName} 🌍
            </h1>
            <p className="text-gray-600 mt-1">
              Description:{" "}
              <span className="font-semibold">{group?.description}</span>
            </p>
          </div>

          <Link
            to={`/${userID}/dashboard`}
            className="px-5 py-2.5 rounded-xl bg-white/80 border border-white/50 shadow hover:bg-white transition font-semibold 7"
          >
            ← Back to Dashboard
          </Link>
        </div>

        {/* Group Info Card */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 p-6">
            {/* Tabs */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveTab("plan")}
                className={`px-5 py-2.5 rounded-xl font-semibold transition ${activeTab === "plan"
                  ? "bg-gradient-to-r from-sky-500 to-emerald-500 text-white shadow"
                  : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                  }`}
              >
                Trip Plan ✈️
              </button>

              <button
                onClick={() => setActiveTab("expenses")}
                className={`px-5 py-2.5 rounded-xl font-semibold transition ${activeTab === "expenses"
                  ? "bg-gradient-to-r from-sky-500 to-emerald-500 text-white shadow"
                  : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                  }`}
              >
                Expenses 💰
              </button>

              <button
                onClick={() => setActiveTab("invoice")}
                className={`px-5 py-2.5 rounded-xl font-semibold transition ${activeTab === "invoice"
                  ? "bg-gradient-to-r from-sky-500 to-emerald-500 text-white shadow"
                  : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                  }`}
              >
                Invoice 🧾
              </button>
            </div>

            {/* Tab Content */}
            <div className="mt-6">
              {/* Trip Plan */}
              {activeTab === "plan" && (
                <div className="space-y-4">
                  <h2 className="text-xl font-bold text-gray-900">
                    Trip Plan Details 🗺️
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-5 rounded-2xl bg-white border border-gray-200">
                      <p className="text-sm text-gray-500">Group</p>
                      <p className="font-bold text-gray-900 mt-1">
                        {group?.groupName}
                      </p>
                    </div>

                    <div className="p-5 rounded-2xl bg-white border border-gray-200">
                      <p className="text-sm text-gray-500">Description</p>
                      <p className="font-bold text-gray-900 mt-1">
                        {group?.description}
                      </p>
                    </div>

                    <div className="p-5 rounded-2xl bg-white border border-gray-200">
                      <p className="text-sm text-gray-500">Members</p>
                      <p className="font-bold text-gray-900 mt-1">
                        {members?.length}
                      </p>
                    </div>

                    <div className="p-5 rounded-2xl bg-white border border-gray-200">
                      <p className="text-sm text-gray-500">Created</p>
                      <p className="font-bold text-gray-900 mt-1">
                        {group?.createdAt}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl p-6 bg-gradient-to-br from-sky-500 to-emerald-500 text-white shadow-lg">
                    <h3 className="font-bold text-lg">Pro Tip ✨</h3>
                    <p className="text-white/90 mt-2 text-sm">
                      Add expenses as soon as you pay (hotel/food/tickets). This
                      keeps group split fair and clean.
                    </p>
                  </div>
                </div>
              )}

              {/* Expenses */}
              {activeTab === "expenses" && (
                <AddExpense group={group} members={members} expenses={expenses} />
              )}

              {/* Invoice */}
              {activeTab === "invoice" && (
                <Invoice />
              )}
            </div>
          </div>

          {/* Members Side */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 p-6">
            <h2 className="text-xl font-bold text-gray-900">
              Members 👥 ({members?.length})
            </h2>

            {/* Add member */}
            <AddMember members={members} />

            {/* list */}
            <div className="mt-6 space-y-3">
              {members?.map((m) => (
                <div
                  key={m.id}
                  className="p-4 rounded-2xl border border-gray-200 bg-white"
                >
                  <p className="font-bold text-gray-900">{m.name}</p>
                  <p className="text-sm text-gray-600">{m.email}</p>
                </div>
              ))}
            </div>

            {/* Illustration */}
            <div className="mt-7 relative h-28 overflow-hidden rounded-2xl bg-gradient-to-br from-sky-500 to-emerald-500">
              <div className="absolute bottom-0 left-0 w-full h-14 bg-black/20 rounded-t-[100px]" />
              <div className="absolute bottom-0 left-10 w-28 h-12 bg-white/20 rounded-t-[80px]" />
              <div className="absolute bottom-0 right-10 w-36 h-16 bg-white/15 rounded-t-[100px]" />
              <div className="absolute top-3 left-6 w-9 h-9 bg-yellow-200 rounded-full blur-sm" />
            </div>

            <p className="mt-3 text-xs text-gray-500 text-center">
              Together is the best place to be 🌴
            </p>
          </div>
        </div>
      </div >
    </div >
  );
}
