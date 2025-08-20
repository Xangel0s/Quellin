

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
            console.debug('[Auth] checkUser: start');
            setLoading(true);
            let attempt = 0;
            const maxAttempts = 2;
            let finalError: any = null;

            while (attempt < maxAttempts) {
                attempt += 1;
                try {
                    // Prevent hanging indefinitely if Supabase doesn't respond
                    const timeout = new Promise<{ data: any; error: Error | null }>((resolve) => {
                        setTimeout(() => resolve({ data: null, error: new Error('Auth check timed out') }), 8000);
                    });

                    const result = await Promise.race([supabase.getUser(), timeout]);
                    console.debug('[Auth] checkUser: attempt', attempt, 'result', result);
                    const { data, error } = result as { data: any; error: any };
                    if (data) {
                        setCurrentUser(data);
                        finalError = null;
                        break;
                    }
                    if (error) {
                        finalError = error;
                        console.warn('[Auth] checkUser attempt error:', error);
                    }
                } catch (err) {
                    finalError = err;
                    console.error('Unexpected error during auth check attempt:', attempt, err);
                }

                if (attempt < maxAttempts) {
                    // wait a little before retrying
                    await new Promise((r) => setTimeout(r, 1000));
                    console.debug('[Auth] retrying auth check (attempt', attempt + 1, ')');
                }
            }

            // Only show the toast after all attempts failed
            if (finalError) {
                console.error('Auth check error:', finalError);
                addToast('No se pudo verificar la sesión. Revisa tu conexión.', 'error');
            }

            setLoading(false);
            console.debug('[Auth] checkUser: finished (loading=false)');
        };
        checkUser();

        const { data: authListener } = supabase.client.auth.onAuthStateChange(
            async (event, session) => {
                console.debug('[Auth] authListener event', event, session);
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
            try {
                // Be defensive: subscription may not exist if supabase failed to initialize
                (authListener as any)?.subscription?.unsubscribe?.();
            } catch (e) {
                console.debug('No auth listener to unsubscribe or error during unsubscribe', e);
            }
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
        // Refresca la sesión y el usuario para asegurar que el avatar y datos se actualicen en todos los componentes
        const { data: sessionData } = await supabase.client.auth.getSession();
        if (sessionData?.session?.user?.id) {
            const { data: updatedUser } = await supabase.getUser();
            setCurrentUser(updatedUser);
        }
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