import React, { useState, useEffect } from 'react';
import { Task, Screen, User } from '../../types.ts';
// Fix: Corrected the import path for the 'api' module.
import * as api from '../../api.ts';
import { ListBulletIcon, ChevronRightIcon } from '../Icons.tsx';

interface MyTasksWidgetProps {
    currentUser: User;
    onDeepLink: (projectId: string, screen: Screen, params: any) => void;
}

const MyTasksWidget: React.FC<MyTasksWidgetProps> = ({ currentUser, onDeepLink }) => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadTasks = async () => {
            setIsLoading(true);
            const userTasks = await api.fetchTasksForUser(currentUser);
            const openTasks = userTasks
                .filter(t => t.status !== 'Done')
                .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
            setTasks(openTasks);
            setIsLoading(false);
        };
        loadTasks();
    }, [currentUser]);

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-100 h-full flex flex-col transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <ListBulletIcon className="w-6 h-6 text-gray-500" /> My Open Tasks
                </h2>
                {tasks.length > 5 && <span className="text-sm font-semibold text-blue-600">{tasks.length} total</span>}
            </div>
            {isLoading ? (
                <p className="text-gray-500 flex-grow flex items-center justify-center">Loading tasks...</p>
            ) : tasks.length === 0 ? (
                <p className="text-gray-500 flex-grow flex items-center justify-center">No open tasks assigned to you.</p>
            ) : (
                <ul className="divide-y divide-gray-200">
                    {tasks.slice(0, 5).map(task => (
                        <li 
                            key={task.id}
                            onClick={() => onDeepLink(task.projectId, 'task-detail', { taskId: task.id })}
                            className="py-3 flex items-center justify-between hover:bg-gray-50 cursor-pointer -mx-3 px-3 rounded-lg"
                        >
                            <div>
                                <p className="font-semibold text-gray-800">{task.title}</p>
                                <p className="text-sm text-gray-500">Due: {new Date(task.dueDate).toLocaleDateString()}</p>
                            </div>
                            <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default MyTasksWidget;