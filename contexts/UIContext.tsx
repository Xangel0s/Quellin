

import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import type { View, StoredContentItem, Community, User, PlanName, Toast } from '../types';

interface UIContextType {
    view: View;
    contentForViewer: StoredContentItem | string | null;
    contentForAnalytics: StoredContentItem | null;
    activeCommunity: Community | null;
    viewedProfile: User | null;
    communityToEdit: Community | null;
    isProfileModalOpen: boolean;
    isCreateCommunityModalOpen: boolean;
    isUpgradeModalOpen: boolean;
    upgradeReason: { feature: string; requiredPlan: PlanName } | null;
    toasts: Toast[];
    navigate: (targetView: View, context?: any) => void;
    openProfileModal: () => void;
    openCreateCommunityModal: () => void;
    openUpgradeModal: (feature: string, requiredPlan: PlanName) => void;
    closeAllModals: () => void;
    addToast: (message: string, type?: Toast['type']) => void;
    removeToast: (id: string) => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const UIProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [view, setView] = useState<View>('dashboard');
    const [contentForViewer, setContentForViewer] = useState<StoredContentItem | string | null>(null);
    const [contentForAnalytics, setContentForAnalytics] = useState<StoredContentItem | null>(null);
    const [activeCommunity, setActiveCommunity] = useState<Community | null>(null);
    const [viewedProfile, setViewedProfile] = useState<User | null>(null);
    const [communityToEdit, setCommunityToEdit] = useState<Community | null>(null);
    
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [isCreateCommunityModalOpen, setIsCreateCommunityModalOpen] = useState(false);
    const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
    const [upgradeReason, setUpgradeReason] = useState<{ feature: string; requiredPlan: PlanName } | null>(null);
    const [toasts, setToasts] = useState<Toast[]>([]);

    const removeToast = useCallback((id: string) => {
        setToasts(currentToasts => currentToasts.filter(toast => toast.id !== id));
    }, []);

    const addToast = useCallback((message: string, type: Toast['type'] = 'info') => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts(currentToasts => [...currentToasts, { id, message, type }]);
        // Automatically remove the toast after 5 seconds
        setTimeout(() => {
            removeToast(id);
        }, 5000);
    }, [removeToast]);

    const navigate = useCallback((targetView: View, context?: any) => {
        // Reset context-specific state on navigation
        setContentForViewer(null);
        setContentForAnalytics(null);
        setActiveCommunity(null);
        setViewedProfile(null);
        setCommunityToEdit(null);

        if (targetView === 'viewer') setContentForViewer(context);
        if (targetView === 'analytics') setContentForAnalytics(context as StoredContentItem);
        if (targetView === 'communityFeed') setActiveCommunity(context as Community);
        if (targetView === 'profile') setViewedProfile(context as User);
        if (targetView === 'communitySettings') setCommunityToEdit(context as Community);
        
        setView(targetView);
    }, []);

    const openProfileModal = () => setIsProfileModalOpen(true);
    const openCreateCommunityModal = () => setIsCreateCommunityModalOpen(true);
    const openUpgradeModal = (feature: string, requiredPlan: PlanName) => {
        setUpgradeReason({ feature, requiredPlan });
        setIsUpgradeModalOpen(true);
    };

    const closeAllModals = () => {
        setIsProfileModalOpen(false);
        setIsCreateCommunityModalOpen(false);
        setIsUpgradeModalOpen(false);
    };

    const value = {
        view, contentForViewer, contentForAnalytics, activeCommunity, viewedProfile, communityToEdit,
        isProfileModalOpen, isCreateCommunityModalOpen, isUpgradeModalOpen, upgradeReason,
        toasts, addToast, removeToast,
        navigate, openProfileModal, openCreateCommunityModal, openUpgradeModal, closeAllModals
    };

    return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
};

export const useUI = (): UIContextType => {
    const context = useContext(UIContext);
    if (context === undefined) {
        throw new Error('useUI must be used within a UIProvider');
    }
    return context;
};