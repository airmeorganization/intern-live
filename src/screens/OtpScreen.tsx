import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { verifyOtp } from '../auth/authLogic';

export default function OtpScreen() {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;

  if (!email) {
    navigate('/login', { replace: true });
    return null;
  }

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const { error: verifyError } = await verifyOtp(email, otp);
    setIsLoading(false);

    if (verifyError) {
      setError(verifyError.message);
    } else {
      navigate('/home', { replace: true });
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <h1 className="text-3xl font-extrabold tracking-tighter text-blue-600 mb-6 text-center logo-font">intern.</h1>
        <h2 className="text-xl font-bold mb-2 text-center">Check your email</h2>
        <p className="text-center text-sm text-gray-600 mb-6">
          We sent a verification code to <span className="font-medium text-gray-900">{email}</span>
        </p>

        <form onSubmit={handleOtpSubmit} className="space-y-4">
          <div>
            <label htmlFor="otp" className="block text-sm font-medium text-gray-700">Verification Code</label>
            <input
              type="text"
              id="otp"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter 4-digit code"
              maxLength={4}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-center tracking-widest text-lg"
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={isLoading || otp.length < 4}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isLoading ? 'Verifying...' : 'Verify & Continue'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() => navigate('/login')}
            className="text-sm text-blue-600 hover:text-blue-500"
          >
            Back to login
          </button>
        </div>
      </div>
    </div>
  );
}
