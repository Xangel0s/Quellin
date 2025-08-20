

import React, { useState } from 'react';
import type { Community } from '../types';
import Input from '../components/Input';
import Textarea from '../components/Textarea';
import Button from '../components/Button';
import Spinner from '../components/Spinner';
import { useData } from '../contexts/DataContext';
import { useUI } from '../contexts/UIContext';

interface CommunitySettingsPageProps {
    community: Community;
}

const CommunitySettingsPage: React.FC<CommunitySettingsPageProps> = ({ community }) => {
    const { updateCommunity, actionLoading } = useData();
    const { navigate } = useUI();

    const [name, setName] = useState(community.name);
    const [description, setDescription] = useState(community.description);
    const [visibility, setVisibility] = useState<'public' | 'private'>(community.visibility);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const success = await updateCommunity({
            ...community,
            name,
            description,
            visibility,
        });
        if (success) {
            navigate('communities');
        }
    };

    const isUpdating = actionLoading === 'updating-community';

    return (
        <div className="max-w-2xl mx-auto">
             <div className="mb-6">
                 <button onClick={() => navigate('communities')} className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                       <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                    Volver a Comunidades
                </button>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200">
                <form onSubmit={handleSubmit} className="space-y-6">
                     <Input
                        id="communityName"
                        label="Nombre de la Comunidad"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        maxLength={50}
                    />
                    <Textarea
                        id="communityDescription"
                        label="Descripción"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={3}
                        required
                        maxLength={150}
                    />
                     <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Visibilidad</label>
                        <div className="flex gap-4">
                             <div className="flex items-center">
                                <input id="public" name="visibility" type="radio" value="public" checked={visibility === 'public'} onChange={() => setVisibility('public')} className="h-4 w-4 border-slate-300 text-indigo-600 focus:ring-indigo-600" />
                                <label htmlFor="public" className="ml-3 block text-sm font-medium leading-6 text-slate-900">Pública <span className="text-xs text-slate-500 font-normal">(Visible para todos)</span></label>
                            </div>
                            <div className="flex items-center">
                                <input id="private" name="visibility" type="radio" value="private" checked={visibility === 'private'} onChange={() => setVisibility('private')} className="h-4 w-4 border-slate-300 text-indigo-600 focus:ring-indigo-600" />
                                <label htmlFor="private" className="ml-3 block text-sm font-medium leading-6 text-slate-900">Privada <span className="text-xs text-slate-500 font-normal">(Solo miembros pueden ver)</span></label>
                            </div>
                        </div>
                    </div>
                     <div className="flex justify-end pt-4 border-t border-slate-200">
                        <Button type="submit" disabled={isUpdating}>
                            {isUpdating ? <Spinner /> : 'Guardar Cambios'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CommunitySettingsPage;