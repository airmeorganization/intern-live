import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Send } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ChatDetailScreen() {
    const { peerId } = useParams();
    const navigate = useNavigate();
    const [messages, setMessages] = useState<any[]>([]);
    const [input, setInput] = useState('');
    const [userId, setUserId] = useState<string | null>(null);
    const [peerProfile, setPeerProfile] = useState<any>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        loadData();
    }, [peerId]);

    const loadData = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) { navigate('/login'); return; }
        setUserId(session.user.id);

        if (peerId) {
            const { data } = await supabase.from('profiles').select('*').eq('id', peerId).single();
            setPeerProfile(data);

            fetchMessages(session.user.id, peerId);

            const subscription = supabase
                .channel(`messages:${peerId}`)
                .on('postgres_changes', {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `sender_id=eq.${peerId}`
                }, (payload) => {
                    if (payload.new.receiver_id === session.user.id) {
                        setMessages(prev => [...prev, payload.new]);
                    }
                })
                .subscribe();

            return () => {
                supabase.removeChannel(subscription);
            };
        }
    };

    const fetchMessages = async (currentId: string, otherId: string) => {
        const { data } = await supabase
            .from('messages')
            .select('*')
            .or(`and(sender_id.eq.${currentId},receiver_id.eq.${otherId}),and(sender_id.eq.${otherId},receiver_id.eq.${currentId})`)
            .order('created_at', { ascending: true });

        setMessages(data || []);
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || !userId || !peerId) return;

        const messageText = input.trim();
        setInput('');

        const newMessage = {
            sender_id: userId,
            receiver_id: peerId,
            content: messageText
        };

        // Optimistic UI update
        setMessages(prev => [...prev, { ...newMessage, id: Date.now(), created_at: new Date().toISOString() }]);
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);

        const { error } = await supabase.from('messages').insert(newMessage);
        if (error) {
            toast.error("Failed to send message");
        }
    };

    return (
        <div className="flex flex-col h-screen bg-gray-50 max-w-lg mx-auto shadow-sm">
            <div className="bg-white px-4 py-3 border-b border-gray-200 flex items-center space-x-3 shadow-sm z-10">
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full">
                    <ArrowLeft size={20} />
                </button>
                <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold overflow-hidden">
                        {peerProfile?.avatar_url ? <img src={peerProfile.avatar_url} /> : peerProfile?.name?.charAt(0)}
                    </div>
                    <div>
                        <h1 className="text-sm font-bold">{peerProfile?.name || 'Loading...'}</h1>
                        <p className="text-[10px] text-gray-500">@{peerProfile?.username}</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((m) => {
                    const isMine = m.sender_id === userId;
                    return (
                        <div key={m.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${isMine ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white text-gray-800 border border-gray-100 shadow-sm rounded-bl-none'}`}>
                                {m.content}
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-4 bg-white border-t border-gray-200 pb-8">
                <form onSubmit={handleSend} className="flex space-x-2 relative">
                    <input
                        type="text"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        placeholder="Message..."
                        className="flex-1 bg-gray-100 border-transparent rounded-full px-4 py-2.5 text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                    <button type="submit" disabled={!input.trim()} className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white disabled:opacity-50 hover:bg-blue-700">
                        <Send size={16} className="ml-1" />
                    </button>
                </form>
            </div>
        </div>
    );
}
