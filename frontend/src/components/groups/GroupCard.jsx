import React from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'

function GroupCard({ group }) {
    const userID = useParams().userID;
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.3 }}
        >
            <Link
                to={`/${userID}/group/${group._id}`}
                className="block bg-white/80 backdrop-blur-xl rounded-2xl shadow-md border border-white/50 hover:shadow-xl transition-shadow p-6"
            >
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">
                            {group.groupName}
                        </h3>
                        <p className="text-gray-600 mt-1 line-clamp-1">
                            {group.description}
                        </p>
                        <p className="text-sm text-gray-500 mt-2 flex items-center gap-1">
                            <span className="text-sky-500">👥</span> {group.members.length} members
                        </p>
                    </div>

                    <span className="text-sm font-semibold text-sky-600 bg-sky-50 px-3 py-1 rounded-full border border-sky-100 whitespace-nowrap">
                        Details →
                    </span>
                </div>
            </Link>
        </motion.div>
    )
}

export default GroupCard