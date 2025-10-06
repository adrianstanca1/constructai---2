// Fix: Created the RFIDetailScreen component to resolve "not a module" error.
import React, { useState, useEffect } from 'react';
import { Project, RFI, User, Comment, Attachment } from '../../types.ts';
import * as api from '../../api.ts';
import { ChevronLeftIcon, PaperClipIcon, CalendarDaysIcon, UsersIcon, ClockIcon, TrashIcon } from '../Icons.tsx';

interface RFIDetailScreenProps {
    rfiId: string;
    project: Project;
    goBack: () => void;
    currentUser: User;
}

const getStatusColor = (status: RFI['status']) => {
    switch (status) {
        case 'Open': return 'bg-red-100 text-red-800 border-2 border-red-300';
        case 'Closed': return 'bg-green-100 text-green-800 border-2 border-green-300';
        case 'Draft': return 'bg-yellow-100 text-yellow-800 border-2 border-yellow-300';
        default: return 'bg-gray-100 text-gray-800 border-2 border-gray-300';
    }
};

const isRfiOverdue = (rfi: RFI): boolean => {
    if (rfi.status !== 'Open') return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(rfi.dueDate) < today;
};


const RFIDetailScreen: React.FC<RFIDetailScreenProps> = ({ rfiId, project, goBack, currentUser }) => {
    const [rfi, setRfi] = useState<RFI | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [newComment, setNewComment] = useState('');
    const [answer, setAnswer] = useState('');
    const [responseFiles, setResponseFiles] = useState<File[]>([]);
    const [isDraggingOver, setIsDraggingOver] = useState(false);

    useEffect(() => {
        const loadRfi = async () => {
            setIsLoading(true);
            const fetchedRfi = await api.fetchRFIById(rfiId);
            setRfi(fetchedRfi || null);
            setIsLoading(false);
        };
        loadRfi();
    }, [rfiId]);
    
    const handleAddComment = async () => {
        if (!rfi || !newComment.trim()) return;
        const comment = await api.addCommentToRFI(rfi.id, newComment, currentUser);
        setRfi(prev => prev ? { ...prev, comments: [...prev.comments, comment] } : null);
        setNewComment('');
    };

    const handleAnswerSubmit = async () => {
        if (!rfi || !answer.trim()) {
            alert("Please enter an answer before submitting.");
            return;
        }
        const attachmentsForApi: Attachment[] = await Promise.all(
            responseFiles.map(file => new Promise((resolve, reject) => {
                 const reader = new FileReader();
                reader.onload = (e) => {
                    resolve({ name: file.name, url: e.target?.result as string });
                };
                reader.onerror = reject;
                reader.readAsDataURL(file);
            }))
        );

        const updatedRfi = await api.addAnswerToRFI(rfi.id, answer, attachmentsForApi, currentUser);
        if(updatedRfi) {
            setRfi(updatedRfi);
        }
        setAnswer('');
        setResponseFiles([]);
    };

    const processFiles = (files: FileList) => {
        if (files) {
            setResponseFiles(prev => [...prev, ...Array.from(files)]);
        }
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            processFiles(event.target.files);
        }
        if (event.target) event.target.value = '';
    };

    const handleRemoveFile = (indexToRemove: number) => {
        setResponseFiles(prev => prev.filter((_, index) => index !== indexToRemove));
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
        return <div className="text-center p-8">Loading RFI details...</div>;
    }

    if (!rfi) {
        return <div className="text-center p-8 text-red-500">RFI not found.</div>;
    }

    const overdue = isRfiOverdue(rfi);
    const canAnswer = (currentUser.role === 'company_admin' || currentUser.role === 'supervisor');

    return (
        <div className="flex flex-col h-full max-w-4xl mx-auto">
            <header className="bg-white p-4 flex items-center border-b mb-8">
                <button onClick={goBack} className="mr-4 p-2 rounded-full hover:bg-gray-100">
                    <ChevronLeftIcon className="w-6 h-6 text-gray-600" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 truncate" title={rfi.subject}>{rfi.subject}</h1>
                    <p className="text-sm text-gray-500">{project.name}</p>
                </div>
            </header>

            <main className="flex-grow space-y-6">
                <div className="bg-white rounded-lg shadow-md border border-gray-100 p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2">
                        <h3 className="font-bold text-lg text-gray-800 mb-2">Question</h3>
                        <p className="text-gray-600 whitespace-pre-wrap">{rfi.question}</p>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <p className="text-xs font-bold text-gray-500 uppercase">Status</p>
                            <p className={`font-bold py-1 px-2 rounded-full inline-block text-xs mt-1 ${getStatusColor(rfi.status)}`}>{rfi.status}</p>
                        </div>
                         <div>
                            <p className="text-xs font-bold text-gray-500 uppercase mb-1 flex items-center gap-1.5"><UsersIcon className="w-4 h-4"/>Assigned To</p>
                            <p className="text-gray-800 font-semibold">{rfi.assignee}</p>
                        </div>
                        <div>
                            <p className={`text-xs font-bold uppercase mb-1 flex items-center gap-1.5 ${overdue ? 'text-red-600' : 'text-gray-500'}`}>
                                <CalendarDaysIcon className="w-4 h-4"/>Response Due
                            </p>
                            <p className={`font-semibold ${overdue ? 'text-red-600' : 'text-gray-800'}`}>
                                {new Date(rfi.dueDate).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                </div>
                
                <div className="bg-white rounded-lg shadow-md border border-gray-100 p-6">
                    <h3 className="font-bold text-lg text-gray-800 mb-4">Official Response</h3>
                    {rfi.status === 'Closed' && rfi.response ? (
                         <div className="p-4 bg-green-50 border-l-4 border-green-400 rounded-r-md">
                            <p className="text-gray-700 whitespace-pre-wrap">{rfi.response}</p>
                            <p className="text-xs text-gray-500 mt-2">Answered by {rfi.answeredBy}</p>
                            {rfi.responseAttachments && rfi.responseAttachments.length > 0 && (
                                <div className="mt-4">
                                    <h4 className="font-semibold text-sm text-gray-700 mb-2">Attachments:</h4>
                                    <ul className="space-y-2">
                                        {rfi.responseAttachments.map((att, index) => (
                                            <li key={index} className="flex items-center gap-2">
                                                <PaperClipIcon className="w-4 h-4 text-gray-500" />
                                                <a href={att.url} className="text-sm text-blue-600 hover:underline">{att.name}</a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    ) : (
                        canAnswer ? (
                            <div>
                                <textarea 
                                    rows={4} 
                                    value={answer}
                                    onChange={(e) => setAnswer(e.target.value)}
                                    placeholder="Type the official response here..."
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                />
                                <div className="mt-4">
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Attachments</label>
                                    <div onDragEnter={handleDragEnter} onDragLeave={handleDragLeave} onDragOver={handleDragOver} onDrop={handleDrop} className={`mt-2 flex justify-center rounded-lg border border-dashed px-6 py-10 transition-colors ${isDraggingOver ? 'border-blue-600 bg-blue-50' : 'border-gray-900/25'}`}>
                                        <div className="text-center">
                                            <PaperClipIcon className="mx-auto h-12 w-12 text-gray-300" />
                                            <div className="mt-4 flex text-sm text-gray-600"><label htmlFor="file-upload" className="relative cursor-pointer rounded-md bg-white font-semibold text-blue-600 hover:text-blue-500"><span>Upload a file</span><input id="file-upload" type="file" className="sr-only" onChange={handleFileSelect} multiple /></label><p className="pl-1">or drag and drop</p></div>
                                            <p className="text-xs text-gray-600">PDF, PNG, JPG up to 10MB</p>
                                        </div>
                                    </div>
                                    {responseFiles.length > 0 && (
                                        <div className="mt-4 space-y-2">
                                            {responseFiles.map((file, index) => (
                                                <div key={index} className="flex items-center justify-between p-2 bg-gray-100 rounded-md text-sm">
                                                    <span className="font-medium text-gray-700 truncate">{file.name}</span>
                                                    <button onClick={() => handleRemoveFile(index)} className="p-1 text-gray-400 hover:text-red-500"><TrashIcon className="w-4 h-4" /></button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="text-right mt-4">
                                    <button onClick={handleAnswerSubmit} className="px-4 py-2 bg-blue-600 text-white font-bold rounded-md hover:bg-blue-700">
                                        Submit Answer & Close RFI
                                    </button>
                                </div>
                            </div>
                        ) : (
                             <p className="text-sm text-gray-500">Awaiting response from the assigned party.</p>
                        )
                    )}
                </div>

                <div className="bg-white rounded-lg shadow-md border border-gray-100 p-6">
                    <h3 className="font-bold text-lg text-gray-800 mb-4">Comments ({rfi.comments.length})</h3>
                    <div className="space-y-4">
                        {rfi.comments.map(comment => (
                            <div key={comment.id} className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-600 flex-shrink-0">
                                    {comment.author.charAt(0)}
                                </div>
                                <div>
                                    <div className="flex items-baseline gap-2">
                                        <p className="font-bold text-sm">{comment.author}</p>
                                        <p className="text-xs text-gray-500">{new Date(comment.timestamp).toLocaleString()}</p>
                                    </div>
                                    <p className="text-sm text-gray-700 mt-1">{comment.text}</p>
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
                        <div className="text-right mt-2">
                            <button onClick={handleAddComment} className="px-4 py-2 bg-blue-600 text-white font-bold rounded-md hover:bg-blue-700">
                                Post Comment
                            </button>
                        </div>
                    </div>
                </div>

                {rfi.history && rfi.history.length > 0 && (
                    <div className="bg-white rounded-lg shadow-md border border-gray-100 p-6">
                        <h3 className="font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
                            <ClockIcon className="w-5 h-5 text-gray-500" />
                            History
                        </h3>
                        <ul className="space-y-4 border-l-2 border-gray-200 ml-2">
                            {rfi.history.slice().reverse().map((event, index) => (
                                <li key={index} className="relative pl-6">
                                    <div className="absolute -left-[7px] top-1.5 w-3 h-3 bg-gray-300 rounded-full ring-4 ring-white"></div>
                                    <p className="text-sm text-gray-800 font-medium">{event.change}</p>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        by {event.author} &middot; {new Date(event.timestamp).toLocaleString()}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </main>
        </div>
    );
};

export default RFIDetailScreen;