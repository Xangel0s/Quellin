



import { createClient, PostgrestError } from '@supabase/supabase-js';
import type { User, CreatorProfile, Quiz, InteractiveCourse, StoredContentItem, Submission, Community, Comment, PublishedPost, Attachment } from '../types';

// Read Supabase credentials from environment variables
const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL;
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;

// This is the standard, secure way to handle secrets in a frontend application.
// In local development, these are loaded from a `.env` file.
// In production (e.g., Netlify), these are set in the hosting provider's UI.
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL and Anon Key must be provided in environment variables.");
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: { id: string; profile: CreatorProfile };
        Insert: { id: string; profile: CreatorProfile };
        Update: { id?: string; profile?: CreatorProfile };
        Relationships: [];
      };
      content_items: {
        Row: {
          id: string;
          creator_id: string;
          title: string;
          type: "quiz" | "course";
          created_at: string;
          data: Quiz | InteractiveCourse | null;
          attachments: Attachment[] | null;
          has_certificate: boolean;
        };
        Insert: {
          id?: string;
          creator_id: string;
          title: string;
          type: "quiz" | "course";
          created_at?: string;
          data?: Quiz | InteractiveCourse | null;
          attachments?: Attachment[] | null;
          has_certificate: boolean;
        };
        Update: {
          id?: string;
          creator_id?: string;
          title?: string;
          type?: "quiz" | "course";
          created_at?: string;
          data?: Quiz | InteractiveCourse | null;
          attachments?: Attachment[] | null;
          has_certificate?: boolean;
        };
        Relationships: [];
      };
      submissions: {
        Row: {
          id: string;
          content_id: string;
          student_name: string;
          score: number;
          total_questions: number;
          submitted_at: string;
          module_attempts: Record<number, number> | null;
        };
        Insert: {
          id?: string;
          content_id: string;
          student_name: string;
          score: number;
          total_questions: number;
          submitted_at?: string;
          module_attempts?: Record<number, number> | null;
        };
        Update: {
          id?: string;
          content_id?: string;
          student_name?: string;
          score?: number;
          total_questions?: number;
          submitted_at?: string;
          module_attempts?: Record<number, number> | null;
        };
        Relationships: [];
      };
      communities: {
        Row: {
            id: string;
            name: string;
            description: string;
            creator_id: string;
            visibility: "public" | "private";
        };
        Insert: {
            id?: string;
            name: string;
            description: string;
            creator_id: string;
            visibility: "public" | "private";
        };
        Update: {
            id?: string;
            name?: string;
            description?: string;
            creator_id?: string;
            visibility?: "public" | "private";
        };
        Relationships: [];
      };
      community_members: {
        Row: { community_id: string; user_id: string; joined_at: string };
        Insert: { community_id: string; user_id: string; joined_at?: string };
        Update: { community_id?: string; user_id?: string; joined_at?: string };
        Relationships: [];
      };
      published_posts: {
        Row: {
            id: string;
            community_id: string;
            content_id: string;
            author_id: string;
            message: string;
            published_at: string;
            custom_author: string | null;
        };
        Insert: {
            id?: string;
            community_id: string;
            content_id: string;
            author_id: string;
            message: string;
            published_at?: string;
            custom_author?: string | null;
        };
        Update: {
            id?: string;
            community_id?: string;
            content_id?: string;
            author_id?: string;
            message?: string;
            published_at?: string;
            custom_author?: string | null;
        };
        Relationships: [];
      };
      comments: {
        Row: {
            id: string;
            post_id: string;
            author_id: string;
            text: string;
            created_at: string;
        };
        Insert: {
            id?: string;
            post_id: string;
            author_id: string;
            text: string;
            created_at?: string;
        };
        Update: {
            id?: string;
            post_id?: string;
            author_id?: string;
            text?: string;
            created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      create_community: {
        Args: { name: string; description: string; visibility: 'public' | 'private' };
        Returns: string;
      };
      get_communities_with_member_status: {
        Args: { user_id: string };
        Returns: {
            id: string;
            name: string;
            description: string;
            creator_id: string;
            visibility: 'public' | 'private';
            member_count: number;
            is_member: boolean;
        }[];
      };
    };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  }
}

const supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey);

const createDefaultProfile = (email: string): CreatorProfile => ({
    name: email.split('@')[0],
    bio: '',
    avatar: {
        color: 'bg-slate-500',
        initials: email.charAt(0).toUpperCase(),
    },
    plan: 'free',
    certificate_uses_left: 1,
});

const mapDbUserToUser = (dbUser: { id: string, profile: CreatorProfile }): User => ({
    id: dbUser.id,
    profile: dbUser.profile,
});

const safeRpc = async <T>(fn: any): Promise<{ data: T | null; error: PostgrestError | null }> => {
    const { data, error } = await fn;
    if (error) console.error(`RPC Error:`, error);
    return { data, error };
}

const safeQuery = async <T>(fn: any): Promise<{ data: T | null; error: PostgrestError | null }> => {
    const { data, error } = await fn;
    if (error) console.error(`Query Error:`, error);
    return { data, error };
}


const supabase = {
    client: supabaseClient,
    
    // --- AUTH ---
    async getUser(): Promise<{ data: User | null; error: Error | null }> {
      const { data: { session }, error: sessionError } = await supabaseClient.auth.getSession();
      if (sessionError) return { data: null, error: sessionError };
      if (!session || !session.user.email) return { data: null, error: null };
      
      const { id: userId, email: userEmail } = session.user;

      const { data: profileData, error: profileError } = await safeQuery<{ id: string, profile: CreatorProfile }>(
        supabaseClient.from('profiles').select('id, profile').eq('id', userId).single()
      );

      if (profileError && profileError.code !== 'PGRST116') {
        return { data: null, error: new Error(profileError.message) };
      }
      
      if (!profileData || !profileData.profile) {
        const defaultProfile = createDefaultProfile(userEmail);
        const { data: newProfileData, error: insertError } = await safeQuery<{ id: string, profile: CreatorProfile }>(
          supabaseClient.from('profiles').upsert({ id: userId, profile: defaultProfile }).select('id, profile').single()
        );
        
        if (insertError || !newProfileData) {
            return { data: null, error: new Error(insertError?.message || 'Failed to create profile') };
        }
        return { data: { id: userId, email: userEmail, profile: newProfileData.profile }, error: null };
      }

      return { data: { id: userId, email: userEmail, profile: profileData.profile }, error: null };
    },
    async signUp(email: string, password: string) {
        return supabaseClient.auth.signUp({ 
            email, password, options: { emailRedirectTo: window.location.origin }
        });
    },
    async signIn(email: string, password: string) {
        return supabaseClient.auth.signInWithPassword({ email, password });
    },
    async signOut() {
        return supabaseClient.auth.signOut();
    },
    async updatePassword(newPassword: string) {
        return supabaseClient.auth.updateUser({ password: newPassword });
    },
    async resendConfirmationEmail(email: string) {
        return supabaseClient.auth.resend({ type: 'signup', email, options: { emailRedirectTo: window.location.origin } });
    },

    // --- PROFILES ---
    async updateUserProfile(userId: string, profile: CreatorProfile) {
        return safeQuery(supabaseClient.from('profiles').update({ profile }).eq('id', userId).select().single());
    },
    async getUserById(userId: string) {
        return safeQuery<User>(supabaseClient.from('profiles').select('id, profile').eq('id', userId).single());
    },
    
    // --- CONTENT ---
    async createContentItem(creatorId: string, title: string, data: Quiz | InteractiveCourse, attachments: Attachment[], has_certificate: boolean) {
        const isCourse = 'modulos' in data;
        return safeQuery<StoredContentItem>(
            supabaseClient.from('content_items')
            .insert({
                creator_id: creatorId,
                title: title || (isCourse ? 'Curso sin título' : 'Cuestionario sin título'),
                type: isCourse ? 'course' : 'quiz',
                data, attachments, has_certificate
            })
            .select().single()
        );
    },
    async getContentItems(creatorId: string) {
        return safeQuery<StoredContentItem[]>(
            supabaseClient.from('content_items').select('*')
            .eq('creator_id', creatorId).order('created_at', { ascending: false })
        );
    },
    async getContentItemById(contentId: string) {
        return safeQuery<StoredContentItem>(
            supabaseClient.from('content_items').select('*').eq('id', contentId).single()
        );
    },
    async deleteContentItem(id: string) {
        return safeQuery(supabaseClient.from('content_items').delete().eq('id', id));
    },

    // --- SUBMISSIONS ---
    async createSubmission(submission: Omit<Submission, 'id' | 'submitted_at'>) {
        return safeQuery<Submission>(supabaseClient.from('submissions').insert(submission).select().single());
    },
    async getSubmissions(contentId: string) {
        return safeQuery<Submission[]>(supabaseClient.from('submissions').select('*').eq('content_id', contentId));
    },

    // --- COMMUNITIES ---
    async getCommunities(userId: string) {
        const { data, error } = await safeRpc<any[]>(supabaseClient.rpc('get_communities_with_member_status', { user_id: userId }));
        if (error || !data) return { data: [], error };
        
        const communities: Community[] = data.map((c) => ({
             id: c.id, name: c.name, description: c.description,
             creator_id: c.creator_id, visibility: c.visibility,
             member_count: c.member_count,
             members: c.is_member ? [userId] : [] // Simplified member list for client
        }));
        return { data: communities, error: null };
    },
    async createCommunity(name: string, description: string, visibility: 'public' | 'private', creatorId: string) {
        const { data: newCommunityId, error: rpcError } = await safeRpc<string>(supabaseClient.rpc('create_community', { name, description, visibility }));
        if (rpcError || !newCommunityId) return { data: null, error: rpcError };

        const { data, error } = await safeQuery<Community>(supabaseClient.from('communities').select('*').eq('id', newCommunityId).single());
        if (error || !data) return { data: null, error };
        
        return { data: { ...data, member_count: 1, members: [creatorId] }, error: null };
    },
    async updateCommunity(community: Omit<Community, 'members' | 'creator_id' | 'member_count'>) {
        return safeQuery<Community>(
            supabaseClient.from('communities')
            .update({ name: community.name, description: community.description, visibility: community.visibility })
            .eq('id', community.id).select().single()
        );
    },
    async joinCommunity(communityId: string, userId: string) {
        return safeQuery(supabaseClient.from('community_members').insert({ community_id: communityId, user_id: userId }));
    },

    // --- POSTS & COMMENTS ---
    async getPublishedPosts() {
        const { data, error } = await safeQuery<any[]>(
            supabaseClient.from('published_posts')
            .select(`*, author:profiles(id, profile), content:content_items(*), comments(*, author:profiles(id, profile))`)
            .order('published_at', { ascending: false })
        );
        if (error || !data) return { data: [], error };

        const posts: PublishedPost[] = data.map(post => ({
            id: post.id, community_id: post.community_id, message: post.message, published_at: post.published_at,
            custom_author: post.custom_author,
            author: mapDbUserToUser(post.author),
            content: post.content,
            comments: post.comments.map((c: any) => ({
                id: c.id, text: c.text, created_at: c.created_at, author: mapDbUserToUser(c.author),
            })).sort((a:Comment, b:Comment) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()),
        }));
        return { data: posts, error: null };
    },
    async getPostByContentId(contentId: string) {
        const { data, error } = await safeQuery<any>(
            supabaseClient.from('published_posts')
            .select(`*, author:profiles(id, profile), content:content_items(*)`)
            .eq('content_id', contentId).limit(1).single()
        );
        if (error || !data) return { data: null, error };
        
        const post: PublishedPost = {
            id: data.id, community_id: data.community_id, message: data.message, published_at: data.published_at,
            custom_author: data.custom_author,
            author: mapDbUserToUser(data.author),
            content: data.content,
            comments: [],
        };
        return { data: post, error: null };
    },
    async publishPost(contentId: string, communityId: string, message: string, authorId: string, customAuthor?: string) {
         const { data, error } = await safeQuery<any>(
            supabaseClient.from('published_posts')
            .insert({ content_id: contentId, community_id: communityId, message, custom_author: customAuthor, author_id: authorId })
            .select(`*, author:profiles(id, profile), content:content_items(*)`).single()
         );
         if (error || !data) return { data: null, error };
 
         const post: PublishedPost = { ...data, author: mapDbUserToUser(data.author), content: data.content, comments: [] };
         return { data: post, error: null };
    },
    async addComment(postId: string, text: string, author: User) {
        const { data, error } = await safeQuery<any>(
            supabaseClient.from('comments').insert({ post_id: postId, text, author_id: author.id }).select().single()
        );
        if (error || !data) return { data: null, error };

        const comment: Comment = { id: data.id, text: data.text, created_at: data.created_at, author };
        return { data: comment, error: null };
    },
};

export default supabase;