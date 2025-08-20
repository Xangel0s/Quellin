

import React, { useState } from 'react';
import type { Community, PublishedPost, User } from '../types';
import Avatar from '../components/Avatar';
import Button from '../components/Button';
import Textarea from '../components/Textarea';
import Spinner from '../components/Spinner';
import { AcademicCapIcon, DocumentDuplicateIcon } from '../components/icons';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { useUI } from '../contexts/UIContext';

interface CommunityFeedPageProps {
    community: Community;
}

const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffSeconds = Math.round((now.getTime() - date.getTime()) / 1000);

    if (diffSeconds < 60) return "hace un momento";
    if (diffSeconds < 3600) return `hace ${Math.floor(diffSeconds / 60)}m`;
    if (diffSeconds < 86400) return `hace ${Math.floor(diffSeconds / 3600)}h`;
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' });
}

const CommentSection: React.FC<{ post: PublishedPost; }> = ({ post }) => {
    const { currentUser } = useAuth();
    const { addComment, actionLoading } = useData();
    const { navigate } = useUI();
    const [commentText, setCommentText] = useState('');

    if (!currentUser) return null;

    const isCommenting = actionLoading === `commenting-${post.id}`;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (commentText.trim() && !isCommenting) {
            addComment(post.id, commentText).then(() => {
                setCommentText('');
            });
        }
    };

    return (
        <div className="mt-4 pt-4 border-t border-slate-200">
            {post.comments.length > 0 && (
                <div className="space-y-4 mb-4">
                    {post.comments.map(comment => (
                        <div key={comment.id} className="flex items-start gap-3">
                            <button onClick={() => navigate('profile', comment.author)} className="flex-shrink-0">
                                <Avatar profile={comment.author.profile} size="sm" />
                            </button>
                            <div className="bg-slate-100 rounded-lg p-3 w-full">
                                <div className="flex items-center gap-2">
                                    <button onClick={() => navigate('profile', comment.author)} className="font-bold text-sm text-slate-800 hover:underline">{comment.author.profile.name}</button>
                                    <span className="text-xs text-slate-500">&middot; {formatDate(comment.created_at)}</span>
                                </div>
                                <p className="text-sm text-slate-700 mt-1">{comment.text}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
             <form onSubmit={handleSubmit} className="flex items-start gap-3">
                <div className="flex-shrink-0">
                    <Avatar profile={currentUser.profile} size="sm" />
                </div>
                <Textarea
                    id={`comment-input-${post.id}`}
                    label="Escribe un comentario"
                    aria-label="Escribe un comentario"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Añade tu comentario..."
                    rows={1}
                    className="!py-2 text-sm"
                />
                <Button type="submit" disabled={!commentText.trim() || isCommenting} className="!py-2 !px-3 !text-sm mt-7">
                   {isCommenting ? <Spinner className="w-4 h-4"/> : 'Enviar'}
                </Button>
             </form>
        </div>
    )
}

const CommunityFeedPage: React.FC<CommunityFeedPageProps> = ({ community }) => {
    const { currentUser } = useAuth();
    const { publishedPosts, joinCommunity, actionLoading } = useData();
    const { navigate } = useUI();
    
    if (!currentUser) return null;

    const posts = publishedPosts.filter(p => p.community_id === community.id);
    const isMember = community.members.includes(currentUser.id);
    const isJoining = actionLoading === `joining-community-${community.id}`;

    return (
        <div>
            <div className="mb-6">
                 <button onClick={() => navigate('communities')} className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                       <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                    Volver a Comunidades
                </button>
                <p className="mt-1 text-slate-600">{community.description}</p>
            </div>
            
            {!isMember && community.visibility === 'public' && (
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200 text-center mb-6">
                    <h3 className="text-lg font-semibold text-slate-800">Únete a la conversación</h3>
                    <p className="text-slate-600 text-sm mt-1">Para publicar y comentar, primero debes unirte a la comunidad.</p>
                    <Button onClick={() => joinCommunity(community.id)} className="mt-4" disabled={isJoining}>
                        {isJoining ? <Spinner /> : 'Unirse a la Comunidad'}
                    </Button>
                </div>
            )}

            <div className="space-y-6">
                {posts.length > 0 ? (
                    posts.map(post => (
                        <div key={post.id} className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200">
                            <div className="flex items-start gap-4">
                               {post.custom_author ? (
                                    <div className="flex-shrink-0 w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center">
                                        <DocumentDuplicateIcon className="w-5 h-5 text-slate-500" />
                                    </div>
                               ) : (
                                    <button onClick={() => navigate('profile', post.author)} className="flex-shrink-0">
                                        <Avatar profile={post.author.profile} />
                                    </button>
                               )}

                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        {post.custom_author ? (
                                            <p className="font-bold text-slate-800">{post.custom_author}</p>
                                        ) : (
                                            <button onClick={() => navigate('profile', post.author)} className="font-bold text-slate-800 hover:underline">{post.author.profile.name}</button>
                                        )}
                                        <p className="text-xs text-slate-400">&middot;</p>
                                        <p className="text-xs text-slate-500">{formatDate(post.published_at)}</p>
                                    </div>
                                    {post.message && <p className="text-sm text-slate-700 mt-1 whitespace-pre-wrap">{post.message}</p>}
                                    
                                    <div className="mt-4 p-4 border border-slate-200 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-50">
                                        <div className="flex items-center gap-3">
                                            {post.content.type === 'course' 
                                                ? <AcademicCapIcon className="w-6 h-6 text-purple-600 flex-shrink-0" />
                                                : <DocumentDuplicateIcon className="w-6 h-6 text-sky-600 flex-shrink-0" />
                                            }
                                            <div>
                                                <h4 className="font-semibold text-slate-900">{post.content.title}</h4>
                                                <p className="text-xs text-slate-500">
                                                    {post.content.type === 'course' ? 'Curso Interactivo' : 'Cuestionario'}
                                                </p>
                                            </div>
                                        </div>
                                        <Button onClick={() => navigate('viewer', post.content.id)} className="!py-2 !px-3 !text-sm flex-shrink-0 w-full sm:w-auto">
                                            Empezar
                                        </Button>
                                    </div>
                                    {isMember && <CommentSection post={post} />}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-16 bg-white rounded-2xl shadow-lg border border-slate-200">
                        <h3 className="text-xl font-semibold text-slate-800">Esta comunidad está tranquila</h3>
                        <p className="text-slate-500 mt-2">{isMember ? '¡Sé el primero en publicar algo!' : 'Únete para empezar la conversación.'}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CommunityFeedPage;