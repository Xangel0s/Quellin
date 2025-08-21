

import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback } from 'react';
import type { StoredContentItem, Community, PublishedPost, Submission, Quiz, InteractiveCourse, Attachment, Comment } from '../types';
import { db } from '../services/firebase';
import { ref, get, set, update, remove, push, child, query, orderByChild, equalTo } from 'firebase/database';
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
        // Ensure we have a valid user id before fetching
        if (currentUser && currentUser.id) {
            setLoading(true);
            // Fetch data from Firebase
            Promise.all([
                fetchContentItems(currentUser.id),
                fetchCommunities(),
                fetchPublishedPosts()
            ]).then(([contentItems, communities, posts]) => {
                setContentItems(contentItems);
                setCommunities(communities);
                setPublishedPosts(posts);
            }).catch(err => {
                console.error("Error fetching data:", err);
                addToast("No se pudieron cargar los datos.", 'error');
            }).finally(() => setLoading(false));
        } else {
            setContentItems([]);
            setCommunities([]);
            setPublishedPosts([]);
            setSubmissions([]);
            setLoading(false);
        }
    }, [currentUser, addToast]);

    // Firebase fetchers
    const fetchContentItems = async (userId?: string): Promise<StoredContentItem[]> => {
        if (!userId) return [];
        const q = query(ref(db, 'contentItems'), orderByChild('creator_id'), equalTo(userId));
        const snapshot = await get(q);
        const items = snapshot.exists() ? snapshot.val() : {};
        // If items is not an object, return empty
        if (!items || typeof items !== 'object') return [];
        return Object.values(items);
    };
    const fetchCommunities = async (): Promise<Community[]> => {
        const snapshot = await get(ref(db, 'communities'));
        const items = snapshot.exists() ? snapshot.val() : {};
        return Object.values(items);
    };
    const fetchPublishedPosts = async (): Promise<PublishedPost[]> => {
        const snapshot = await get(ref(db, 'publishedPosts'));
        const items = snapshot.exists() ? snapshot.val() : {};
        return Object.values(items);
    };
    
    // --- Actions ---

    const createContentItem = async (title: string, data: Quiz | InteractiveCourse, attachments: Attachment[], hasCertificate: boolean) => {
        if (!currentUser) return;
        try {
            const newItemRef = push(ref(db, 'contentItems'));
            const newItem: StoredContentItem = {
                id: newItemRef.key!,
                title,
                type: Array.isArray(data) ? 'quiz' : 'course',
                created_at: new Date().toISOString(),
                creator_id: currentUser.id,
                data,
                attachments,
                has_certificate: hasCertificate
            };
            await set(newItemRef, newItem);
            setContentItems(prev => [newItem, ...prev]);
            addToast("Contenido creado exitosamente.", 'success');
        } catch (error: any) {
            addToast(`Error: ${error?.message || 'No se pudo crear el contenido.'}`, 'error');
        }
        if (hasCertificate && currentUser.profile.plan === 'free') {
            // Actualizar el perfil en Firebase si es necesario
        }
    };

    const deleteContentItem = async (id: string) => {
        try {
            await remove(ref(db, `contentItems/${id}`));
            setContentItems(prev => prev.filter(item => item.id !== id));
            addToast("Contenido eliminado.", 'success');
        } catch (error: any) {
            addToast(`Error: ${error.message}`, 'error');
        }
    };

    const createSubmission = async (contentId: string, submission: Omit<Submission, 'submitted_at' | 'content_id'>) => {
        try {
            const newSubmissionRef = push(ref(db, 'submissions'));
            const newSubmission: Submission = {
                ...submission,
                content_id: contentId,
                submitted_at: new Date().toISOString()
            };
            await set(newSubmissionRef, newSubmission);
            setSubmissions(prev => [newSubmission, ...prev]);
            addToast("Envío registrado.", 'success');
        } catch (error: any) {
            addToast(`Error: ${error.message}`, 'error');
        }
    };

    const getSubmissionsForContent = useCallback(async (contentId: string) => {
        try {
            const q = query(ref(db, 'submissions'), orderByChild('content_id'), equalTo(contentId));
            const snapshot = await get(q);
            const items = snapshot.exists() ? snapshot.val() : {};
            setSubmissions(Object.values(items));
        } catch (error: any) {
            addToast(`Error: ${error.message}`, 'error');
        }
    }, [addToast]);

    const publishPost = async (contentId: string, communityId: string, message: string, customAuthor?: string) => {
        if (!currentUser) return null;
        setActionLoading('publishing-post');
        try {
            const newPostRef = push(ref(db, 'publishedPosts'));
            const newPost: PublishedPost = {
                id: newPostRef.key!,
                community_id: communityId,
                content: contentItems.find(item => item.id === contentId)!,
                author: currentUser,
                message,
                published_at: new Date().toISOString(),
                comments: [],
                custom_author: customAuthor
            };
            await set(newPostRef, newPost);
            setPublishedPosts(prev => [newPost, ...prev]);
            addToast("Publicado en la comunidad!", 'success');
            setActionLoading(null);
            return newPost;
        } catch (error: any) {
            addToast(`Error: ${error?.message || 'No se pudo publicar.'}`, 'error');
            setActionLoading(null);
            return null;
        }
    };
    
    const addComment = async (postId: string, text: string) => {
        if (!currentUser) return;
        setActionLoading(`commenting-${postId}`);
        try {
            const newCommentRef = push(ref(db, `publishedPosts/${postId}/comments`));
            const newComment: Comment = {
                id: newCommentRef.key!,
                author: currentUser,
                text,
                created_at: new Date().toISOString()
            };
            await set(newCommentRef, newComment);
            setPublishedPosts(prev => prev.map(post => 
                post.id === postId ? { ...post, comments: [...post.comments, newComment] } : post
            ));
        } catch (error: any) {
            addToast(`Error: ${error?.message || 'No se pudo añadir el comentario.'}`, 'error');
        }
        setActionLoading(null);
    };

    const createCommunity = async (name: string, description: string, visibility: 'public' | 'private') => {
        if (!currentUser) return null;
        setActionLoading('creating-community');
        try {
            const newCommunityRef = push(ref(db, 'communities'));
            const newCommunity: Community = {
                id: newCommunityRef.key!,
                name,
                description,
                creator_id: currentUser.id,
                visibility,
                members: [currentUser.id],
                member_count: 1
            };
            await set(newCommunityRef, newCommunity);
            setCommunities(prev => [newCommunity, ...prev]);
            addToast(`Comunidad "${newCommunity.name}" creada.`, 'success');
            setActionLoading(null);
            return newCommunity;
        } catch (error: any) {
            addToast(`Error: ${error?.message || 'No se pudo crear la comunidad.'}`, 'error');
            setActionLoading(null);
            return null;
        }
    };

    const updateCommunity = async (updatedCommunity: Omit<Community, 'members' | 'creator_id' | 'member_count'>) => {
        setActionLoading('updating-community');
        try {
            await update(ref(db, `communities/${updatedCommunity.id}`), updatedCommunity);
            setCommunities(prev => prev.map(c => c.id === updatedCommunity.id ? { ...c, ...updatedCommunity } : c));
            addToast("Comunidad actualizada.", 'success');
            setActionLoading(null);
            return true;
        } catch (error: any) {
            addToast(`Error: ${error?.message || 'No se pudo actualizar la comunidad.'}`, 'error');
            setActionLoading(null);
            return false;
        }
    };
    
    const joinCommunity = async (communityId: string) => {
        if (!currentUser) return;
        setActionLoading(`joining-community-${communityId}`);
        try {
            const communityRef = ref(db, `communities/${communityId}`);
            const snapshot = await get(communityRef);
            const community = snapshot.exists() ? snapshot.val() : null;
            if (community) {
                const updatedMembers = [...community.members, currentUser.id];
                await update(communityRef, { members: updatedMembers, member_count: (community.member_count || 0) + 1 });
                setCommunities(prev => prev.map(c => 
                    c.id === communityId ? { ...c, members: updatedMembers, member_count: (community.member_count || 0) + 1 } : c
                ));
                addToast("Te has unido a la comunidad.", 'success');
            }
        } catch (error: any) {
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