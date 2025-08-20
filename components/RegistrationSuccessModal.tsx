import React, { useState } from 'react';
import Button from './Button';
import { MailSendIcon } from './icons';
import Spinner from './Spinner';

interface RegistrationSuccessModalProps {
    email: string;
    onClose: () => void;
    onResend: () => Promise<any>;
}

const RegistrationSuccessModal: React.FC<RegistrationSuccessModalProps> = ({ email, onClose, onResend }) => {
    const [isResending, setIsResending] = useState(false);
    const [resendSuccess, setResendSuccess] = useState(false);

    const handleResendClick = async () => {
        setIsResending(true);
        setResendSuccess(false);
        await onResend();
        setIsResending(false);
        setResendSuccess(true);
        setTimeout(() => setResendSuccess(false), 3000); // Reset after 3s
    }

    return (
        <div 
            className="fixed inset-0 bg-slate-900 bg-opacity-60 z-50 flex items-center justify-center p-4"
        >
            <div 
                className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 text-center"
            >
                <div className="mx-auto mb-6 h-20 w-20">
                    <MailSendIcon />
                </div>
                
                <h2 className="text-2xl font-bold text-slate-900">¡Registro Exitoso!</h2>
                <p className="text-slate-600 mt-2">
                    Hemos enviado un enlace de verificación a:
                </p>
                <p className="font-semibold text-indigo-600 my-2">{email}</p>
                <p className="text-sm text-slate-500">
                    Por favor, revisa tu bandeja de entrada (y la carpeta de spam) para activar tu cuenta.
                </p>

                <div className="mt-8 space-y-3">
                    <Button onClick={onClose} className="w-full">
                        Entendido
                    </Button>
                    <div className="text-xs text-slate-500">
                        ¿No recibiste el correo? 
                        <button 
                            onClick={handleResendClick} 
                            disabled={isResending || resendSuccess}
                            className="font-semibold text-indigo-600 hover:underline ml-1 disabled:text-slate-400 disabled:cursor-not-allowed"
                        >
                             {isResending 
                                ? <span className="flex items-center justify-center"><Spinner className="w-4 h-4 mr-2" /> Reenviando...</span>
                                : resendSuccess ? '¡Correo Reenviado!' : 'Reenviar Verificación'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegistrationSuccessModal;