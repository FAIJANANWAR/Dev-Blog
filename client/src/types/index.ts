export type UserRole = 'author' | 'admin';
export type PostStatus = 'Draft' | 'Published';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  created_at: string;
}

export interface PostAuthor {
  id: string;
  name: string;
  email: string;
}

export interface Post {
  id: string;
  user_id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  image_url: string | null;
  category: string;
  tags: string[];
  status: PostStatus;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
  author?: PostAuthor;
}

export interface PostInput {
  title: string;
  summary: string;
  content: string;
  image_url?: string;
  category: string;
  tags: string[];
  status: PostStatus;
}

export interface PaginationData {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  limit: number;
}

export interface PostsApiResponse {
  posts: Post[];
  pagination: PaginationData;
}
