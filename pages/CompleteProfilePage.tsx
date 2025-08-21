import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../services/firebase';

const CompleteProfilePage: React.FC = () => {
    const { currentUser, setError } = useAuth();
    const [name, setName] = useState('');
    const [bio, setBio] = useState('');
    const [role, setRole] = useState('estudiante');
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const { set, ref } = await import('firebase/database');
            const profile = {
                name,
                bio,
                role,
                avatar: {
                    color: 'bg-slate-500',
                    initials: name.charAt(0).toUpperCase(),
                },
                plan: 'free',
                certificate_uses_left: 1,
            };
            await set(ref(db, `profiles/${currentUser.id}`), profile);
            setShowModal(true);
        } catch (err: any) {
            setError('Error al guardar el perfil.');
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 animate-fadeIn">
                <h2 className="text-2xl font-bold mb-4 text-teal-700">Completa tu perfil</h2>
                <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
                    <input
                        name="name"
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="Nombre completo"
                        className="w-full px-4 py-3 border-2 border-teal-200 rounded-xl text-base focus:border-teal-500 transition-all duration-300 shadow-sm"
                        required
                        maxLength={40}
                    />
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-slate-700 mb-1">¿Cuál es tu rol principal?</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button type="button" onClick={() => setRole('estudiante')} className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all duration-300 shadow-sm text-base font-medium ${role==='estudiante' ? 'border-teal-500 bg-teal-50 scale-105' : 'border-slate-200 bg-white'}`}>🎓 Estudiante</button>
                            <button type="button" onClick={() => setRole('profesor')} className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all duration-300 shadow-sm text-base font-medium ${role==='profesor' ? 'border-teal-500 bg-teal-50 scale-105' : 'border-slate-200 bg-white'}`}>👨‍🏫 Profesor</button>
                            <button type="button" onClick={() => setRole('coach')} className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all duration-300 shadow-sm text-base font-medium ${role==='coach' ? 'border-teal-500 bg-teal-50 scale-105' : 'border-slate-200 bg-white'}`}>🧑‍💼 Coach</button>
                            <button type="button" onClick={() => setRole('autodidacta')} className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all duration-300 shadow-sm text-base font-medium ${role==='autodidacta' ? 'border-teal-500 bg-teal-50 scale-105' : 'border-slate-200 bg-white'}`}>🤓 Autodidacta</button>
                        </div>
                    </div>
                    <textarea
                        name="bio"
                        value={bio}
                        onChange={e => setBio(e.target.value)}
                        placeholder="Cuéntanos algo sobre ti..."
                        className="w-full px-4 py-3 border-2 border-teal-200 rounded-xl text-base focus:border-teal-500 transition-all duration-300 shadow-sm"
                        rows={3}
                        maxLength={120}
                    />
                    <button type="submit" className="mt-2 px-6 py-3 bg-teal-600 text-white rounded-xl font-semibold shadow-md hover:bg-teal-700 transition-all duration-300" disabled={loading}>
                        Guardar perfil
                    </button>
                </form>
            </div>
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-fadeIn">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-8 flex flex-col items-center">
                        <svg className="w-16 h-16 text-teal-500 mb-4 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        <h3 className="text-xl font-bold mb-2 text-teal-700">¡Revisa tu correo!</h3>
                        <p className="mb-4 text-slate-700 text-center">Para completar tu registro, verifica tu cuenta desde el enlace enviado a tu correo electrónico.</p>
                        <span className="text-xs text-slate-500">Debes ingresar por el link para activar tu cuenta.</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CompleteProfilePage;
