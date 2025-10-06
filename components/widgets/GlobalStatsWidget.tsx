import React, { useState, useEffect } from 'react';
// Fix: Corrected import paths to use proper relative path and file extension.
import { Project, User } from '../../types.ts';
// Fix: Corrected import paths to use proper relative path and file extension.
// Fix: Corrected the import path for the 'api' module.
import * as api from '../../api.ts';
// Fix: Added .tsx extension to import
import StatCard from './StatCard.tsx';

interface GlobalStatsWidgetProps {
    currentUser: User;
}

const GlobalStatsWidget: React.FC<GlobalStatsWidgetProps> = ({ currentUser }) => {
    const [stats, setStats] = useState({
        openRFIs: 0,
        overdueTasks: 0,
        pendingTMTickets: 0,
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadGlobalStats = async () => {
            setIsLoading(true);
            const projects = await api.fetchAllProjects(currentUser);
            const totals = projects.reduce((acc, project) => ({
                openRFIs: acc.openRFIs + project.snapshot.openRFIs,
                overdueTasks: acc.overdueTasks + project.snapshot.overdueTasks,
                pendingTMTickets: acc.pendingTMTickets + project.snapshot.pendingTMTickets,
            }), { openRFIs: 0, overdueTasks: 0, pendingTMTickets: 0 });
            setStats(totals);
            setIsLoading(false);
        };
        loadGlobalStats();
    }, [currentUser]);

    if (isLoading) {
        return (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-white p-5 rounded-lg shadow-md border border-gray-100 h-[105px] animate-pulse">
                         <div className="flex items-center space-x-4">
                            <div className="w-14 h-14 rounded-full bg-gray-200"></div>
                            <div>
                                <div className="h-8 w-12 bg-gray-200 rounded"></div>
                                <div className="h-4 w-24 bg-gray-200 rounded mt-2"></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }
    
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <StatCard label="Total Open RFIs" value={stats.openRFIs} type="rfi" />
            <StatCard label="Total Overdue" value={stats.overdueTasks} type="overdue" />
            <StatCard label="Total Pending T&M" value={stats.pendingTMTickets} type="tm-ticket" />
            <StatCard label="Company Risk" value="Low" type="ai-risk" />
        </div>
    );
};

export default GlobalStatsWidget;