import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Layout from '../components/Layout';
import { ArrowLeft, Heart, Send } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PostDetailScreen() {
    const { postId } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState<any>(null);
    const [comments, setComments] = useState<any[]>([]);
    const [newComment, setNewComment] = useState('');
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, [postId]);

    const loadData = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        setUserId(session?.user.id || null);

        if (postId) {
            const { data: postData } = await supabase
                .from('posts')
                .select('*, profiles:author_id(name, username, avatar_url, profession_major)')
                .eq('id', postId)
                .single();
            setPost(postData);

            fetchComments();

            // Sub for comments
            const subscription = supabase
                .channel(`post:${postId}`)
                .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'comments', filter: `post_id=eq.${postId}` }, fetchComments)
                .subscribe();

            return () => { supabase.removeChannel(subscription); };
        }
    };

    const fetchComments = async () => {
        const { data } = await supabase
            .from('comments')
            .select('*, profiles:author_id(name, username, avatar_url)')
            .eq('post_id', postId)
            .order('created_at', { ascending: true });
        setComments(data || []);
    };

    const handleComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || !userId || !postId) return;

        const { error } = await supabase.from('comments').insert({
            post_id: postId,
            author_id: userId,
            content: newComment.trim()
        });

        if (error) toast.error("Failed to post comment");
        else setNewComment('');
    };

    const handleLike = async () => {
        if (!post) return;
        const { error } = await supabase
          .from('posts')
          .update({ likes_count: post.likes_count + 1 })
          .eq('id', post.id);

        if (error) toast.error("Failed to like post");
        else setPost({...post, likes_count: post.likes_count + 1});
    };

    if (!post) return <Layout><div className="p-10 text-center">Loading...</div></Layout>;

    return (
        <Layout>
            <div className="flex items-center space-x-3 mb-6">
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full -ml-2">
                    <ArrowLeft size={20} />
                </button>
                <h1 className="text-xl font-bold">Post</h1>
            </div>

            <div className="border-b border-gray-100 pb-4 mb-4">
              <div className="flex items-center space-x-3 mb-3 cursor-pointer" onClick={() => navigate(`/profile/${post.profiles?.username}`)}>
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold overflow-hidden">
                    {post.profiles?.avatar_url ? <img src={post.profiles.avatar_url} alt="avatar" /> : post.profiles?.name?.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-sm">{post.profiles?.name} <span className="text-gray-500 font-normal">@{post.profiles?.username}</span></p>
                  <p className="text-xs text-gray-500">{post.profiles?.profession_major}</p>
                </div>
              </div>
              <p className="text-gray-800 text-sm mb-4">{post.content}</p>
              {post.media_url && (
                  <img src={post.media_url} alt="post media" className="rounded-lg w-full mb-4" />
              )}

              <div className="flex items-center space-x-6 text-gray-500 border-t border-gray-100 pt-3">
                <button onClick={handleLike} className="flex items-center space-x-1 hover:text-red-500">
                  <Heart size={18} />
                  <span className="text-xs">{post.likes_count}</span>
                </button>
              </div>
            </div>

            <div className="mb-6">
                <h3 className="font-bold text-sm mb-4">Comments ({comments.length})</h3>
                <div className="space-y-4">
                    {comments.map(c => (
                        <div key={c.id} className="flex space-x-3">
                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0 cursor-pointer" onClick={() => navigate(`/profile/${c.profiles?.username}`)}>
                                {c.profiles?.avatar_url ? <img src={c.profiles.avatar_url} /> : c.profiles?.name?.charAt(0)}
                            </div>
                            <div className="bg-gray-50 rounded-2xl px-4 py-2 flex-1">
                                <p className="text-xs font-bold">{c.profiles?.name}</p>
                                <p className="text-sm text-gray-800 mt-0.5">{c.content}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <form onSubmit={handleComment} className="flex space-x-2 pb-8">
                <input
                    type="text"
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                    className="flex-1 bg-gray-100 border-transparent rounded-full px-4 py-2.5 text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
                <button type="submit" disabled={!newComment.trim()} className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white disabled:opacity-50">
                    <Send size={16} className="ml-1" />
                </button>
            </form>
        </Layout>
    );
}
