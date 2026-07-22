import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SplashScreen from './screens/SplashScreen';
import LoginScreen from './screens/LoginScreen';
import OtpScreen from './screens/OtpScreen';
import HomeScreen from './screens/HomeScreen';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SplashScreen />} />
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/otp" element={<OtpScreen />} />
        <Route path="/home" element={<HomeScreen />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
