import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';
import { RichTextEditor } from '../components/RichTextEditor';
import { ArrowLeft, Save, Globe, Loader2 } from 'lucide-react';

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

export const CreatePost: React.FC = () => {
  const { getAuthHeaders } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [tagsInput, setTagsInput] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState<'Draft' | 'Published'>('Draft');
  const [loading, setLoading] = useState(false);

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

    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      
      // Parse tags (comma separated strings)
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

      const response = await fetch(`${apiUrl}/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify(postData)
      });

      const data = await response.json();

      if (response.ok) {
        toast(`Article successfully ${status === 'Published' ? 'published' : 'saved as draft'}!`, 'success');
        // Clear editor auto-save cache
        localStorage.removeItem('blog_draft');
        navigate('/dashboard');
      } else {
        toast(data.error || 'Failed to create post. Please try again.', 'error');
      }
    } catch (err) {
      console.error('Error creating post:', err);
      toast('Network error creating article. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-grow pb-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        
        {/* Back Link Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </div>

        {/* Title Section */}
        <div className="mb-10 text-left">
          <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white">Create New Post</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Write using our split-screen editor. Save as a draft or publish immediately.
          </p>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="space-y-6 text-left">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Left form properties Column */}
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

            {/* Right form parameters Column */}
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

          {/* Markdown editor component link */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-550 dark:text-slate-400 mb-2">
              Article Content * (Markdown)
            </label>
            <RichTextEditor
              value={content}
              onChange={setContent}
              storageKey="blog_draft"
              placeholder="Use markdown to structure your article! Use code blocks, headers, blockquotes, and lists."
            />
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap items-center justify-between border-t border-slate-150 dark:border-slate-850 pt-6 gap-4">
            {/* Status selector */}
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

            {/* Submission buttons */}
            <div className="flex gap-3">
              <Link
                to="/dashboard"
                className="px-5 py-3 border border-slate-200 dark:border-slate-800 text-slate-750 dark:text-slate-300 font-semibold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors text-sm"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 disabled:bg-brand-400 text-white font-bold py-3 px-5 rounded-xl shadow-lg shadow-brand-500/10 hover:shadow-brand-500/20 disabled:shadow-none transition-all hover-lift duration-250 cursor-pointer text-sm"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : status === 'Published' ? (
                  <>
                    <Globe className="w-4 h-4" />
                    Publish Post
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
export default CreatePost;
