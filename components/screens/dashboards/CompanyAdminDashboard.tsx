// Fix: Created CompanyAdminDashboard.tsx to resolve "not a module" error.
import React, { useEffect } from 'react';
// Fix: Added .ts extension to import
import { User, Screen } from '../../../types.ts';
// Fix: Added .ts extension to import
import * as api from '../../../api.ts';
// Fix: Added .tsx extension to widget imports
import QuickActionsWidget from '../../widgets/QuickActionsWidget.tsx';
import NotificationsWidget from '../../widgets/NotificationsWidget.tsx';
import ProjectsOverviewWidget from '../../widgets/ProjectsOverviewWidget.tsx';
import GlobalStatsWidget from '../../widgets/GlobalStatsWidget.tsx';
import UpcomingDeadlinesWidget from '../../widgets/UpcomingDeadlinesWidget.tsx';

interface CompanyAdminDashboardProps {
    currentUser: User;
    navigateTo: (screen: Screen, params?: any) => void;
    onDeepLink: (projectId: string, screen: Screen, params: any) => void;
    onQuickAction: (action: Screen, projectId?: string) => void;
    onSuggestAction: () => void;
    selectProject: (id: string) => void;
}

const CompanyAdminDashboard: React.FC<CompanyAdminDashboardProps> = (props) => {
    const { currentUser, navigateTo, onDeepLink, onQuickAction, onSuggestAction } = props;

    useEffect(() => {
        api.checkAndCreateDueDateNotifications(currentUser);
    }, [currentUser]);

    return (
        <div className="space-y-8">
            <header className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Company Dashboard</h1>
                    <p className="text-md text-gray-500">Welcome, {currentUser.name}!</p>
                </div>
                <img src={currentUser.avatar} alt="User Avatar" className="w-12 h-12 rounded-full" />
            </header>

            <GlobalStatsWidget currentUser={currentUser} />
            
            <QuickActionsWidget 
                onQuickAction={onQuickAction} 
                onSuggestAction={onSuggestAction}
                isGlobal={true}
                currentUser={currentUser}
            />

            <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                   <ProjectsOverviewWidget currentUser={currentUser} navigateTo={navigateTo} onDeepLink={onDeepLink} />
                   <UpcomingDeadlinesWidget currentUser={currentUser} onDeepLink={onDeepLink} />
                </div>
                <div className="lg:col-span-1">
                    <NotificationsWidget currentUser={currentUser} onDeepLink={onDeepLink} />
                </div>
            </main>
        </div>
    );
};

export default CompanyAdminDashboard;