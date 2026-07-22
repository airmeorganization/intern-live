import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { Sparkles, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SuggestionsScreen() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    setUserProfile(profile);

    // Fetch jobs and sort them in JS based on keyword overlap
    const { data: allJobs } = await supabase
      .from('jobs')
      .select('*, profiles(college_company, name, avatar_url)');

    if (allJobs && profile) {
      const userKeywords = profile.parsed_keywords || [];
      const scoredJobs = allJobs.map(job => {
        const jobKeywords = job.keywords || [];
        const matchCount = jobKeywords.filter((k: string) => userKeywords.includes(k)).length;
        return { ...job, matchCount };
      });
      // Sort by best match
      scoredJobs.sort((a, b) => b.matchCount - a.matchCount);
      setJobs(scoredJobs);
    }
  };

  const handleQuickApply = async (jobId: string) => {
    if (!userProfile) return;
    const { error } = await supabase
        .from('applications')
        .insert({
            job_id: jobId,
            applicant_id: userProfile.id,
            status: 'under_review'
        });

    if (error) {
        if (error.code === '23505') toast.error("You already applied to this job!");
        else toast.error("Failed to apply");
    } else {
        toast.success("Application submitted!");
    }
  };

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">Job Matches</h1>
        <p className="text-sm text-gray-500">Based on your parsed resume skills</p>
      </div>

      <div className="space-y-4">
        {jobs.length === 0 ? (
          <p className="text-gray-500 text-center py-10">No jobs found.</p>
        ) : (
          jobs.map(job => (
            <div key={job.id} className="border border-gray-200 rounded-xl p-5 shadow-sm relative overflow-hidden">
                {job.matchCount > 0 && (
                    <div className="absolute top-0 right-0 bg-blue-50 text-blue-600 text-[10px] font-bold px-2 py-1 rounded-bl-lg flex items-center space-x-1">
                        <Sparkles size={10} />
                        <span>{job.matchCount} SKILL MATCHES</span>
                    </div>
                )}

                <h2 className="text-lg font-bold text-gray-900 mt-2">{job.title}</h2>
                <p className="text-sm font-medium text-gray-600 mb-3">{job.profiles?.college_company}</p>

                <p className="text-sm text-gray-600 mb-4 line-clamp-3">{job.description}</p>

                <div className="flex flex-wrap gap-2 mb-4">
                    {job.keywords?.slice(0, 4).map((kw: string) => (
                        <span key={kw} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                            {kw}
                        </span>
                    ))}
                    {job.keywords?.length > 4 && <span className="text-xs text-gray-400 py-1">+{job.keywords.length - 4} more</span>}
                </div>

                <div className="flex space-x-3 pt-3 border-t border-gray-100">
                    {job.quick_apply && (
                        <button onClick={() => handleQuickApply(job.id)} className="flex-1 bg-gray-900 text-white text-sm font-medium py-2 rounded-lg hover:bg-black transition">
                            Quick Apply
                        </button>
                    )}
                    {job.ai_interview && (
                        <button onClick={() => navigate(`/ai-interview/${job.id}`)} className="flex-1 bg-blue-600 text-white text-sm font-medium py-2 rounded-lg hover:bg-blue-700 transition flex justify-center items-center space-x-1">
                            <span>Start AI Interview</span>
                            <ChevronRight size={16} />
                        </button>
                    )}
                </div>
            </div>
          ))
        )}
      </div>
    </Layout>
  );
}
