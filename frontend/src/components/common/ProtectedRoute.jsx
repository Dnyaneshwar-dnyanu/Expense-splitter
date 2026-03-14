import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { LuLoaderCircle } from "react-icons/lu";
import { toast } from "react-toastify";

function ProtectedRoute({ children }) {
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(null);

    useEffect(() => {
        checkAuth();
    }, []);

    async function checkAuth() {
        try {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/validateUser`, {
                method: 'GET',
                credentials: 'include'
            });

            if (res.status === 200) {
                setIsAuthenticated(true);
            } else {
                setIsAuthenticated(false);
            }
        } catch (error) {
            console.error("Auth check failed:", error);
            setIsAuthenticated(false);
            toast.error('Connection to server failed!');
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen w-full fixed top-0 left-0 flex items-center justify-center bg-gradient-to-br from-sky-500 to-emerald-500 z-50">
                <LuLoaderCircle className="loader animate-spin text-white text-5xl" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to='/Login' replace />;
    }

    return children;
}

export default ProtectedRoute;