// import type { User as SupabaseUser } from '@supabase/supabase-js'; // Eliminado

export const PLANS = {
  free: { name: 'Gratuito', limits: { content: 3, attachments: 0 }, features: { analytics: false, customBranding: false, certificates: true } },
  pro: { name: 'Pro', limits: { content: 20, attachments: 5 }, features: { analytics: false, customBranding: true, certificates: true } },
  business: { name: 'Business', limits: { content: Infinity, attachments: Infinity }, features: { analytics: true, customBranding: true, certificates: true } },
};

export type PlanName = keyof typeof PLANS;

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export interface QuizQuestion {
  pregunta: string;
  opciones: {
    a: string;
    b: string;
    c: string;
    d: string;
  };
  respuesta_correcta: 'a' | 'b' | 'c' | 'd';
  justificacion: string;
}

export type Quiz = QuizQuestion[];

export enum Difficulty {
    Easy = "Fácil para principiantes",
    Intermediate = "Intermedio para estudiantes",
    Advanced = "Avanzado para expertos"
}

export interface AttachmentFile {
    type: 'file';
    title: string;
    description: string;
    fileName: string; // Or a URL to the file
}

export interface AttachmentVideo {
    type: 'video';
    title: string;
    description: string;
    youtubeUrl: string;
}

export type Attachment = AttachmentFile | AttachmentVideo;

export interface CourseModule {
  titulo: string;
  resumen?: string; 
  contexto_adicional?: string;
  cuestionario: Quiz;
}

export interface InteractiveCourse {
  titulo: string;
  modulos: CourseModule[];
}

export interface Submission {
  id?: string;
  content_id: string;
  student_name: string;
  score: number;
  total_questions: number;
  submitted_at?: string;
  module_attempts?: Record<number, number>;
}

export interface CreatorProfile {
    name: string;
    bio: string;
    avatar: {
        color: string;
        initials: string;
    };
    plan: PlanName;
    certificate_uses_left: number;
}

export interface User {
    id: string;
    email?: string;
    profile: CreatorProfile;
}


export interface StoredContentItem {
  id: string;
  title: string;
  type: 'quiz' | 'course';
  created_at: string;
  creator_id: string;
  data: Quiz | InteractiveCourse;
  attachments?: Attachment[];
  has_certificate?: boolean;
}

export interface Community {
    id: string;
    name: string;
    description: string;
    creator_id: string;
    visibility: 'public' | 'private';
    members: string[];
    member_count?: number; // from RPC
}

export interface Comment {
    id: string;
    author: User;
    text: string;
    created_at: string;
}

export interface PublishedPost {
    id: string;
    community_id: string;
    content: StoredContentItem;
    author: User;
    message: string;
    published_at: string;
    comments: Comment[];
    custom_author?: string;
}

export type View = 'login' | 'dashboard' | 'generator' | 'viewer' | 'analytics' | 'communities' | 'communityFeed' | 'profile' | 'communitySettings';