import React from 'react';
// Fix: Added .ts extension to import
import { Project } from '../../types.ts';
// Fix: Added .tsx extension to import
import { ChevronLeftIcon, PlusIcon } from '../Icons.tsx';

interface PhotoGalleryScreenProps {
    project: Project;
    goBack: () => void;
}

const MOCK_PHOTOS = [
    { id: 1, url: 'https://picsum.photos/seed/p1/400/300', date: '2023-10-26', author: 'Charlie' },
    { id: 2, url: 'https://picsum.photos/seed/p2/400/300', date: '2023-10-26', author: 'Diana' },
    { id: 3, url: 'https://picsum.photos/seed/p3/400/300', date: '2023-10-25', author: 'Charlie' },
    { id: 4, url: 'https://picsum.photos/seed/p4/400/300', date: '2023-10-25', author: 'Charlie' },
    { id: 5, url: 'https://picsum.photos/seed/p5/400/300', date: '2023-10-24', author: 'Diana' },
    { id: 6, url: 'https://picsum.photos/seed/p6/400/300', date: '2023-10-24', author: 'Charlie' },
    { id: 7, url: 'https://picsum.photos/seed/p7/400/300', date: '2023-10-23', author: 'Diana' },
    { id: 8, url: 'https://picsum.photos/seed/p8/400/300', date: '2023-10-23', author: 'Charlie' },
];

const PhotoGalleryScreen: React.FC<PhotoGalleryScreenProps> = ({ project, goBack }) => {
    return (
         <div className="flex flex-col h-full max-w-6xl mx-auto">
            <header className="bg-white p-4 flex justify-between items-center border-b mb-8">
                <div className="flex items-center">
                    <button onClick={goBack} className="mr-4 p-2 rounded-full hover:bg-gray-100">
                        <ChevronLeftIcon className="w-6 h-6 text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Photo Gallery</h1>
                        <p className="text-sm text-gray-500">{project.name}</p>
                    </div>
                </div>
                 <button className="bg-blue-600 text-white p-2.5 rounded-full shadow hover:bg-blue-700">
                    <PlusIcon className="w-6 h-6"/>
                </button>
            </header>
             <main className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {MOCK_PHOTOS.map(photo => (
                    <div key={photo.id} className="bg-white rounded-lg shadow overflow-hidden group">
                        <img src={photo.url} alt={`Site photo ${photo.id}`} className="w-full h-48 object-cover group-hover:opacity-80" />
                        <div className="p-2 text-xs">
                            <p className="font-semibold">{new Date(photo.date).toLocaleDateString()}</p>
                            <p className="text-gray-500">by {photo.author}</p>
                        </div>
                    </div>
                ))}
            </main>
        </div>
    );
};

export default PhotoGalleryScreen;