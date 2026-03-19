import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import UserSearch from "../components/common/UserSearch";

export default function CreateGroup() {
    const navigate = useNavigate();
    const userID = useParams().userID;

    const [groupName, setGroupName] = useState("");
    const [description, setDescription] = useState("");

    const [members, setMembers] = useState([]);
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

    const handleSelectMember = (selectedUser) => {
        const alreadyMember = members.some((m) => m.id === selectedUser._id);
        if (alreadyMember) {
            toast.error('This user is already added!');
            return;
        }

        setMembers((prev) => [
            ...prev,
            {
                id: selectedUser._id,
                name: selectedUser.name,
                username: selectedUser.username,
                email: selectedUser.email,
            },
        ]);
        toast.success(`${selectedUser.name} added!`);
    };

    const removeMember = (id) => {
        setMembers(members.filter((m) => m.id !== id));
        toast.success("Member removed successfully!");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const formData = {
                groupName,
                description,
                members,
            };

            let res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/user/group/${userID}/create_group`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(formData),
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                toast.error(errorData.message || "Failed to create group.");
                return;
            }

            let data = await res.json();

            if (data.success) {
                toast.success("Group created successfully!");
                navigate(`/${userID}/dashboard`);
            } else {
                toast.error(data.message || "Failed to create group.");
            }
        } catch (error) {
            console.error("Create group failed:", error);
            toast.error("Network error, could not create group.");
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-sky-200 via-white to-emerald-200 px-4 py-10">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Create Group 👥
                        </h1>
                        <p className="text-gray-600 mt-1">
                            Add group details and invite members to start splitting.
                        </p>
                    </div>

                    <Link
                        to={`/${userID}/dashboard`}
                        className="px-5 py-2.5 rounded-xl bg-white/80 border border-white/50 shadow hover:bg-white transition font-semibold text-gray-800"
                    >
                        ← Back to Dashboard
                    </Link>
                </div>

                {/* Layout */}
                <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-6 text-black">
                    {/* Form */}
                    <div className="lg:col-span-2 bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 p-6 md:p-8">
                        <h2 className="text-xl font-bold text-gray-900">
                            Group Information 💳
                        </h2>

                        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                            {/* Group Name */}
                            <div>
                                <label className="text-sm font-medium text-gray-700">
                                    Group Name
                                </label>
                                <input
                                    type="text"
                                    value={groupName}
                                    onChange={(e) => setGroupName(e.target.value)}
                                    placeholder="Example: Benki Boys"
                                    className="mt-2 w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-4 focus:ring-sky-200 focus:border-sky-400 transition"
                                    required
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="text-sm font-medium text-gray-700">
                                    Description
                                </label>
                                <input
                                    type="text"
                                    value={description}
                                    maxLength={50}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Example: Sharing expense not bond"
                                    className="mt-2 w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-4 focus:ring-emerald-200 focus:border-emerald-400 transition"
                                    required
                                />
                            </div>

                            {/* Member Add */}
                            <div className="rounded-2xl border border-gray-200 p-5 bg-white/70">
                                <h3 className="font-bold text-gray-900">Add Members 👥</h3>
                                <p className="text-sm text-gray-600 mt-1 mb-4">
                                    Search by @username or email to invite friends.
                                </p>

                                <UserSearch 
                                    onSelect={handleSelectMember} 
                                    placeholder="Search to add members..."
                                    excludeList={[...(user ? [user._id] : []), ...members.map(m => m.id)]}
                                />

                                {/* Members list */}
                                <div className="mt-6 space-y-3">
                                    {members.length === 0 ? (
                                        <div className="p-8 text-center bg-white/50 rounded-xl border-2 border-dashed border-gray-100 text-gray-400">
                                            <p className="font-bold text-sm uppercase tracking-widest">No members added yet</p>
                                        </div>
                                    ) : (
                                        members.map((m) => (
                                            <div
                                                key={m.id}
                                                className="flex items-center justify-between gap-4 p-4 rounded-xl border border-gray-200 bg-white shadow-sm"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-sky-50 flex items-center justify-center text-sky-600 font-bold">
                                                        {m.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-900 leading-tight">{m.name}</p>
                                                        <p className="text-xs text-sky-600 font-bold">@{m.username || 'user'}</p>
                                                    </div>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() => removeMember(m.id)}
                                                    className="p-2 rounded-lg border border-red-100 text-red-500 hover:bg-red-50 transition"
                                                    title="Remove Member"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                                
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-sky-500 text-white font-black shadow-lg hover:shadow-xl transition-all scale-100 active:scale-95"
                            >
                                Create Group ✅
                            </button>
                        </form>
                    </div>

                    {/* Side Preview Card */}
                    <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 p-6">
                        <h2 className="text-xl font-bold text-gray-900">Preview ✨</h2>

                        <div className="mt-5 p-5 rounded-2xl bg-gradient-to-br from-sky-500 to-emerald-500 text-white shadow-lg">
                            <p className="text-xs font-bold uppercase tracking-widest opacity-80">Group</p>
                            <h3 className="text-xl font-black mt-1 truncate">
                                {groupName || "Your Group Name"}
                            </h3>

                            <p className="text-xs font-bold uppercase tracking-widest mt-4 opacity-80">Description</p>
                            <p className="font-bold text-sm mt-1 line-clamp-2 italic">
                                "{description || "No description yet"}"
                            </p>

                            <div className="mt-6 flex items-center justify-between">
                                <p className="text-xs font-bold uppercase tracking-widest opacity-80">
                                    Members
                                </p>
                                <span className="px-2 py-0.5 rounded-lg bg-white/20 font-black text-xs">
                                    {members.length + 1} Total
                                </span>
                            </div>
                            <div className="flex -space-x-2 mt-2">
                                <div className="w-8 h-8 rounded-full border-2 border-white bg-white/30 flex items-center justify-center text-[10px] font-black">
                                    YOU
                                </div>
                                {members.slice(0, 4).map((m, idx) => (
                                    <div key={idx} className="w-8 h-8 rounded-full border-2 border-white bg-white/20 flex items-center justify-center text-[10px] font-black">
                                        {m.name.charAt(0)}
                                    </div>
                                ))}
                                {members.length > 4 && (
                                    <div className="w-8 h-8 rounded-full border-2 border-white bg-white/10 flex items-center justify-center text-[10px] font-black">
                                        +{members.length - 4}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Illustration */}
                        <div className="mt-6 relative h-32 overflow-hidden rounded-2xl bg-gradient-to-br from-sky-500 to-emerald-500/80">
                            <div className="absolute bottom-0 left-0 w-full h-16 bg-black/20 rounded-t-[100px]" />
                            <div className="absolute bottom-0 left-10 w-32 h-14 bg-white/20 rounded-t-[80px]" />
                            <div className="absolute bottom-0 right-10 w-40 h-20 bg-white/15 rounded-t-[100px]" />
                            <div className="absolute top-3 left-6 w-10 h-10 bg-yellow-200 rounded-full blur-sm" />
                        </div>

                        <p className="mt-4 text-xs text-gray-500 text-center font-bold uppercase tracking-widest">
                            Invite friends and keep finances clear 🤝
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
