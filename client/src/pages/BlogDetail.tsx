import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { Calendar, Clock, User, Share2, Link as LinkIcon, Check, ArrowLeft, Edit3, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';
import type { Post } from '../types';
import { estimateReadingTime, formatDate } from '../utils/helpers';
import { updateMetaTags } from '../utils/seo';
import 'highlight.js/styles/github-dark.css';

export const BlogDetail: React.FC = () => {
  const { id_or_slug } = useParams<{ id_or_slug: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchPostDetail = async () => {
      setLoading(true);
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        
        // Pass bearer token if available to bypass draft view restrictions on backend
        const headers: any = {};
        if (user?.token) {
          headers['Authorization'] = `Bearer ${user.token}`;
        }

        const response = await fetch(`${apiUrl}/posts/${id_or_slug}`, { headers });
        if (response.status === 404) {
          toast('Article not found.', 'error');
          navigate('/');
          return;
        } else if (response.status === 403) {
          toast('You do not have permission to view this draft.', 'error');
          navigate('/');
          return;
        }

        if (response.ok) {
          const data = await response.json();
          setPost(data);

          // Update SEO head tags dynamically
          updateMetaTags({
            title: data.title,
            description: data.summary,
            imageUrl: data.image_url || undefined,
            slug: data.slug
          });
        }
      } catch (err) {
        console.error('Error fetching blog detail:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id_or_slug) {
      fetchPostDetail();
    }
  }, [id_or_slug, user]);

  if (loading) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center py-24 gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-brand-500" />
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Loading full article content...</p>
      </div>
    );
  }

  if (!post) return null;

  const readingTime = estimateReadingTime(post.content);
  const formattedDate = formatDate(post.created_at);
  const siteUrl = window.location.href;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(siteUrl);
    setCopied(true);
    toast('Article link copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const isAuthor = user && user.id === post.user_id;
  const isAdmin = user && user.role === 'admin';

  return (
    <div className="flex-grow pb-24">
      {/* Article Header area */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        
        {/* Navigation row */}
        <div className="flex items-center justify-between mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Feed
          </Link>

          {(isAuthor || isAdmin) && (
            <Link
              to={`/posts/${post.id}/edit`}
              className="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
              Edit Article
            </Link>
          )}
        </div>

        {/* Categories, Title & Summary */}
        <header className="space-y-4 mb-8 text-left">
          <div className="flex items-center gap-2">
            <span className="px-3.5 py-1 text-xs font-bold text-brand-500 dark:text-brand-400 bg-brand-500/10 dark:bg-brand-500/20 rounded-full tracking-wide">
              {post.category}
            </span>
            {post.status === 'Draft' && (
              <span className="px-2 py-0.5 text-xs font-semibold text-amber-800 bg-amber-100 rounded-md">
                Draft Mode
              </span>
            )}
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-extrabold text-slate-950 dark:text-white leading-tight">
            {post.title}
          </h1>
          <p className="text-lg sm:text-xl text-slate-500 dark:text-slate-400 font-light leading-relaxed border-l-2 border-brand-500 pl-4 py-1">
            {post.summary}
          </p>
        </header>

        {/* Author Details and Actions bar */}
        <div className="flex flex-wrap items-center justify-between gap-6 border-y border-slate-100 dark:border-slate-900 py-6 mb-10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-750 flex items-center justify-center text-slate-700 dark:text-slate-300 font-semibold font-display">
              <User className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                {post.author?.name || 'Anonymous Builder'}
              </p>
              <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {formattedDate}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {readingTime} min read
                </span>
              </div>
            </div>
          </div>

          {/* Social Share Buttons */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-450 dark:text-slate-500 font-semibold uppercase tracking-wider mr-1.5 flex items-center gap-1.5">
              <Share2 className="w-3.5 h-3.5" />
              Share
            </span>
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(siteUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-500 hover:text-sky-500 transition-colors"
              title="Share on Twitter"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(siteUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-500 hover:text-blue-600 transition-colors"
              title="Share on LinkedIn"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
            </a>
            <button
              onClick={handleCopyLink}
              className="p-2 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-500 hover:text-brand-500 transition-colors flex items-center justify-center"
              title="Copy link to clipboard"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <LinkIcon className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Featured Image */}
        {post.image_url && (
          <div className="rounded-3xl overflow-hidden aspect-[16/9] mb-12 shadow-md bg-slate-100 dark:bg-slate-900">
            <img
              src={post.image_url}
              alt={post.title}
              className="object-cover w-full h-full"
            />
          </div>
        )}

        {/* Prose Markdown Body Content */}
        <section className="prose prose-slate dark:prose-invert prose-headings:font-display prose-headings:font-bold prose-a:text-brand-500 prose-img:rounded-2xl max-w-none text-left leading-relaxed">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight]}
          >
            {post.content}
          </ReactMarkdown>
        </section>

        {/* Tag Pills Footer */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-12 pt-8 border-t border-slate-100 dark:border-slate-900 justify-start">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 text-xs font-semibold rounded-lg"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

      </article>
    </div>
  );
};
export default BlogDetail;
