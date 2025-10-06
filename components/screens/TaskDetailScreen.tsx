import React, { useState, useEffect } from 'react';
// Fix: Added .ts extension to import
import { Project, Task, User, Comment, Attachment } from '../../types.ts';
// Fix: Added .ts extension to import
import * as api from '../../api.ts';
// Fix: Added .tsx extension to import
import { ChevronLeftIcon, PaperClipIcon, CalendarDaysIcon, UsersIcon, CheckBadgeIcon, PencilIcon, ListBulletIcon, AlertTriangleIcon, TrashIcon } from '../Icons.tsx';

interface TaskDetailScreenProps {
    taskId: string;
    project: Project;
    goBack: () => void;
    currentUser: User;
}

const isTaskOverdue = (task: Task): boolean => {
    if (task.status === 'Done') return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(task.dueDate) < today;
};

const formatAssignee = (task: Task): string => {
    if (task.assignee) {
        return task.assignee;
    }
    if (task.targetRoles && task.targetRoles.length > 0) {
        const role = task.targetRoles[0];
        return `All ${role.charAt(0).toUpperCase() + role.slice(1)}s`;
    }
    return 'Unassigned';
};

const TaskDetailScreen: React.FC<TaskDetailScreenProps> = ({ taskId, project, goBack, currentUser }) => {
    const [task, setTask] = useState<Task | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [newComment, setNewComment] = useState('');
    const [commentFiles, setCommentFiles] = useState<File[]>([]);
    const [isDraggingOver, setIsDraggingOver] = useState(false);

    useEffect(() => {
        const loadTask = async () => {
            setIsLoading(true);
            const fetchedTask = await api.fetchTaskById(taskId);
            setTask(fetchedTask || null);
            setIsLoading(false);
        };
        loadTask();
    }, [taskId]);

    const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        if (!task) return;
        const newStatus = e.target.value as Task['status'];
        const updatedTask = { ...task, status: newStatus };
        setTask(updatedTask); // Optimistic update
        try {
            await api.updateTask(updatedTask, currentUser);
        } catch (error: any) {
            alert(error.message);
            setTask(task); // Revert on error
        }
    };

    const handleAddComment = async () => {
        if (!task || (!newComment.trim() && commentFiles.length === 0)) return;

        const attachments: Attachment[] = await Promise.all(
            commentFiles.map(file => new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    resolve({ name: file.name, url: e.target?.result as string });
                };
                reader.onerror = reject;
                reader.readAsDataURL(file);
            }))
        );

        const comment = await api.addCommentToTask(task.id, newComment, attachments, currentUser);
        setTask(prev => prev ? { ...prev, comments: [...prev.comments, comment] } : null);
        setNewComment('');
        setCommentFiles([]);
    };
    
    const processFiles = (files: FileList) => {
        if (files) {
            setCommentFiles(prev => [...prev, ...Array.from(files)]);
        }
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            processFiles(event.target.files);
        }
        if (event.target) event.target.value = '';
    };
    
    const handleRemoveFile = (indexToRemove: number) => {
        setCommentFiles(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDraggingOver(true); };
    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDraggingOver(false); };
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); };
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDraggingOver(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            processFiles(e.dataTransfer.files);
        }
    };


    if (isLoading) {
        return <div className="text-center p-8">Loading task details...</div>;
    }

    if (!task) {
        return <div className="text-center p-8 text-red-500">Task not found.</div>;
    }

    const overdue = isTaskOverdue(task);
    const canEditStatus = ['company_admin', 'supervisor', 'super_admin'].includes(currentUser.role);

    return (
        <div className="flex flex-col h-full max-w-4xl mx-auto">
            <header className="bg-white p-4 flex items-center border-b mb-8">
                <button onClick={goBack} className="mr-4 p-2 rounded-full hover:bg-gray-100">
                    <ChevronLeftIcon className="w-6 h-6 text-gray-600" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 truncate" title={task.title}>{task.title}</h1>
                    <p className="text-sm text-gray-500">{project.name}</p>
                </div>
            </header>

            <main className="flex-grow space-y-6">
                <div className="bg-white rounded-lg shadow-md border border-gray-100 p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2">
                        <h3 className="font-bold text-lg text-gray-800 mb-2">Description</h3>
                        <p className="text-gray-600 whitespace-pre-wrap">{task.description || 'No description provided.'}</p>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">Status</label>
                            <select 
                                value={task.status} 
                                onChange={handleStatusChange} 
                                className="w-full mt-1 p-2 border border-gray-300 rounded-md disabled:opacity-70 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                disabled={!canEditStatus}
                            >
                                <option value="To Do">To Do</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Done">Done</option>
                            </select>
                        </div>
                         <div>
                            <p className="text-xs font-bold text-gray-500 uppercase mb-1 flex items-center gap-1.5"><UsersIcon className="w-4 h-4"/>Assignee</p>
                            <p className="text-gray-800 font-semibold">{formatAssignee(task)}</p>
                        </div>
                        <div>
                            <p className={`text-xs font-bold text-gray-500 uppercase mb-1 flex items-center gap-1.5 ${overdue ? 'text-red-600' : ''}`}>
                                <CalendarDaysIcon className="w-4 h-4"/>Due Date
                            </p>
                            <p className={`font-semibold ${overdue ? 'text-red-600' : 'text-gray-800'}`}>{new Date(task.dueDate).toLocaleDateString()}</p>
                        </div>
                    </div>
                </div>

                {task.attachments && task.attachments.length > 0 && (
                     <div className="bg-white rounded-lg shadow-md border border-gray-100 p-6">
                        <h3 className="font-bold text-lg text-gray-800 mb-2 flex items-center gap-2"><PaperClipIcon className="w-5 h-5"/>Attachments</h3>
                         <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                            {task.attachments.map((att, index) => (
                                <a key={index} href={att.url} target="_blank" rel="noopener noreferrer" className="block group">
                                    <img src={att.url} alt={att.name} className="w-full h-24 object-cover rounded-md"/>
                                    <p className="text-xs text-gray-600 truncate mt-1 group-hover:text-blue-600">{att.name}</p>
                                </a>
                            ))}
                        </div>
                    </div>
                )}
                
                <div className="bg-white rounded-lg shadow-md border border-gray-100 p-6">
                    <h3 className="font-bold text-lg text-gray-800 mb-4">Comments ({task.comments.length})</h3>
                    <div className="space-y-4">
                        {task.comments.map(comment => (
                            <div key={comment.id} className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-600 flex-shrink-0">
                                    {comment.author.charAt(0)}
                                </div>
                                <div>
                                    <div className="flex items-baseline gap-2">
                                        <p className="font-bold text-sm">{comment.author}</p>
                                        <p className="text-xs text-gray-500">{new Date(comment.timestamp).toLocaleString()}</p>
                                    </div>
                                    <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">{comment.text}</p>
                                    {comment.attachments && comment.attachments.length > 0 && (
                                        <div className="mt-2">
                                            <p className="text-xs font-semibold text-gray-600 mb-1">Attachments:</p>
                                            <div className="flex flex-wrap gap-2">
                                                {comment.attachments.map((att, index) => (
                                                    <a key={index} href={att.url} target="_blank" rel="noopener noreferrer" className="text-sm bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded-md flex items-center gap-1.5">
                                                        <PaperClipIcon className="w-4 h-4 text-gray-500"/>
                                                        <span className="truncate max-w-xs">{att.name}</span>
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                     <div className="mt-6 pt-4 border-t">
                        <textarea 
                            rows={3} 
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Add a comment..."
                            className="w-full p-2 border border-gray-300 rounded-md"
                        />
                        <div className="mt-2">
                            <div onDragEnter={handleDragEnter} onDragLeave={handleDragLeave} onDragOver={handleDragOver} onDrop={handleDrop} className={`mt-2 flex justify-center rounded-lg border border-dashed px-6 py-4 transition-colors ${isDraggingOver ? 'border-blue-600 bg-blue-50' : 'border-gray-900/25'}`}>
                                <div className="text-center">
                                    <PaperClipIcon className="mx-auto h-8 w-8 text-gray-300" />
                                    <div className="mt-2 flex text-sm text-gray-600"><label htmlFor="file-upload" className="relative cursor-pointer rounded-md bg-white font-semibold text-blue-600 hover:text-blue-500"><span>Upload files</span><input id="file-upload" type="file" className="sr-only" onChange={handleFileSelect} multiple /></label><p className="pl-1">or drag and drop</p></div>
                                </div>
                            </div>
                            {commentFiles.length > 0 && (
                                <div className="mt-2 space-y-2">
                                    {commentFiles.map((file, index) => (
                                        <div key={index} className="flex items-center justify-between p-2 bg-gray-100 rounded-md text-sm">
                                            <span className="font-medium text-gray-700 truncate">{file.name}</span>
                                            <button onClick={() => handleRemoveFile(index)} className="p-1 text-gray-400 hover:text-red-500"><TrashIcon className="w-4 h-4" /></button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="text-right mt-2">
                            <button onClick={handleAddComment} className="px-4 py-2 bg-blue-600 text-white font-bold rounded-md hover:bg-blue-700">
                                Post Comment
                            </button>
                        </div>
                    </div>
                </div>

            </main>
        </div>
    );
};

export default TaskDetailScreen;