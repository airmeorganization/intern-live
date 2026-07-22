import { supabase } from '../lib/supabase';

// Splash Screen Logic: Check if there is an active session
export const checkSession = async () => {
  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session) {
    return { hasSession: false };
  }
  return { hasSession: true, session: data.session };
};

// Google Sign-In Trigger
export const handleGoogleSignInClick = () => {
  alert("Google Sign-In integration is currently under review and will be live soon! Please sign in using Email or aorg.in.");
};

// aorg.in Login Flow - Send OTP
export const sendOtp = async (email: string) => {
  if (!email.endsWith('@aorg.in')) {
    return { error: new Error('Only @aorg.in emails are allowed for this login flow.') };
  }

  const { data, error } = await supabase.auth.signInWithOtp({
    email,
  });

  return { data, error };
};

// aorg.in Login Flow - Verify OTP
export const verifyOtp = async (email: string, token: string) => {
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'email',
  });

  return { data, error };
};

// Username Availability Check
let timeoutId: any;
export const checkUsernameAvailability = (username: string, callback: (isAvailable: boolean) => void) => {
  clearTimeout(timeoutId);
  timeoutId = setTimeout(async () => {
    if (!username) {
      callback(false);
      return;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', username)
      .limit(1);

    if (error) {
      console.error("Error checking username availability:", error);
      callback(false);
      return;
    }

    // If no records found, the username is available
    const isAvailable = !data || data.length === 0;
    callback(isAvailable);
  }, 300); // 300ms debounce
};
