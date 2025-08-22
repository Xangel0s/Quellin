

import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { auth, db } from '../services/firebase';
import { useUI } from './UIContext';
import type { CreatorProfile } from '../types';

// Funciones para persistencia en localStorage
const USER_KEY = 'quellin.currentUser';
function saveUserToLocalStorage(user: any) {
    try { localStorage.setItem(USER_KEY, JSON.stringify(user)); } catch {}
}
function getUserFromLocalStorage() {
    try {
        const raw = localStorage.getItem(USER_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch { return null; }
}
function removeUserFromLocalStorage() {
    try { localStorage.removeItem(USER_KEY); } catch {}
}

interface AuthContextType {
    currentUser: any;
    loading: boolean;
    error: string | null;
    setError: (error: string | null) => void;
    signIn: (email: string, password: string) => Promise<boolean>;
    signUp: (email: string, password: string) => Promise<boolean>;
    signOut: () => Promise<void>;
    updateUserProfile: (profile: CreatorProfile) => Promise<boolean>;
    updatePassword: (newPass: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<any>(getUserFromLocalStorage());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { addToast } = useUI();
       const [showProfileModal, setShowProfileModal] = useState(false);

    useEffect(() => {
        setLoading(true);
        const handleAuthChange = async (user: any) => {
            if (user) {
                // Obtener perfil de la base de datos
                const { get, ref } = await import('firebase/database');
                let profile = null;
                try {
                    const snap = await get(ref(db, `profiles/${user.uid}`));
                    profile = snap.exists() ? snap.val() : null;
                } catch {}
                const userObj = {
                    id: user.uid,
                    email: user.email,
                    profile,
                };
                setCurrentUser(userObj);
                saveUserToLocalStorage(userObj);
                // Si el usuario está verificado pero no tiene perfil, mostrar modal de perfil
                if (user.emailVerified && !profile) {
                    setShowProfileModal(true);
                }
            } else {
                setCurrentUser(null);
                removeUserFromLocalStorage();
            }
            setLoading(false);
        };
        const unsubscribe = auth.onAuthStateChanged((user) => {
            // Llama a la función async sin bloquear el callback
            handleAuthChange(user);
        });
        return () => unsubscribe();
    }, []);

    const signIn = async (email: string, password: string): Promise<boolean> => {
        setLoading(true);
        setError(null);
        try {
            // Firebase modular API
            const { signInWithEmailAndPassword } = await import('firebase/auth');
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            setCurrentUser(userCredential.user);
            saveUserToLocalStorage(userCredential.user);
            setLoading(false);
            return true;
        } catch (error: any) {
            setError('Email o contraseña incorrectos.');
            setLoading(false);
            return false;
        }
    };

    const signUp = async (email: string, password: string): Promise<boolean> => {
        setLoading(true);
        setError(null);
        try {
                const { createUserWithEmailAndPassword, sendEmailVerification } = await import('firebase/auth');
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                // Enviar correo de verificación inmediatamente usando el user devuelto
                try {
                    const actionCodeSettings = { url: window.location.origin + window.location.pathname, handleCodeInApp: false };
                    if (userCredential && userCredential.user) {
                        await sendEmailVerification(userCredential.user, actionCodeSettings);
                    }
                } catch (sendErr: any) {
                    // registrar el error pero no bloquear el flujo de registro
                    console.error('sendEmailVerification after signUp failed:', sendErr);
                }
            // Guardar usuario en contexto/localStorage sin perfil aún
            const userObj = {
                id: userCredential.user.uid,
                email: userCredential.user.email,
                profile: null,
            };
            setCurrentUser(userObj);
            saveUserToLocalStorage(userObj);
            setLoading(false);
            // Redirigir a la página de onboarding
            window.location.hash = '#onboarding';
            return true;
        } catch (error: any) {
            setError(error.message || 'Ocurrió un error al registrar.');
            setLoading(false);
            return false;
        }
    };

    const signOut = async () => {
        await auth.signOut();
        setCurrentUser(null);
        removeUserFromLocalStorage();
    };

    const updateUserProfile = async (profile: CreatorProfile): Promise<boolean> => {
        // Aquí deberás implementar la lógica para actualizar el perfil en Firebase Database o Firestore
        addToast('Perfil actualizado con éxito!', 'success');
        return true;
    };

    const updatePassword = async (newPass: string): Promise<boolean> => {
        if (!auth.currentUser) return false;
        setLoading(true);
        setError('');
        try {
            // Firebase modular API
            const { updatePassword } = await import('firebase/auth');
            await updatePassword(auth.currentUser, newPass);
            addToast('¡Contraseña actualizada con éxito!', 'success');
            setLoading(false);
            return true;
        } catch (error: any) {
            setError(error.message || 'Error al actualizar la contraseña.');
            setLoading(false);
            return false;
        }
    };

    const value = { currentUser, loading, error, setError, signIn, signUp, signOut, updateUserProfile, updatePassword };

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
}

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
