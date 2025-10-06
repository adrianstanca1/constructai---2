import React, { useState } from 'react';
// Fix: Added .ts extension to import
import { Project, User } from '../../types.ts';
// Fix: Corrected the import path for the 'api' module.
import * as api from '../../api.ts';
// Fix: Added .tsx extension to import
import { ChevronLeftIcon, CalendarDaysIcon, UsersIcon, PaperClipIcon } from '../Icons.tsx';

interface NewRFIScreenProps {
    project: Project;
    goBack: () => void;
    currentUser: User;
}

const NewRFIScreen: React.FC<NewRFIScreenProps> = ({ project, goBack, currentUser }) => {
    const [subject, setSubject] = useState('');
    const [question, setQuestion] = useState('');
    const [assignee, setAssignee] = useState('');
    const [dueDate, setDueDate] = useState('');
    
    // In a real app, this would be a more sophisticated list
    const possibleAssignees = ['Architect Team', 'Structural Engineer', 'MEP Consultant', 'General Contractor'];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!subject || !question || !assignee || !dueDate) {
            alert('Please fill in all required fields.');
            return;
        }
        
        const newRFI = {
            projectId: project.id,
            subject,
            question,
            status: 'Open' as const,
            assignee,
            dueDate,
            attachments: [],
        };
        
        // Fix: Pass the current user as the second argument to `createRFI`.
        await api.createRFI(newRFI, currentUser);
        alert('RFI created successfully!');
        goBack();
    };

    return (
        <div className="flex flex-col h-full max-w-2xl mx-auto">
            <header className="bg-white p-4 flex items-center border-b mb-8">
                <button onClick={goBack} className="mr-4 p-2 rounded-full hover:bg-gray-100">
                    <ChevronLeftIcon className="w-6 h-6 text-gray-600" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">New RFI</h1>
                    <p className="text-sm text-gray-500">{project.name}</p>
                </div>
            </header>

            <form id="rfi-form" onSubmit={handleSubmit} className="flex-grow space-y-6">
                <div>
                    <label htmlFor="subject" className="block text-sm font-bold text-gray-700 mb-1">
                        Subject <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        id="subject"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md shadow-sm"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="question" className="block text-sm font-bold text-gray-700 mb-1">
                        Question <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        id="question"
                        rows={6}
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md shadow-sm"
                        required
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="assignee" className="block text-sm font-bold text-gray-700 mb-1">
                            Assigned To <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                             <select
                                id="assignee"
                                value={assignee}
                                onChange={(e) => setAssignee(e.target.value)}
                                className="w-full p-2 pl-10 border border-gray-300 rounded-md shadow-sm appearance-none"
                                required
                            >
                                <option value="" disabled>Select a team or person</option>
                                {possibleAssignees.map(name => (
                                    <option key={name} value={name}>{name}</option>
                                ))}
                            </select>
                            <UsersIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="dueDate" className="block text-sm font-bold text-gray-700 mb-1">
                            Response Due <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <input
                                type="date"
                                id="dueDate"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                                className="w-full p-2 pl-10 border border-gray-300 rounded-md shadow-sm"
                                required
                            />
                             <CalendarDaysIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Attachments</label>
                    <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10">
                        <div className="text-center">
                            <PaperClipIcon className="mx-auto h-12 w-12 text-gray-300" aria-hidden="true" />
                            <div className="mt-4 flex text-sm leading-6 text-gray-600">
                                <label htmlFor="file-upload" className="relative cursor-pointer rounded-md bg-white font-semibold text-blue-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-600 focus-within:ring-offset-2 hover:text-blue-500">
                                    <span>Upload a file</span>
                                    <input id="file-upload" name="file-upload" type="file" className="sr-only" />
                                </label>
                                <p className="pl-1">or drag and drop</p>
                            </div>
                            <p className="text-xs leading-5 text-gray-600">PDF, PNG, JPG up to 10MB</p>
                        </div>
                    </div>
                </div>
            </form>

            <footer className="bg-white p-4 mt-8 border-t flex justify-end items-center gap-4">
                <button type="button" onClick={goBack} className="px-6 py-3 rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300 font-bold">
                    Cancel
                </button>
                <button type="submit" form="rfi-form" className="px-6 py-3 rounded-md bg-blue-600 text-white hover:bg-blue-700 font-bold">
                    Submit RFI
                </button>
            </footer>
        </div>
    );
};

export default NewRFIScreen;