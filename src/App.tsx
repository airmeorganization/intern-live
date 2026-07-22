import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SplashScreen from './screens/SplashScreen';
import LoginScreen from './screens/LoginScreen';
import OtpScreen from './screens/OtpScreen';
import HomeScreen from './screens/HomeScreen';
import CreateProfileScreen from './screens/CreateProfileScreen';
import SearchScreen from './screens/SearchScreen';
import SuggestionsScreen from './screens/SuggestionsScreen';
import PostJobScreen from './screens/PostJobScreen';
import MyProfileScreen from './screens/MyProfileScreen';
import PostDetailScreen from './screens/PostDetailScreen';
import OtherUserProfileScreen from './screens/OtherUserProfileScreen';
import EditProfileScreen from './screens/EditProfileScreen';
import DashboardScreen from './screens/DashboardScreen';
import ChatScreen from './screens/ChatScreen';
import ChatDetailScreen from './screens/ChatDetailScreen';
import AIChatDetailScreen from './screens/AIChatDetailScreen';
import AIInterviewerScreen from './screens/AIInterviewerScreen';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SplashScreen />} />
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/otp" element={<OtpScreen />} />
        <Route path="/create-profile" element={<CreateProfileScreen />} />

        <Route path="/home" element={<HomeScreen />} />
        <Route path="/search" element={<SearchScreen />} />
        <Route path="/post/:postId" element={<PostDetailScreen />} />
        <Route path="/suggestions" element={<SuggestionsScreen />} />
        <Route path="/post-job" element={<PostJobScreen />} />

        <Route path="/profile" element={<MyProfileScreen />} />
        <Route path="/profile/:username" element={<OtherUserProfileScreen />} />
        <Route path="/edit-profile" element={<EditProfileScreen />} />
        <Route path="/dashboard" element={<DashboardScreen />} />

        <Route path="/chat" element={<ChatScreen />} />
        <Route path="/chat/:peerId" element={<ChatDetailScreen />} />
        <Route path="/ai-chat" element={<AIChatDetailScreen />} />
        <Route path="/ai-interview/:jobId" element={<AIInterviewerScreen />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
