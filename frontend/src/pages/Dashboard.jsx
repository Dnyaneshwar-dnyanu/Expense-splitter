import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import GroupCard from "../components/groups/GroupCard";
import { motion, AnimatePresence } from "framer-motion";

export default function Dashboard() {
  const navigate = useNavigate();
  const userID = useParams().userID;
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      let res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/getUser`, {
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
      } else {
        navigate('/login');
      }
    } catch (error) {
      console.error("Fetch user failed:", error);
      toast.error("Network error, could not fetch user data.");
    }
  }

  const logout = async () => {
    try {
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
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Network error, logout failed.");
    }
  }

  function getEmoji() {
    const start = 0x1f600;
    const end = 0x1f637;

    const code = Math.floor(Math.random() * (end - start)) + start;

    return String.fromCodePoint(code);
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-sky-200 via-white to-emerald-200 px-4 py-10"
    >
      <div className="max-w-6xl mx-auto">
        {/* Top header */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome {user?.name.split(" ")[0]} {getEmoji()}
            </h1>
            <p className="text-gray-600 mt-1 font-medium">
              Manage your groups and keep everyone's expenses in check.
            </p>
          </div>

          {/* Create Group button */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              to={`/${userID}/create-group`}
              className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-emerald-500 text-white font-bold shadow-lg hover:opacity-90 transition active:shadow-inner"
            >
              + Create Group
            </Link>
          </motion.div>
        </motion.div>

        {/* Main content */}
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Section */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Your Groups 👨‍👦‍👦
            </h2>

            {/* Group cards */}
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-4"
            >
              {
                user?.groups?.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-10 rounded-2xl bg-white/50 border border-dashed border-gray-300 text-gray-500 text-center"
                  >
                    No groups yet, click on Create New Group to create.
                  </motion.div>
                  ) : (
                    user?.groups?.map((g) => (
                      <GroupCard key={g._id} group={g}/>
                    ))
                  )}
            </motion.div>
          </div>

          {/* Right Section - Quick Card */}
          <motion.div 
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/50 p-6 self-start lg:sticky lg:top-10"
          >
            <h2 className="text-xl font-bold text-gray-900">Quick Actions ⚡</h2>
            <p className="text-gray-600 mt-2 text-sm leading-relaxed">
              Split bills with your friends & keep everything balanced in one place.
            </p>

            <div className="mt-6 space-y-3">
              <motion.div whileHover={{ x: 5 }} whileTap={{ scale: 0.98 }}>
                <Link
                  to={`/${userID}/create-group`}
                  className="block w-full text-center px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-sky-500 text-white font-bold shadow-md hover:opacity-90 transition"
                >
                  Create New Group
                </Link>
              </motion.div>

              <motion.div whileHover={{ x: 5 }} whileTap={{ scale: 0.98 }}>
                <Link
                  to="/profile"
                  className="block w-full text-center px-4 py-3 rounded-xl border border-gray-200 text-gray-800 font-bold hover:bg-white transition"
                >
                  My Profile
                </Link>
              </motion.div>

              <motion.div whileHover={{ x: 5 }} whileTap={{ scale: 0.98 }}>
                <button
                  onClick={() => logout()}
                  className="block w-full text-center px-4 py-3 rounded-xl border border-red-100 text-red-600 font-bold hover:bg-red-50 transition"
                >
                  Logout
                </button>
              </motion.div>
            </div>

            {/* Illustration */}
            <div className="mt-8 relative h-32 overflow-hidden rounded-2xl bg-gradient-to-br from-sky-500 to-emerald-500">
              <div className="absolute bottom-0 left-0 w-full h-16 bg-black/20 rounded-t-[100px]" />
              <div className="absolute bottom-0 left-10 w-32 h-14 bg-white/20 rounded-t-[80px]" />
              <div className="absolute bottom-0 right-10 w-40 h-20 bg-white/15 rounded-t-[100px]" />
              <div className="absolute top-3 left-6 w-10 h-10 bg-yellow-200 rounded-full blur-sm animate-pulse" />
            </div>

            <p className="text-xs text-gray-500 mt-3 text-center italic">
              "Splitting made simple."
            </p>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

