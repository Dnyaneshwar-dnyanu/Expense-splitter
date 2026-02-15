import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import GroupCard from "../components/groups/GroupCard";

export default function Dashboard() {
  const navigate = useNavigate();
  const userID = useParams().userID;
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    let res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/getData`, {
      method: 'GET',
      credentials: 'include'
    });

    if (res.status === 200) {
      let data = await res.json();
      if (data.success) {
        setUser(data.user);
      }
      else {
        navigate('/login');
      }
    }
  }

  const logout = async () => {
    let res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/logout`, {
      method: 'GET',
      credentials: 'include'
    });

    if (res.status === 200) {
      navigate('/login');
    }
    else {
      toast.error('Logout Failed!');
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-200 via-white to-emerald-200 px-4 py-10">
      <div className="max-w-6xl mx-auto">
        {/* Top header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              TripNest Dashboard 🌍
            </h1>
            <p className="text-gray-600 mt-1">
              Manage your groups and plan your next adventure.
            </p>
          </div>

          {/* Create Group button */}
          <Link
            to={`/${userID}/create-group`}
            className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-emerald-500 text-white font-semibold shadow-lg hover:opacity-90 transition"
          >
            + Create Group
          </Link>
        </div>

        {/* Main content */}
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Section */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Your Groups 🧳
            </h2>

            {/* Group cards */}
            <div className="space-y-4">
              {
                user?.groups?.length === 0 ? (
                  <div className="p-10 rounded-2xl text-gray-500">No groups yet, click on Create New Group to create.</div>
                  ) : (
                    user?.groups?.map((g) => (
                      <GroupCard group={g}/>
                    ))
                  )}
            </div>
          </div>

          {/* Right Section - Quick Card */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/50 p-6">
            <h2 className="text-xl font-bold text-gray-900">Quick Actions ⚡</h2>
            <p className="text-gray-600 mt-2 text-sm">
              Organize trips with your friends & keep everything in one place.
            </p>

            <div className="mt-6 space-y-3">
              <Link
                to={`/${userID}/create-group`}
                className="block w-full text-center px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-sky-500 text-white font-semibold shadow hover:opacity-90 transition"
              >
                Create New Group
              </Link>

              <Link
                to="/profile"
                className="block w-full text-center px-4 py-3 rounded-xl border border-gray-200 text-gray-800 font-semibold hover:bg-white transition"
              >
                Profile
              </Link>

              <button
                onClick={() => logout()}
                className="block w-full text-center px-4 py-3 rounded-xl border border-red-200 text-red-600 font-semibold hover:bg-red-50 transition"
              >
                Logout
              </button>
            </div>

            {/* Illustration */}
            <div className="mt-8 relative h-32 overflow-hidden rounded-2xl bg-gradient-to-br from-sky-500 to-emerald-500">
              <div className="absolute bottom-0 left-0 w-full h-16 bg-black/20 rounded-t-[100px]" />
              <div className="absolute bottom-0 left-10 w-32 h-14 bg-white/20 rounded-t-[80px]" />
              <div className="absolute bottom-0 right-10 w-40 h-20 bg-white/15 rounded-t-[100px]" />
              <div className="absolute top-3 left-6 w-10 h-10 bg-yellow-200 rounded-full blur-sm" />
            </div>

            <p className="text-xs text-gray-500 mt-3 text-center">
              "Group is better together."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
