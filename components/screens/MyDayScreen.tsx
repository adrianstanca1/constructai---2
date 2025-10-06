import React, { useState, useEffect } from 'react';
// Fix: Corrected import paths to include file extensions.
import { Project, Screen, Task, SiteInstruction, User, AIInsight } from '../../types.ts';
// Fix: Corrected import paths to include file extensions.
// Fix: Corrected the import path for the 'api' module.
import * as api from '../../api.ts';
// Use WandSparklesIcon for AI suggestions and move it to the main content area for prominence.
import { ChevronLeftIcon, CheckBadgeIcon, AlertTriangleIcon, SunIcon, ClipboardDocumentListIcon, PaperClipIcon, WandSparklesIcon, ArrowPathIcon, PencilIcon, ListBulletIcon } from '../Icons.tsx';

interface MyDayScreenProps {
    project: Project;
    navigateTo: (screen: Screen, params?: any) => void;
    goBack: () => void;
    currentUser: User;
}

const isTaskOverdue = (task: Task): boolean => {
    if (task.status === 'Done') return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(task.dueDate) < today;
};

const TaskStatusIcon: React.FC<{ task: Task }> = ({ task }) => {
    if (isTaskOverdue(task)) {
        return <AlertTriangleIcon className="w-6 h-6 text-red-500" title="Overdue" />;
    }
    switch (task.status) {
        case 'Done':
            return <CheckBadgeIcon className="w-6 h-6 text-green-500" title="Done" />;
        case 'In Progress':
            return <PencilIcon className="w-6 h-6 text-blue-500" title="In Progress" />;
        case 'To Do':
            return <ListBulletIcon className="w-6 h-6 text-gray-400" title="To Do" />;
        default:
            return <div className="w-6 h-6"></div>;
    }
};


const MyDayScreen: React.FC<MyDayScreenProps> = ({ project, navigateTo, goBack, currentUser }) => {
    const [myTasks, setMyTasks] = useState<Task[]>([]);
    const [instructions, setInstructions] = useState<SiteInstruction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [insights, setInsights] = useState<AIInsight[]>([]);
    const [isInsightsLoading, setIsInsightsLoading] = useState(true);
    const [isInsightsRefreshing, setIsInsightsRefreshing] = useState(false);


    const weatherData = { temp: "18°C", condition: "Partly Cloudy" };

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            setIsInsightsLoading(true);
            const [allTasks, siteInstructions] = await Promise.all([
                api.fetchTasksForUser(currentUser),
                api.fetchSiteInstructions()
            ]);
            
            const filteredTasks = allTasks.filter(task => task.projectId === project.id && (task.assignee === currentUser.name || task.targetRoles?.includes(currentUser.role)));
            setMyTasks(filteredTasks);
            setInstructions(siteInstructions);
            setIsLoading(false);

            const aiInsights = await api.getAIInsightsForMyDay(filteredTasks, project, weatherData);
            setInsights(aiInsights);
            setIsInsightsLoading(false);
        };
        loadData();
    }, [currentUser, project.id]);
    
    const handleRefreshInsights = async () => {
        setIsInsightsRefreshing(true);
        const aiInsights = await api.getAIInsightsForMyDay(myTasks, project, weatherData);
        setInsights(aiInsights);
        setIsInsightsRefreshing(false);
    };

    const InsightItem: React.FC<{ insight: AIInsight }> = ({ insight }) => {
        const props = {
            alert: { icon: AlertTriangleIcon, color: 'yellow' },
            risk: { icon: AlertTriangleIcon, color: 'red' },
            tip: { icon: CheckBadgeIcon, color: 'blue' },
        }[insight.type];

        const Icon = props.icon;
        const colorClasses = {
            yellow: { container: 'bg-yellow-50 border-yellow-200', icon: 'text-yellow-600' },
            red: { container: 'bg-red-50 border-red-200', icon: 'text-red-600' },
            blue: { container: 'bg-blue-50 border-blue-200', icon: 'text-blue-600' },
        }[props.color];

        return (
            <div className={`p-3 border-l-4 rounded-r-md ${colorClasses.container}`}>
                <div className="flex items-center gap-2">
                    <Icon className={`w-5 h-5 flex-shrink-0 ${colorClasses.icon}`} />
                    <h4 className="font-bold text-sm text-gray-800">{insight.title}</h4>
                </div>
                <p className="text-sm text-gray-700 mt-1 pl-7">{insight.message}</p>
            </div>
        );
    };

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <header className="bg-white p-4 flex items-center border-b mb-8">
                 <button onClick={goBack} className="mr-4 p-2 rounded-full hover:bg-gray-100">
                    <ChevronLeftIcon className="w-6 h-6 text-gray-600" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">My Day</h1>
                    <p className="text-sm text-gray-500">{project.name} - {new Date().toLocaleDateString()}</p>
                </div>
            </header>

            <main className="flex-grow grid grid-cols-1 lg:grid-cols-3 gap-8">
                 {/* Main Column */}
                <div className="lg:col-span-2 space-y-8">
                    {/* AI Suggested Actions Widget */}
                    <div className="bg-white rounded-lg shadow-lg border border-gray-100 p-6 transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1">
                        <div className="flex items-center justify-between gap-3 mb-4">
                            <div className="flex items-center gap-3">
                                <WandSparklesIcon className="w-6 h-6 text-purple-500" />
                                <h2 className="font-bold text-lg text-gray-800">AI Suggested Actions</h2>
                            </div>
                            <button onClick={handleRefreshInsights} disabled={isInsightsLoading || isInsightsRefreshing} className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-wait">
                                <ArrowPathIcon className={`w-5 h-5 text-gray-500 ${(isInsightsLoading || isInsightsRefreshing) ? 'animate-spin' : ''}`} />
                            </button>
                        </div>
                        {(isInsightsLoading) ? (
                            <p className="text-sm text-center text-gray-500 py-4">Generating personalized suggestions...</p>
                        ) : (
                            <div className="space-y-3">
                                {insights.length > 0 ? (
                                    insights.map((insight, index) => <InsightItem key={index} insight={insight} />)
                                ) : (
                                    <p className="text-sm text-center text-gray-500 py-4">No specific suggestions for today. Stay focused!</p>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="bg-white rounded-lg shadow-md border border-gray-100">
                        <div className="p-4 border-b">
                            <h2 className="font-bold text-lg text-gray-800">My Tasks ({myTasks.length})</h2>
                        </div>
                        {isLoading ? (
                            <p className="p-4 text-sm text-center text-gray-500">Loading tasks...</p>
                        ) : (
                            <ul className="divide-y divide-gray-200">
                                {myTasks.length === 0 ? (
                                    <p className="p-4 text-sm text-center text-gray-500">No tasks assigned to you for this project.</p>
                                ) : (
                                    myTasks.map(task => {
                                        const overdue = isTaskOverdue(task);
                                        return (
                                            <li 
                                                key={task.id} 
                                                onClick={() => navigateTo('task-detail', { taskId: task.id })}
                                                className={`p-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer ${overdue ? 'bg-red-50' : ''}`}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <TaskStatusIcon task={task} />
                                                    <div>
                                                        <p className="font-semibold text-gray-800 flex items-center gap-2">
                                                            {task.title}
                                                            {task.attachments && task.attachments.length > 0 && (
                                                                <PaperClipIcon className="w-4 h-4 text-gray-400" />
                                                            )}
                                                        </p>
                                                        <p className={`text-sm ${overdue ? 'text-red-600 font-semibold' : 'text-gray-500'}`}>Due: {new Date(task.dueDate).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                                            </li>
                                        )
                                    })
                                )}
                            </ul>
                        )}
                    </div>

                    {instructions.length > 0 && (
                        <div className="bg-white rounded-lg shadow-md border border-gray-100">
                            <div className="p-4 border-b flex items-center gap-3">
                                <ClipboardDocumentListIcon className="w-6 h-6 text-blue-500" />
                                <h2 className="font-bold text-lg text-gray-800">Site Instructions</h2>
                            </div>
                            <ul className="divide-y divide-gray-200">
                           {instructions.map(inst => (
                                <li key={inst.id} className="p-4 text-sm">
                                    <p className="text-gray-800">{inst.text}</p>
                                    <p className="text-xs text-gray-500 mt-1">- {inst.author}</p>
                                </li>
                           ))}
                        </ul>
                        </div>
                    )}
                </div>

                 {/* Sidebar Column */}
                <div className="lg:col-span-1 space-y-8">
                     <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
                        <h2 className="font-bold text-lg text-gray-800 mb-3">Daily Summary</h2>
                        <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100 mb-4">
                            <SunIcon className="w-8 h-8 text-yellow-500" />
                            <div>
                                <p className="font-bold text-lg text-gray-800">{weatherData.temp}, {weatherData.condition}</p>
                                <p className="text-xs text-gray-600">Wind: 5 km/h E</p>
                            </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">You haven't submitted your log for today.</p>
                        <button 
                            onClick={() => navigateTo('daily-log')}
                            className="w-full px-4 py-2 bg-blue-600 text-white font-bold rounded-md hover:bg-blue-700 text-sm"
                        >
                            Start Daily Log
                        </button>
                    </div>
                </div>

            </main>
        </div>
    );
};

export default MyDayScreen;