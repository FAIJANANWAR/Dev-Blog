import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Calendar, User, ArrowRight } from 'lucide-react';
import type { Post } from '../types';
import { estimateReadingTime, formatDate } from '../utils/helpers';

interface BlogCardProps {
  post: Post;
}

export const BlogCard: React.FC<BlogCardProps> = ({ post }) => {
  const readingTime = estimateReadingTime(post.content);
  const formattedDate = formatDate(post.created_at);

  // Fallback high-quality image if post image is missing or invalid
  const fallbackImage = 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=800&auto=format&fit=crop';
  const coverImage = post.image_url || fallbackImage;

  // Max 150 characters summary truncation
  const displaySummary =
    post.summary.length > 150 ? `${post.summary.substring(0, 147)}...` : post.summary;

  return (
    <article className="group flex flex-col h-full card-gradient rounded-2xl overflow-hidden hover-lift duration-300">
      {/* Aspect ratio container for featured image */}
      <div className="relative overflow-hidden aspect-[16/10] bg-slate-100 dark:bg-slate-900">
        <img
          src={coverImage}
          alt={post.title}
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />
        <div className="absolute top-3 left-3">
          <span className="px-3 py-1 text-xs font-semibold text-white bg-slate-950/60 backdrop-blur-md border border-white/10 rounded-full tracking-wide">
            {post.category}
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="flex flex-col flex-1 p-6">
        {/* Meta Row */}
        <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mb-3 font-medium">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {formattedDate}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {readingTime} min read
          </span>
        </div>

        {/* Title */}
        <h3 className="text-xl font-display font-bold text-slate-950 dark:text-white mb-2 line-clamp-2 leading-snug group-hover:text-brand-500 dark:group-hover:text-brand-400 transition-colors">
          <Link to={`/posts/${post.slug || post.id}`}>{post.title}</Link>
        </h3>

        {/* Summary */}
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 line-clamp-3 leading-relaxed flex-1">
          {displaySummary}
        </p>

        {/* Card Footer: Author & Read More */}
        <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-900 pt-4 mt-auto">
          <div className="flex items-center gap-2 max-w-[60%]">
            <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-750 text-slate-650 dark:text-slate-355 shrink-0">
              <User className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-semibold text-slate-755 dark:text-slate-300 truncate">
              {post.author?.name || 'Anonymous'}
            </span>
          </div>

          <Link
            to={`/posts/${post.slug || post.id}`}
            className="inline-flex items-center gap-1 text-xs font-bold text-brand-500 dark:text-brand-400 hover:text-brand-650 dark:hover:text-brand-300 group-hover:gap-1.5 transition-all"
          >
            Read More
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </article>
  );
};
export default BlogCard;
