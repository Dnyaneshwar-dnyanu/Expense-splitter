import { useState } from 'react'
import { useParams } from 'react-router-dom';

function AddMember() {
    const groupID = useParams().groupID;

    const [newMemberName, setNewMemberName] = useState("");
    const [newMemberEmail, setNewMemberEmail] = useState("");
    async function addMember() {
        if (!newMemberName.trim() || !newMemberEmail.trim()) {
            return toast.error('Enter details of member to add!');
        }

        let res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/user/group/${groupID}/addMember`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ name: newMemberName, email: newMemberEmail })
        });

        let data = await res.json();
        if (data.success) {
            toast.success(data.message);
        }
        else {
            toast.error(data.message);
        }

        fetchGroup();

        setNewMemberName("");
        setNewMemberEmail("");
    }
    return (
        <div>
            <div className="mt-4 space-y-3">
              <input
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
                type="text"
                placeholder="Member name"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-4 focus:ring-sky-200 focus:border-sky-400 transition"
              />
              <input
                value={newMemberEmail}
                onChange={(e) => setNewMemberEmail(e.target.value)}
                type="email"
                placeholder="Member email"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-4 focus:ring-emerald-200 focus:border-emerald-400 transition"
              />
              <button
                type="button"
                onClick={addMember}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-sky-500 text-white font-semibold shadow hover:opacity-90 transition"
              >
                + Add Member
              </button>
            </div>
        </div>
    )
}

export default AddMember