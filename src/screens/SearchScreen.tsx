import { useState } from 'react';
import Layout from '../components/Layout';
import { Search } from 'lucide-react';
import clsx from 'clsx';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

export default function SearchScreen() {
  const [activeTab, setActiveTab] = useState<'Profiles' | 'Posts' | 'Jobs'>('Profiles');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const navigate = useNavigate();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;

    if (activeTab === 'Profiles') {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .or(`name.ilike.%${query}%,username.ilike.%${query}%,profession_major.ilike.%${query}%`);
      setResults(data || []);
    } else if (activeTab === 'Posts') {
      const { data } = await supabase
        .from('posts')
        .select('*, profiles(name, username)')
        .ilike('content', `%${query}%`);
      setResults(data || []);
    } else if (activeTab === 'Jobs') {
      const { data } = await supabase
        .from('jobs')
        .select('*, profiles(name, college_company)')
        .ilike('title', `%${query}%`);
      setResults(data || []);
    }
  };

  return (
    <Layout>
      <form onSubmit={handleSearch} className="relative mb-6">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search size={18} className="text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          placeholder="Search intern."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </form>

      <div className="flex border-b border-gray-200 mb-4">
        {['Profiles', 'Posts', 'Jobs'].map((tab) => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab as any); setResults([]); }}
            className={clsx(
              "flex-1 py-2 text-center text-sm font-medium border-b-2",
              activeTab === tab ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {results.length === 0 && query ? (
            <p className="text-gray-500 text-center text-sm">No results found for "{query}". Press enter to search.</p>
        ) : (
            results.map((item, idx) => (
                <div
                    key={idx}
                    className="p-4 border border-gray-100 rounded-lg shadow-sm cursor-pointer hover:bg-gray-50"
                    onClick={() => {
                        if (activeTab === 'Profiles') navigate(`/profile/${item.username}`);
                        if (activeTab === 'Posts') navigate(`/post/${item.id}`);
                        if (activeTab === 'Jobs') navigate(`/suggestions`);
                    }}
                >
                    {activeTab === 'Profiles' && (
                        <div>
                            <p className="font-bold">{item.name}</p>
                            <p className="text-xs text-gray-500">@{item.username}</p>
                            <p className="text-sm mt-1">{item.profession_major}</p>
                        </div>
                    )}
                    {activeTab === 'Posts' && (
                        <div>
                            <p className="font-bold text-sm mb-1">{item.profiles?.name}</p>
                            <p className="text-sm text-gray-700">{item.content}</p>
                        </div>
                    )}
                    {activeTab === 'Jobs' && (
                        <div>
                            <p className="font-bold text-blue-600">{item.title}</p>
                            <p className="text-sm font-medium text-gray-800">{item.profiles?.college_company}</p>
                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{item.description}</p>
                        </div>
                    )}
                </div>
            ))
        )}
      </div>
    </Layout>
  );
}
