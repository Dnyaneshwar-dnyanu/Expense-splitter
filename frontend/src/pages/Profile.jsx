import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function Profile() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [form, setForm] = useState({ name: "", username: "", email: "", phone: "", bio: ""});
    const [isEditing, setIsEditing] = useState(false);

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
                    setForm({ 
                        name: data.user.name, 
                        username: data.user.username || "",
                        email: data.user.email, 
                        phone: data.user.phone || "", 
                        bio: data.user.bio || "" 
                    });
                }
                else {
                    navigate('/login');
                }
            } else {
                navigate('/login');
            }
        } catch (error) {
            console.error("Fetch user failed:", error);
            toast.error("Failed to fetch user data.");
        }
    }

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSave = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/updateUser`, {
                method: 'POST',
                headers: { "Content-Type": "application/json"},
                credentials: 'include',
                body: JSON.stringify(form)
            });

            const data = await res.json();
            if (data.success) {
                setIsEditing(false);
                fetchUser();
                return toast.success(data.message);
            }
            toast.error(data.message);
        } catch (error) {
            console.error("Update profile failed:", error);
            toast.error("Network error, failed to update profile.");
        }
    };

    const logout = async () => {
        try {
            let res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/logout`, {
                method: 'GET',
                credentials: 'include'
            });

            if (res.status === 200) {
                navigate('/login');
            } else {
                toast.error('Logout Failed!');
            }
        } catch (error) {
            console.error("Logout failed:", error);
            toast.error("Logout failed due to network error.");
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-sky-200 via-white to-emerald-200 px-4 py-10">
            <div className="max-w-6xl mx-auto text-black">

                {/* Header */}
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            My Profile 👤
                        </h1>
                        <p className="text-gray-600 mt-1">
                            Manage your personal info & group identity.
                        </p>
                    </div>

                    <Link
                        to={user ? `/${user._id}/dashboard` : "/login"}
                        className="px-5 py-2.5 rounded-xl bg-white/80 border border-white/50 shadow hover:bg-white transition font-semibold text-gray-800"
                    >
                        ← Back to Dashboard
                    </Link>
                </div>

                {/* Layout */}
                <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* LEFT — Profile Card */}
                    <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 p-6 text-center">

                        {/* Avatar */}
                        <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-sky-500 to-emerald-500 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                            {user?.name.charAt(0)}
                        </div>

                        <h2 className="mt-4 text-xl font-bold text-gray-900">
                            {user?.name}
                        </h2>
                        <p className="text-sky-600 font-bold text-sm">@{user?.username || 'user'}</p>
                        <p className="text-gray-500 text-xs mt-1">{user?.email}</p>

                        <p className="mt-4 text-sm text-gray-600 italic px-4">
                            {user?.bio || "No bio yet. Add something cool! 🚀"}
                        </p>

                        {/* Stats */}
                        <div className="mt-6 grid grid-cols-2 gap-4 text-center">
                            <div className="p-4 rounded-xl bg-white border border-gray-200">
                                <p className="text-lg font-bold text-gray-900">
                                    {user?.groups?.length || 0}
                                </p>
                                <p className="text-xs text-gray-500">Groups</p>
                            </div>

                            <div className="p-4 rounded-xl bg-white border border-gray-200">
                                <p className="text-lg font-bold text-gray-900">
                                    {user?.groups?.length || 0}
                                </p>
                                <p className="text-xs text-gray-500">Expenses</p>
                            </div>
                        </div>

                        {/* Logout */}
                        <button 
                            onClick={logout}
                            className="mt-6 w-full py-3 rounded-xl border border-red-200 text-red-600 font-semibold hover:bg-red-50 transition"
                        >
                            Logout
                        </button>
                    </div>

                    {/* RIGHT — Edit Form */}
                    <div className="lg:col-span-2 bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 p-6">

                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900">
                                Personal Information ✏️
                            </h2>

                            {!isEditing ? (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-emerald-500 text-white font-semibold shadow hover:opacity-90 transition"
                                >
                                    Edit
                                </button>
                            ) : (
                                <button
                                    onClick={handleSave}
                                    className="px-5 py-2 rounded-xl bg-emerald-500 text-white font-semibold shadow hover:opacity-90 transition"
                                >
                                    Save
                                </button>
                            )}
                        </div>

                        {/* Form */}
                        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-5">

                            {/* Name */}
                            <div>
                                <label className="text-sm font-medium text-gray-700">
                                    Full Name
                                </label>
                                <input
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className="mt-2 w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/90 backdrop-blur-xl focus:outline-none focus:ring-4 focus:ring-sky-200 focus:border-sky-400 transition disabled:opacity-70"
                                />
                            </div>

                            {/* Username */}
                            <div>
                                <label className="text-sm font-medium text-gray-700">
                                    Username
                                </label>
                                <input
                                    name="username"
                                    value={form.username}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className="mt-2 w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/90 backdrop-blur-xl focus:outline-none focus:ring-4 focus:ring-sky-200 focus:border-sky-400 transition disabled:opacity-70"
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label className="text-sm font-medium text-gray-700">
                                    Email
                                </label>
                                <input
                                    name="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className="mt-2 w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/90 backdrop-blur-xl focus:outline-none focus:ring-4 focus:ring-emerald-200 focus:border-emerald-400 transition disabled:opacity-70"
                                />
                            </div>

                            {/* Phone */}
                            <div>
                                <label className="text-sm font-medium text-gray-700">
                                    Phone
                                </label>
                                <input
                                    name="phone"
                                    value={form.phone}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className="mt-2 w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/90 backdrop-blur-xl focus:outline-none focus:ring-4 focus:ring-sky-200 focus:border-sky-400 transition disabled:opacity-70"
                                />
                            </div>

                            {/* Bio */}
                            <div className="md:col-span-2">
                                <label className="text-sm font-medium text-gray-700">
                                    Bio
                                </label>
                                <textarea
                                    name="bio"
                                    rows={3}    
                                    value={form.bio}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className="mt-2 w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/90 backdrop-blur-xl focus:outline-none focus:ring-4 focus:ring-emerald-200 focus:border-emerald-400 transition disabled:opacity-70"
                                />
                            </div>

                        </div>

                        {/* Joined Groups */}
                        <div className="mt-10">
                            <h3 className="text-lg font-bold text-gray-900">
                                Joined Groups 🌍
                            </h3>

                            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                {user?.groups?.map((g) => (
                                    <Link
                                        key={g._id}
                                        to={`/${user?._id}/group/${g._id}`}
                                        className="p-4 rounded-xl border border-gray-200 bg-white hover:shadow-md transition font-semibold text-gray-800"
                                    >
                                        {g.groupName}
                                    </Link>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>

                {/* Bottom Illustration */}
                <div className="mt-10 relative h-40 overflow-hidden rounded-2xl bg-gradient-to-br from-sky-500 to-emerald-500 shadow-xl">
                    <div className="absolute bottom-0 left-0 w-full h-20 bg-black/20 rounded-t-[100px]" />
                    <div className="absolute bottom-0 left-10 w-40 h-16 bg-white/20 rounded-t-[80px]" />
                    <div className="absolute bottom-0 right-10 w-56 h-28 bg-white/15 rounded-t-[100px]" />
                    <div className="absolute top-6 left-10 w-14 h-14 bg-yellow-200 rounded-full blur-sm" />

                    <div className="absolute right-10 top-10 text-white font-bold">
                        “Split smart, live better.” 💳
                    </div>
                </div>

            </div>
        </div>
    );
}
