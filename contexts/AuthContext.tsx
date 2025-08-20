

import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import type { User, CreatorProfile } from '../types';
import supabase from '../services/supabase';
import { useUI } from './UIContext';

interface AuthContextType {
    currentUser: User | null;
    loading: boolean;
    error: string | null;
    setError: (error: string | null) => void;
    signIn: (email: string, password: string) => Promise<boolean>;
    signUp: (email: string, password: string) => Promise<boolean>;
    signOut: () => void;
    updateUserProfile: (profile: CreatorProfile) => Promise<boolean>;
    updatePassword: (current: string, newPass: string) => Promise<boolean>;
    resendConfirmation: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { addToast } = useUI();

    useEffect(() => {
        const checkUser = async () => {
            setLoading(true);
            const { data, error } = await supabase.getUser();
            if (data) setCurrentUser(data);
            if (error) console.error("Auth check error:", error);
            setLoading(false);
        };
        checkUser();

        const { data: authListener } = supabase.client.auth.onAuthStateChange(
            async (event, session) => {
                if (event === 'SIGNED_IN' || event === 'USER_UPDATED' || event === 'TOKEN_REFRESHED') {
                    const { data } = await supabase.getUser();
                    setCurrentUser(data);
                }
                if (event === 'SIGNED_OUT') {
                    setCurrentUser(null);
                }
            }
        );

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);

    const signIn = async (email: string, password: string): Promise<boolean> => {
        setLoading(true);
        setError(null);
        const { error } = await supabase.signIn(email, password);
        if (error) {
            if (error.message.toLowerCase().includes('email not confirmed')) {
                addToast('Tu cuenta aún no ha sido verificada. Revisa tu correo.', 'error');
            } else {
                setError('Email o contraseña incorrectos.'); // Keep this for form-level feedback
            }
            setLoading(false);
            return false;
        }
        setLoading(false);
        return true;
    };

    const signUp = async (email: string, password: string): Promise<boolean> => {
        setLoading(true);
        setError(null);
        const { error } = await supabase.signUp(email, password);
        if (error) {
            if (error.message.toLowerCase().includes('user already registered')) {
                await resendConfirmation(email);
                return true; // Treat as success to show the confirmation modal
            }
            setError(error.message || 'Ocurrió un error al registrar.');
            setLoading(false);
            return false;
        }
        setLoading(false);
        return true;
    };

    const signOut = async () => {
        await supabase.signOut();
        setCurrentUser(null);
    };

    const updateUserProfile = async (profile: CreatorProfile): Promise<boolean> => {
        if (!currentUser) return false;
        setLoading(true);
        const { data, error } = await supabase.updateUserProfile(currentUser.id, profile);
        if (error || !data) {
             addToast(error?.message || "Error al actualizar el perfil.", 'error');
             setLoading(false);
             return false;
        }
        const { data: updatedUser } = await supabase.getUser();
        setCurrentUser(updatedUser);
        addToast('Perfil actualizado con éxito!', 'success');
        setLoading(false);
        return true;
    };
    
    const updatePassword = async (current: string, newPass: string): Promise<boolean> => {
        if (!currentUser || !currentUser.email) return false;
        setLoading(true);
        setError('');
        
        const { error: signInError } = await supabase.signIn(currentUser.email, current);
        if (signInError) {
             setError('La contraseña actual es incorrecta.');
             setLoading(false);
             return false;
        }

        const { error: updateError } = await supabase.updatePassword(newPass);
        if(updateError) {
            setError(updateError.message);
            setLoading(false);
            return false;
        }
        
        addToast('¡Contraseña actualizada con éxito!', 'success');
        setLoading(false);
        return true;
    }

    const resendConfirmation = async (email: string) => {
        await supabase.resendConfirmationEmail(email);
        addToast('Correo de verificación reenviado.', 'info');
    };
    

    const value = { currentUser, loading, error, setError, signIn, signUp, signOut, updateUserProfile, updatePassword, resendConfirmation };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};