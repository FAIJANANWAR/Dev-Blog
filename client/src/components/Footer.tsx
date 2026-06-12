import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-900 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Pitch */}
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2 text-xl font-display font-bold text-slate-900 dark:text-white">
              <div className="bg-brand-500 text-white p-1.5 rounded-lg">
                <BookOpen className="w-5 h-5" />
              </div>
              <span>DevBlog</span>
            </Link>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">
              A premium blogging platform dedicated to delivering high-quality tech articles, developer tutorials, and industry insights written by builders, for builders.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-4">Navigation</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-slate-500 dark:text-slate-400 hover:text-brand-500 dark:hover:text-brand-400 transition-colors">
                  Home Feed
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-slate-500 dark:text-slate-400 hover:text-brand-500 dark:hover:text-brand-400 transition-colors">
                  Sign In
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-slate-500 dark:text-slate-400 hover:text-brand-500 dark:hover:text-brand-400 transition-colors">
                  Create Account
                </Link>
              </li>
            </ul>
          </div>

          {/* Developer Tools */}
          <div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-4">Tech Stack</h4>
            <div className="flex flex-wrap gap-2">
              {['React', 'TypeScript', 'Tailwind CSS', 'Vite', 'Express', 'Supabase'].map((tech) => (
                <span
                  key={tech}
                  className="px-2.5 py-1 text-xs font-medium bg-slate-50 dark:bg-slate-900 text-slate-550 dark:text-slate-400 rounded-md border border-slate-100 dark:border-slate-900"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 dark:border-slate-900 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400 dark:text-slate-500">
          <p>© {new Date().getFullYear()} DevBlog Platform. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="/sitemap.xml" className="hover:underline">Sitemap</a>
            <a href="/robots.txt" className="hover:underline">Robots</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
export default Footer;
