import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCareerMentorResponse } from '../lib/gemini';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Send, Bot } from 'lucide-react';

export default function AIChatDetailScreen() {
    const navigate = useNavigate();
    const [messages, setMessages] = useState<{role: 'user' | 'model', text: string}[]>([
        { role: 'model', text: "Hi there! I'm your intern. AI career mentor. How can I help you today?" }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [userContext, setUserContext] = useState<any>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const loadContext = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
                setUserContext(data);
            }
        };
        loadContext();
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
        setIsLoading(true);

        const responseText = await getCareerMentorResponse(userContext || {}, userMessage);

        setMessages(prev => [...prev, { role: 'model', text: responseText }]);
        setIsLoading(false);
    };

    return (
        <div className="flex flex-col h-screen bg-gray-50 max-w-lg mx-auto shadow-sm">
            <div className="bg-white px-4 py-3 border-b border-gray-200 flex items-center space-x-3 shadow-sm z-10">
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full">
                    <ArrowLeft size={20} />
                </button>
                <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
                        <Bot size={16} />
                    </div>
                    <div>
                        <h1 className="text-sm font-bold">intern. AI</h1>
                        <p className="text-[10px] text-green-500 font-medium">Online</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${m.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white text-gray-800 border border-gray-100 shadow-sm rounded-bl-none'}`}>
                            {m.text}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-gray-200 animate-pulse w-16 h-8 rounded-2xl rounded-bl-none"></div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-4 bg-white border-t border-gray-200 pb-8">
                <form onSubmit={handleSend} className="flex space-x-2 relative">
                    <input
                        type="text"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        placeholder="Ask for resume advice, interview prep..."
                        className="flex-1 bg-gray-100 border-transparent rounded-full px-4 py-2.5 text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                    <button type="submit" disabled={!input.trim() || isLoading} className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white disabled:opacity-50">
                        <Send size={16} className="ml-1" />
                    </button>
                </form>
            </div>
        </div>
    );
}
