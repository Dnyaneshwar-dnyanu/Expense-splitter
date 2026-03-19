import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const UserSearch = ({ onSelect, placeholder = "Search by @username or email...", excludeList = [] }) => {
    const [query, setQuery] = useState('');
    const [users, setUsers] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const searchUsers = async () => {
            if (query.length < 2) {
                setUsers([]);
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            try {
                // Remove @ if user starts with it
                const searchQuery = query.startsWith('@') ? query.substring(1) : query;
                
                const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/searchUsers?q=${searchQuery}`, {
                    method: 'GET',
                    credentials: 'include'
                });
                const data = await res.json();
                if (data.success) {
                    // Filter out already added members
                    const filteredUsers = data.users.filter(u => !excludeList.includes(u._id));
                    setUsers(filteredUsers);
                }
            } catch (error) {
                console.error("Search failed:", error);
            } finally {
                setIsLoading(false);
            }
        };

        const timeoutId = setTimeout(searchUsers, 300);
        return () => clearTimeout(timeoutId);
    }, [query, excludeList]);

    const handleSelect = (user) => {
        onSelect(user);
        setQuery('');
        setUsers([]);
        setIsOpen(false);
    };

    return (
        <div className="relative w-full" ref={dropdownRef}>
            <div className="relative">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                    placeholder={placeholder}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-4 focus:ring-sky-200 focus:border-sky-400 transition bg-white/50"
                />
                {isLoading && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        <div className="w-4 h-4 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                )}
            </div>

            <AnimatePresence>
                {isOpen && (users.length > 0 || (query.length >= 2 && !isLoading)) && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute z-50 mt-2 w-full bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden max-h-60 overflow-y-auto"
                    >
                        {users.length > 0 ? (
                            users.map((user) => (
                                <button
                                    key={user._id}
                                    onClick={() => handleSelect(user)}
                                    className="w-full px-5 py-4 flex items-center gap-4 hover:bg-sky-50 transition text-left border-b border-gray-50 last:border-0"
                                >
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-400 to-emerald-400 flex items-center justify-center text-white font-black">
                                        {user.name.charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0 text-white">
                                        <p className="font-bold truncate">{user.name}</p>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-black text-sky-600 bg-sky-50 px-1.5 py-0.5 rounded">@{user.username || 'user'}</span>
                                            <span className="text-xs text-gray-400 truncate">{user.email}</span>
                                        </div>
                                    </div>
                                </button>
                            ))
                        ) : query.length >= 2 && !isLoading ? (
                            <div className="p-8 text-center text-gray-400">
                                <p className="text-2xl mb-2">🔍</p>
                                <p className="font-bold text-sm uppercase tracking-widest">No users found</p>
                            </div>
                        ) : null}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default UserSearch;
