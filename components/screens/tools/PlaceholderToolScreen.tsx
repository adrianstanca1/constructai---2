
import React from 'react';
import { ChevronLeftIcon } from '../../Icons.tsx';

interface PlaceholderToolScreenProps {
    goBack: () => void;
    title?: string;
}

const PlaceholderToolScreen: React.FC<PlaceholderToolScreenProps> = ({ goBack, title = "Tool" }) => {
    return (
        <div className="flex flex-col h-full max-w-4xl mx-auto">
            <header className="bg-white p-4 flex items-center border-b mb-8">
                <button onClick={goBack} className="mr-4 p-2 rounded-full hover:bg-gray-100">
                    <ChevronLeftIcon className="w-6 h-6 text-gray-600" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                    <p className="text-sm text-gray-500">Feature Coming Soon</p>
                </div>
            </header>
            <main className="flex-grow flex items-center justify-center bg-white rounded-lg shadow-md border border-gray-100">
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-gray-700">Under Construction</h2>
                    <p className="mt-2 text-gray-500">This feature is currently in development and will be available soon.</p>
                </div>
            </main>
        </div>
    );
};

export default PlaceholderToolScreen;
