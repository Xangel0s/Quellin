
import React, { useState, useEffect } from 'react';
import Button from '../components/Button';
import Input from '../components/Input';
import Spinner from '../components/Spinner';
import { QuillanLogo } from '../components/icons';
import { UserCircleIcon, CheckIcon } from '../components/icons';
import RegistrationSuccessModal from '../components/RegistrationSuccessModal';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const { signIn, signUp, resendConfirmation, loading, error, setError } = useAuth();

  const [passwordValidity, setPasswordValidity] = useState({
    minLength: false,
    hasNumber: false,
    hasSpecialChar: false,
  });

  useEffect(() => {
    if (!isLogin) {
      setPasswordValidity({
        minLength: password.length >= 8,
        hasNumber: /\d/.test(password),
        hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      });
    }
  }, [password, isLogin]);

  const allPasswordRequirementsMet = Object.values(passwordValidity).every(Boolean);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLogin) {
      if (password !== confirmPassword) {
        setError('Las contraseñas no coinciden.');
        return;
      }
      if (!allPasswordRequirementsMet) {
        setError('La contraseña no cumple con todos los requisitos de seguridad.');
        return;
      }
      const success = await signUp(email, password);
      if (success) {
        setShowSuccessModal(true);
      }
    } else {
      await signIn(email, password);
    }
  };
  
  const PasswordRequirement: React.FC<{met: boolean; text: string}> = ({met, text}) => (
    <div className={`flex items-center text-xs transition-colors ${met ? 'text-green-600' : 'text-slate-500'}`}>
        <CheckIcon className={`w-3.5 h-3.5 mr-1.5 ${met ? 'opacity-100' : 'opacity-40'}`} />
        {text}
    </div>
  );

  if (showSuccessModal) {
    return (
        <RegistrationSuccessModal 
            email={email}
            onClose={() => {
                setShowSuccessModal(false);
                setIsLogin(true);
                setEmail('');
                setPassword('');
                setConfirmPassword('');
            }}
            onResend={() => resendConfirmation(email)}
        />
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4">
        <div className="w-full max-w-md">
            <div className="flex justify-center items-center gap-3 mb-8">
                 <div className="p-3 bg-teal-600 rounded-lg text-white">
                    <QuillanLogo className="w-8 h-8" />
                </div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Quillan</h1>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200">
                <h2 className="text-xl font-semibold text-center text-slate-800 mb-1">{isLogin ? 'Bienvenido de Nuevo' : 'Crea tu Cuenta'}</h2>
                <p className="text-sm text-center text-slate-500 mb-6">{isLogin ? 'Inicia sesión para continuar.' : 'Regístrate para empezar a crear.'}</p>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        id="email"
                        label="Email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="tu@email.com"
                        icon={<UserCircleIcon className="w-5 h-5 text-slate-400" />}
                        required
                        disabled={loading}
                    />
                    <div>
                        <Input
                            id="password"
                            label="Contraseña"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            icon={<svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-slate-400"><path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" /></svg>}
                            required
                            disabled={loading}
                        />
                        {!isLogin && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 mt-2 pl-1">
                                <PasswordRequirement met={passwordValidity.minLength} text="Mínimo 8 caracteres" />
                                <PasswordRequirement met={passwordValidity.hasNumber} text="Contiene un número" />
                                <PasswordRequirement met={passwordValidity.hasSpecialChar} text="Contiene un símbolo" />
                            </div>
                        )}
                    </div>

                    {!isLogin && (
                        <Input
                            id="confirmPassword"
                            label="Confirmar Contraseña"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="••••••••"
                            icon={<svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-slate-400"><path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" /></svg>}
                            required
                            disabled={loading}
                        />
                    )}

                    {error && <p className="text-sm text-red-600 text-center pt-2">{error}</p>}

                    <div className="pt-2">
                        <Button type="submit" className="w-full" disabled={loading || (!isLogin && !allPasswordRequirementsMet)}>
                            {loading ? <Spinner className="text-white"/> : (isLogin ? 'Entrar' : 'Crear Cuenta')}
                        </Button>
                    </div>
                </form>
                <p className="text-sm text-slate-500 mt-6 text-center">
                    {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes una cuenta?'}
                    <button onClick={() => {setIsLogin(!isLogin); setError(null);}} className="font-semibold text-teal-600 hover:text-teal-500 ml-1">
                        {isLogin ? 'Regístrate' : 'Inicia Sesión'}
                    </button>
                </p>
            </div>
        </div>
    );
};