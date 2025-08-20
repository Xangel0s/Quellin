

import React, { useState, useEffect } from 'react';
import type { StoredContentItem } from '../types';
import Input from './Input';
import Button from './Button';
import Textarea from './Textarea';
import { ClipboardIcon, CheckIcon, LinkIcon, UsersIcon } from './icons';
import Avatar from './Avatar';
import Spinner from './Spinner';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { useUI } from '../contexts/UIContext';

interface ShareModalProps {
    content: StoredContentItem;
    onClose: () => void;
}

type ShareMode = 'link' | 'community';
type AuthorMode = 'profile' | 'custom';

const ShareModal: React.FC<ShareModalProps> = ({ content, onClose }) => {
    const { currentUser } = useAuth();
    const { joinedCommunities, publishPost, actionLoading } = useData();
    const { navigate } = useUI();

    const [shareLink, setShareLink] = useState('');
    const [copySuccess, setCopySuccess] = useState(false);
    const [mode, setMode] = useState<ShareMode>('link');
    const [selectedCommunity, setSelectedCommunity] = useState<string>(joinedCommunities[0]?.id || '');
    const [publishMessage, setPublishMessage] = useState('');
    const [authorMode, setAuthorMode] = useState<AuthorMode>('profile');
    const [customAuthor, setCustomAuthor] = useState('');

    useEffect(() => {
        const getShareableLink = () => {
            const baseUrl = window.location.href.split('#')[0];
            return `${baseUrl}#view/${content.id}`;
        }
        setShareLink(getShareableLink());
    }, [content]);

    const handleCopy = () => {
        if (!shareLink) return;
        navigator.clipboard.writeText(shareLink).then(() => {
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        });
    };

    const handlePublish = async () => {
        if(selectedCommunity && content) {
            const newPost = await publishPost(content.id, selectedCommunity, publishMessage, authorMode === 'custom' ? customAuthor : undefined);
            if (newPost) {
                const community = joinedCommunities.find(c => c.id === selectedCommunity);
                if (community) {
                    navigate('communityFeed', community);
                }
                onClose();
            }
        }
    }

    const getTabClass = (tabMode: ShareMode) => {
        return `px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            mode === tabMode 
            ? 'bg-teal-100 text-teal-700' 
            : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
        }`;
    }
    
    if (!currentUser) return null;

    const isPublishing = actionLoading === 'publishing-post';

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div 
                className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 relative"
                onClick={(e) => e.stopPropagation()}
            >
                <button 
                    onClick={onClose} 
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
                    title="Cerrar"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-teal-100 text-teal-600 rounded-lg">
                        <LinkIcon className="w-6 h-6"/>
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Compartir y Publicar</h2>
                        <p className="text-sm text-slate-500 truncate" title={content.title}>"{content.title}"</p>
                    </div>
                </div>

                <div className="mb-4 border-b border-slate-200">
                    <nav className="-mb-px flex space-x-2" aria-label="Tabs">
                        <button onClick={() => setMode('link')} className={getTabClass('link')}>
                            <LinkIcon className="w-4 h-4 mr-2 inline-block"/>
                            Enlace Privado
                        </button>
                        <button onClick={() => setMode('community')} className={getTabClass('community')}>
                            <UsersIcon className="w-4 h-4 mr-2 inline-block"/>
                            Publicar en Comunidad
                        </button>
                    </nav>
                </div>

                {mode === 'link' && (
                    <div className="space-y-4">
                        <p className="text-sm text-slate-600">Cualquiera con este enlace privado podrá acceder a tu contenido para realizarlo.</p>
                        <div className="relative">
                            <Input 
                                id="shareLink" 
                                label="Enlace para compartir:" 
                                value={shareLink} 
                                readOnly 
                                className="!pr-10 bg-slate-50"
                            />
                            <button 
                                onClick={handleCopy} 
                                title="Copiar enlace" 
                                className="absolute top-7 right-0 flex items-center pr-3 text-slate-500 hover:text-teal-600 transition-colors"
                            >
                                {copySuccess ? <CheckIcon className="w-5 h-5 text-green-500" /> : <ClipboardIcon className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>
                )}

                {mode === 'community' && (
                    <div className="space-y-4">
                        {joinedCommunities.length > 0 ? (
                            <>
                                <div>
                                    <label htmlFor="community" className="block text-sm font-medium text-slate-700 mb-1">1. Selecciona una Comunidad</label>
                                    <select
                                    id="community"
                                    name="community"
                                    className="block w-full rounded-md border-slate-400 bg-white shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm transition duration-150 ease-in-out pl-3 pr-8 py-2"
                                    value={selectedCommunity}
                                    onChange={(e) => setSelectedCommunity(e.target.value)}
                                    >
                                    {joinedCommunities.map((community) => (
                                        <option key={community.id} value={community.id}>{community.name}</option>
                                    ))}
                                    </select>
                                </div>
                                <Textarea 
                                    id="publishMessage"
                                    label="2. Mensaje (Opcional)"
                                    placeholder="Añade un mensaje para la comunidad sobre tu contenido..."
                                    rows={3}
                                    value={publishMessage}
                                    onChange={(e) => setPublishMessage(e.target.value)}
                                />
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">3. Atribución de Autor</label>
                                    <div className="space-y-3">
                                        <div onClick={() => setAuthorMode('profile')} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${authorMode === 'profile' ? 'bg-teal-50 border-teal-300' : 'bg-white border-slate-300 hover:bg-slate-50'}`}>
                                            <input type="radio" name="authorMode" value="profile" checked={authorMode==='profile'} readOnly className="h-4 w-4 border-slate-300 text-teal-600 focus:ring-teal-600"/>
                                            <Avatar profile={currentUser.profile} size="sm" />
                                            <div>
                                                <p className="font-semibold text-sm text-slate-800">{currentUser.profile.name}</p>
                                                <p className="text-xs text-slate-500">Mostrar tu perfil de creador.</p>
                                            </div>
                                        </div>
                                         <div onClick={() => setAuthorMode('custom')} className={`p-3 rounded-lg border cursor-pointer transition-colors ${authorMode === 'custom' ? 'bg-teal-50 border-teal-300' : 'bg-white border-slate-300 hover:bg-slate-50'}`}>
                                            <div className="flex items-center gap-3">
                                                <input type="radio" name="authorMode" value="custom" checked={authorMode==='custom'} readOnly className="h-4 w-4 border-slate-300 text-teal-600 focus:ring-teal-600"/>
                                                <div className="flex-1">
                                                    <p className="font-semibold text-sm text-slate-800">Nombre Personalizado</p>
                                                    <p className="text-xs text-slate-500">Usa un nombre diferente para esta publicación.</p>
                                                </div>
                                            </div>
                                            {authorMode === 'custom' && (
                                                <Input 
                                                    id="customAuthor"
                                                    label=""
                                                    placeholder="Ej: Equipo Académico"
                                                    value={customAuthor}
                                                    onChange={(e) => setCustomAuthor(e.target.value)}
                                                    className="mt-2 text-sm"
                                                />
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-end">
                                    <Button onClick={handlePublish} disabled={isPublishing || !selectedCommunity || (authorMode === 'custom' && !customAuthor.trim())}>
                                        {isPublishing ? <Spinner /> : 'Publicar en Comunidad'}
                                    </Button>
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-6">
                                <p className="text-sm text-slate-600">No te has unido a ninguna comunidad todavía.</p>
                                <p className="text-xs text-slate-500 mt-1">Explora las comunidades y únete a alguna para poder publicar.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ShareModal;