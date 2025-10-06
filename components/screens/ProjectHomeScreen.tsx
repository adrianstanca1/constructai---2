import React, { useEffect } from 'react';
// Fix: Added User type import.
// Fix: Corrected import paths to include file extensions.
import { Project, Screen, User } from '../../types.ts';
// Fix: Added .tsx extension to icon import
import { 
    BuildingOfficeIcon, UsersIcon, MapPinIcon, ChevronLeftIcon,
} from '../Icons.tsx';
// Fix: Added .tsx extension to widget imports
import QuickActionsWidget from '../widgets/QuickActionsWidget.tsx';
import ProjectTasksWidget from '../widgets/ProjectTasksWidget.tsx';
import StatCard from '../widgets/StatCard.tsx';
import MyProjectDeadlinesWidget from '../widgets/MyProjectDeadlinesWidget.tsx';

interface ProjectHomeScreenProps {
    project: Project;
    navigateTo: (screen: Screen, params?: any) => void;
    goBack: () => void;
    // Fix: Added currentUser to props to pass it down to child components.
    currentUser: User;
}

const ProjectHomeScreen: React.FC<ProjectHomeScreenProps> = ({ project, navigateTo, goBack, currentUser }) => {

    // Fix: Add a guard to prevent rendering with an undefined project, which causes a crash.
    // This can happen during complex navigation sequences.
    useEffect(() => {
        if (!project) {
            goBack();
        }
    }, [project, goBack]);

    if (!project) {
        return null; // Render nothing while the goBack navigation occurs.
    }


    return (
        <div className="flex flex-col h-full">
            <header className="bg-white p-4 flex items-center border-b mb-8">
                 <button onClick={goBack} className="mr-4 p-2 rounded-full hover:bg-gray-100">
                    <ChevronLeftIcon className="w-6 h-6 text-gray-600" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
                    <p className="text-sm text-gray-500 flex items-center"><MapPinIcon className="w-4 h-4 mr-1"/>{project.location}</p>
                </div>
            </header>

            <main className="flex-grow space-y-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <StatCard label="Open RFIs" value={project.snapshot.openRFIs} type="rfi" />
                    <StatCard label="Overdue Tasks" value={project.snapshot.overdueTasks} type="overdue" />
                    <StatCard label="Pending T&M" value={project.snapshot.pendingTMTickets} type="tm-ticket" />
                    <StatCard label="AI Risk Level" value={project.snapshot.aiRiskLevel} type="ai-risk" />
                </div>
                
                <QuickActionsWidget onQuickAction={navigateTo} onSuggestAction={()=>{}} isGlobal={false} currentUser={currentUser} />
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Fix: Passed currentUser to ProjectTasksWidget. */}
                    <ProjectTasksWidget project={project} navigateTo={navigateTo} currentUser={currentUser} />
                    <MyProjectDeadlinesWidget project={project} navigateTo={navigateTo} currentUser={currentUser} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center"><BuildingOfficeIcon className="w-6 h-6 mr-2 text-gray-500"/>Project Description</h2>
                        <p className="text-gray-600">{project.description}</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center"><UsersIcon className="w-6 h-6 mr-2 text-gray-500"/>Key Contacts</h2>
                        <ul className="space-y-3">
                            {project.contacts.map(contact => (
                                <li key={contact.name} className="flex justify-between items-center text-sm">
                                    <span className="font-semibold text-gray-700">{contact.role}</span>
                                    <span className="text-gray-600">{contact.name}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ProjectHomeScreen;