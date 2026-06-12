import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';
import { RichTextEditor } from '../components/RichTextEditor';
import { ArrowLeft, Save, Globe, Loader2, AlertCircle } from 'lucide-react';

const CATEGORIES = [
  'Technology',
  'Web Development',
  'AI & Machine Learning',
  'Programming',
  'Startups',
  'Business',
  'Career',
  'Productivity',
  'Design',
  'Lifestyle'
];

export const EditPost: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, getAuthHeaders } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [tagsInput, setTagsInput] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState<'Draft' | 'Published'>('Draft');
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorState, setErrorState] = useState<string | null>(null);

  useEffect(() => {
    const fetchPostData = async () => {
      setLoading(true);
      setErrorState(null);
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        
        const response = await fetch(`${apiUrl}/posts/${id}`, {
          headers: getAuthHeaders()
        });

        if (response.status === 404) {
          setErrorState('Article not found.');
          return;
        } else if (response.status === 403) {
          setErrorState('Access denied. You do not own this article.');
          return;
        }

        if (response.ok) {
          const post = await response.json();

          // Double check client side ownership too just in case
          const isOwner = user && user.id === post.user_id;
          const isAdmin = user && user.role === 'admin';
          if (!isOwner && !isAdmin) {
            setErrorState('Access denied: Unauthorized access.');
            return;
          }

          setTitle(post.title);
          setSummary(post.summary);
          setImageUrl(post.image_url || '');
          setCategory(post.category);
          setTagsInput(post.tags ? post.tags.join(', ') : '');
          setContent(post.content);
          setStatus(post.status);
        } else {
          setErrorState('Failed to fetch article details.');
        }
      } catch (err) {
        console.error('Fetch post error:', err);
        setErrorState('Network error fetching article.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPostData();
    }
  }, [id, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Validation checks
    if (!title.trim()) {
      toast('Title is required.', 'error');
      return;
    }
    if (!summary.trim()) {
      toast('Summary is required.', 'error');
      return;
    }
    if (summary.length > 250) {
      toast('Summary cannot exceed 250 characters.', 'error');
      return;
    }
    if (!content.trim()) {
      toast('Article content cannot be empty.', 'error');
      return;
    }

    setSaving(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      
      const tags = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t !== '');

      const postData = {
        title,
        summary,
        image_url: imageUrl.trim() || undefined,
        category,
        tags,
        content,
        status
      };

      const response = await fetch(`${apiUrl}/posts/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify(postData)
      });

      const data = await response.json();

      if (response.ok) {
        toast('Article changes saved successfully!', 'success');
        // Clear local storage edit auto-saves if we use custom edit storage keys
        localStorage.removeItem(`edit_draft_${id}`);
        navigate('/dashboard');
      } else {
        toast(data.error || 'Failed to update article.', 'error');
      }
    } catch (err) {
      console.error('Update post error:', err);
      toast('Network error updating article.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center py-24 gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-brand-500" />
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Loading article details...</p>
      </div>
    );
  }

  if (errorState) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center py-24 px-4">
        <div className="card-gradient p-8 rounded-3xl text-center max-w-md w-full shadow-lg space-y-4">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-xl font-bold font-display text-slate-900 dark:text-white">Cannot Edit Post</h2>
          <p className="text-sm text-slate-500 dark:text-slate-455">{errorState}</p>
          <Link
            to="/dashboard"
            className="inline-block w-full bg-brand-500 hover:bg-brand-600 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-grow pb-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        
        {/* Back Link */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </div>

        {/* Header */}
        <div className="mb-10 text-left">
          <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white">Edit Post</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Update your article properties and content.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6 text-left">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Left Col */}
            <div className="md:col-span-2 space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-2">
                  Article Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Building an Autonomous AI Coding Assistant"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-2">
                  Short Summary * ({summary.length}/250 chars)
                </label>
                <textarea
                  required
                  rows={2}
                  maxLength={250}
                  placeholder="Summarize your article in 150-250 characters..."
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-850 dark:text-slate-100 resize-none text-sm"
                />
              </div>
            </div>

            {/* Right Col */}
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-2">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800 dark:text-slate-100 text-sm font-medium"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-2">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="AI, Code, React, Vite"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800 dark:text-slate-100 text-sm"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-2">
              Featured Cover Image URL
            </label>
            <input
              type="url"
              placeholder="https://images.unsplash.com/photo-1507238691740-187a5b1d37b8"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800 dark:text-slate-100 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-550 dark:text-slate-400 mb-2">
              Article Content (Markdown)
            </label>
            <RichTextEditor
              value={content}
              onChange={setContent}
              storageKey={`edit_draft_${id}`}
              placeholder="Update article content using Markdown..."
            />
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center justify-between border-t border-slate-150 dark:border-slate-850 pt-6 gap-4">
            {/* Status */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">Post Status:</span>
              <div className="flex bg-slate-100 dark:bg-slate-850 p-0.5 rounded-lg">
                <button
                  type="button"
                  onClick={() => setStatus('Draft')}
                  className={`px-4 py-2 rounded-md text-xs font-semibold transition-all ${
                    status === 'Draft'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm font-bold'
                      : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-350'
                  }`}
                >
                  Save as Draft
                </button>
                <button
                  type="button"
                  onClick={() => setStatus('Published')}
                  className={`px-4 py-2 rounded-md text-xs font-semibold transition-all ${
                    status === 'Published'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm font-bold'
                      : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-350'
                  }`}
                >
                  Publish Now
                </button>
              </div>
            </div>

            {/* Submit */}
            <div className="flex gap-3">
              <Link
                to="/dashboard"
                className="px-5 py-3 border border-slate-200 dark:border-slate-800 text-slate-750 dark:text-slate-300 font-semibold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-855 transition-colors text-sm"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 disabled:bg-brand-400 text-white font-bold py-3 px-5 rounded-xl shadow-lg shadow-brand-500/10 hover:shadow-brand-500/20 disabled:shadow-none transition-all hover-lift duration-250 cursor-pointer text-sm"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving Changes...
                  </>
                ) : status === 'Published' ? (
                  <>
                    <Globe className="w-4 h-4" />
                    Save & Publish
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Draft
                  </>
                )}
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};
export default EditPost;
