import { Response, Router } from 'express';
import { z } from 'zod';
import { authenticate, optionalAuthenticate, AuthenticatedRequest } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { supabaseAdmin } from '../services/db';

const router = Router();

const VALID_CATEGORIES = [
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

// Helper to generate a clean URL-friendly slug
function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
}

// Ensure unique slug helper
async function generateUniqueSlug(title: string): Promise<string> {
  const baseSlug = slugify(title) || 'untitled';
  let slug = baseSlug;
  let exists = true;
  let counter = 0;

  while (exists) {
    const checkSlug = counter === 0 ? slug : `${baseSlug}-${counter}`;
    const { data, error } = await supabaseAdmin
      .from('posts')
      .select('id')
      .eq('slug', checkSlug)
      .maybeSingle();

    if (!data && !error) {
      slug = checkSlug;
      exists = false;
    } else {
      counter++;
      // Guard against infinite loop
      if (counter > 100) {
        slug = `${baseSlug}-${Math.random().toString(36).substring(2, 7)}`;
        break;
      }
    }
  }
  return slug;
}

// Zod validation schemas
const postCreateSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title cannot exceed 100 characters'),
  summary: z.string().min(1, 'Summary is required').max(250, 'Summary cannot exceed 250 characters'),
  content: z.string().min(1, 'Content is required'),
  image_url: z.string().url('Invalid image URL').optional().or(z.literal('')),
  category: z.string().refine(val => VALID_CATEGORIES.includes(val), {
    message: `Category must be one of: ${VALID_CATEGORIES.join(', ')}`
  }),
  tags: z.array(z.string()).optional().default([]),
  status: z.enum(['Draft', 'Published']).optional().default('Draft'),
});

const postUpdateSchema = postCreateSchema.partial();

/**
 * GET /api/posts - Fetch published posts
 * Query filters: ?category=Technology&search=javascript&page=1&limit=6
 */
router.get('/', async (req, res, next) => {
  try {
    const { category, search, page = '1', limit = '6' } = req.query;
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const offset = (pageNum - 1) * limitNum;

    // Start building query
    let query = supabaseAdmin
      .from('posts')
      .select(`
        id, title, slug, summary, content, image_url, category, tags, status, created_at, updated_at,
        author:users(id, name, email)
      `, { count: 'exact' })
      .eq('status', 'Published')
      .is('deleted_at', null);

    // Category filter
    if (category && category !== 'All') {
      query = query.eq('category', category as string);
    }

    // Search filter
    if (search) {
      query = query.or(`title.ilike.%${search}%,summary.ilike.%${search}%`);
    }

    // Order and paginate
    const { data: posts, count, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limitNum - 1);

    if (error) throw error;

    const totalCount = count || 0;
    const totalPages = Math.ceil(totalCount / limitNum);

    return res.status(200).json({
      posts,
      pagination: {
        totalItems: totalCount,
        totalPages,
        currentPage: pageNum,
        limit: limitNum
      }
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/my-posts - Fetch all posts written by the current logged-in user
 */
router.get('/my-posts', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const { data: posts, error } = await supabaseAdmin
      .from('posts')
      .select(`
        id, title, slug, summary, content, image_url, category, tags, status, created_at, updated_at
      `)
      .eq('user_id', userId)
      .is('deleted_at', null) // Only return non-soft-deleted posts in dashboard
      .order('created_at', { ascending: false });

    if (error) throw error;

    return res.status(200).json({ posts });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/posts/:id_or_slug - Fetch single post detail
 */
router.get('/:id_or_slug', optionalAuthenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id_or_slug } = req.params;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id_or_slug);

    // Fetch the post
    let query = supabaseAdmin
      .from('posts')
      .select(`
        id, user_id, title, slug, summary, content, image_url, category, tags, status, deleted_at, created_at, updated_at,
        author:users(id, name, email)
      `);

    if (isUuid) {
      query = query.eq('id', id_or_slug);
    } else {
      query = query.eq('slug', id_or_slug);
    }

    const { data: post, error } = await query.maybeSingle();

    if (error) throw error;
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Access checks:
    // If post is soft-deleted, block public access completely.
    if (post.deleted_at !== null) {
      const isOwner = req.user && req.user.id === post.user_id;
      const isAdmin = req.user && req.user.role === 'admin';
      if (!isOwner && !isAdmin) {
        return res.status(404).json({ error: 'Post not found' });
      }
    }

    // If post is Draft, only author or admin can view it.
    if (post.status === 'Draft') {
      const isOwner = req.user && req.user.id === post.user_id;
      const isAdmin = req.user && req.user.role === 'admin';
      if (!isOwner && !isAdmin) {
        return res.status(403).json({ error: 'Access denied: This post is a draft.' });
      }
    }

    return res.status(200).json(post);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/posts - Create post
 */
router.post('/', authenticate, validateBody(postCreateSchema), async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const { title, summary, content, image_url, category, tags, status } = req.body;
    
    // Generate a unique URL slug
    const slug = await generateUniqueSlug(title);

    const { data: newPost, error } = await supabaseAdmin
      .from('posts')
      .insert({
        user_id: userId,
        title,
        slug,
        summary,
        content,
        image_url: image_url || null,
        category,
        tags: tags || [],
        status: status || 'Draft'
      })
      .select(`
        id, title, slug, summary, content, image_url, category, tags, status, created_at, updated_at,
        author:users(id, name, email)
      `)
      .single();

    if (error) throw error;

    return res.status(201).json(newPost);
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/posts/:id - Edit post
 */
router.put('/:id', authenticate, validateBody(postUpdateSchema), async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const isUserAdmin = req.user!.role === 'admin';

    // 1. Ownership check: Fetch the post first
    const { data: post, error: fetchError } = await supabaseAdmin
      .from('posts')
      .select('user_id, title, slug')
      .eq('id', id)
      .maybeSingle();

    if (fetchError) throw fetchError;
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Only owner or admin can edit
    if (post.user_id !== userId && !isUserAdmin) {
      return res.status(403).json({ error: 'Forbidden: You do not own this post' });
    }

    // 2. Prepare update payload
    const updateData: any = { ...req.body };
    
    // If title is changing, generate a new unique slug
    if (updateData.title && updateData.title !== post.title) {
      updateData.slug = await generateUniqueSlug(updateData.title);
    }

    const { data: updatedPost, error } = await supabaseAdmin
      .from('posts')
      .update(updateData)
      .eq('id', id)
      .select(`
        id, title, slug, summary, content, image_url, category, tags, status, created_at, updated_at,
        author:users(id, name, email)
      `)
      .single();

    if (error) throw error;

    return res.status(200).json(updatedPost);
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/posts/:id - Delete post
 * Supports soft-delete by default, and admin force-delete via query param ?force=true
 */
router.delete('/:id', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const isUserAdmin = req.user!.role === 'admin';
    const forceDelete = req.query.force === 'true';

    // 1. Fetch the post for ownership checks
    const { data: post, error: fetchError } = await supabaseAdmin
      .from('posts')
      .select('user_id')
      .eq('id', id)
      .maybeSingle();

    if (fetchError) throw fetchError;
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Only owner or admin can delete
    if (post.user_id !== userId && !isUserAdmin) {
      return res.status(403).json({ error: 'Forbidden: You do not own this post' });
    }

    // 2. Perform Delete
    if (forceDelete) {
      if (!isUserAdmin) {
        return res.status(403).json({ error: 'Forbidden: Only administrators can force-delete posts' });
      }

      // Hard physical delete
      const { error } = await supabaseAdmin
        .from('posts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return res.status(200).json({ message: 'Post permanently deleted from system' });
    } else {
      // Soft delete: set deleted_at timestamp
      const { error } = await supabaseAdmin
        .from('posts')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;

      return res.status(200).json({ message: 'Post successfully soft-deleted' });
    }
  } catch (err) {
    next(err);
  }
});

export default router;
