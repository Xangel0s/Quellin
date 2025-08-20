
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useUI } from '../contexts/UIContext';

interface HeaderProps {
    pageTitle: string;
}

const Header: React.FC<HeaderProps> = ({ pageTitle }) => {
    const { currentUser } = useAuth();
    const { navigate, openProfileModal } = useUI();
    
    if (!currentUser) return null;

    return (
        <header className="bg-white shadow-sm sticky top-0 z-10 flex-shrink-0">
            <div className="px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <h1 className="text-2xl font-bold text-slate-900">{pageTitle}</h1>
                    <div className="flex items-center gap-4">
                         <button 
                            onClick={() => navigate('profile', currentUser)}
                            title="Ver mi perfil público"
                            className="text-sm font-semibold text-slate-600 hover:text-teal-600"
                        >
                           Mi Perfil
                        </button>
                        <button 
                            onClick={openProfileModal}
                            title="Editar Perfil"
                            className="p-2 bg-slate-100 rounded-full text-slate-600 hover:bg-slate-200 hover:text-slate-800 transition-colors"
                        >
                           <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M10 3.75a2 2 0 100 4 2 2 0 000-4zM4 3.75a2 2 0 100 4 2 2 0 000-4zM16 3.75a2 2 0 100 4 2 2 0 000-4zM10 8.75a2 2 0 100 4 2 2 0 000-4zM4 8.75a2 2 0 100 4 2 2 0 000-4zM16 8.75a2 2 0 100 4 2 2 0 000-4zM10 13.75a2 2 0 100 4 2 2 0 000-4zM4 13.75a2 2 0 100 4 2 2 0 000-4zM16 13.75a2 2 0 100 4 2 2 0 000-4z" /></svg>
                        </button>
                    </div>
                </div>
            </div>
      </header>
    )
}

export default Header;