import React, { useState, useEffect } from 'react';
import { User, Screen, Task, SiteInstruction, DailyLog } from '../../../types.ts';
import * as api from '../../../api.ts';
import { ListBulletIcon, ClipboardDocumentListIcon, AlertTriangleIcon } from '../../Icons.tsx';

interface OperativeDashboardProps {
    currentUser: User;
    navigateTo: (screen: Screen, params?: any) => void;
    onDeepLink: (projectId: string, screen: Screen, params: any) => void;
}

const OperativeDashboard: React.FC<OperativeDashboardProps> = ({ currentUser, navigateTo, onDeepLink }) => {
    const [firstTask, setFirstTask] = useState<Task | null>(null);
    const [siteInstructions, setSiteInstructions] = useState<SiteInstruction[]>([]);
    const [dailyLog, setDailyLog] = useState<DailyLog | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadDashboardData = async () => {
            setIsLoading(true);
            const todayStr = new Date().toISOString().split('T')[0];
            const [userTasks, instructions, log] = await Promise.all([
                api.fetchTasksForUser(currentUser),
                api.fetchSiteInstructions(),
                api.fetchDailyLogForUser(currentUser.id, todayStr)
            ]);
            
            const openTasks = userTasks
                .filter(t => t.status !== 'Done')
                .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
            
            setFirstTask(openTasks.length > 0 ? openTasks[0] : null);
            setSiteInstructions(instructions);
            setDailyLog(log);
            setIsLoading(false);
        };
        loadDashboardData();
    }, [currentUser]);

    const handleDailyLogClick = () => {
        // Find the project for the first task, or default to some logic
        const projectId = firstTask?.projectId; 
        if (projectId) {
            onDeepLink(projectId, 'daily-log', {});
        } else {
            // If no tasks, we can't deep link. Here you might prompt to select a project.
            // For now, we'll assume a project context is needed and disable if no tasks.
            alert("Please be assigned to a task on a project to create a daily log.");
        }
    };


    return (
        <div className="space-y-8">
            <header className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">My Workday</h1>
                    <p className="text-md text-gray-500">Welcome, {currentUser.name}!</p>
                </div>
                <img src={currentUser.avatar} alt="User Avatar" className="w-12 h-12 rounded-full" />
            </header>
            
            {isLoading ? (
                <div className="text-center p-8 text-gray-500">Loading your workday...</div>
            ) : (
                <main className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-8">
                        {firstTask ? (
                            <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-100">
                                <h2 className="text-lg font-bold text-gray-800 mb-3">First Task Up</h2>
                                <div 
                                    onClick={() => onDeepLink(firstTask.projectId, 'task-detail', { taskId: firstTask.id })}
                                    className="p-4 bg-blue-50 border border-blue-200 rounded-lg cursor-pointer hover:bg-blue-100"
                                >
                                    <p className="font-bold text-blue-800">{firstTask.title}</p>
                                    <p className="text-sm text-red-600 font-semibold mt-1">Due: {new Date(firstTask.dueDate).toLocaleDateString()}</p>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-100">
                                <h2 className="text-lg font-bold text-gray-800 mb-3">First Task Up</h2>
                                <p className="p-4 bg-green-50 text-green-800 text-center rounded-lg">No open tasks. Great job!</p>
                            </div>
                        )}
                        
                        <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-100">
                             <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <ListBulletIcon className="w-6 h-6 text-gray-500" /> All My Tasks
                            </h2>
                            <button onClick={() => {
                                // This requires a global "my tasks" screen, which we don't have.
                                // For now, this can be a placeholder or navigate to the first task's project task list.
                                if(firstTask) onDeepLink(firstTask.projectId, 'tasks', {});
                                else alert("No tasks to display.");
                            }} className="w-full px-4 py-3 bg-blue-600 text-white font-bold rounded-md hover:bg-blue-700">
                                View All My Tasks
                            </button>
                        </div>
                    </div>
                     <div className="space-y-8">
                        <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-100">
                            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <ClipboardDocumentListIcon className="w-6 h-6 text-gray-500" /> Daily Log
                            </h2>
                             <button 
                                onClick={handleDailyLogClick}
                                disabled={!firstTask}
                                className={`w-full px-4 py-3 font-bold rounded-md transition-colors ${dailyLog ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-yellow-400 text-yellow-900 hover:bg-yellow-500'} disabled:bg-gray-300 disabled:cursor-not-allowed`}
                            >
                                {dailyLog ? "View/Edit Today's Log" : "Start Daily Log"}
                            </button>
                        </div>

                        {siteInstructions.length > 0 && (
                             <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-100">
                                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <AlertTriangleIcon className="w-6 h-6 text-orange-500" /> Recent Site Instructions
                                </h2>
                                <ul className="space-y-2">
                                    {siteInstructions.map(inst => (
                                        <li key={inst.id} className="text-sm p-3 bg-orange-50 border-l-4 border-orange-300 rounded-r-md">
                                            <p className="text-orange-900">{inst.text} <span className="text-xs text-orange-700">- {inst.author}</span></p>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </main>
            )}
        </div>
    );
};

export default OperativeDashboard;