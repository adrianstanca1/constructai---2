export type UserRole = 'super_admin' | 'company_admin' | 'supervisor' | 'operative';

export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    avatar: string;
    companyId: string;
}

export interface Company {
    id: string;
    name: string;
}

export interface ProjectSnapshot {
    openRFIs: number;
    overdueTasks: number;
    pendingTMTickets: number;
    aiRiskLevel: string;
}

export interface ProjectContact {
    role: string;
    name: string;
}

export interface Project {
    id: string;
    companyId: string;
    name: string;
    location: string;
    image: string;
    description: string;
    contacts: ProjectContact[];
    snapshot: ProjectSnapshot;
}

export type Screen = 
    | 'global-dashboard'
    | 'projects' 
    | 'project-home'
    | 'my-day'
    | 'tasks'
    | 'task-detail'
    | 'new-task'
    | 'daily-log'
    | 'photos'
    | 'rfis'
    | 'rfi-detail'
    | 'new-rfi'
    | 'punch-list'
    | 'punch-list-item-detail'
    | 'new-punch-list-item'
    | 'drawings'
    | 'plans'
    | 'daywork-sheets'
    | 'daywork-sheet-detail'
    | 'new-daywork-sheet'
    | 'documents'
    | 'delivery'
    // Module Screens
    | 'accounting'
    | 'ai-tools'
    | 'document-management'
    | 'time-tracking'
    | 'project-operations'
    | 'financial-management'
    | 'business-development'
    // Tool screens
    | 'placeholder-tool';


export interface Comment {
    id: string;
    author: string;
    timestamp: string;
    text: string;
    attachments?: Attachment[];
}

export interface Task {
    id: string;
    projectId: string;
    title: string;
    description: string;
    status: 'To Do' | 'In Progress' | 'Done';
    assignee?: string;
    targetRoles?: UserRole[];
    dueDate: string;
    attachments: Attachment[];
    comments: Comment[];
}

export interface Attachment {
    name: string;
    url: string;
}

export interface RFIHistoryEvent {
    timestamp: string;
    author: string;
    change: string;
}

export interface RFI {
    id: string;
    projectId: string;
    subject: string;
    question: string;
    status: 'Open' | 'Closed' | 'Draft';
    assignee: string;
    dueDate: string;
    attachments: Attachment[];
    comments: Comment[];
    response?: string;
    answeredBy?: string;
    responseAttachments?: Attachment[];
    createdBy: string;
    dueDateNotified: boolean;
    history?: RFIHistoryEvent[];
}

export interface PunchListItem {
    id: string;
    projectId: string;
    title: string;
    description: string;
    location: string;
    status: 'Open' | 'Ready for Review' | 'Closed';
    assignee: string;
    photos: string[];
    comments: Comment[];
}

export interface Drawing {
    id: string;
    projectId: string;
    number: string;
    title: string;
    revision: number;
    date: string;
    url: string;
}

export interface Document {
    id: string;
    projectId: string;
    name: string;
    url: string;
    uploadedAt: string;
}

export interface SiteInstruction {
    id: string;
    text: string;
    author: string;
}

export interface DeliveryItem {
    id: string;
    name: string;
    ordered: number;
    received: number;
}

export interface DayworkSheetItem {
    id: string;
    description: string;
    quantity: number;
    unit: string;
    rate: number;
}

export interface DayworkSheet {
    id: string;
    projectId: string;
    ticketNumber: string;
    date: string;
    contractor: string;
    description: string;
    status: 'Pending' | 'Approved' | 'Rejected';
    items: DayworkSheetItem[];
    approvedBy: string | null;
    approvedDate: string | null;
}

export interface NotificationLink {
    projectId?: string;
    screen: Screen;
    params?: any;
}

export interface Notification {
    id: string;
    message: string;
    timestamp: string;
    read: boolean;
    link: NotificationLink;
}

export interface ActivityEvent {
    id: string;
    type: 'status_change' | 'comment' | 'photo' | 'log_submitted';
    author: string;
    description: string;
    timestamp: string;
    projectId: string;
    projectName: string;
    link: {
        screen: Screen;
        params: any;
    };
}

export interface AISuggestion {
    title: string;
    reason: string;
    action: {
        label: string;
        link: NotificationLink;
    }
}

export interface AIInsight {
    type: 'risk' | 'alert' | 'tip';
    title: string;
    message: string;
}

export interface AIFeedback {
    id: string;
    suggestionTitle: string;
    suggestionReason: string;
    feedback: 'up' | 'down';
    timestamp: string;
    userId: string;
}

export interface LogItem {
    id: number;
    item: string;
    quantity: string;
    unitCost: string;
}

export interface DailyLog {
    id: string;
    projectId: string;
    userId: string;
    date: string;
    submittedAt: string;
    weather: string;
    notes: string;
    photos: string[];
    labor: LogItem[];
    equipment: LogItem[];
    materials: LogItem[];
}