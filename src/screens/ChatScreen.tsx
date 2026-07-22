import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { Bot, User } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function ChatScreen() {
    const navigate = useNavigate();
        const [recentChats, setRecentChats] = useState<any[]>([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        // Fetch recent messages
        const { data: messages } = await supabase
            .from('messages')
            .select('*, sender:sender_id(id, name, username, avatar_url), receiver:receiver_id(id, name, username, avatar_url)')
            .or(`sender_id.eq.${session.user.id},receiver_id.eq.${session.user.id}`)
            .order('created_at', { ascending: false });

        if (messages) {
            // Group by peer
            const peerMap = new Map();
            messages.forEach(msg => {
                const isSender = msg.sender_id === session.user.id;
                const peerId = isSender ? msg.receiver_id : msg.sender_id;
                const peerData = isSender ? msg.receiver : msg.sender;

                if (!peerMap.has(peerId)) {
                    peerMap.set(peerId, {
                        peerId,
                        peer: peerData,
                        lastMessage: msg.content,
                        created_at: msg.created_at,
                        is_read: msg.is_read || isSender // Consider read if I sent it
                    });
                }
            });
            setRecentChats(Array.from(peerMap.values()));
        }
    };

    return (
        <Layout>
            <h1 className="text-xl font-bold mb-4">Messages</h1>

            <div className="space-y-2">
                {/* Pinned AI Chat */}
                <div
                    onClick={() => navigate('/ai-chat')}
                    className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-xl cursor-pointer border border-blue-100 bg-blue-50/50 mb-4"
                >
                    <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white">
                        <Bot size={24} />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-gray-900">intern. AI</h3>
                        <p className="text-sm text-gray-500 line-clamp-1">Your personal career mentor</p>
                    </div>
                </div>

                <div className="px-1 mb-2">
                   <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Direct Messages</p>
                </div>

                {recentChats.length === 0 ? (
                   <div className="text-sm text-gray-500 text-center py-6">
                       Connect with others to start messaging
                   </div>
                ) : (
                    recentChats.map(chat => (
                        <div
                            key={chat.peerId}
                            onClick={() => navigate(`/chat/${chat.peerId}`)}
                            className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-xl cursor-pointer border border-transparent"
                        >
                            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 overflow-hidden">
                                {chat.peer?.avatar_url ? <img src={chat.peer.avatar_url} /> : <User size={20} />}
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-baseline">
                                    <h3 className={`text-sm ${!chat.is_read ? 'font-bold text-black' : 'font-medium text-gray-900'}`}>
                                        {chat.peer?.name || 'User'}
                                    </h3>
                                    <span className="text-[10px] text-gray-400">
                                        {new Date(chat.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                                <p className={`text-xs line-clamp-1 mt-0.5 ${!chat.is_read ? 'font-medium text-black' : 'text-gray-500'}`}>
                                    {chat.lastMessage}
                                </p>
                            </div>
                            {!chat.is_read && <div className="w-2.5 h-2.5 bg-blue-500 rounded-full"></div>}
                        </div>
                    ))
                )}
            </div>
        </Layout>
    )
}
