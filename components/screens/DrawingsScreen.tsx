import React, { useState, useEffect } from 'react';
// Fix: Added .ts extension to import
import { Project, Drawing, Screen, User } from '../../types.ts';
// Fix: Corrected the import path for the 'api' module.
import * as api from '../../api.ts';
// Fix: Added .tsx extension to import
import { ChevronLeftIcon, PlusIcon, DocumentDuplicateIcon } from '../Icons.tsx';
// Fix: Added .tsx extension to import
import NewDrawingModal from '../modals/NewDrawingModal.tsx';

interface DrawingsScreenProps {
    project: Project;
    goBack: () => void;
    navigateTo: (screen: Screen, params?: any) => void;
    currentUser: User;
}

const DrawingsScreen: React.FC<DrawingsScreenProps> = ({ project, goBack, navigateTo, currentUser }) => {
    const [drawings, setDrawings] = useState<Drawing[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    
    const canCreate = ['company_admin', 'supervisor', 'super_admin'].includes(currentUser.role);

    useEffect(() => {
        const loadDrawings = async () => {
            setIsLoading(true);
            const fetchedDrawings = await api.fetchDrawings();
            setDrawings(fetchedDrawings.filter(d => d.projectId === project.id));
            setIsLoading(false);
        };
        loadDrawings();
    }, [project.id]);

    const openDrawing = (drawing: Drawing) => {
        navigateTo('plans', { url: drawing.url, title: `${drawing.number} - ${drawing.title}` });
    };

    const handleUploadSubmit = async (drawingData: { number: string; title: string; revision: number; date: string; file: File }) => {
        try {
            const newDrawing = await api.createDrawing(project.id, drawingData, currentUser);
            setDrawings(prevDrawings => [newDrawing, ...prevDrawings]);
            setIsUploadModalOpen(false);
        } catch (error) {
            console.error("Failed to create drawing:", error);
            alert("Failed to upload drawing. Please try again.");
        }
    };


    return (
        <div className="flex flex-col h-full max-w-4xl mx-auto">
            <header className="bg-white p-4 flex justify-between items-center border-b mb-8">
                <div className="flex items-center">
                    <button onClick={goBack} className="mr-4 p-2 rounded-full hover:bg-gray-100">
                        <ChevronLeftIcon className="w-6 h-6 text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Drawings</h1>
                        <p className="text-sm text-gray-500">{project.name}</p>
                    </div>
                </div>
                 {canCreate && (
                    <button onClick={() => setIsUploadModalOpen(true)} className="bg-blue-600 text-white p-2.5 rounded-full shadow hover:bg-blue-700">
                        <PlusIcon className="w-6 h-6"/>
                    </button>
                 )}
            </header>

            <main className="flex-grow bg-white rounded-lg shadow-md border border-gray-100">
                {isLoading ? (
                    <p className="text-center text-slate-500 p-8">Loading drawings...</p>
                ) : (
                    <ul className="divide-y divide-slate-200">
                        {drawings.map(drawing => (
                            <li key={drawing.id} onClick={() => openDrawing(drawing)} className="p-4 flex items-center justify-between hover:bg-slate-50 cursor-pointer">
                                <div className="flex items-center gap-4">
                                    <DocumentDuplicateIcon className="w-8 h-8 text-fuchsia-500" />
                                    <div>
                                        <p className="font-semibold text-gray-800">{drawing.number} - {drawing.title}</p>
                                        <p className="text-xs text-slate-500">Rev: {drawing.revision} | Date: {new Date(drawing.date).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                            </li>
                        ))}
                    </ul>
                )}
            </main>

            {isUploadModalOpen && (
                <NewDrawingModal
                    project={project}
                    onClose={() => setIsUploadModalOpen(false)}
                    onSubmit={handleUploadSubmit}
                />
            )}
        </div>
    );
};

export default DrawingsScreen;