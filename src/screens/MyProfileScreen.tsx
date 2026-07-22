import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Layout from '../components/Layout';
import { Edit3, Settings, PlusCircle, Briefcase, FileText } from 'lucide-react';

export default function MyProfileScreen() {
    const navigate = useNavigate();
    const [profile, setProfile] = useState<any>(null);
    const [stats, setStats] = useState({ posts: 0, applications: 0, jobs: 0 });

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) { navigate('/login'); return; }

        const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
        setProfile(data);

        // Load stats based on role
        if (data) {
            const { count: postsCount } = await supabase.from('posts').select('*', { count: 'exact', head: true }).eq('author_id', data.id);
            if (data.role === 'student') {
                const { count: appsCount } = await supabase.from('applications').select('*', { count: 'exact', head: true }).eq('applicant_id', data.id);
                setStats(s => ({ ...s, posts: postsCount || 0, applications: appsCount || 0 }));
            } else {
                const { count: jobsCount } = await supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('employer_id', data.id);
                setStats(s => ({ ...s, posts: postsCount || 0, jobs: jobsCount || 0 }));
            }
        }
    };

    if (!profile) return <Layout><div className="flex justify-center p-10">Loading...</div></Layout>;

    return (
        <Layout>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-xl font-bold">Profile</h1>
                <div className="flex gap-4 text-gray-700">
                    <button onClick={() => navigate('/edit-profile')}><Edit3 size={20} /></button>
                    <button onClick={async () => { await supabase.auth.signOut(); navigate('/login'); }}><Settings size={20} /></button>
                </div>
            </div>

            <div className="flex flex-col items-center mb-8">
                <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center text-3xl text-blue-600 font-bold overflow-hidden border-4 border-white shadow-sm mb-4">
                    {profile.avatar_url ? <img src={profile.avatar_url} alt="avatar" className="object-cover w-full h-full" /> : profile.name?.charAt(0)}
                </div>
                <h2 className="text-xl font-bold">{profile.name}</h2>
                <p className="text-sm text-gray-500">@{profile.username}</p>
                <p className="text-sm font-medium mt-1">{profile.profession_major} at {profile.college_company}</p>
            </div>

            <div className="flex justify-around bg-gray-50 rounded-xl p-4 mb-8">
                <div className="text-center">
                    <p className="font-bold text-lg">{stats.posts}</p>
                    <p className="text-xs text-gray-500">Posts</p>
                </div>
                {profile.role === 'student' ? (
                    <div className="text-center">
                        <p className="font-bold text-lg">{stats.applications}</p>
                        <p className="text-xs text-gray-500">Applications</p>
                    </div>
                ) : (
                    <div className="text-center">
                        <p className="font-bold text-lg">{stats.jobs}</p>
                        <p className="text-xs text-gray-500">Jobs Posted</p>
                    </div>
                )}
                <div className="text-center">
                    <p className="font-bold text-lg">0</p>
                    <p className="text-xs text-gray-500">Connections</p>
                </div>
            </div>

            {profile.role === 'employer' && (
                 <button onClick={() => navigate('/post-job')} className="w-full mb-8 bg-blue-600 text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-blue-700">
                     <PlusCircle size={18} />
                     Post a New Job
                 </button>
            )}

            <div className="mb-8">
                <h3 className="font-bold mb-2">About</h3>
                <p className="text-sm text-gray-700 bg-gray-50 p-4 rounded-xl">{profile.bio || "No bio added yet."}</p>
            </div>

            {profile.parsed_keywords && profile.parsed_keywords.length > 0 && (
                <div className="mb-8">
                    <h3 className="font-bold mb-3 flex items-center gap-2"><Briefcase size={16}/> Skills & Keywords</h3>
                    <div className="flex flex-wrap gap-2">
                        {profile.parsed_keywords.map((kw: string) => (
                            <span key={kw} className="bg-blue-50 text-blue-700 px-3 py-1 text-xs font-medium rounded-full">
                                {kw}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {profile.resume_url && (
                <div className="mb-8">
                    <h3 className="font-bold mb-3 flex items-center gap-2"><FileText size={16}/> Resume</h3>
                    <a href={profile.resume_url} target="_blank" rel="noreferrer" className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                        <span className="text-sm font-medium text-blue-600 truncate flex-1">View Current Resume</span>
                    </a>
                </div>
            )}
        </Layout>
    );
}
