import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export default function EditProfileScreen() {
    const navigate = useNavigate();
    const [userId, setUserId] = useState<string | null>(null);
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [bio, setBio] = useState('');
    const [professionMajor, setProfessionMajor] = useState('');
    const [collegeCompany, setCollegeCompany] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) { navigate('/login'); return; }

        setUserId(session.user.id);
        const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
        if (data) {
            setName(data.name || '');
            setUsername(data.username || '');
            setBio(data.bio || '');
            setProfessionMajor(data.profession_major || '');
            setCollegeCompany(data.college_company || '');
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userId) return;
        setIsLoading(true);

        const { error } = await supabase
            .from('profiles')
            .update({
                name,
                username,
                bio,
                profession_major: professionMajor,
                college_company: collegeCompany
            })
            .eq('id', userId);

        setIsLoading(false);

        if (error) {
            toast.error(error.message);
        } else {
            toast.success("Profile updated");
            navigate('/profile');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col pb-20">
            <div className="bg-white px-4 py-4 border-b border-gray-200 flex items-center space-x-3 sticky top-0 z-10 shadow-sm">
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full -ml-2">
                    <ArrowLeft size={20} />
                </button>
                <h1 className="text-xl font-bold">Edit Profile</h1>
            </div>

            <form onSubmit={handleSave} className="p-4 space-y-4 max-w-lg mx-auto w-full bg-white mt-4 rounded-xl shadow-sm">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <input type="text" required value={name} onChange={e => setName(e.target.value)}
                           className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Username</label>
                    <input type="text" required value={username} onChange={e => setUsername(e.target.value)}
                           className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Major / Profession</label>
                    <input type="text" value={professionMajor} onChange={e => setProfessionMajor(e.target.value)}
                           className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">College / Company</label>
                    <input type="text" value={collegeCompany} onChange={e => setCollegeCompany(e.target.value)}
                           className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Bio</label>
                    <textarea rows={4} value={bio} onChange={e => setBio(e.target.value)}
                              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                </div>

                <button type="submit" disabled={isLoading} className="w-full mt-6 bg-blue-600 text-white font-medium py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50">
                    {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
            </form>
        </div>
    );
}
