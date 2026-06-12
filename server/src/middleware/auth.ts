import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../services/db';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
    role: 'author' | 'admin';
    token: string;
  };
}

/**
 * Strict authentication middleware.
 * Rejects requests that do not provide a valid Supabase JWT.
 */
export async function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split(' ')[1];
    
    // Verify token with Supabase Auth
    const { data: { user: authUser }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !authUser) {
      return res.status(401).json({ error: 'Unauthorized: Invalid session token' });
    }

    // Retrieve user profile metadata & role
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('users')
      .select('name, email, role')
      .eq('id', authUser.id)
      .single();

    if (profileError || !profile) {
      return res.status(401).json({ error: 'Unauthorized: User profile does not exist in local database' });
    }

    req.user = {
      id: authUser.id,
      email: authUser.email || profile.email,
      name: profile.name,
      role: profile.role as 'author' | 'admin',
      token
    };

    next();
  } catch (error) {
    console.error('Authentication Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

/**
 * Optional authentication middleware.
 * Resolves user credentials if a token is present, but permits anonymous access.
 */
export async function optionalAuthenticate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.split(' ')[1];
    const { data: { user: authUser } } = await supabaseAdmin.auth.getUser(token);

    if (authUser) {
      const { data: profile } = await supabaseAdmin
        .from('users')
        .select('name, email, role')
        .eq('id', authUser.id)
        .single();

      if (profile) {
        req.user = {
          id: authUser.id,
          email: authUser.email || profile.email,
          name: profile.name,
          role: profile.role as 'author' | 'admin',
          token
        };
      }
    }
    next();
  } catch (error) {
    // Fail silently for optional auth; treat as public visitor
    next();
  }
}

/**
 * Strict authorization guard.
 * Restricts access to users with the 'admin' role.
 */
export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized: Authentication required' });
  }
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: Admin privileges required' });
  }
  next();
}
