import React, { useState, useEffect, useCallback } from 'react';
import { Screen, User, Project, NotificationLink, AISuggestion } from './types.ts';
import * as api from './api.ts';
import AuthScreen from './components/screens/AuthScreen.tsx';
import AppLayout from './components/layout/AppLayout.tsx';
import Sidebar from './components/layout/Sidebar.tsx';
import { MOCK_PROJECT } from './constants.ts';
import AISuggestionModal from './components/modals/AISuggestionModal.tsx';
import ProjectSelectorModal from './components/modals/ProjectSelectorModal.tsx';
import FloatingMenu from './components/layout/FloatingMenu.tsx';

// Screen Components
import UnifiedDashboardScreen from './components/screens/UnifiedDashboardScreen.tsx';
import ProjectsListScreen from './components/screens/ProjectsListScreen.tsx';
import ProjectHomeScreen from './components/screens/ProjectHomeScreen.tsx';
import MyDayScreen from './components/screens/MyDayScreen.tsx';
import TasksScreen from './components/screens/TasksScreen.tsx';
import TaskDetailScreen from './components/screens/TaskDetailScreen.tsx';
import NewTaskScreen from './components/screens/NewTaskScreen.tsx';
import DailyLogScreen from './components/screens/DailyLogScreen.tsx';
import PhotoGalleryScreen from './components/screens/PhotoGalleryScreen.tsx';
import RFIsScreen from './components/screens/RFIsScreen.tsx';
import RFIDetailScreen from './components/screens/RFIDetailScreen.tsx';
import NewRFIScreen from './components/screens/NewRFIScreen.tsx';
import PunchListScreen from './components/screens/PunchListScreen.tsx';
import PunchListItemDetailScreen from './components/screens/PunchListItemDetailScreen.tsx';
import NewPunchListItemScreen from './components/screens/NewPunchListItemScreen.tsx';
import DrawingsScreen from './components/screens/DrawingsScreen.tsx';
import PlansViewerScreen from './components/screens/PlansViewerScreen.tsx';
import DayworkSheetsListScreen from './components/screens/DayworkSheetsListScreen.tsx';
import DayworkSheetDetailScreen from './components/screens/DayworkSheetDetailScreen.tsx';
import NewDayworkSheetScreen from './components/screens/NewDayworkSheetScreen.tsx';
import DocumentsScreen from './components/screens/DocumentsScreen.tsx';
import DeliveryScreen from './components/screens/DeliveryScreen.tsx';

// Module Screens
import AccountingScreen from './components/screens/modules/AccountingScreen.tsx';
import AIToolsScreen from './components/screens/modules/AIToolsScreen.tsx';
import DocumentManagementScreen from './components/screens/modules/DocumentManagementScreen.tsx';
import TimeTrackingScreen from './components/screens/modules/TimeTrackingScreen.tsx';
import ProjectOperationsScreen from './components/screens/modules/ProjectOperationsScreen.tsx';
import FinancialManagementScreen from './components/screens/modules/FinancialManagementScreen.tsx';
import BusinessDevelopmentScreen from './components/screens/modules/BusinessDevelopmentScreen.tsx';
import PlaceholderToolScreen from './components/screens/tools/PlaceholderToolScreen.tsx';


type NavigationItem = {
    screen: Screen;
    params?: any;
    project?: Project;
};

const SCREEN_COMPONENTS: { [key in Screen]: React.FC<any> } = {
    'global-dashboard': UnifiedDashboardScreen,
    'projects': ProjectsListScreen,
    'project-home': ProjectHomeScreen,
    'my-day': MyDayScreen,
    'tasks': TasksScreen,
    'task-detail': TaskDetailScreen,
    'new-task': NewTaskScreen,
    'daily-log': DailyLogScreen,
    'photos': PhotoGalleryScreen,
    'rfis': RFIsScreen,
    'rfi-detail': RFIDetailScreen,
    'new-rfi': NewRFIScreen,
    'punch-list': PunchListScreen,
    'punch-list-item-detail': PunchListItemDetailScreen,
    'new-punch-list-item': NewPunchListItemScreen,
    'drawings': DrawingsScreen,
    'plans': PlansViewerScreen,
    'daywork-sheets': DayworkSheetsListScreen,
    'daywork-sheet-detail': DayworkSheetDetailScreen,
    'new-daywork-sheet': NewDayworkSheetScreen,
    'documents': DocumentsScreen,
    'delivery': DeliveryScreen,
    // Modules
    'accounting': AccountingScreen,
    'ai-tools': AIToolsScreen,
    'document-management': DocumentManagementScreen,
    'time-tracking': TimeTrackingScreen,
    'project-operations': ProjectOperationsScreen,
    'financial-management': FinancialManagementScreen,
    'business-development': BusinessDevelopmentScreen,
    // Tools
    'placeholder-tool': PlaceholderToolScreen,
};

const App: React.FC = () => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [navigationStack, setNavigationStack] = useState<NavigationItem[]>([]);
    const [allProjects, setAllProjects] = useState<Project[]>([]);

    const [isAISuggestionModalOpen, setIsAISuggestionModalOpen] = useState(false);
    const [isAISuggestionLoading, setIsAISuggestionLoading] = useState(false);
    const [aiSuggestion, setAiSuggestion] = useState<AISuggestion | null>(null);
    
    const [isProjectSelectorOpen, setIsProjectSelectorOpen] = useState(false);
    const [projectSelectorCallback, setProjectSelectorCallback] = useState<(projectId: string) => void>(() => () => {});
    const [projectSelectorTitle, setProjectSelectorTitle] = useState('');


    useEffect(() => {
        if (currentUser) {
            const loadProjects = async () => {
                const projects = await api.fetchAllProjects(currentUser);
                setAllProjects(projects);
            };
            loadProjects();
            // Default to dashboard
            navigateToModule('global-dashboard');
             window.dispatchEvent(new CustomEvent('userLoggedIn'));
        } else {
            setNavigationStack([]);
            setAllProjects([]);
        }
    }, [currentUser]);
    
    useEffect(() => {
        const handleLogout = () => {
            setCurrentUser(null);
            window.dispatchEvent(new CustomEvent('userLoggedOut'));
        };
        window.addEventListener('userLoggedOutFromButton', handleLogout);
        return () => window.removeEventListener('userLoggedOutFromButton', handleLogout);
    }, []);

    const handleLoginSuccess = (user: User) => {
        setCurrentUser(user);
    };

    const handleLogout = () => {
        setCurrentUser(null);
        window.dispatchEvent(new CustomEvent('userLoggedOut'));
    };

    const navigateTo = useCallback(async (screen: Screen, params: any = {}) => {
        const currentProject = navigationStack[navigationStack.length - 1]?.project;
        setNavigationStack(prev => [...prev, { screen, params, project: currentProject }]);
    }, [navigationStack]);

    const navigateToModule = useCallback((screen: Screen, params: any = {}) => {
        setNavigationStack([{ screen, params, project: undefined }]);
    }, []);
    
    const goBack = useCallback(() => {
        if (navigationStack.length > 1) {
            setNavigationStack(prev => prev.slice(0, -1));
        }
    }, [navigationStack]);

    const goHome = useCallback(() => {
        if (currentUser) {
            const currentProject = navigationStack[navigationStack.length - 1]?.project;
            if (currentProject) {
                // Go to project home
                setNavigationStack(prev => [prev[0], { screen: 'project-home', project: currentProject }]);
            } else {
                // Go to global dashboard
                navigateToModule('global-dashboard');
            }
        }
    }, [currentUser, navigationStack, navigateToModule]);

    const selectProject = useCallback(async (projectId: string) => {
        const project = await api.fetchProjectById(projectId);
        if (project) {
            setNavigationStack([{ screen: 'project-home', project }]);
        }
    }, []);
    
    const handleDeepLink = useCallback(async (projectId: string | null, screen: Screen, params: any) => {
        if (projectId) {
            const project = allProjects.find(p => p.id === projectId) || await api.fetchProjectById(projectId);
            if (project) {
                // A deeplink from a global context should feel like starting a new flow within a project
                 setNavigationStack([
                    { screen: 'project-home', project },
                    { screen, params, project }
                ]);
            }
        } else {
            // This is a navigation to a global tool, which should be a simple push.
            navigateTo(screen, params);
        }
    }, [allProjects, navigateTo]);

    const openProjectSelector = useCallback((title: string, onSelect: (projectId: string) => void) => {
        setProjectSelectorTitle(title);
        setProjectSelectorCallback(() => (projectId: string) => {
            onSelect(projectId);
            setIsProjectSelectorOpen(false);
        });
        setIsProjectSelectorOpen(true);
    }, []);
    
     const handleQuickAction = (action: Screen) => {
        openProjectSelector(`Select a project for the new ${action.split('-')[1]}`, (projectId) => {
            handleDeepLink(projectId, action, {});
        });
    };
    
    const handleSuggestAction = async () => {
        if (!currentUser) return;
        setIsAISuggestionModalOpen(true);
        setIsAISuggestionLoading(true);
        setAiSuggestion(null);
        const suggestion = await api.getAISuggestedAction(currentUser);
        setAiSuggestion(suggestion);
        setIsAISuggestionLoading(false);
    };
    
    const handleAISuggestionAction = (link: NotificationLink) => {
        if (link.projectId) {
            handleDeepLink(link.projectId, link.screen, link.params);
        }
        setIsAISuggestionModalOpen(false);
    };

    if (!currentUser) {
        return (
            <div className="bg-slate-100 min-h-screen flex items-center justify-center">
                <AuthScreen onLoginSuccess={handleLoginSuccess} />
            </div>
        );
    }
    
    const currentNavItem = navigationStack[navigationStack.length - 1];
    if (!currentNavItem) {
        return <div className="p-8">Loading...</div>; // Should not happen if useEffect is correct
    }
    
    const { screen, params, project } = currentNavItem;
    const ScreenComponent = SCREEN_COMPONENTS[screen] || PlaceholderToolScreen;
    
    const getSidebarProject = () => {
        if (project) {
            return project;
        }
        // For global view, create a temporary object so the sidebar displays correctly
        // but doesn't think it's in a real project context.
        return {
            ...MOCK_PROJECT, // Base it on MOCK_PROJECT to satisfy the type
            id: '', // Crucially, set id to empty string
            name: 'Global View',
            location: `Welcome, ${currentUser.name}`,
        };
    };

    return (
        <div className="bg-slate-50">
            <AppLayout
                sidebar={
                    <Sidebar 
                        project={getSidebarProject()}
                        navigateTo={navigateTo}
                        navigateToModule={navigateToModule}
                        goHome={goHome}
                        currentUser={currentUser}
                        onLogout={handleLogout}
                    />
                }
                 floatingMenu={<FloatingMenu currentUser={currentUser} navigateToModule={navigateToModule} />}
            >
                <div className="p-8">
                     <ScreenComponent
                        // Props for dashboards & modules
                        currentUser={currentUser}
                        selectProject={selectProject}
                        navigateTo={navigateTo}
                        onDeepLink={handleDeepLink}
                        onQuickAction={handleQuickAction}
                        onSuggestAction={handleSuggestAction}
                        openProjectSelector={openProjectSelector}
                        
                        // Props for project screens
                        project={project}
                        goBack={goBack}
                        
                        // Props for detail screens
                        {...params}
                    />
                </div>
            </AppLayout>

            <AISuggestionModal
                isOpen={isAISuggestionModalOpen}
                isLoading={isAISuggestionLoading}
                suggestion={aiSuggestion}
                onClose={() => setIsAISuggestionModalOpen(false)}
                onAction={handleAISuggestionAction}
                currentUser={currentUser}
            />
            {isProjectSelectorOpen && (
                <ProjectSelectorModal
                    title={projectSelectorTitle}
                    onClose={() => setIsProjectSelectorOpen(false)}
                    onSelectProject={projectSelectorCallback}
                    currentUser={currentUser}
                />
            )}
        </div>
    );
}

export default App;