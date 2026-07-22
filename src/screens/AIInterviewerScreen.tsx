import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { generateInterviewResponse } from '../lib/gemini';
import { supabase } from '../lib/supabase';
import { Mic, MicOff, X, Send } from 'lucide-react';


export default function AIInterviewerScreen() {
    const { jobId } = useParams();
    const navigate = useNavigate();
    const [job, setJob] = useState<any>(null);
    const [messages, setMessages] = useState<{role: 'user' | 'model', parts: [{text: string}]}[]>([]);
    const [isRecording, setIsRecording] = useState(false);
    const [textInput, setTextInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // For demo purposes, we will use text input instead of actual STT/TTS in browser
    // to ensure reliable operation within the prompt constraints.

    useEffect(() => {
        const fetchJob = async () => {
            const { data } = await supabase.from('jobs').select('title').eq('id', jobId).single();
            setJob(data);
            if (data) {
                // Initialize interview
                setIsLoading(true);
                const initialResponse = await generateInterviewResponse(data.title, [{role: 'user', parts: [{text: "Hello, I'm ready to start the interview."}]}]);
                setMessages([{role: 'model', parts: [{text: initialResponse}]}]);
                setIsLoading(false);
            }
        };
        if (jobId) fetchJob();
    }, [jobId]);

    const handleSendText = async () => {
        if (!textInput.trim() || isLoading) return;
        const userText = textInput.trim();

        const newUserMessage: {role: "user" | "model", parts: [{text: string}]} = { role: "user", parts: [{text: userText}] };
        const newMessages = [...messages, newUserMessage];
        setMessages(newMessages);
        setIsLoading(true);

        const aiResponse = await generateInterviewResponse(job?.title || "this role", newMessages);

        setMessages([...newMessages, { role: "model", parts: [{text: aiResponse}] }]);
        setIsLoading(false);
        setTextInput('');


    };

    return (
        <div className="flex flex-col h-screen bg-black text-white">
            <div className="flex justify-between items-center p-6">
                <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium">Recording</span>
                </div>
                <button onClick={() => navigate('/suggestions')} className="p-2 bg-gray-800 rounded-full hover:bg-gray-700">
                    <X size={20} />
                </button>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-12">
                <div className="text-center space-y-4">
                    <h2 className="text-gray-400 text-sm tracking-widest uppercase">AI Interviewer</h2>
                    <h1 className="text-2xl font-bold">{job?.title}</h1>
                </div>

                {/* Pulsing Avatar */}
                <div className="relative w-48 h-48 flex items-center justify-center">
                    {isLoading && <div className="absolute inset-0 border-4 border-blue-500 rounded-full animate-ping opacity-20"></div>}
                    <div className="absolute inset-4 border-4 border-blue-400 rounded-full animate-pulse opacity-40"></div>
                    <div className="w-32 h-32 bg-blue-600 rounded-full flex items-center justify-center text-4xl shadow-[0_0_50px_rgba(37,99,235,0.5)]">
                        🤖
                    </div>
                </div>

                <div className="w-full max-w-md bg-gray-900 p-6 rounded-2xl border border-gray-800 min-h-[120px] flex items-center justify-center text-center">
                    {messages.length > 0 ? (
                        <p className="text-lg leading-relaxed">
                            {messages[messages.length - 1].parts[0].text}
                        </p>
                    ) : (
                        <p className="text-gray-500">Connecting...</p>
                    )}
                </div>
            </div>

            <div className="p-6 w-full max-w-md mx-auto">
                <div className="flex space-x-2 bg-gray-900 rounded-full p-1 border border-gray-800 focus-within:border-gray-600 transition-colors">
                    <button
                        onClick={() => setIsRecording(!isRecording)}
                        className={`p-3 rounded-full ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
                    >
                        {isRecording ? <Mic size={20} /> : <MicOff size={20} />}
                    </button>
                    <input
                        type="text"
                        value={textInput}
                        onChange={e => setTextInput(e.target.value)}
                        onKeyPress={e => e.key === 'Enter' && handleSendText()}
                        placeholder="Type your response..."
                        className="flex-1 bg-transparent border-none outline-none text-white px-2 placeholder-gray-600"
                    />
                    <button
                        onClick={handleSendText}
                        disabled={!textInput.trim() || isLoading}
                        className="p-3 bg-white text-black rounded-full disabled:opacity-50 hover:bg-gray-200"
                    >
                        <Send size={18} className="ml-0.5" />
                    </button>
                </div>
                <p className="text-center text-xs text-gray-500 mt-4">
                    Voice feature in development. Please use text.
                </p>
            </div>
        </div>
    );
}
