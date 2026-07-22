import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function HomeScreen() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login', { replace: true });
  };

  return (
    <div className="flex h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <h1 className="text-4xl font-extrabold tracking-tighter text-blue-600 mb-6 logo-font">intern.</h1>
      <h2 className="text-2xl font-bold mb-4">Welcome Home!</h2>
      <p className="text-gray-600 mb-8 text-center max-w-md">
        You've successfully authenticated. This is where the intern matching magic will happen.
      </p>
      <button
        onClick={handleLogout}
        className="py-2 px-6 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
      >
        Sign Out
      </button>
    </div>
  );
}
