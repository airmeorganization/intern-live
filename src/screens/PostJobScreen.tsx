import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { RECRUITABLE_KEYWORDS } from '../constants/keywords';
import toast from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';

export default function PostJobScreen() {
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
    const [quickApply, setQuickApply] = useState(true);
    const [aiInterview, setAiInterview] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) setUserId(session.user.id);
            else navigate('/login');
        });
    }, [navigate]);

    const toggleKeyword = (kw: string) => {
        if (selectedKeywords.includes(kw)) {
            setSelectedKeywords(selectedKeywords.filter(k => k !== kw));
        } else {
            setSelectedKeywords([...selectedKeywords, kw]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userId) return;

        toast.loading("Posting job...", { id: 'job' });
        const { error } = await supabase
            .from('jobs')
            .insert({
                employer_id: userId,
                title,
                description,
                keywords: selectedKeywords,
                quick_apply: quickApply,
                ai_interview: aiInterview
            });

        if (error) {
            toast.error(error.message, { id: 'job' });
        } else {
            toast.success("Job posted successfully!", { id: 'job' });
            navigate('/profile');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col pb-20">
            <div className="bg-white px-4 py-4 border-b border-gray-200 flex items-center space-x-3 sticky top-0 z-10">
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full">
                    <ArrowLeft size={20} />
                </button>
                <h1 className="text-xl font-bold">Post a Job</h1>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-6 max-w-lg mx-auto w-full bg-white mt-4 rounded-xl shadow-sm">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Job Title</label>
                    <input type="text" required value={title} onChange={e => setTitle(e.target.value)}
                           className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea rows={4} required value={description} onChange={e => setDescription(e.target.value)}
                              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Required Skills (Select multiple)</label>
                    <div className="h-48 overflow-y-auto border border-gray-300 rounded-md p-2 flex flex-wrap gap-2 bg-gray-50">
                        {RECRUITABLE_KEYWORDS.map(kw => (
                            <button
                                key={kw} type="button" onClick={() => toggleKeyword(kw)}
                                className={`px-2 py-1 text-xs rounded-full border transition-colors ${selectedKeywords.includes(kw) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'}`}
                            >
                                {kw}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                    <div>
                        <p className="text-sm font-medium text-gray-900">Quick Apply</p>
                        <p className="text-xs text-gray-500">Allow users to apply with 1-click</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={quickApply} onChange={e => setQuickApply(e.target.checked)} className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                </div>

                <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                    <div>
                        <p className="text-sm font-medium text-gray-900 flex items-center gap-1">AI Interviewer Pro <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 rounded">BETA</span></p>
                        <p className="text-xs text-gray-500">Automatically conduct a first-round AI interview</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={aiInterview} onChange={e => setAiInterview(e.target.checked)} className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                </div>

                <button type="submit" className="w-full mt-6 bg-blue-600 text-white font-medium py-3 rounded-lg hover:bg-blue-700 transition">
                    Publish Job
                </button>
            </form>
        </div>
    );
}
