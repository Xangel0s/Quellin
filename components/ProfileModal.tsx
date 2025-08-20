

import React, { useState } from 'react';
import Input from './Input';
import Button from './Button';
import Textarea from './Textarea';
import Avatar from './Avatar';
import PlanBadge from './PlanBadge';
import type { CreatorProfile } from '../types';
import { UserIcon } from './icons';
import Spinner from './Spinner';
import { useAuth } from '../contexts/AuthContext';
import { useUI } from '../contexts/UIContext';

const avatarColors = [
    'bg-slate-500', 'bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-yellow-500',
    'bg-lime-500', 'bg-green-500', 'bg-emerald-500', 'bg-teal-500', 'bg-cyan-500',
    'bg-sky-500', 'bg-blue-500', 'bg-indigo-500', 'bg-violet-500', 'bg-purple-500',
    'bg-fuchsia-500', 'bg-pink-500', 'bg-rose-500'
];

type View = 'profile' | 'security';

const ProfileModal: React.FC = () => {
    const { currentUser, updateUserProfile, updatePassword, loading, error, setError } = useAuth();
    const { closeAllModals } = useUI();

    const [view, setView] = useState<View>('profile');
    const [profile, setProfile] = useState<CreatorProfile | null>(currentUser?.profile || null);
    
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');

    if (!profile || !currentUser) return null;

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (profile.name.trim()) {
            const initials = profile.name.trim().charAt(0).toUpperCase();
            const success = await updateUserProfile({ ...profile, name: profile.name.trim(), avatar: { ...profile.avatar, initials } });
            if (success) {
                closeAllModals();
            }
        } else {
            setError("El nombre no puede estar vacío.");
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (newPassword !== confirmNewPassword) {
            setError('Las nuevas contraseñas no coinciden.');
            return;
        }
        if (newPassword.length < 8) {
            setError('La nueva contraseña debe tener al menos 8 caracteres.');
            return;
        }

        const success = await updatePassword(currentPassword, newPassword);
        if(success) {
            setCurrentPassword('');
            setNewPassword('');
            setConfirmNewPassword('');
        }
    }

    const handleFieldChange = (field: keyof Omit<CreatorProfile, 'avatar' | 'plan' | 'certificate_uses_left'>, value: string) => {
        setProfile(prev => prev ? ({...prev, [field]: value}) : null);
    }

    const handleAvatarColorChange = (color: string) => {
        setProfile(prev => prev ? ({ ...prev, avatar: { ...prev.avatar, color } }) : null);
    }

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={closeAllModals}
        >
            <div 
                className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative"
                onClick={(e) => e.stopPropagation()}
            >
                <button 
                    onClick={closeAllModals} 
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
                    title="Cerrar"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-teal-100 text-teal-600 rounded-lg">
                        <UserIcon className="w-6 h-6"/>
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Editar Perfil</h2>
                    </div>
                </div>

                <div className="mb-4 border-b border-slate-200">
                    <nav className="-mb-px flex space-x-4" aria-label="Tabs">
                        <button onClick={() => setView('profile')} className={`px-1 py-2 text-sm font-medium border-b-2 ${view === 'profile' ? 'border-teal-500 text-teal-600' : 'border-transparent text-slate-500 hover:border-slate-300'}`}>
                           Perfil Público
                        </button>
                        <button onClick={() => setView('security')} className={`px-1 py-2 text-sm font-medium border-b-2 ${view === 'security' ? 'border-teal-500 text-teal-600' : 'border-transparent text-slate-500 hover:border-slate-300'}`}>
                           Seguridad
                        </button>
                    </nav>
                </div>

                {view === 'profile' && (
                    <form onSubmit={handleSaveProfile} className="space-y-4">
                         <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                             <span className="text-sm font-medium text-slate-600">Plan Actual</span>
                             <div className="flex items-center gap-2">
                                <PlanBadge plan={profile.plan} />
                                <Button type="button" className="!py-1 !px-3 !text-xs !font-semibold">Actualizar Plan</Button>
                             </div>
                         </div>
                        <div className="flex items-center gap-4">
                            <Avatar profile={profile} size="lg" />
                            <Input
                                id="creatorName"
                                label="Tu Nombre"
                                value={profile.name}
                                onChange={(e) => handleFieldChange('name', e.target.value)}
                                placeholder="Ej: Prof. Smith"
                                className="flex-1"
                                required
                            />
                        </div>
                        <Textarea
                            id="bio"
                            label="Biografía Corta"
                            value={profile.bio}
                            onChange={(e) => handleFieldChange('bio', e.target.value)}
                            placeholder="Ej: Apasionado por la historia y la tecnología."
                            rows={2}
                            maxLength={100}
                        />
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Color del Avatar</label>
                            <div className="flex flex-wrap gap-2">
                                {avatarColors.map(color => (
                                    <button
                                        key={color}
                                        type="button"
                                        onClick={() => handleAvatarColorChange(color)}
                                        className={`w-8 h-8 rounded-full ${color} transition-transform duration-150 ${profile.avatar.color === color ? 'ring-2 ring-offset-2 ring-teal-500' : 'hover:scale-110'}`}
                                        aria-label={`Select ${color} color`}
                                    ></button>
                                ))}
                            </div>
                        </div>
                        {error && <p className="text-sm text-red-500 text-center">{error}</p>}
                        <div className="flex justify-end gap-3 pt-4">
                            <Button type="button" onClick={closeAllModals} className="!bg-slate-200 !text-slate-800 hover:!bg-slate-300">
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading ? <Spinner /> : 'Guardar Cambios'}
                            </Button>
                        </div>
                    </form>
                )}

                {view === 'security' && (
                     <form onSubmit={handlePasswordChange} className="space-y-4">
                         <Input
                            id="currentPassword"
                            label="Contraseña Actual"
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            required
                        />
                        <Input
                            id="newPassword"
                            label="Nueva Contraseña"
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                        />
                        <Input
                            id="confirmNewPassword"
                            label="Confirmar Nueva Contraseña"
                            type="password"
                            value={confirmNewPassword}
                            onChange={(e) => setConfirmNewPassword(e.target.value)}
                            required
                        />
                        {error && <p className="text-sm text-red-500 text-center">{error}</p>}
                        <div className="flex justify-end gap-3 pt-4">
                            <Button type="button" onClick={closeAllModals} className="!bg-slate-200 !text-slate-800 hover:!bg-slate-300">
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading ? <Spinner /> : 'Cambiar Contraseña'}
                            </Button>
                        </div>
                     </form>
                )}
            </div>
        </div>
    );
};

export default ProfileModal;