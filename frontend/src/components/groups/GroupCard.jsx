import React from 'react'
import { Link, useParams } from 'react-router-dom'

function GroupCard({ group }) {
    const userID = useParams().userID;
    return (
        <Link
            key={group._id}
            to={`/${userID}/group/${group._id}`}
            className="block bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/50 hover:shadow-2xl transition p-6"
        >
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h3 className="text-lg font-bold text-gray-900">
                        {group.groupName}
                    </h3>
                    <p className="text-gray-600 mt-1">
                        Description:{" "}
                        <span className="font-semibold">{group.description}</span>
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                        👥 {group.members.length} members
                    </p>
                </div>

                <span className="text-sm font-semibold text-sky-600 bg-sky-100 px-3 py-1 rounded-full">
                    View →
                </span>
            </div>
        </Link>
    )
}

export default GroupCard