import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Layout from '../components/Layout';
import { BarChart3, Users, Briefcase, Eye } from 'lucide-react';

export default function DashboardScreen() {
    const navigate = useNavigate();
    const [profile, setProfile] = useState<any>(null);
    const [stats, setStats] = useState<any>({ views: 0, engagements: 0, actions: 0 });
    const [activity, setActivity] = useState<any[]>([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) { navigate('/login'); return; }

        const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
        setProfile(data);

        if (data) {
            if (data.role === 'student') {
                const { count: appsCount } = await supabase.from('applications').select('*', { count: 'exact', head: true }).eq('applicant_id', data.id);
                setStats({ views: 15, engagements: 4, actions: appsCount || 0 });

                const { data: apps } = await supabase.from('applications').select('*, jobs(title)').eq('applicant_id', data.id).order('created_at', { ascending: false }).limit(3);
                setActivity(apps || []);
            } else {
                const { count: jobsCount } = await supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('employer_id', data.id);
                setStats({ views: 42, engagements: 12, actions: jobsCount || 0 });

                const { data: jobs } = await supabase.from('jobs').select('*').eq('employer_id', data.id).order('created_at', { ascending: false }).limit(3);
                setActivity(jobs || []);
            }
        }
    };

    if (!profile) return <Layout><div className="flex justify-center p-10">Loading...</div></Layout>;

    return (
        <Layout>
            <div className="mb-6">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <BarChart3 className="text-blue-600" />
                    Analytics Dashboard
                </h1>
                <p className="text-sm text-gray-500 mt-1">Track your performance and engagement.</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-2 text-gray-500 mb-2">
                        <Eye size={16} />
                        <span className="text-xs font-medium uppercase tracking-wider">Profile Views</span>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{stats.views}</p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-2 text-gray-500 mb-2">
                        <Users size={16} />
                        <span className="text-xs font-medium uppercase tracking-wider">Connections</span>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{stats.engagements}</p>
                </div>

                <div className="col-span-2 bg-gradient-to-br from-blue-600 to-blue-800 p-6 rounded-xl shadow-md text-white">
                    <div className="flex items-center gap-2 mb-2 opacity-80">
                        <Briefcase size={16} />
                        <span className="text-xs font-medium uppercase tracking-wider">
                            {profile.role === 'student' ? 'Applications Sent' : 'Job Applications Received'}
                        </span>
                    </div>
                    <div className="flex justify-between items-end">
                        <p className="text-4xl font-bold">{stats.actions}</p>
                        <p className="text-sm bg-white/20 px-2 py-1 rounded-lg">Total count</p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-4">Recent Activity</h3>
                <div className="space-y-4">
                    {activity.length === 0 && <p className="text-sm text-gray-500">No recent activity.</p>}
                    {activity.map((item) => (
                        <div key={item.id} className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                            <div className="w-2 h-2 mt-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                            <div>
                                <p className="text-sm font-medium text-gray-900 line-clamp-1">
                                    {profile.role === 'student' ? `Applied to ${item.jobs?.title || 'a job'}` : `Posted job: ${item.title}`}
                                </p>
                                <p className="text-xs text-gray-500">{new Date(item.created_at).toLocaleDateString()}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </Layout>
    );
}
