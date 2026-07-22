import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { parseResumeFile } from '../lib/resumeParser';
import { extractKeywordsFromResume } from '../lib/gemini';
import toast, { Toaster } from 'react-hot-toast';

export default function CreateProfileScreen() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);

  const [role, setRole] = useState<'student' | 'employer'>('student');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [professionMajor, setProfessionMajor] = useState('');
  const [collegeCompany, setCollegeCompany] = useState('');
  const [bio, setBio] = useState('');

  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUserId(session.user.id);
        // Pre-fill name if available
        setName(session.user.user_metadata?.full_name || '');
      } else {
        navigate('/login');
      }
    });
  }, [navigate]);

  // Debounced username check
  useEffect(() => {
    if (username.length < 3) {
      setUsernameAvailable(null);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username)
        .maybeSingle();

      if (error) console.error(error);
      setUsernameAvailable(!data);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [username]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setResumeFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    if (usernameAvailable === false) {
        toast.error("Username is already taken");
        return;
    }

    setIsProcessing(true);
    let parsedKeywords: string[] = [];
    let resumeUrl = '';

    // Process Resume if provided
    if (resumeFile) {
        toast.loading("Parsing resume...", { id: 'resume' });
        try {
            // 1. Upload file
            const fileExt = resumeFile.name.split('.').pop();
            const fileName = `${userId}_${Date.now()}.${fileExt}`;
            const { error: uploadError } = await supabase.storage
                .from('resumes')
                .upload(fileName, resumeFile);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('resumes')
                .getPublicUrl(fileName);
            resumeUrl = publicUrl;

            // 2. Parse text
            const text = await parseResumeFile(resumeFile);

            // 3. Extract keywords
            toast.loading("AI extracting keywords...", { id: 'resume' });
            parsedKeywords = await extractKeywordsFromResume(text);
            toast.success(`Extracted ${parsedKeywords.length} skills!`, { id: 'resume' });

        } catch (error: any) {
            console.error(error);
            toast.error(`Resume processing failed: ${error.message}`, { id: 'resume' });
            // Continue with profile creation even if resume fails
        }
    }

    toast.loading("Creating profile...", { id: 'profile' });

    // Create Profile Record
    const { error } = await supabase
        .from('profiles')
        .insert({
            id: userId,
            name,
            username,
            role,
            profession_major: professionMajor,
            college_company: collegeCompany,
            bio,
            resume_url: resumeUrl || null,
            parsed_keywords: parsedKeywords
        });

    setIsProcessing(false);

    if (error) {
        console.error(error);
        toast.error(error.message, { id: 'profile' });
    } else {
        toast.success("Profile created!", { id: 'profile' });
        navigate('/suggestions', { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <Toaster />
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 logo-font text-blue-600">
          intern.
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Let's set up your profile
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>

            {/* Role Toggle */}
            <div className="flex justify-center space-x-4 mb-6">
                <button
                    type="button"
                    onClick={() => setRole('student')}
                    className={`px-4 py-2 rounded-full text-sm font-medium ${role === 'student' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                >
                    I am a Student
                </button>
                <button
                    type="button"
                    onClick={() => setRole('employer')}
                    className={`px-4 py-2 rounded-full text-sm font-medium ${role === 'employer' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                >
                    I am an Employer
                </button>
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
              <div className="mt-1">
                <input id="name" type="text" required value={name} onChange={e => setName(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
              <div className="mt-1 relative">
                <input id="username" type="text" required value={username} onChange={e => setUsername(e.target.value.toLowerCase())}
                  className={`appearance-none block w-full px-3 py-2 border ${usernameAvailable === false ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                />
                {username.length >= 3 && (
                   <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                     {usernameAvailable === true && <span className="text-green-500 text-xs font-bold">✓ Available</span>}
                     {usernameAvailable === false && <span className="text-red-500 text-xs font-bold">✗ Taken</span>}
                   </div>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="major" className="block text-sm font-medium text-gray-700">
                {role === 'student' ? 'Major / Degree' : 'Job Title / Role'}
              </label>
              <div className="mt-1">
                <input id="major" type="text" required value={professionMajor} onChange={e => setProfessionMajor(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="college" className="block text-sm font-medium text-gray-700">
                {role === 'student' ? 'College / University' : 'Company Name'}
              </label>
              <div className="mt-1">
                <input id="college" type="text" required value={collegeCompany} onChange={e => setCollegeCompany(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700">Short Bio</label>
              <div className="mt-1">
                <textarea id="bio" rows={3} value={bio} onChange={e => setBio(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            {role === 'student' && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Upload Resume (PDF, DOCX)</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-blue-500 transition-colors">
                  <div className="space-y-1 text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div className="flex text-sm text-gray-600 justify-center">
                      <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">
                        <span>Upload a file</span>
                        <input id="file-upload" name="file-upload" type="file" className="sr-only" accept=".pdf,.doc,.docx" onChange={handleFileChange} />
                      </label>
                    </div>
                    <p className="text-xs text-gray-500">
                      {resumeFile ? resumeFile.name : "PDF, DOCX up to 10MB"}
                    </p>
                  </div>
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  Our AI will parse your resume to automatically match you with jobs.
                </p>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isProcessing || usernameAvailable === false}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isProcessing ? 'Creating Profile...' : 'Complete Profile'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
