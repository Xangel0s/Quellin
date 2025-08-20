

import React from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Spinner from './components/Spinner';
import { ToastContainer } from './components/Toast';
import { useAuth } from './contexts/AuthContext';
import { useUI } from './contexts/UIContext';
import { useData } from './contexts/DataContext';

// Lazy load all pages for better performance
const LoginPage = React.lazy(() => import('./pages/LoginPage'));
const DashboardPage = React.lazy(() => import('./pages/DashboardPage'));
const GeneratorPage = React.lazy(() => import('./pages/GeneratorPage'));
const ViewerPage = React.lazy(() => import('./pages/ViewerPage'));
const AnalyticsPage = React.lazy(() => import('./pages/AnalyticsPage'));
const CommunityHubPage = React.lazy(() => import('./pages/CommunityHubPage'));
const CommunityFeedPage = React.lazy(() => import('./pages/CommunityFeedPage'));
const ProfilePage = React.lazy(() => import('./pages/ProfilePage'));
const CommunitySettingsPage = React.lazy(() => import('./pages/CommunitySettingsPage'));
const ProfileModal = React.lazy(() => import('./components/ProfileModal'));
const CreateCommunityModal = React.lazy(() => import('./components/CreateCommunityModal'));
const UpgradeModal = React.lazy(() => import('./components/UpgradeModal'));

const App: React.FC = () => {
  const { currentUser, loading: authLoading } = useAuth();
  const { 
    view, 
    contentForViewer, 
    contentForAnalytics,
    activeCommunity,
    viewedProfile,
    communityToEdit,
    isProfileModalOpen,
    isCreateCommunityModalOpen,
    isUpgradeModalOpen,
    upgradeReason,
    closeAllModals,
    navigate
  } = useUI();

  const { getSubmissionsForContent, submissions, loading: dataLoading } = useData();

  React.useEffect(() => {
      if (!authLoading && !dataLoading) {
          const loader = document.getElementById('global-loader');
          if (loader) {
              loader.classList.add('hidden');
          }
      }
  }, [authLoading, dataLoading]);

  React.useEffect(() => {
      const hash = window.location.hash;
      if (!currentUser && hash.startsWith('#view/')) {
        const contentId = hash.substring(6);
        // Initial load for non-logged-in viewer
        navigate('viewer', contentId);
      } else if (currentUser && hash) {
        window.location.hash = '';
      }
  }, [currentUser, navigate]);


  React.useEffect(() => {
    if (contentForAnalytics) {
      getSubmissionsForContent(contentForAnalytics.id);
    }
  }, [contentForAnalytics, getSubmissionsForContent]);
  
  if (authLoading || (currentUser && dataLoading)) {
    return null; // The global loader in index.html is handling the loading state
  }

  const renderAuthenticatedView = () => {
    let currentPage;
    let pageTitle = "Dashboard";

    switch(view) {
        case 'dashboard':
            pageTitle = "Tu Biblioteca";
            currentPage = <DashboardPage />;
            break;
        case 'generator':
            pageTitle = "Generador de Contenido";
            currentPage = <GeneratorPage />;
            break;
        case 'analytics':
             if (contentForAnalytics) {
                pageTitle = "Resultados y Analíticas";
                currentPage = <AnalyticsPage 
                  contentItem={contentForAnalytics}
                  submissions={submissions}
                />;
             } else { navigate('dashboard'); }
            break;
        case 'communities':
            pageTitle = "Comunidades";
            currentPage = <CommunityHubPage />;
            break;
        case 'communityFeed':
            if (activeCommunity) {
                pageTitle = `Comunidad: ${activeCommunity.name}`;
                currentPage = <CommunityFeedPage community={activeCommunity} />;
            } else { navigate('communities'); }
            break;
        case 'profile':
            if (viewedProfile) {
                pageTitle = `Perfil de ${viewedProfile.profile.name}`;
                currentPage = <ProfilePage user={viewedProfile} />;
            } else { navigate('dashboard'); }
            break;
        case 'communitySettings':
            if (communityToEdit) {
                pageTitle = `Gestionar "${communityToEdit.name}"`;
                currentPage = <CommunitySettingsPage community={communityToEdit} />
            } else { navigate('communities'); }
            break;
        case 'viewer':
             if (contentForViewer) {
                 return <ViewerPage contentId={contentForViewer as string} />;
             }
             navigate('dashboard');
             break;
        default:
            navigate('dashboard');
    }

    if (view === 'viewer') return currentPage;

    return (
        <div className="flex h-screen bg-slate-100">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header pageTitle={pageTitle} />
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                    <React.Suspense fallback={
                        <div className="w-full h-full flex items-center justify-center">
                            <Spinner large />
                        </div>
                    }>
                        {currentPage}
                    </React.Suspense>
                </main>
            </div>
        </div>
    );
  }
  
  const renderUnauthenticatedView = () => {
    if (view === 'viewer' && contentForViewer) {
      return <ViewerPage contentId={contentForViewer as string} />;
    }
    return <LoginPage />;
  }
  
  return (
    <div className="min-h-screen font-sans text-slate-800">
        <ToastContainer />
        <React.Suspense fallback={<div className="flex h-screen items-center justify-center"><Spinner large /></div>}>
            {currentUser ? renderAuthenticatedView() : renderUnauthenticatedView()}
            {isProfileModalOpen && <ProfileModal />}
            {isCreateCommunityModalOpen && <CreateCommunityModal />}
            {isUpgradeModalOpen && upgradeReason && (
                <UpgradeModal 
                    feature={upgradeReason.feature}
                    requiredPlan={upgradeReason.requiredPlan}
                    onClose={closeAllModals}
                />
            )}
        </React.Suspense>
    </div>
  );
};

export default App;