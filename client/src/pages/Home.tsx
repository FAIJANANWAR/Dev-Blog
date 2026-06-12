import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, RotateCcw, SearchX } from 'lucide-react';
import { BlogCard } from '../components/BlogCard';
import type { Post, PaginationData } from '../types';

const CATEGORIES = [
  'All',
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

export const Home: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationData>({
    totalItems: 0,
    totalPages: 1,
    currentPage: 1,
    limit: 6
  });

  // Read search & category parameters from URL to support bookmarking/SEO friendliness
  const currentCategory = searchParams.get('category') || 'All';
  const currentSearch = searchParams.get('search') || '';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  const [searchInput, setSearchInput] = useState(currentSearch);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const queryParams = new URLSearchParams({
        category: currentCategory,
        search: currentSearch,
        page: currentPage.toString(),
        limit: '6'
      });

      const response = await fetch(`${apiUrl}/posts?${queryParams.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts);
        setPagination(data.pagination);
      } else {
        console.error('Failed to fetch posts');
      }
    } catch (err) {
      console.error('Network error fetching posts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
    // Sync search input if query changes externally
    setSearchInput(currentSearch);
  }, [currentCategory, currentSearch, currentPage]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams({
      category: currentCategory,
      search: searchInput,
      page: '1' // reset page on search
    });
  };

  const handleCategorySelect = (category: string) => {
    setSearchParams({
      category,
      search: currentSearch,
      page: '1'
    });
  };

  const handlePageSelect = (page: number) => {
    if (page < 1 || page > pagination.totalPages) return;
    setSearchParams({
      category: currentCategory,
      search: currentSearch,
      page: page.toString()
    });
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const handleResetFilters = () => {
    setSearchInput('');
    setSearchParams({
      category: 'All',
      search: '',
      page: '1'
    });
  };

  return (
    <div className="flex-grow pb-16">
      
      {/* Sleek SaaS-Style Hero Banner */}
      <header className="relative py-20 overflow-hidden bg-slate-900 text-white rounded-b-[2.5rem] shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-tr from-brand-950 via-slate-900 to-indigo-950/70" />
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-500/20 text-brand-300 border border-brand-500/30 rounded-full text-xs font-semibold uppercase tracking-wider">
            Explore the developer network
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-extrabold tracking-tight max-w-3xl mx-auto leading-tight">
            Knowledge Hub for Modern Builders
          </h1>
          <p className="text-slate-300 text-base sm:text-lg md:text-xl max-w-2xl mx-auto font-light leading-relaxed">
            Read insightful articles on web development, system architecture, programming habits, and artificial intelligence.
          </p>

          {/* Core Search bar */}
          <form onSubmit={handleSearchSubmit} className="max-w-xl mx-auto flex items-center p-1.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg shadow-black/10">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 w-5 h-5 text-slate-300" />
              <input
                type="text"
                placeholder="Search articles by title or summary..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full bg-transparent pl-10 pr-4 py-2 text-white placeholder-slate-350 focus:outline-none text-sm"
              />
            </div>
            <button
              type="submit"
              className="bg-brand-500 hover:bg-brand-650 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all shadow-md shadow-brand-500/20 cursor-pointer"
            >
              Search
            </button>
          </form>
        </div>
      </header>

      {/* Main Grid View section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        {/* Category Pills Navigation */}
        <section className="mb-10">
          <div className="flex items-center justify-between gap-4 mb-4">
            <h2 className="text-xs font-bold uppercase text-slate-550 dark:text-slate-400 tracking-wider">
              Browse by Category
            </h2>
            {currentSearch && (
              <span className="text-xs text-slate-500">
                Found {pagination.totalItems} result(s) for "{currentSearch}"
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategorySelect(cat)}
                className={`px-4.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer border ${
                  currentCategory === cat
                    ? 'bg-brand-500 text-white border-brand-500 shadow-md shadow-brand-500/10'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-350 border-slate-100 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </section>

        {/* Blog Post List / Loading Skeletons / Empty State */}
        <section>
          {loading ? (
            /* Loading Grid Skeletons */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <div key={num} className="card-gradient rounded-2xl overflow-hidden flex flex-col h-[400px] animate-pulse">
                  <div className="bg-slate-200 dark:bg-slate-800 aspect-[16/10]" />
                  <div className="p-6 flex-1 flex flex-col gap-3 justify-between">
                    <div className="space-y-3">
                      <div className="h-4 bg-slate-200 dark:bg-slate-800 w-1/3 rounded-md" />
                      <div className="h-6 bg-slate-200 dark:bg-slate-800 w-3/4 rounded-md" />
                      <div className="h-4 bg-slate-200 dark:bg-slate-800 w-full rounded-md" />
                      <div className="h-4 bg-slate-200 dark:bg-slate-800 w-2/3 rounded-md" />
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-850 mt-auto">
                      <div className="h-4 bg-slate-200 dark:bg-slate-800 w-1/4 rounded-md" />
                      <div className="h-4 bg-slate-200 dark:bg-slate-800 w-1/5 rounded-md" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : posts.length === 0 ? (
            /* Empty State Container */
            <div className="card-gradient rounded-3xl p-16 text-center max-w-lg mx-auto flex flex-col items-center gap-6 shadow-md mt-6">
              <div className="bg-slate-100 dark:bg-slate-900 text-slate-400 dark:text-slate-500 p-4 rounded-2xl">
                <SearchX className="w-12 h-12" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold font-display text-slate-900 dark:text-white">No Articles Found</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                  We couldn't find any published posts in "{currentCategory}" matching your search criteria. Try updating your filters.
                </p>
              </div>
              <button
                onClick={handleResetFilters}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-500 hover:bg-brand-650 text-white rounded-xl text-sm font-semibold shadow-md shadow-brand-500/10 cursor-pointer transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Reset Filters
              </button>
            </div>
          ) : (
            /* Post Cards Feed */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </section>

        {/* Pagination Section controls */}
        {posts.length > 0 && pagination.totalPages > 1 && (
          <section className="flex items-center justify-center gap-2 mt-16 border-t border-slate-100 dark:border-slate-900 pt-8">
            <button
              onClick={() => handlePageSelect(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
              className="px-4 py-2 border border-slate-150 dark:border-slate-850 rounded-xl text-xs font-semibold text-slate-650 dark:text-slate-350 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageSelect(page)}
                className={`w-9 h-9 flex items-center justify-center rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  pagination.currentPage === page
                    ? 'bg-brand-500 text-white border-brand-500 shadow-md shadow-brand-500/10'
                    : 'bg-white dark:bg-slate-900 text-slate-650 dark:text-slate-350 border-slate-150 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => handlePageSelect(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
              className="px-4 py-2 border border-slate-150 dark:border-slate-850 rounded-xl text-xs font-semibold text-slate-650 dark:text-slate-350 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors disabled:cursor-not-allowed"
            >
              Next
            </button>
          </section>
        )}
      </main>
    </div>
  );
};
export default Home;
