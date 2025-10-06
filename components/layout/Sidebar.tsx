import React from 'react';
// Fix: Added .ts extension to import
import { Project, Screen, User, UserRole } from '../../types.ts';
// Fix: Added .tsx extension to import
import { 
    ChevronLeftIcon, BuildingOfficeIcon, ListBulletIcon, DocumentIcon,
    CheckBadgeIcon, DocumentDuplicateIcon, CameraIcon, ClipboardDocumentListIcon,
    BellIcon, TicketIcon, SunIcon, QuestionMarkCircleIcon, ArrowLeftOnRectangleIcon
} from '../Icons.tsx';

interface SidebarProps {
    project: Project;
    navigateTo: (screen: Screen, params?: any) => void;
    navigateToModule?: (screen: Screen, params?: any) => void;
    goHome: () => void;
    currentUser: User;
    onLogout: () => void;
}

const NavItem: React.FC<{
    label: string;
    icon: React.FC<any>;
    onClick: () => void;
}> = ({ label, icon: Icon, onClick }) => (
    <li>
        <button onClick={onClick} className="w-full flex items-center p-3 text-sm text-slate-300 rounded-lg hover:bg-slate-700 transition-colors">
            <Icon className="w-6 h-6 mr-3 text-slate-400" />
            <span>{label}</span>
        </button>
    </li>
);

const Sidebar: React.FC<SidebarProps> = ({ project, navigateTo, navigateToModule, goHome, currentUser, onLogout }) => {

    const allNavItems = [
        { label: 'My Projects', screen: 'projects', icon: BuildingOfficeIcon, roles: ['operative', 'supervisor', 'company_admin', 'super_admin'] },
        { label: 'My Day', screen: 'my-day', icon: SunIcon, roles: ['operative', 'supervisor', 'company_admin', 'super_admin'] },
        { label: 'Tasks', screen: 'tasks', icon: ListBulletIcon, roles: ['operative', 'supervisor', 'company_admin', 'super_admin'] },
        { label: 'Daily Logs', screen: 'daily-log', icon: ClipboardDocumentListIcon, roles: ['operative', 'supervisor', 'company_admin', 'super_admin'] },
        { label: 'Photos', screen: 'photos', icon: CameraIcon, roles: ['operative', 'supervisor', 'company_admin', 'super_admin'] },
        { label: 'RFIs', screen: 'rfis', icon: QuestionMarkCircleIcon, roles: ['supervisor', 'company_admin', 'super_admin'] },
        { label: 'Punch List', screen: 'punch-list', icon: CheckBadgeIcon, roles: ['supervisor', 'company_admin', 'super_admin'] },
        { label: 'Drawings', screen: 'drawings', icon: DocumentDuplicateIcon, roles: ['supervisor', 'company_admin', 'super_admin'] },
        { label: 'Daywork Sheets', screen: 'daywork-sheets', icon: TicketIcon, roles: ['supervisor', 'company_admin', 'super_admin'] },
        { label: 'Documents', screen: 'documents', icon: DocumentIcon, roles: ['company_admin', 'super_admin'] },
    ];
    
    // In project view, only show project-specific items. In global view, only show global items.
    const isProjectView = !!project.id;
    const itemsToShow = isProjectView 
        ? allNavItems.filter(item => item.screen !== 'projects')
        : [allNavItems.find(item => item.screen === 'projects')!];
    
    const visibleNavItems = itemsToShow.filter(item => item.roles.includes(currentUser.role));


    return (
        <div className="flex flex-col h-full p-4">
            <div className="mb-8">
                <button onClick={goHome} className="block text-left">
                    <h1 className="text-xl font-bold text-white">{project.name}</h1>
                    <p className="text-sm text-slate-400">{project.location}</p>
                </button>
            </div>

            <nav className="flex-grow">
                <ul className="space-y-1">
                    {visibleNavItems.map(item => {
                        // "My Projects" should always reset the stack, so it uses navigateToModule if available.
                        // In global view, `navigateTo` is already `navigateToModule`.
                        const navFunc = (item.screen === 'projects' && navigateToModule) ? navigateToModule : navigateTo;
                        return <NavItem key={item.screen} label={item.label} icon={item.icon} onClick={() => navFunc(item.screen as Screen)} />
                    })}
                </ul>
            </nav>

            <div className="mt-auto pt-4 border-t border-slate-700">
                 <div className="text-center text-slate-300 p-3 mb-2">
                    <p className="font-semibold">{currentUser.name}</p>
                    <p className="text-xs text-slate-400 capitalize">{currentUser.role.replace('_', ' ')}</p>
                </div>
                <button onClick={onLogout} className="w-full flex items-center justify-center p-3 text-sm text-slate-300 rounded-lg hover:bg-slate-700 transition-colors">
                    <ArrowLeftOnRectangleIcon className="w-5 h-5 mr-2" />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;