import React, { useEffect } from 'react';
import { User, Screen } from '../../types.ts';
import * as api from '../../api.ts';
import QuickActionsWidget from '../widgets/QuickActionsWidget.tsx';
import MyTasksWidget from '../widgets/MyTasksWidget.tsx';
import NotificationsWidget from '../widgets/NotificationsWidget.tsx';
import ProjectsOverviewWidget from '../widgets/ProjectsOverviewWidget.tsx';
import RecentActivityWidget from '../widgets/RecentActivityWidget.tsx';
import GlobalStatsWidget from '../widgets/GlobalStatsWidget.tsx';

interface UnifiedDashboardScreenProps {
    currentUser: User;
    navigateTo: (screen: Screen, params?: any) => void;
    onDeepLink: (projectId: string, screen: Screen, params: any) => void;
    onQuickAction: (action: Screen, projectId?: string) => void;
    onSuggestAction: () => void;
    selectProject: (id: string) => void;
}

const UnifiedDashboardScreen: React.FC<UnifiedDashboardScreenProps> = (props) => {
    const { currentUser, navigateTo, onDeepLink, onQuickAction, onSuggestAction } = props;

    useEffect(() => {
        api.checkAndCreateDueDateNotifications(currentUser);
    }, [currentUser]);

    const isAdminOrSupervisor = ['super_admin', 'company_admin', 'supervisor'].includes(currentUser.role);

    return (
        <div className="space-y-8">
            <header className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-md text-gray-500">Welcome back, {currentUser.name}!</p>
                </div>
                <img src={currentUser.avatar} alt="User Avatar" className="w-12 h-12 rounded-full" />
            </header>
            
            {isAdminOrSupervisor && <GlobalStatsWidget currentUser={currentUser} />}
            
            <QuickActionsWidget 
                onQuickAction={onQuickAction} 
                onSuggestAction={onSuggestAction}
                isGlobal={true}
                currentUser={currentUser}
            />

            <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                   <MyTasksWidget currentUser={currentUser} onDeepLink={onDeepLink} />
                   {isAdminOrSupervisor && <RecentActivityWidget currentUser={currentUser} onDeepLink={onDeepLink} />}
                </div>
                <div className="lg:col-span-1 space-y-8">
                    <NotificationsWidget currentUser={currentUser} onDeepLink={onDeepLink} />
                    {isAdminOrSupervisor && <ProjectsOverviewWidget currentUser={currentUser} navigateTo={navigateTo} onDeepLink={onDeepLink} />}
                </div>
            </main>
        </div>
    );
};

export default UnifiedDashboardScreen;
