import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Layout from '../components/Layout';
import { ArrowLeft, MessageSquare, Briefcase } from 'lucide-react';

export default function OtherUserProfileScreen() {
    const { username } = useParams();
    const navigate = useNavigate();
    const [profile, setProfile] = useState<any>(null);
    const [stats, setStats] = useState({ posts: 0 });

    useEffect(() => {
        loadProfile();
    }, [username]);

    const loadProfile = async () => {
        if (!username) return;

        const { data } = await supabase.from('profiles').select('*').eq('username', username).single();
        setProfile(data);

        if (data) {
            const { count: postsCount } = await supabase.from('posts').select('*', { count: 'exact', head: true }).eq('author_id', data.id);
            setStats({ posts: postsCount || 0 });
        }
    };

    if (!profile) return <Layout><div className="flex justify-center p-10">Loading...</div></Layout>;

    return (
        <Layout>
            <div className="flex items-center space-x-3 mb-6">
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full -ml-2">
                    <ArrowLeft size={20} />
                </button>
                <h1 className="text-xl font-bold">{profile.name}</h1>
            </div>

            <div className="flex flex-col items-center mb-6">
                <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center text-3xl text-blue-600 font-bold overflow-hidden border-4 border-white shadow-sm mb-4">
                    {profile.avatar_url ? <img src={profile.avatar_url} alt="avatar" className="object-cover w-full h-full" /> : profile.name?.charAt(0)}
                </div>
                <h2 className="text-xl font-bold">{profile.name}</h2>
                <p className="text-sm text-gray-500">@{profile.username}</p>
                <p className="text-sm font-medium mt-1">{profile.profession_major} at {profile.college_company}</p>
            </div>

            <div className="flex gap-3 mb-8">
                <button
                    onClick={() => navigate(`/chat/${profile.id}`)}
                    className="flex-1 bg-blue-600 text-white font-medium py-2 rounded-xl flex items-center justify-center gap-2 hover:bg-blue-700"
                >
                    <MessageSquare size={18} />
                    Message
                </button>
            </div>

            <div className="flex justify-around bg-gray-50 rounded-xl p-4 mb-8">
                <div className="text-center">
                    <p className="font-bold text-lg">{stats.posts}</p>
                    <p className="text-xs text-gray-500">Posts</p>
                </div>
                <div className="text-center">
                    <p className="font-bold text-lg">0</p>
                    <p className="text-xs text-gray-500">Connections</p>
                </div>
            </div>

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
        </Layout>
    );
}
