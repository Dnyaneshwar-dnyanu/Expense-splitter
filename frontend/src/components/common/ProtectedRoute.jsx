import { useEffect } from "react";
import { useState } from "react"
import { Navigate } from "react-router-dom";
import { LuLoaderCircle } from "react-icons/lu";

function ProtectedRoute({ children }) {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    async function checkAuth() {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/validateUser`, {
            method: 'GET',
            credentials: 'include'
        });

        if (res.status === 200) {
            return setLoading(false);
        }
        
        toast.error('Something went wrong! Try again');
        return <Navigate to='/Login' replace />
    }

    if (loading) {
        return <div className="min-h-screen w-full absolute top-0 flex items-center justify-center bg-gradient-to-br from-sky-500 to-emerald-500">
            <LuLoaderCircle className="loader" />
        </div>
    }

    return children;
}

export default ProtectedRoute