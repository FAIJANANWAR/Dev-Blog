import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';
import { 
  FileText, CheckCircle2, FileEdit, Trash2, Plus, 
  Loader2, AlertTriangle, ArrowUpRight 
} from 'lucide-react';
import type { Post } from '../types';
import { formatDate } from '../utils/helpers';

export const Dashboard: React.FC = () => {
  const { user, getAuthHeaders } = useAuth();
  const { toast } = useToast();
  
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Delete Modal state
  const [postToDelete, setPostToDelete] = useState<Post | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [forceDelete, setForceDelete] = useState(false);

  const fetchMyPosts = async () => {
    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      
      const response = await fetch(`${apiUrl}/posts/my-posts`, {
        headers: getAuthHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts);
      } else {
        console.error('Failed to load user posts');
        toast('Failed to load articles list.', 'error');
      }
    } catch (err) {
      console.error('Network error fetching dashboard posts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyPosts();
  }, [user]);

  // Aggregate stats
  const totalPosts = posts.length;
  const publishedPosts = posts.filter(p => p.status === 'Published').length;
  const draftPosts = posts.filter(p => p.status === 'Draft').length;

  const handleDeleteClick = (post: Post) => {
    setPostToDelete(post);
    setForceDelete(false); // reset
  };

  const handleConfirmDelete = async () => {
    if (!postToDelete) return;
    setDeleteLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      
      // Determine delete mode (soft vs hard/force for admin)
      const queryParams = forceDelete ? '?force=true' : '';
      
      const response = await fetch(`${apiUrl}/posts/${postToDelete.id}${queryParams}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      const data = await response.json();

      if (response.ok) {
        toast(
          `Article successfully ${forceDelete ? 'permanently deleted' : 'soft-deleted'}!`,
          'success'
        );
        setPostToDelete(null);
        // Refresh local posts list
        fetchMyPosts();
      } else {
        toast(data.error || 'Failed to delete article.', 'error');
      }
    } catch (err) {
      console.error('Delete post error:', err);
      toast('Network error deleting article.', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="flex-grow pb-24">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 text-left">
        
        {/* Header Title Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-display font-extrabold text-slate-900 dark:text-white">Dashboard</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              Manage your publications, view analytics, and draft new contents.
            </p>
          </div>
          <Link
            to="/posts/new"
            className="inline-flex items-center justify-center gap-1.5 bg-brand-500 hover:bg-brand-600 text-white font-semibold px-5 py-3 rounded-xl shadow-lg shadow-brand-500/10 hover:shadow-brand-500/20 hover-lift duration-250 transition-all cursor-pointer text-sm"
          >
            <Plus className="w-4 h-4" />
            Write New Post
          </Link>
        </div>

        {/* Aggregate Stats Section */}
        {loading ? (
          /* Stats skeletons */
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
            {[1, 2, 3].map(n => (
              <div key={n} className="card-gradient rounded-2xl p-6 h-28 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
            {/* Total Posts */}
            <div className="card-gradient rounded-2xl p-6 flex items-center justify-between shadow-sm">
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase text-slate-455 dark:text-slate-400 tracking-wider">Total Posts</p>
                <p className="text-3xl font-display font-extrabold text-slate-900 dark:text-white">{totalPosts}</p>
              </div>
              <div className="p-3 bg-brand-500/10 dark:bg-brand-500/20 text-brand-500 rounded-xl">
                <FileText className="w-6 h-6" />
              </div>
            </div>

            {/* Published Posts */}
            <div className="card-gradient rounded-2xl p-6 flex items-center justify-between shadow-sm">
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase text-slate-455 dark:text-slate-400 tracking-wider">Published</p>
                <p className="text-3xl font-display font-extrabold text-slate-900 dark:text-white">{publishedPosts}</p>
              </div>
              <div className="p-3 bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-500 rounded-xl">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>

            {/* Draft Posts */}
            <div className="card-gradient rounded-2xl p-6 flex items-center justify-between shadow-sm">
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase text-slate-455 dark:text-slate-400 tracking-wider">Drafts</p>
                <p className="text-3xl font-display font-extrabold text-slate-900 dark:text-white">{draftPosts}</p>
              </div>
              <div className="p-3 bg-amber-500/10 dark:bg-amber-500/20 text-amber-500 rounded-xl">
                <FileEdit className="w-6 h-6" />
              </div>
            </div>
          </div>
        )}

        {/* Content Table section */}
        <section className="card-gradient rounded-3xl overflow-hidden shadow-sm">
          <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-900">
            <h2 className="text-lg font-bold font-display text-slate-900 dark:text-white">Your Publications</h2>
          </div>

          {loading ? (
            /* Table Loading Skeletons */
            <div className="p-6 space-y-4">
              {[1, 2, 3].map(n => (
                <div key={n} className="flex justify-between items-center h-10 animate-pulse bg-slate-50 dark:bg-slate-900/50 rounded-lg px-4" />
              ))}
            </div>
          ) : posts.length === 0 ? (
            /* Dashboard Empty State */
            <div className="p-16 text-center max-w-md mx-auto flex flex-col items-center gap-6">
              <div className="bg-slate-100 dark:bg-slate-900 text-slate-400 dark:text-slate-500 p-4 rounded-2xl">
                <FileText className="w-12 h-12" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold font-display text-slate-900 dark:text-white">No Articles Yet</h3>
                <p className="text-slate-550 dark:text-slate-400 text-sm leading-relaxed">
                  You haven't written any posts yet. Start sharing your expertise with the developer community today!
                </p>
              </div>
              <Link
                to="/posts/new"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-sm font-semibold shadow-md shadow-brand-500/10 cursor-pointer transition-colors"
              >
                Write Your First Post
              </Link>
            </div>
          ) : (
            /* Posts Table */
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-900 text-left text-xs font-bold uppercase text-slate-455 dark:text-slate-400 tracking-wider">
                    <th className="px-6 py-4">Title</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Created Date</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-900 text-sm text-slate-700 dark:text-slate-300">
                  {posts.map((post) => (
                    <tr key={post.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-950/20 transition-colors">
                      {/* Title & Preview Link */}
                      <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white max-w-xs sm:max-w-md">
                        <div className="flex items-center gap-2">
                          <span className="truncate">{post.title}</span>
                          {post.status === 'Published' && (
                            <Link
                              to={`/posts/${post.slug || post.id}`}
                              className="text-slate-400 hover:text-brand-500 transition-colors shrink-0"
                              title="View live page"
                            >
                              <ArrowUpRight className="w-4 h-4" />
                            </Link>
                          )}
                        </div>
                      </td>
                      
                      {/* Category */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-850 text-slate-650 dark:text-slate-400">
                          {post.category}
                        </span>
                      </td>

                      {/* Status Badge */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg ${
                            post.status === 'Published'
                              ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300'
                              : 'bg-amber-50 dark:bg-amber-955/30 text-amber-700 dark:text-amber-300'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${post.status === 'Published' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                          {post.status}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="px-6 py-4 whitespace-nowrap text-slate-500 dark:text-slate-400">
                        {formatDate(post.created_at)}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/posts/${post.id}/edit`}
                            className="p-1.5 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-500 hover:text-brand-500 dark:hover:text-slate-350 transition-colors flex items-center justify-center"
                            title="Edit Post"
                          >
                            <FileEdit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDeleteClick(post)}
                            className="p-1.5 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 text-slate-500 hover:text-rose-600 dark:hover:text-slate-350 transition-colors flex items-center justify-center"
                            title="Delete Post"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

      </main>

      {/* Delete Confirmation Modal Overlay */}
      {postToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 backdrop-blur-sm px-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl w-full max-w-md shadow-2xl space-y-6 text-left">
            
            {/* Modal Header */}
            <div className="flex items-start gap-4">
              <div className="bg-rose-50 dark:bg-rose-950/30 text-rose-650 dark:text-rose-400 p-3 rounded-2xl shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold font-display text-slate-900 dark:text-white">Delete Article?</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  Are you sure you want to delete <span className="font-semibold text-slate-800 dark:text-slate-200">"{postToDelete.title}"</span>? 
                  This will remove the post from your feed.
                </p>
              </div>
            </div>

            {/* Special controls for admin role */}
            {user?.role === 'admin' && (
              <div className="bg-slate-50 dark:bg-slate-950/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-850 space-y-2">
                <span className="text-xs font-bold uppercase text-slate-455 dark:text-slate-400 tracking-wide block">
                  Admin Delete Controls
                </span>
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={forceDelete}
                    onChange={(e) => setForceDelete(e.target.checked)}
                    className="w-4 h-4 rounded text-brand-500 border-slate-300 focus:ring-brand-500"
                  />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Permanently delete (skip soft-delete recycle bin)
                  </span>
                </label>
              </div>
            )}

            {/* Modal Buttons */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setPostToDelete(null)}
                disabled={deleteLoading}
                className="px-4 py-2.5 border border-slate-200 dark:border-slate-850 text-slate-650 dark:text-slate-350 text-sm font-semibold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deleteLoading}
                className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 disabled:bg-rose-400 text-white font-bold py-2.5 px-4 rounded-xl shadow-md text-sm transition-all"
              >
                {deleteLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete Post
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
export default Dashboard;
