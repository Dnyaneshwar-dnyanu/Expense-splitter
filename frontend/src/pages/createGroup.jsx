import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

export default function CreateGroup() {
    const navigate = useNavigate();
    const userID = useParams().userID;

    const [groupName, setGroupName] = useState("");
    const [description, setDescription] = useState("");

    const [memberName, setMemberName] = useState("");
    const [memberEmail, setMemberEmail] = useState("");

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

    const addMember = async () => {
        try {
            if (!memberName.trim() || !memberEmail.trim()) {
                toast.error("Enter the details of member to add!");
                return;
            };

            const alreadyMember = members.some((member) => member.email === memberEmail);

            if (alreadyMember) {
                return toast.error('This email is already added!');
            }

            let res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/validateMember`, {
                method: 'POST',
                headers: { "Content-Type": "application/json" },
                credentials: 'include',
                body: JSON.stringify({ email: memberEmail })
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                toast.error(errorData.message || "Failed to validate member.");
                return;
            }

            let data = await res.json();

            if (!data.success) {
                return toast.error(data.message);
            }
            else {
                setMembers((prev) => [
                    ...prev,
                    {
                        id: data.memberID,
                        name: memberName.trim(),
                        email: memberEmail.trim(),
                    },
                ]);

                toast.success(data.message);
            }

            setMemberName("");
            setMemberEmail("");
        } catch (error) {
            console.error("Add member failed:", error);
            toast.error("Network error, could not add member.");
        }
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
                            Create Group
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
                                <p className="text-sm text-gray-600 mt-1">
                                    Add people who will share expenses in this group.
                                </p>

                                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input
                                        type="text"
                                        value={memberName}
                                        onChange={(e) => setMemberName(e.target.value)}
                                        placeholder="Member name"
                                        className="px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-4 focus:ring-sky-200 focus:border-sky-400 transition"
                                        />

                                    <input
                                        type="email"
                                        value={memberEmail}
                                        onChange={(e) => setMemberEmail(e.target.value)}
                                        placeholder="Member email"
                                        className="px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-4 focus:ring-emerald-200 focus:border-emerald-400 transition"
                                    />
                                </div>

                                <button
                                    type="button"
                                    onClick={addMember}
                                    className="mt-4 w-full md:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-emerald-500 text-white font-semibold shadow hover:opacity-90 transition"
                                >
                                    + Add Member
                                </button>

                                {/* Members list */}
                                <div className="mt-6 space-y-3">
                                    {members.length === 0 ? (
                                        <p className="text-sm text-gray-500">
                                            No members added yet.
                                        </p>
                                    ) : (
                                        members.map((m) => (
                                            <div
                                                key={m.id}
                                                className="flex items-center justify-between gap-4 p-4 rounded-xl border border-gray-200 bg-white"
                                            >
                                                <div>
                                                    <p className="font-semibold text-gray-900">{m.name}</p>
                                                    <p className="text-sm text-gray-600">{m.email}</p>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() => removeMember(m.id)}
                                                    className="px-4 py-2 rounded-lg border border-red-200 text-red-600 font-semibold hover:bg-red-50 transition"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                                
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-sky-500 text-white font-semibold shadow-lg hover:opacity-90 transition"
                            >
                                Create Group ✅
                            </button>
                        </form>
                    </div>

                    {/* Side Preview Card */}
                    <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 p-6">
                        <h2 className="text-xl font-bold text-gray-900">Preview ✨</h2>

                        <div className="mt-5 p-5 rounded-2xl bg-gradient-to-br from-sky-500 to-emerald-500 text-white shadow-lg">
                            <p className="text-sm text-white/90">Group</p>
                            <h3 className="text-xl font-bold mt-1">
                                {groupName || "Your Group Name"}
                            </h3>

                            <p className="text-sm text-white/90 mt-4">Description</p>
                            <p className="font-semibold text-lg">
                                {description || "Your Description"}
                            </p>

                            <p className="mt-4 text-sm text-white/90">
                                Members: <span className="font-bold">{members.length}</span>
                            </p>
                        </div>

                        {/* Illustration */}
                        <div className="mt-6 relative h-32 overflow-hidden rounded-2xl bg-gradient-to-br from-sky-500 to-emerald-500">
                            <div className="absolute bottom-0 left-0 w-full h-16 bg-black/20 rounded-t-[100px]" />
                            <div className="absolute bottom-0 left-10 w-32 h-14 bg-white/20 rounded-t-[80px]" />
                            <div className="absolute bottom-0 right-10 w-40 h-20 bg-white/15 rounded-t-[100px]" />
                            <div className="absolute top-3 left-6 w-10 h-10 bg-yellow-200 rounded-full blur-sm" />
                        </div>

                        <p className="mt-3 text-xs text-gray-500 text-center">
                            Invite friends and keep finances clear 🤝
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
