
import React from 'react';
import Button from './Button';
import { QuillanLogo } from './icons';
import { PLANS, PlanName } from '../types';

interface UpgradeModalProps {
    feature: string;
    requiredPlan: PlanName;
    onClose: () => void;
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({ feature, requiredPlan, onClose }) => {
    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div 
                className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 text-center"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="mx-auto mb-6 h-16 w-16 p-3 bg-teal-600 rounded-full text-white flex items-center justify-center">
                    <QuillanLogo className="w-full h-full" />
                </div>
                
                <h2 className="text-2xl font-bold text-slate-900">Función Premium</h2>
                <p className="text-slate-600 mt-2">
                    La función <span className="font-semibold text-teal-600">"{feature}"</span> está disponible en el plan <span className="font-semibold">{PLANS[requiredPlan].name}</span> y superiores.
                </p>
                <p className="text-sm text-slate-500 mt-4">
                    Actualiza tu plan para desbloquear esta y muchas otras funciones avanzadas que te ayudarán a crear contenido aún mejor.
                </p>

                <div className="mt-8 space-y-3">
                    <Button onClick={() => alert('Redirigiendo a la página de precios...')} className="w-full">
                        Ver Planes y Precios
                    </Button>
                     <Button onClick={onClose} className="w-full !bg-transparent !text-slate-600 hover:!bg-slate-100">
                        Quizás más tarde
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default UpgradeModal;