

import React, { useState } from 'react';
import Input from './Input';
import Button from './Button';
import Textarea from './Textarea';
import Spinner from './Spinner';
import { UsersIcon } from './icons';
import { useData } from '../contexts/DataContext';
import { useUI } from '../contexts/UIContext';

const CreateCommunityModal: React.FC = () => {
    const { createCommunity, actionLoading } = useData();
    const { closeAllModals, navigate } = useUI();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [visibility, setVisibility] = useState<'public' | 'private'>('public');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim() && description.trim()) {
            const newCommunity = await createCommunity(name.trim(), description.trim(), visibility);
            if (newCommunity) {
                closeAllModals();
                navigate('communityFeed', newCommunity);
            }
        }
    };

    const isCreating = actionLoading === 'creating-community';

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={closeAllModals}
        >
            <div 
                className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 relative"
                onClick={(e) => e.stopPropagation()}
            >
                <button 
                    onClick={closeAllModals} 
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
                    title="Cerrar"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-teal-100 text-teal-600 rounded-lg">
                        <UsersIcon className="w-6 h-6"/>
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Crear Nueva Comunidad</h2>
                        <p className="text-sm text-slate-500">Crea un espacio para un tema específico.</p>
                    </div>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        id="communityName"
                        label="Nombre de la Comunidad"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ej: Amantes de la Historia Antigua"
                        required
                        maxLength={50}
                    />
                    <Textarea
                        id="communityDescription"
                        label="Descripción"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Una breve descripción sobre el propósito de esta comunidad."
                        rows={3}
                        required
                        maxLength={150}
                    />
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Visibilidad</label>
                        <div className="flex gap-4">
                             <div className="flex items-center">
                                <input id="public" name="visibility" type="radio" value="public" checked={visibility === 'public'} onChange={() => setVisibility('public')} className="h-4 w-4 border-slate-300 text-teal-600 focus:ring-teal-600" />
                                <label htmlFor="public" className="ml-3 block text-sm font-medium leading-6 text-slate-900">Pública <span className="text-xs text-slate-500 font-normal">(Visible para todos)</span></label>
                            </div>
                            <div className="flex items-center">
                                <input id="private" name="visibility" type="radio" value="private" checked={visibility === 'private'} onChange={() => setVisibility('private')} className="h-4 w-4 border-slate-300 text-teal-600 focus:ring-teal-600" />
                                <label htmlFor="private" className="ml-3 block text-sm font-medium leading-6 text-slate-900">Privada <span className="text-xs text-slate-500 font-normal">(Solo por invitación)</span></label>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                         <Button type="button" onClick={closeAllModals} className="!bg-slate-200 !text-slate-800 hover:!bg-slate-300">
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isCreating || !name.trim() || !description.trim()}>
                            {isCreating ? <Spinner /> : 'Crear Comunidad'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateCommunityModal;