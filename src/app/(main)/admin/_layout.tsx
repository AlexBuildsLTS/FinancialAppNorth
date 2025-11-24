import React from 'react';
import { Link } from 'expo-router';
import { Users, Activity, Server, AlertTriangle } from 'lucide-react';
import { GlassCard as Card } from '../../../shared/components/GlassCard';

export const AdminDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">System Administration</h1>
          <p className="text-secondary">Monitor health and manage resources</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/admin/Users" className="block">
                <Card className="hover:border-primary/50 transition-colors h-full">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-500/10 text-blue-400 rounded-lg">
                            <Users size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">Users</h3>
                            <p className="text-secondary text-sm">Manage Accounts</p>
                        </div>
                    </div>
                </Card>
            </Link>
             <Card className="h-full">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-lg">
                        <Activity size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white">System Health</h3>
                        <p className="text-emerald-400 text-sm">99.9% Uptime</p>
                    </div>
                </div>
            </Card>
             <Card className="h-full">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-500/10 text-purple-400 rounded-lg">
                        <Server size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white">Database</h3>
                        <p className="text-secondary text-sm">Supabase Connected</p>
                    </div>
                </div>
            </Card>
             <Card className="h-full">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-amber-500/10 text-amber-400 rounded-lg">
                        <AlertTriangle size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white">Logs</h3>
                        <p className="text-secondary text-sm">2 Warnings</p>
                    </div>
                </div>
            </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
                <h2 className="text-xl font-bold text-white mb-4">Recent System Events</h2>
                <div className="space-y-4">
                    <div className="flex items-start gap-3 text-sm">
                        <div className="w-2 h-2 bg-emerald-400 rounded-full mt-1.5" />
                        <p className="text-secondary"><span className="text-white font-medium">Backup Completed</span> • 2 hours ago</p>
                    </div>
                     <div className="flex items-start gap-3 text-sm">
                        <div className="w-2 h-2 bg-amber-400 rounded-full mt-1.5" />
                        <p className="text-secondary"><span className="text-white font-medium">High Latency</span> detected in EU-West • 5 hours ago</p>
                    </div>
                     <div className="flex items-start gap-3 text-sm">
                        <div className="w-2 h-2 bg-emerald-400 rounded-full mt-1.5" />
                        <p className="text-secondary"><span className="text-white font-medium">New CPA Onboarded</span> • 1 day ago</p>
                    </div>
                </div>
            </Card>

            <Card>
                <h2 className="text-xl font-bold text-white mb-4">API Usage</h2>
                <div className="space-y-4">
                    <div>
                        <div className="flex justify-between text-sm mb-1">
                            <span className="text-white">Gemini AI Tokens</span>
                            <span className="text-secondary">45%</span>
                        </div>
                        <div className="w-full bg-white/5 rounded-full h-2">
                            <div className="bg-primary h-2 rounded-full" style={{ width: '45%' }}></div>
                        </div>
                    </div>
                    <div>
                        <div className="flex justify-between text-sm mb-1">
                            <span className="text-white">Storage Limit</span>
                            <span className="text-secondary">12%</span>
                        </div>
                        <div className="w-full bg-white/5 rounded-full h-2">
                            <div className="bg-purple-500 h-2 rounded-full" style={{ width: '12%' }}></div>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    </div>
  );
};