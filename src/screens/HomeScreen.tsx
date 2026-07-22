import { useEffect, useState, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import Layout from '../components/Layout';
import { Heart, MessageCircle, Share } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function HomeScreen() {
  const [posts, setPosts] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const POSTS_PER_PAGE = 10;
  const observer = useRef<IntersectionObserver | null>(null);

  const lastPostElementRef = useCallback((node: HTMLDivElement | null) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prev => prev + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  useEffect(() => {
    // Initial setup
    fetchPosts(0);

    const subscription = supabase
      .channel('public:posts')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts' }, payload => {
          // Fetch full data for new post to get author profiles joined properly
          fetchSinglePostAndPrepend(payload.new.id);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  useEffect(() => {
      if (page > 0) fetchPosts(page);
  }, [page]);

  const fetchSinglePostAndPrepend = async (id: string) => {
      const { data } = await supabase
        .from('posts')
        .select(`*, profiles:author_id (name, username, avatar_url, profession_major)`)
        .eq('id', id)
        .single();
      if (data) setPosts(prev => [data, ...prev]);
  };

  const fetchPosts = async (pageNumber: number) => {
    setLoading(true);
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        profiles:author_id (name, username, avatar_url, profession_major)
      `)
      .order('created_at', { ascending: false })
      .range(pageNumber * POSTS_PER_PAGE, (pageNumber + 1) * POSTS_PER_PAGE - 1);

    if (error) {
        console.error(error);
    } else {
        if (data.length < POSTS_PER_PAGE) setHasMore(false);
        if (pageNumber === 0) setPosts(data);
        else setPosts(prev => [...prev, ...data]);
    }
    setLoading(false);
  };

  const handleLike = async (postId: string, currentLikes: number) => {
      const { error } = await supabase
        .from('posts')
        .update({ likes_count: currentLikes + 1 })
        .eq('id', postId);

      if (error) {
          toast.error("Failed to like post");
      } else {
          setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes_count: currentLikes + 1 } : p));
      }
  };

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-extrabold text-blue-600 logo-font">intern.</h1>
        <div className="bg-gray-100 p-2 rounded-full cursor-pointer hover:bg-gray-200">
           <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
        </div>
      </div>

      <div className="space-y-6">
        {posts.length === 0 && !loading ? (
          <p className="text-gray-500 text-center py-10">No posts yet. Start connecting!</p>
        ) : (
          posts.map((post, index) => {
            const isLast = posts.length === index + 1;
            return (
              <div
                key={post.id}
                ref={isLast ? lastPostElementRef : null}
                className="border-b border-gray-100 pb-6"
              >
                <div className="flex items-center space-x-3 mb-3 cursor-pointer" onClick={() => navigate(`/profile/${post.profiles?.username}`)}>
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold overflow-hidden">
                      {post.profiles?.avatar_url ? <img src={post.profiles.avatar_url} alt="avatar" /> : post.profiles?.name?.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{post.profiles?.name} <span className="text-gray-500 font-normal">@{post.profiles?.username}</span></p>
                    <p className="text-xs text-gray-500">{post.profiles?.profession_major}</p>
                  </div>
                </div>

                <div className="cursor-pointer" onClick={() => navigate(`/post/${post.id}`)}>
                    <p className="text-gray-800 text-sm mb-3">{post.content}</p>
                    {post.media_url && (
                        <img src={post.media_url} alt="post media" className="rounded-lg w-full mb-3" />
                    )}
                </div>

                <div className="flex items-center space-x-6 text-gray-500">
                  <button onClick={() => handleLike(post.id, post.likes_count)} className="flex items-center space-x-1 hover:text-red-500">
                    <Heart size={18} />
                    <span className="text-xs">{post.likes_count}</span>
                  </button>
                  <button onClick={() => navigate(`/post/${post.id}`)} className="flex items-center space-x-1 hover:text-blue-500">
                    <MessageCircle size={18} />
                    <span className="text-xs">Comment</span>
                  </button>
                  <button className="flex items-center space-x-1 hover:text-green-500" onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`);
                        toast.success("Link copied!");
                  }}>
                    <Share size={18} />
                    <span className="text-xs">Share</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
        {loading && <div className="text-center py-4 text-gray-400 text-sm">Loading more...</div>}
      </div>
    </Layout>
  );
}
