/// <reference lib="dom" />
import React, { useState } from 'react';
import { Search, UserPlus } from 'lucide-react';

// Define the User interface
export interface User {
    id: string;
    name: string;
    email: string;
    status: 'active' | 'banned' | 'pending';
    role: 'admin' | 'editor' | 'viewer';
}

// Define mock user data
const MOCK_USERS: User[] = [
    { id: '1', name: 'Alice Smith', email: 'alice@example.com', status: 'active', role: 'admin' },
    { id: '2', name: 'Bob Johnson', email: 'bob@example.com', status: 'banned', role: 'editor' },
    { id: '3', name: 'Charlie Brown', email: 'charlie@example.com', status: 'active', role: 'viewer' },
    { id: '4', name: 'Diana Prince', email: 'diana@example.com', status: 'pending', role: 'editor' },
    { id: '5', name: 'Eve Davis', email: 'eve@example.com', status: 'active', role: 'admin' },
];

// Placeholder UserListItem component
interface UserListItemProps {
    user: User;
    onAction: (userId: string, action: 'role' | 'ban' | 'delete') => void;
}

export const UserListItem: React.FC<UserListItemProps> = ({ user, onAction }) => {
    return (
        <div className="flex justify-between items-center p-4 bg-surface hover:bg-white/5 transition-colors">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-background font-bold text-lg">
                    {user.name.charAt(0)}
                </div>
                <div>
                    <p className="font-medium text-white">{user.name}</p>
                    <p className="text-sm text-secondary">{user.email}</p>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    user.status === 'active' ? 'bg-green-500/20 text-green-400' :
                    user.status === 'banned' ? 'bg-red-500/20 text-red-400' :
                    'bg-yellow-500/20 text-yellow-400'
                }`}>
                    {user.status}
                </span>
                <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-400">
                    {user.role}
                </span>
                <div className="relative">
                    <button className="text-secondary hover:text-white transition-colors">
                        ... {/* Placeholder for a dropdown menu, etc. */}
                    </button>
                    {/* Example action buttons for quick testing */}
                    <div className="absolute right-0 mt-2 w-32 bg-background border border-white/10 rounded-lg shadow-lg z-10 hidden group-hover:block">
                        <button onClick={() => onAction(user.id, 'role')} className="block w-full text-left px-4 py-2 text-white hover:bg-primary/20">Change Role</button>
                        <button onClick={() => onAction(user.id, 'ban')} className="block w-full text-left px-4 py-2 text-white hover:bg-primary/20">
                            {user.status === 'banned' ? 'Unban' : 'Ban'}
                        </button>
                        <button onClick={() => onAction(user.id, 'delete')} className="block w-full text-left px-4 py-2 text-red-400 hover:bg-red-500/20">Delete</button>
                    </div>
                </div>
            </div>
        </div>
    );
};


export const AdminUsers: React.FC = () => {
    const [users, setUsers] = useState<User[]>(MOCK_USERS);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleAction = (userId: string, action: 'role' | 'ban' | 'delete') => {
        if (action === 'delete') {
                if (window.confirm('Are you sure you want to delete this user? This cannot be undone.')) {
                        setUsers(prev => prev.filter(u => u.id !== userId));
                }
                return;
        }

        if (action === 'ban') {
                setUsers(prev => prev.map(u => {
                        if (u.id === userId) {
                                return { ...u, status: u.status === 'banned' ? 'active' : 'banned' };
                        }
                        return u;
                }));
        }

        if (action === 'role') {
                window.alert("Role change modal would open here.");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">User Management</h1>
                    <p className="text-secondary">Manage system access and roles</p>
                </div>
                <button className="bg-primary text-background px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-primary/90 transition-colors">
                        <UserPlus size={18} /> Add User
                </button>
            </div>

            <div className="bg-surface border border-white/5 rounded-xl overflow-hidden">
                <div className="p-4 border-b border-white/5 bg-white/5">
                        <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" size={18} />
                                <input
                                        type="text"
                                        placeholder="Search users by name or email..."
                                        className="w-full bg-background border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white focus:border-primary focus:outline-none"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                />
                        </div>
                </div>

                <div className="divide-y divide-white/5">
                        {filteredUsers.map(user => (
                                <UserListItem key={user.id} user={user} onAction={handleAction} />
                        ))}
                        {filteredUsers.length === 0 && (
                                <div className="p-8 text-center text-secondary">
                                        No users found matching "{searchTerm}"
                                </div>
                        )}
                </div>
            </div>
        </div>
    );
};
