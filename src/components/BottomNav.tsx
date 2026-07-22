import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Search, Briefcase, MessageSquare, User } from 'lucide-react';
import clsx from 'clsx';

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { icon: Home, path: '/home', label: 'Home' },
    { icon: Search, path: '/search', label: 'Search' },
    { icon: Briefcase, path: '/suggestions', label: 'Jobs' },
    { icon: MessageSquare, path: '/chat', label: 'Chat' },
    { icon: User, path: '/profile', label: 'Profile' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 flex justify-between items-center z-50">
      {navItems.map((item) => (
        <button
          key={item.path}
          onClick={() => navigate(item.path)}
          className={clsx(
            "flex flex-col items-center p-2 rounded-lg transition-colors",
            location.pathname === item.path ? "text-blue-600" : "text-gray-500 hover:bg-gray-50"
          )}
        >
          <item.icon size={24} className={location.pathname === item.path ? "fill-blue-100" : ""} />
          <span className="text-[10px] mt-1 font-medium">{item.label}</span>
        </button>
      ))}
    </div>
  );
}
