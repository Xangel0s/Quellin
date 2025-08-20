
import React, { useState } from 'react';
import type { StoredContentItem } from '../types';
import { PLANS } from '../types';
import Button from '../components/Button';
import ContentListItem from '../components/ContentListItem';
import ShareModal from '../components/ShareModal';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { useUI } from '../contexts/UIContext';

const DashboardPage: React.FC = () => {
    const { currentUser } = useAuth();
    const { contentItems, joinedCommunities } = useData();
    const { navigate, openUpgradeModal } = useUI();

    const [shareModalContent, setShareModalContent] = useState<StoredContentItem | null>(null);

    const handleNavigateWithPlanCheck = (view: 'viewer' | 'analytics', context: StoredContentItem) => {
      if (view === 'analytics' && currentUser && !PLANS[currentUser.profile.plan].features.analytics) {
          openUpgradeModal('Resultados y Analíticas', 'business');
          return;
      }
      navigate(view, context);
    }
    
    if (!currentUser) return null;

    return (
        <>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Tu Biblioteca de Contenido</h1>
                    <p className="mt-1 text-slate-600">Aquí puedes gestionar todos tus cuestionarios y cursos generados.</p>
                </div>
                <Button onClick={() => navigate('generator')} className="flex-shrink-0">
                    + Crear Nuevo Contenido
                </Button>
            </div>
            
            <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg border border-slate-200">
                {contentItems.length > 0 ? (
                     <div className="divide-y divide-slate-200">
                        {contentItems.map(item => (
                            <ContentListItem 
                                key={item.id}
                                item={item}
                                onShare={setShareModalContent}
                                onNavigate={handleNavigateWithPlanCheck}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <h3 className="text-xl font-semibold text-slate-800">Tu biblioteca está vacía</h3>
                        <p className="text-slate-500 mt-2">¡Es hora de crear algo increíble!</p>
                        <Button onClick={() => navigate('generator')} className="mt-6">
                            Empezar a Crear
                        </Button>
                    </div>
                )}
            </div>

            {shareModalContent && (
                <ShareModal 
                    content={shareModalContent}
                    onClose={() => setShareModalContent(null)}
                />
            )}
        </>
    );
};

export default DashboardPage;