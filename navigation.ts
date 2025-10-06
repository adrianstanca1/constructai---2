import { Screen, UserRole } from './types.ts';

export interface MenuItem {
    label: string;
    screen?: Screen;
    roles: UserRole[];
    children?: MenuItem[];
}

export const MENU_ITEMS: MenuItem[] = [
    {
        label: 'Accounting',
        screen: 'accounting',
        roles: ['company_admin'],
    },
    {
        label: 'AI Tools',
        screen: 'ai-tools',
        roles: ['company_admin', 'supervisor'],
    },
    {
        label: 'Document Management',
        roles: ['company_admin', 'supervisor', 'operative'],
        children: [
            { label: 'All Documents', screen: 'document-management', roles: ['company_admin', 'supervisor', 'operative'] },
            { label: 'Drawings', screen: 'drawings', roles: ['company_admin', 'supervisor', 'operative'] },
            { label: 'Photo Gallery', screen: 'photos', roles: ['company_admin', 'supervisor', 'operative'] },
            { label: 'Reports', screen: 'documents', roles: ['company_admin', 'supervisor'] },
        ]
    },
    {
        label: 'Time Tracking',
        screen: 'time-tracking',
        roles: ['company_admin', 'supervisor', 'operative'],
    },
    {
        label: 'Project Operations',
        screen: 'project-operations',
        roles: ['company_admin', 'supervisor'],
    },
    {
        label: 'Financial Management',
        screen: 'financial-management',
        roles: ['company_admin'],
    },
    {
        label: 'Business Development',
        screen: 'business-development',
        roles: ['company_admin'],
    }
];