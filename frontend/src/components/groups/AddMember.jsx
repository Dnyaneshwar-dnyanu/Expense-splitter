import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import UserSearch from '../common/UserSearch';

function AddMember({ refreshData, existingMembers = [] }) {
    const groupID = useParams().groupID;

    const handleSelectUser = async (user) => {
        try {
            let res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/user/group/${groupID}/addMember`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ email: user.email })
            });

            const data = await res.json();
            if (data.success) {
                toast.success(data.message);
                if (refreshData) refreshData();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error("Add member failed:", error);
            toast.error("Network error, could not add member.");
        }
    };

    return (
        <div className="mt-4">
            <UserSearch 
                onSelect={handleSelectUser} 
                placeholder="Type @username to add..." 
                excludeList={existingMembers.map(m => m._id)}
            />
        </div>
    );
}

export default AddMember;