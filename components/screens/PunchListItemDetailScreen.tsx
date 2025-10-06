import React, { useState, useEffect } from 'react';
import { Project, PunchListItem, User, Comment } from '../../types.ts';
import * as api from '../../api.ts';
import { ChevronLeftIcon, PaperClipIcon, UsersIcon, MapPinIcon } from '../Icons.tsx';

interface PunchListItemDetailScreenProps {
    itemId: string;
    project: Project;
    goBack: () => void;
    currentUser: User;
}

const getStatusColor = (status: PunchListItem['status']) => {
    switch (status) {
        case 'Open': return { text: 'text-red-800', bg: 'bg-red-100' };
        case 'Ready for Review': return { text: 'text-yellow-800', bg: 'bg-yellow-100' };
        case 'Closed': return { text: 'text-green-800', bg: 'bg-green-100' };
        default: return { text: 'text-gray-800', bg: 'bg-gray-100' };
    }
};

const PunchListItemDetailScreen: React.FC<PunchListItemDetailScreenProps> = ({ itemId, project, goBack, currentUser }) => {
    const [item, setItem] = useState<PunchListItem | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [newComment, setNewComment] = useState('');

    useEffect(() => {
        const loadItem = async () => {
            setIsLoading(true);
            const fetchedItem = await api.fetchPunchListItemById(itemId);
            setItem(fetchedItem || null);
            setIsLoading(false);
        };
        loadItem();
    }, [itemId]);

    const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        if (!item) return;
        const newStatus = e.target.value as PunchListItem['status'];
        const originalItem = item;
        const updatedItemData = { ...item, status: newStatus };
        setItem(updatedItemData); // Optimistic update
        try {
            await api.updatePunchListItem(updatedItemData, currentUser);
        } catch (error: any) {
            alert(error.message);
            setItem(originalItem); // Revert on error
        }
    };

    const handleAddComment = async () => {
        if (!item || !newComment.trim()) return;
        const comment = await api.addCommentToPunchListItem(item.id, newComment, currentUser);
        setItem(prev => prev ? { ...prev, comments: [...prev.comments, comment] } : null);
        setNewComment('');
    };

    if (isLoading) {
        return <div className="text-center p-8">Loading item details...</div>;
    }

    if (!item) {
        return <div className="text-center p-8 text-red-500">Punch list item not found.</div>;
    }

    const statusColors = getStatusColor(item.status);
    
    const isOperative = currentUser.role === 'operative';
    const canChangeStatus = !isOperative || (isOperative && item.status === 'Open');
    
    return (
        <div className="flex flex-col h-full max-w-4xl mx-auto">
            <header className="bg-white p-4 flex items-center border-b mb-8">
                <button onClick={goBack} className="mr-4 p-2 rounded-full hover:bg-gray-100">
                    <ChevronLeftIcon className="w-6 h-6 text-gray-600" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 truncate" title={item.title}>{item.title}</h1>
                    <p className="text-sm text-gray-500">{project.name}</p>
                </div>
            </header>

            <main className="flex-grow space-y-6">
                <div className="bg-white rounded-lg shadow-md border border-gray-100 p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2">
                        <h3 className="font-bold text-lg text-gray-800 mb-2">Description</h3>
                        <p className="text-gray-600 whitespace-pre-wrap">{item.description || 'No description provided.'}</p>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">Status</label>
                            <select 
                                value={item.status} 
                                onChange={handleStatusChange} 
                                className={`w-full mt-1 p-2 border border-gray-300 rounded-md font-semibold ${statusColors.text} ${statusColors.bg} disabled:opacity-70 disabled:bg-gray-200 disabled:cursor-not-allowed`}
                                disabled={!canChangeStatus}
                            >
                                <option value="Open">Open</option>
                                <option value="Ready for Review">Ready for Review</option>
                                <option value="Closed" disabled={isOperative}>Closed</option>
                            </select>
                        </div>
                         <div>
                            <p className="text-xs font-bold text-gray-500 uppercase mb-1 flex items-center gap-1.5"><UsersIcon className="w-4 h-4"/>Assignee</p>
                            <p className="text-gray-800 font-semibold">{item.assignee}</p>
                        </div>
                        <div>
                           <p className="text-xs font-bold text-gray-500 uppercase mb-1 flex items-center gap-1.5"><MapPinIcon className="w-4 h-4"/>Location</p>
                            <p className="text-gray-800 font-semibold">{item.location}</p>
                        </div>
                    </div>
                </div>

                {item.photos && item.photos.length > 0 && (
                     <div className="bg-white rounded-lg shadow-md border border-gray-100 p-6">
                        <h3 className="font-bold text-lg text-gray-800 mb-2 flex items-center gap-2"><PaperClipIcon className="w-5 h-5"/>Photos</h3>
                         <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                            {item.photos.map((photo, index) => (
                                <img key={index} src={photo} alt={`item-photo-${index}`} className="w-full h-24 object-cover rounded-md"/>
                            ))}
                        </div>
                    </div>
                )}
                
                <div className="bg-white rounded-lg shadow-md border border-gray-100 p-6">
                    <h3 className="font-bold text-lg text-gray-800 mb-4">Comments ({item.comments.length})</h3>
                    <div className="space-y-4">
                        {item.comments.map(comment => (
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

            </main>
        </div>
    );
};

export default PunchListItemDetailScreen;