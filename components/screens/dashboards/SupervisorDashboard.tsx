// Fix: Created SupervisorDashboard.tsx to resolve "not a module" error.
import React, { useEffect } from 'react';
// Fix: Added .ts extension to import
import { User, Screen } from '../../../types.ts';
// Fix: Added .ts extension to import
import * as api from '../../../api.ts';
// Fix: Added .tsx extension to widget imports
import QuickActionsWidget from '../../widgets/QuickActionsWidget.tsx';
import MyTasksWidget from '../../widgets/MyTasksWidget.tsx';
import NotificationsWidget from '../../widgets/NotificationsWidget.tsx';
import ProjectsOverviewWidget from '../../widgets/ProjectsOverviewWidget.tsx';
import RecentActivityWidget from '../../widgets/RecentActivityWidget.tsx';

interface SupervisorDashboardProps {
    currentUser: User;
    navigateTo: (screen: Screen, params?: any) => void;
    onDeepLink: (projectId: string, screen: Screen, params: any) => void;
    onQuickAction: (action: Screen, projectId?: string) => void;
    onSuggestAction: () => void;
}

const SupervisorDashboard: React.FC<SupervisorDashboardProps> = (props) => {
    const { currentUser, navigateTo, onDeepLink, onQuickAction, onSuggestAction } = props;

    useEffect(() => {
        api.checkAndCreateDueDateNotifications(currentUser);
    }, [currentUser]);


    return (
        <div className="space-y-8">
            <header className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Supervisor Dashboard</h1>
                    <p className="text-md text-gray-500">Welcome, {currentUser.name}!</p>
                </div>
                <img src={currentUser.avatar} alt="User Avatar" className="w-12 h-12 rounded-full" />
            </header>
            
            <QuickActionsWidget 
                onQuickAction={onQuickAction} 
                onSuggestAction={onSuggestAction}
                isGlobal={true}
                currentUser={currentUser}
            />

            <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                   <MyTasksWidget currentUser={currentUser} onDeepLink={onDeepLink} />
                   <RecentActivityWidget currentUser={currentUser} onDeepLink={onDeepLink} />
                </div>
                <div className="lg:col-span-1 space-y-8">
                    <NotificationsWidget currentUser={currentUser} onDeepLink={onDeepLink} />
                    <ProjectsOverviewWidget currentUser={currentUser} navigateTo={navigateTo} onDeepLink={onDeepLink} />
                </div>
            </main>
        </div>
    );
};

export default SupervisorDashboard;