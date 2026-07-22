import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkSession } from '../auth/authLogic';

export default function SplashScreen() {
  const navigate = useNavigate();

  useEffect(() => {
    const initApp = async () => {
      const { hasSession } = await checkSession();
      if (hasSession) {
        navigate('/home', { replace: true });
      } else {
        navigate('/login', { replace: true });
      }
    };

    initApp();
  }, [navigate]);

  return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-extrabold tracking-tighter text-blue-600 mb-4 logo-font">intern.</h1>
        <div className="flex justify-center space-x-1">
          <div className="w-1.5 h-8 bg-blue-600 rounded-full voice-wave" style={{ animationDelay: '0s' }}></div>
          <div className="w-1.5 h-12 bg-blue-500 rounded-full voice-wave" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-1.5 h-6 bg-blue-400 rounded-full voice-wave" style={{ animationDelay: '0.4s' }}></div>
          <div className="w-1.5 h-10 bg-blue-600 rounded-full voice-wave" style={{ animationDelay: '0.6s' }}></div>
          <div className="w-1.5 h-8 bg-blue-500 rounded-full voice-wave" style={{ animationDelay: '0.8s' }}></div>
        </div>
      </div>
    </div>
  );
}
