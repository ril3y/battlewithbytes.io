// Common types used across the application

// Blog related types
export interface BlogPost {
  slug: string;
  title?: string;
  date?: string;
  excerpt?: string;
  tags?: string[];
  author?: string;
  coverImage?: string;
  content?: string;
}

export interface BlogMetadata {
  title: string;
  slug: string;
  date: string;
  excerpt?: string;
  tags?: string[];
  author?: string;
  coverImage?: string;
  titleExists: boolean;
}

// Project related types
export interface Project {
  slug: string;
  title: string;
  description?: string;
  tags?: string[];
  coverImage?: string;
  content?: string;
  githubUrl?: string;
  demoUrl?: string;
  featured?: boolean;
}

// Form related types
export interface FormState {
  [key: string]: string | number | boolean;
}

export type FormStatus = 'idle' | 'submitting' | 'success' | 'error';

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

// Tool related types
export interface ToolResult {
  value: number | string;
  unit?: string;
  formula?: string;
  notes?: string[];
}

export interface CalculationInput {
  name: string;
  value: string;
  unit?: string;
  min?: number;
  max?: number;
}

// Common component props
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

// Navigation types
export interface NavItem {
  name: string;
  href: string;
  external?: boolean;
}

// SEO types
export interface SEOData {
  title: string;
  description: string;
  keywords?: string[];
  ogImage?: string;
  canonical?: string;
}