
import React from 'react';
import type { User, StoredContentItem } from '../types';
import Avatar from '../components/Avatar';
import Button from '../components/Button';
import { AcademicCapIcon, DocumentDuplicateIcon } from '../components/icons';
import { useData } from '../contexts/DataContext';
import { useUI } from '../contexts/UIContext';

interface ProfilePageProps {
    user: User;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ user }) => {
    const { publishedPosts } = useData();
    const { navigate, activeCommunity } = useUI();
    
    const userPublishedPosts = publishedPosts.filter(p => p.author.id === user.id);

    const handleBack = () => {
        navigate(activeCommunity ? 'communityFeed' : 'communities', activeCommunity || undefined);
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-6">
                 <button onClick={handleBack} className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                       <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                    Volver
                </button>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200 flex flex-col sm:flex-row items-center gap-6 mb-8">
                <Avatar profile={user.profile} size="lg" />
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">{user.profile.name}</h1>
                    <p className="text-slate-600 mt-1">{user.profile.bio}</p>
                </div>
            </div>

            <h2 className="text-xl font-bold text-slate-800 mb-4">Contenido Publicado</h2>
            <div className="space-y-4">
                {userPublishedPosts.length > 0 ? (
                    userPublishedPosts.map(post => (
                        <div key={post.id} className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                           <div className="flex items-center gap-3">
                                {post.content.type === 'course' 
                                    ? <AcademicCapIcon className="w-6 h-6 text-purple-600 flex-shrink-0" />
                                    : <DocumentDuplicateIcon className="w-6 h-6 text-sky-600 flex-shrink-0" />
                                }
                                <div>
                                    <h4 className="font-semibold text-slate-900">{post.content.title}</h4>
                                    <p className="text-xs text-slate-500">
                                        Publicado el {formatDate(post.published_at)}
                                    </p>
                                </div>
                            </div>
                             <Button onClick={() => navigate('viewer', post.content.id)} className="!py-2 !px-3 !text-sm flex-shrink-0 w-full sm:w-auto">
                                Ver Contenido
                            </Button>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-10 bg-white rounded-2xl border border-slate-200">
                        <p className="text-slate-600">{user.profile.name} todavía no ha publicado nada.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfilePage;