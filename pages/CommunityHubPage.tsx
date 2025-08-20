

import React from 'react';
import type { Community } from '../types';
import { UsersIcon, Cog6ToothIcon } from '../components/icons';
import Button from '../components/Button';
import Spinner from '../components/Spinner';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { useUI } from '../contexts/UIContext';

const CommunityHubPage: React.FC = () => {
    const { currentUser } = useAuth();
    const { communities, joinCommunity, actionLoading } = useData();
    const { navigate, openCreateCommunityModal } = useUI();

    if (!currentUser) return null;

    const myCommunities = communities.filter(c => c.members.includes(currentUser.id));
    const exploreCommunities = communities.filter(c => !c.members.includes(currentUser.id) && c.visibility === 'public');

    const CommunityCard = ({ community }: { community: Community }) => {
        const isMember = community.members.includes(currentUser.id);
        const isCreator = community.creator_id === currentUser.id;
        const isJoining = actionLoading === `joining-community-${community.id}`;

        return (
             <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200 flex flex-col">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                            <UsersIcon className="w-5 h-5" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800">{community.name}</h3>
                    </div>
                    {isCreator && (
                        <button 
                            onClick={() => navigate('communitySettings', community)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full"
                            title="Gestionar Comunidad"
                        >
                            <Cog6ToothIcon className="w-5 h-5"/>
                        </button>
                    )}
                </div>
                <p className="text-slate-600 text-sm flex-grow mb-4">{community.description}</p>
                <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-slate-500">{community.member_count} miembro(s) &middot; {community.visibility === 'public' ? 'Pública' : 'Privada'}</span>
                     {isMember ? (
                        <button 
                            onClick={() => navigate('communityFeed', community)}
                            className="text-center px-4 py-2 bg-slate-100 text-slate-700 font-semibold text-sm rounded-md"
                        >
                            Ver
                        </button>
                     ) : (
                        <button 
                            onClick={() => joinCommunity(community.id)}
                            disabled={isJoining}
                            className="text-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-md transition-colors disabled:bg-indigo-400"
                        >
                           {isJoining ? <Spinner className="w-4 h-4"/> : 'Unirse'}
                        </button>
                     )}
                </div>
            </div>
        )
    };

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Comunidades</h1>
                    <p className="mt-1 text-slate-600">Descubre, únete y comparte en comunidades temáticas.</p>
                </div>
                <Button onClick={openCreateCommunityModal} className="flex-shrink-0">
                    + Crear Comunidad
                </Button>
            </div>

            {myCommunities.length > 0 && (
                <section className="mb-10">
                    <h2 className="text-xl font-bold text-slate-800 mb-4">Mis Comunidades</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                       {myCommunities.map(c => <CommunityCard key={c.id} community={c} />)}
                    </div>
                </section>
            )}

             <section>
                <h2 className="text-xl font-bold text-slate-800 mb-4">Explorar Comunidades Públicas</h2>
                {exploreCommunities.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {exploreCommunities.map(c => <CommunityCard key={c.id} community={c} />)}
                    </div>
                ) : (
                     <div className="text-center py-10 bg-white rounded-2xl border border-slate-200">
                        <p className="text-slate-600">No hay más comunidades públicas para explorar por ahora.</p>
                    </div>
                )}
            </section>
        </div>
    );
};

export default CommunityHubPage;