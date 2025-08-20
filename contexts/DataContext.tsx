

import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback } from 'react';
import type { StoredContentItem, Community, PublishedPost, Submission, Quiz, InteractiveCourse, Attachment, Comment } from '../types';
import supabase from '../services/supabase';
import { useAuth } from './AuthContext';
import { useUI } from './UIContext';

interface DataContextType {
    contentItems: StoredContentItem[];
    communities: Community[];
    publishedPosts: PublishedPost[];
    submissions: Submission[];
    joinedCommunities: Community[];
    loading: boolean;
    actionLoading: string | null; // e.g., 'joining-community-123', 'publishing-post'
    createContentItem: (title: string, data: Quiz | InteractiveCourse, attachments: Attachment[], hasCertificate: boolean) => Promise<void>;
    deleteContentItem: (id: string) => Promise<void>;
    createSubmission: (contentId: string, submission: Omit<Submission, 'submitted_at' | 'content_id'>) => Promise<void>;
    getSubmissionsForContent: (contentId: string) => Promise<void>;
    publishPost: (contentId: string, communityId: string, message: string, customAuthor?: string) => Promise<PublishedPost | null>;
    addComment: (postId: string, text: string) => Promise<void>;
    createCommunity: (name: string, description: string, visibility: 'public' | 'private') => Promise<Community | null>;
    updateCommunity: (community: Omit<Community, 'members' | 'creator_id' | 'member_count'>) => Promise<boolean>;
    joinCommunity: (communityId: string) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { currentUser } = useAuth();
    const { addToast } = useUI();
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const [contentItems, setContentItems] = useState<StoredContentItem[]>([]);
    const [communities, setCommunities] = useState<Community[]>([]);
    const [publishedPosts, setPublishedPosts] = useState<PublishedPost[]>([]);
    const [submissions, setSubmissions] = useState<Submission[]>([]);

    const joinedCommunities = React.useMemo(() => 
        currentUser ? communities.filter(c => c.members.includes(currentUser.id)) : [],
        [communities, currentUser]
    );

    // Initial data fetching for authenticated user
    useEffect(() => {
        if (currentUser) {
            setLoading(true);
            Promise.all([
                supabase.getContentItems(currentUser.id),
                supabase.getCommunities(currentUser.id),
                supabase.getPublishedPosts()
            ]).then(([contentRes, communitiesRes, postsRes]) => {
                if (contentRes.data) setContentItems(contentRes.data);
                if (communitiesRes.data) setCommunities(communitiesRes.data);
                if (postsRes.data) setPublishedPosts(postsRes.data);
            }).catch(err => {
                console.error("Error fetching data:", err);
                addToast("No se pudieron cargar los datos.", 'error');
            }).finally(() => setLoading(false));
        } else {
            // Clear data on sign out
            setContentItems([]);
            setCommunities([]);
            setPublishedPosts([]);
            setSubmissions([]);
            setLoading(false);
        }
    }, [currentUser, addToast]);
    
    // --- Actions ---

    const createContentItem = async (title: string, data: Quiz | InteractiveCourse, attachments: Attachment[], hasCertificate: boolean) => {
        if (!currentUser) return;
        const { data: newItem, error } = await supabase.createContentItem(currentUser.id, title, data, attachments, hasCertificate);
        if (newItem) {
            setContentItems(prev => [newItem, ...prev]);
            addToast("Contenido creado exitosamente.", 'success');
        } else {
            addToast(`Error: ${error?.message || 'No se pudo crear el contenido.'}`, 'error');
        }
        if (hasCertificate && currentUser.profile.plan === 'free') {
            const profile = { ...currentUser.profile, certificate_uses_left: 0 };
            supabase.updateUserProfile(currentUser.id, profile);
        }
    };

    const deleteContentItem = async (id: string) => {
        const { error } = await supabase.deleteContentItem(id);
        if (!error) {
            setContentItems(prev => prev.filter(item => item.id !== id));
            addToast("Contenido eliminado.", 'success');
        } else {
            addToast(`Error: ${error.message}`, 'error');
        }
    };

    const createSubmission = async (contentId: string, submission: Omit<Submission, 'submitted_at' | 'content_id'>) => {
        await supabase.createSubmission({ ...submission, content_id: contentId });
    };

    const getSubmissionsForContent = useCallback(async (contentId: string) => {
        const { data } = await supabase.getSubmissions(contentId);
        if (data) setSubmissions(data);
    }, []);

    const publishPost = async (contentId: string, communityId: string, message: string, customAuthor?: string) => {
        if (!currentUser) return null;
        setActionLoading('publishing-post');
        const { data: newPost, error } = await supabase.publishPost(contentId, communityId, message, currentUser.id, customAuthor);
        if (newPost) {
            setPublishedPosts(prev => [newPost, ...prev]);
            addToast("Publicado en la comunidad!", 'success');
        } else {
            addToast(`Error: ${error?.message || 'No se pudo publicar.'}`, 'error');
        }
        setActionLoading(null);
        return newPost;
    };
    
    const addComment = async (postId: string, text: string) => {
        if (!currentUser) return;
        setActionLoading(`commenting-${postId}`);
        const { data: newComment, error } = await supabase.addComment(postId, text, currentUser);
        if (newComment) {
            setPublishedPosts(prev => prev.map(post => 
                post.id === postId ? { ...post, comments: [...post.comments, newComment] } : post
            ));
        } else {
            addToast(`Error: ${error?.message || 'No se pudo añadir el comentario.'}`, 'error');
        }
        setActionLoading(null);
    };

    const createCommunity = async (name: string, description: string, visibility: 'public' | 'private') => {
        if (!currentUser) return null;
        setActionLoading('creating-community');
        const { data: newCommunity, error } = await supabase.createCommunity(name, description, visibility, currentUser.id);
        if (newCommunity) {
            setCommunities(prev => [newCommunity, ...prev]);
            addToast(`Comunidad "${newCommunity.name}" creada.`, 'success');
        } else {
            addToast(`Error: ${error?.message || 'No se pudo crear la comunidad.'}`, 'error');
        }
        setActionLoading(null);
        return newCommunity;
    };

    const updateCommunity = async (updatedCommunity: Omit<Community, 'members' | 'creator_id' | 'member_count'>) => {
        setActionLoading('updating-community');
        const { data: result, error } = await supabase.updateCommunity(updatedCommunity);
        if (result && !error) {
            setCommunities(prev => prev.map(c => c.id === result.id ? { ...c, ...result } : c));
            addToast("Comunidad actualizada.", 'success');
            setActionLoading(null);
            return true;
        }
        addToast(`Error: ${error?.message || 'No se pudo actualizar la comunidad.'}`, 'error');
        setActionLoading(null);
        return false;
    };
    
    const joinCommunity = async (communityId: string) => {
        if (!currentUser) return;
        setActionLoading(`joining-community-${communityId}`);
        const { error } = await supabase.joinCommunity(communityId, currentUser.id);
        if(!error) {
            setCommunities(prev => prev.map(c => 
                c.id === communityId ? { ...c, members: [...c.members, currentUser.id], member_count: (c.member_count || 0) + 1 } : c
            ));
            addToast("Te has unido a la comunidad.", 'success');
        } else {
            addToast(`Error: ${error.message}`, 'error');
        }
        setActionLoading(null);
    };

    const value = {
        contentItems, communities, publishedPosts, submissions, joinedCommunities, loading, actionLoading,
        createContentItem, deleteContentItem, createSubmission, getSubmissionsForContent,
        publishPost, addComment, createCommunity, updateCommunity, joinCommunity
    };

    return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = (): DataContextType => {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};