
import React from 'react';
import type { View } from '../types';
import { PLANS } from '../types';
import Avatar from './Avatar';
import PlanBadge from './PlanBadge';
import { QuillanLogo, DocumentDuplicateIcon, UsersIcon, LogoutIcon } from './icons';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { useUI } from '../contexts/UIContext';

const Sidebar: React.FC = () => {
    const { currentUser, signOut } = useAuth();
    const { contentItems } = useData();
    const { view, navigate } = useUI();

    // Si no hay usuario o el perfil está incompleto, muestra un loader o mensaje
    if (!currentUser || !currentUser.profile || !currentUser.profile.plan) {
        return (
            <div className="w-64 h-screen flex items-center justify-center bg-white border-r border-slate-200">
                <span className="text-slate-400 text-sm">Cargando perfil...</span>
            </div>
        );
    }

    const userPlan = PLANS[currentUser.profile.plan];
    const usageLimit = userPlan.limits.content;
    const contentCount = contentItems.length;
    const usagePercentage = isFinite(usageLimit) && usageLimit > 0 ? Math.min((contentCount / usageLimit) * 100, 100) : 0;

    const getNavItemClass = (navView: View) => {
        const baseClass = "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors w-full text-left";
        const isActive = view === navView || (view === 'communityFeed' && navView === 'communities');
        return isActive 
            ? `${baseClass} bg-teal-100 text-teal-800`
            : `${baseClass} text-slate-600 hover:bg-slate-200 hover:text-slate-800`;
    };

    return (
        <aside className="w-64 bg-white border-r border-slate-200 flex flex-col flex-shrink-0">
            <div className="h-16 flex items-center gap-3 px-4 border-b border-slate-200">
                <div className="p-2 bg-teal-600 rounded-lg text-white">
                    <QuillanLogo className="w-6 h-6" />
                </div>
                <h1 className="text-lg font-bold text-slate-900">Quillan</h1>
            </div>

            <nav className="flex-1 p-4 space-y-2">
                <button onClick={() => navigate('dashboard')} className={getNavItemClass('dashboard')}>
                    <DocumentDuplicateIcon className="w-5 h-5" />
                    <span>Mi Biblioteca</span>
                </button>
                <button onClick={() => navigate('communities')} className={getNavItemClass('communities')}>
                    <UsersIcon className="w-5 h-5" />
                    <span>Comunidades</span>
                </button>
                 <button onClick={() => navigate('generator')} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors w-full text-left bg-teal-600 text-white hover:bg-teal-700 mt-4">
                    <QuillanLogo className="w-5 h-5" />
                    <span>Crear Nuevo</span>
                </button>
            </nav>

            <div className="p-4 border-t border-slate-200 space-y-4">
                 <div>
                    <div className="flex justify-between items-center text-xs mb-1">
                        <span className="font-medium text-slate-600">Uso Mensual</span>
                        <span className="text-slate-500">{isFinite(usageLimit) ? `${contentCount} / ${usageLimit}` : `${contentCount}`} creaciones</span>
                    </div>
                    {isFinite(usageLimit) && (
                        <div className="w-full bg-slate-200 rounded-full h-1.5">
                            <div 
                                className="bg-teal-500 h-1.5 rounded-full"
                                style={{width: `${usagePercentage}%`}}
                            ></div>
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-between">
                     <button onClick={() => navigate('profile', currentUser)} className="flex items-center gap-3 text-left min-w-0 p-1 rounded-md hover:bg-slate-100">
                        <Avatar profile={currentUser.profile} />
                        <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-800 truncate">{currentUser.profile.name}</p>
                            <PlanBadge plan={currentUser.profile.plan} />
                        </div>
                    </button>
                    <button onClick={signOut} title="Cerrar sesión" className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-full transition-colors flex-shrink-0">
                        <LogoutIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </aside>
    );
}

export default Sidebar;