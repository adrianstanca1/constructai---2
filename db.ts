//
// Golden Rule: Data Encapsulation
// ---------------------------------
// The arrays in this file represent our mock database. To ensure data integrity
// and simulate a real backend, they should NEVER be mutated directly from
// outside this file (e.g., from api.ts).
//
// ALWAYS use the exported accessor and mutator functions to interact with the data.
// This keeps data management centralized and predictable.
//
// Fix: Added .ts extension to import
import { User, Company, Project, Task, RFI, PunchListItem, Drawing, Document, SiteInstruction, DeliveryItem, DayworkSheet, Comment, Notification, ActivityEvent, AIFeedback, DailyLog } from './types.ts';

// Helper to create date strings
const d = (daysAgo: number): string => {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return date.toISOString().split('T')[0];
};
const dt = (daysAgo: number, h = 0, m = 0): string => {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    date.setHours(date.getHours() - h, date.getMinutes() - m);
    return date.toISOString();
}

// --- DATABASE ARRAYS (PRIVATE) ---

const COMPANIES: Company[] = [
    { id: 'comp-1', name: 'ConstructCo' },
    { id: 'comp-2', name: 'BuildRight Inc.' },
];

const USERS: User[] = [
    { id: 'user-sa', name: 'Sam Admin', email: 'sam@constructai.com', role: 'super_admin', avatar: 'https://i.pravatar.cc/150?u=sam', companyId: '' },
    { id: 'user-ca', name: 'Casey Admin', email: 'casey@constructco.com', role: 'company_admin', avatar: 'https://i.pravatar.cc/150?u=casey', companyId: 'comp-1' },
    { id: 'user-ss', name: 'Susan Supervisor', email: 'susan@constructco.com', role: 'supervisor', avatar: 'https://i.pravatar.cc/150?u=susan', companyId: 'comp-1' },
    { id: 'user-oo', name: 'Oscar Operative', email: 'oscar@constructco.com', role: 'operative', avatar: 'https://i.pravatar.cc/150?u=oscar', companyId: 'comp-1' },
    { id: 'user-olivia', name: 'Olivia Operative', email: 'olivia@constructco.com', role: 'operative', avatar: 'https://i.pravatar.cc/150?u=olivia', companyId: 'comp-1' },
    { id: 'user-br', name: 'Bob Right', email: 'bob@buildright.com', role: 'company_admin', avatar: 'https://i.pravatar.cc/150?u=bob', companyId: 'comp-2' },
];

const PROJECTS: Project[] = [
    { 
        id: 'proj-1', 
        companyId: 'comp-1',
        name: 'Metropolis Grand Tower', 
        location: '123 Main St, Metropolis, USA', 
        image: 'https://picsum.photos/seed/proj1/800/600',
        description: 'A 50-story mixed-use skyscraper featuring retail, office, and residential units. Currently in the structural steel phase.',
        contacts: [
            { role: 'Project Manager', name: 'Jane PM' },
            { role: 'Superintendent', name: 'Mike Superintendent' },
        ],
        snapshot: { openRFIs: 2, overdueTasks: 1, pendingTMTickets: 2, aiRiskLevel: 'Low' }
    },
    { 
        id: 'proj-2', 
        companyId: 'comp-1',
        name: 'Oceanview Corporate Campus', 
        location: '456 Tech Park, Coast City', 
        image: 'https://picsum.photos/seed/proj2/800/600',
        description: 'A sprawling 3-building corporate campus with extensive landscaping and a central water feature. Site grading and foundations are underway.',
        contacts: [
            { role: 'Project Manager', name: 'Carl PM' },
            { role: 'Superintendent', name: 'Sue Superintendent' },
        ],
        snapshot: { openRFIs: 5, overdueTasks: 3, pendingTMTickets: 1, aiRiskLevel: 'Medium' }
    },
     { 
        id: 'proj-3', 
        companyId: 'comp-2',
        name: 'Riverside Hospital Wing', 
        location: '789 Health Ave, Rivertown', 
        image: 'https://picsum.photos/seed/proj3/800/600',
        description: 'A new 5-story patient care wing for the existing Riverside General Hospital. Interior fit-out and MEP work are in progress.',
        contacts: [
            { role: 'Project Manager', name: 'Rita PM' },
            { role: 'Superintendent', name: 'Ray Superintendent' },
        ],
        snapshot: { openRFIs: 1, overdueTasks: 0, pendingTMTickets: 4, aiRiskLevel: 'Low' }
    },
];

const comments: Comment[] = [
    { id: 'c1', author: 'Susan Supervisor', timestamp: dt(1, 2), text: 'Make sure to check the latest revision of the drawing.' },
    { id: 'c2', author: 'Oscar Operative', timestamp: dt(1, 1), text: 'Will do. I have rev 3.' },
    { id: 'c3', author: 'Casey Admin', timestamp: dt(2, 5), text: 'We need a response on this ASAP.' },
];

const TASKS: Task[] = [
    { id: 'task-1', projectId: 'proj-1', title: 'Install Level 10 East Wing Drywall', description: 'Hang, tape, and mud all drywall on the east wing of level 10.', status: 'In Progress', assignee: 'Oscar Operative', dueDate: d(-2), attachments: [], comments: [comments[0], comments[1]] },
    { id: 'task-2', projectId: 'proj-1', title: 'Level 12 Plumbing Rough-in', description: '', status: 'To Do', assignee: 'Olivia Operative', dueDate: d(5), attachments: [{ name: 'plumbing-plan.jpg', url: 'https://picsum.photos/seed/task2/400/300'}], comments: [] },
    { id: 'task-3', projectId: 'proj-1', title: 'Finalize concrete pour schedule for Level 15', description: 'Coordinate with concrete supplier and structural engineer.', status: 'To Do', assignee: 'Susan Supervisor', dueDate: d(2), attachments: [], comments: [] },
    { id: 'task-4', projectId: 'proj-2', title: 'Site Drainage Installation', description: 'Install all storm drainage pipes as per plan C-101.', status: 'Done', assignee: 'Oscar Operative', dueDate: d(10), attachments: [], comments: [] },
    { id: 'task-5', projectId: 'proj-2', title: 'Foundation Rebar Inspection', description: 'Schedule inspection with city inspector before Friday.', status: 'In Progress', assignee: 'Susan Supervisor', dueDate: d(3), attachments: [], comments: [] },
    { id: 'task-6', projectId: 'proj-3', title: 'Order HVAC units for ORs', description: 'Get submittals approved first.', status: 'To Do', assignee: 'Bob Right', dueDate: d(1), attachments: [], comments: [] },
];

const RFIS: RFI[] = [
    { 
        id: 'rfi-1', 
        projectId: 'proj-1', 
        subject: 'Clarification on Beam B-102 Connection', 
        question: 'Drawing S-201 shows a bolted connection, but the spec calls for a welded connection. Please clarify which is correct.', 
        status: 'Open', 
        assignee: 'Structural Engineer', 
        dueDate: d(-1), 
        attachments: [], 
        comments: [comments[2]], 
        createdBy: 'user-ss', 
        dueDateNotified: false,
        history: [
            { timestamp: dt(3, 2), author: 'Susan Supervisor', change: 'Created RFI.' }
        ] 
    },
    { 
        id: 'rfi-2', 
        projectId: 'proj-1', 
        subject: 'Window Type A-3a Glazing Spec', 
        question: 'The glazing spec for window A-3a is missing from the architectural drawings. Please provide.', 
        status: 'Closed', 
        assignee: 'Architect Team', 
        dueDate: d(10), 
        attachments: [], 
        response: 'The spec is XYZ-123. It has been added to revision 4 of sheet A-501. See attached spec sheet.', 
        comments: [], 
        createdBy: 'user-ss', 
        answeredBy: 'user-ca', 
        dueDateNotified: true,
        responseAttachments: [
            { name: 'Glazing-Spec-XYZ-123.pdf', url: '#' }
        ],
        history: [
            { timestamp: dt(11, 0), author: 'Susan Supervisor', change: 'Created RFI.' },
            { timestamp: dt(10, 0), author: 'Casey Admin', change: 'Answered RFI and changed status to Closed.' }
        ]
    },
    { 
        id: 'rfi-3', 
        projectId: 'proj-2', 
        subject: 'Landscaping Soil Type', 
        question: 'Is the specified topsoil mix required for all landscaped areas or just the planter beds?', 
        status: 'Open', 
        assignee: 'Landscape Architect', 
        dueDate: d(2), 
        attachments: [], 
        comments: [], 
        createdBy: 'user-ss', 
        dueDateNotified: false,
        history: [
            { timestamp: dt(5, 0), author: 'Susan Supervisor', change: 'Created RFI.' }
        ]
    },
];

const PUNCH_LIST_ITEMS: PunchListItem[] = [
    { id: 'pl-1', projectId: 'proj-1', title: 'Paint scuff on wall', description: 'Lobby, west wall near elevator.', location: 'Lobby, West Wall', status: 'Open', assignee: 'Painting Sub', photos: ['https://picsum.photos/seed/pl1/400/300'], comments: [] },
    { id: 'pl-2', projectId: 'proj-1', title: 'Ceiling tile stained', description: '', location: 'Corridor 2A', status: 'Ready for Review', assignee: 'General Contractor', photos: [], comments: [] },
    { id: 'pl-3', projectId: 'proj-1', title: 'Door 101 not closing properly', description: 'Hinges seem to be misaligned.', location: 'Office 101', status: 'Closed', assignee: 'Doors & Hardware', photos: [], comments: [] },
];

const DRAWINGS: Drawing[] = [
    { id: 'dwg-1', projectId: 'proj-1', number: 'A-101', title: 'Floor Plan - Level 1', revision: 3, date: d(30), url: '/sample.pdf' },
    { id: 'dwg-2', projectId: 'proj-1', number: 'S-201', title: 'Structural Framing Plan - Level 10', revision: 2, date: d(45), url: '/sample.pdf' },
    { id: 'dwg-3', projectId: 'proj-2', number: 'C-101', title: 'Site Grading and Drainage', revision: 5, date: d(20), url: '/sample.pdf' },
];

const DOCUMENTS: Document[] = [
    { id: 'doc-1', projectId: 'proj-1', name: 'Project Specifications.pdf', url: '#', uploadedAt: d(90) },
    { id: 'doc-2', projectId: 'proj-1', name: 'Safety Manual.pdf', url: '#', uploadedAt: d(120) },
    { id: 'doc-3', projectId: 'proj-2', name: 'Geotechnical Report.pdf', url: '#', uploadedAt: d(60) },
];

const SITE_INSTRUCTIONS: SiteInstruction[] = [
    { id: 'si-1', text: 'All personnel must wear hard hats and safety glasses beyond the site entrance.', author: 'Site Safety Officer' },
    { id: 'si-2', text: 'Weekly safety meeting every Monday at 7:00 AM at the site trailer.', author: 'Susan Supervisor' },
];

const DELIVERY_ITEMS: DeliveryItem[] = [
    { id: 'di-1', name: 'Steel Beams W12x26', ordered: 50, received: 50 },
    { id: 'di-2', name: 'Anchor Bolts 3/4"', ordered: 200, received: 150 },
    { id: 'di-3', name: 'Drywall Sheets 4x8', ordered: 100, received: 100 },
];

const DAYWORK_SHEETS: DayworkSheet[] = [
    { id: 'dws-1', projectId: 'proj-1', ticketNumber: 'T&M-001', date: d(2), contractor: 'ABC Electrical', description: 'Additional trenching for unforeseen underground utility conflict.', status: 'Pending', items: [], approvedBy: null, approvedDate: null },
    { id: 'dws-2', projectId: 'proj-1', ticketNumber: 'T&M-002', date: d(5), contractor: 'XYZ Plumbing', description: 'Rerouted domestic water line due to design change.', status: 'Approved', approvedBy: 'user-ca', approvedDate: d(4), items: [] },
    { id: 'dws-3', projectId: 'proj-2', ticketNumber: 'T&M-001', date: d(1), contractor: 'Rock Breakers Inc.', description: 'Additional rock breaking for foundation excavation.', status: 'Pending', items: [], approvedBy: null, approvedDate: null },
];

const DAILY_LOGS: DailyLog[] = [];

const NOTIFICATIONS: Notification[] = [
    { id: 'notif-1', message: 'Your response for RFI-001 is due in 3 days.', timestamp: dt(0, 1), read: false, link: { projectId: 'proj-1', screen: 'rfi-detail', params: { rfiId: 'rfi-1' } } },
    { id: 'notif-2', message: 'Oscar Operative marked task "Install Level 10 East Wing Drywall" as In Progress.', timestamp: dt(1), read: false, link: { projectId: 'proj-1', screen: 'task-detail', params: { taskId: 'task-1' } } },
    { id: 'notif-3', message: 'New photo added to Punch List item "Paint scuff on wall".', timestamp: dt(2), read: true, link: { projectId: 'proj-1', screen: 'punch-list-item-detail', params: { itemId: 'pl-1' } } },
];

const ACTIVITY_EVENTS: ActivityEvent[] = [
    { id: 'ae-1', type: 'status_change', author: 'Oscar Operative', description: 'updated task "Install Level 10 East Wing Drywall" to In Progress.', timestamp: dt(1), projectId: 'proj-1', projectName: 'Metropolis Grand Tower', link: { screen: 'task-detail', params: { taskId: 'task-1' } } },
    { id: 'ae-2', type: 'comment', author: 'Casey Admin', description: 'commented on RFI "Clarification on Beam B-102 Connection".', timestamp: dt(2, 5), projectId: 'proj-1', projectName: 'Metropolis Grand Tower', link: { screen: 'rfi-detail', params: { rfiId: 'rfi-1' } } },
    { id: 'ae-3', type: 'photo', author: 'Susan Supervisor', description: 'added a photo to "Paint scuff on wall".', timestamp: dt(2, 8), projectId: 'proj-1', projectName: 'Metropolis Grand Tower', link: { screen: 'punch-list-item-detail', params: { itemId: 'pl-1' } } },
    { id: 'ae-4', type: 'status_change', author: 'Susan Supervisor', description: 'updated task "Foundation Rebar Inspection" to In Progress.', timestamp: dt(3), projectId: 'proj-2', projectName: 'Oceanview Corporate Campus', link: { screen: 'task-detail', params: { taskId: 'task-5' } } },
];

const DAYWORK_LEDGER: DayworkSheet[] = [];

const AI_FEEDBACK: AIFeedback[] = [];

// --- EXPORTED ACCESSORS AND MUTATORS ---

// Getters for entire tables
export const getCompanies = () => [...COMPANIES];
export const getUsers = () => [...USERS];
export const getProjects = () => [...PROJECTS];
export const getTasks = () => [...TASKS];
export const getRFIs = () => [...RFIS];
export const getPunchListItems = () => [...PUNCH_LIST_ITEMS];
export const getDrawings = () => [...DRAWINGS];
export const getDocuments = () => [...DOCUMENTS];
export const getSiteInstructions = () => [...SITE_INSTRUCTIONS];
export const getDeliveryItems = () => [...DELIVERY_ITEMS];
export const getDayworkSheets = () => [...DAYWORK_SHEETS];
export const getDailyLogs = () => [...DAILY_LOGS];
export const getNotifications = () => [...NOTIFICATIONS];
export const getActivityEvents = () => [...ACTIVITY_EVENTS];

// Finders for single items
export const findProject = (id: string) => PROJECTS.find(p => p.id === id) || null;
export const findTask = (id: string) => TASKS.find(t => t.id === id) || null;
export const findRFI = (id: string) => RFIS.find(r => r.id === id) || null;
export const findPunchListItem = (id: string) => PUNCH_LIST_ITEMS.find(i => i.id === id) || null;
export const findDayworkSheet = (id: string) => DAYWORK_SHEETS.find(s => s.id === id) || null;
export const findDailyLogsForUserAndDate = (userId: string, date: string) => DAILY_LOGS.find(log => log.userId === userId && log.date === date);
export const findUserByEmail = (email: string) => USERS.find(u => u.email === email.toLowerCase()) || null;
export const findCompanyByName = (name: string) => COMPANIES.find(c => c.name.toLowerCase() === name.toLowerCase()) || null;
export const getAIFeedbackForUser = (userId: string) => AI_FEEDBACK.filter(f => f.userId === userId);


export const findTaskAndIndex = (id: string) => {
    const index = TASKS.findIndex(t => t.id === id);
    return { task: index > -1 ? TASKS[index] : null, index };
};

export const findPunchListItemAndIndex = (id: string) => {
    const index = PUNCH_LIST_ITEMS.findIndex(i => i.id === id);
    return { item: index > -1 ? PUNCH_LIST_ITEMS[index] : null, index };
};

// Mutators (add, update)
export const addCompany = (company: Company) => COMPANIES.push(company);
export const addUser = (user: User) => USERS.push(user);
export const addTask = (task: Task) => TASKS.push(task);
export const addRFI = (rfi: RFI) => RFIS.push(rfi);
export const addPunchListItem = (item: PunchListItem) => PUNCH_LIST_ITEMS.push(item);
export const addDrawing = (drawing: Drawing) => DRAWINGS.unshift(drawing);
export const addDayworkSheet = (sheet: DayworkSheet) => DAYWORK_SHEETS.push(sheet);
export const addDailyLog = (log: DailyLog) => DAILY_LOGS.push(log);
export const addNotification = (notification: Notification) => NOTIFICATIONS.unshift(notification);
export const addActivityEvent = (event: ActivityEvent) => ACTIVITY_EVENTS.unshift(event);
export const addAIFeedback = (feedback: AIFeedback) => AI_FEEDBACK.push(feedback);
export const addDayworkLedgerItem = (item: DayworkSheet) => DAYWORK_LEDGER.push(item);

export const updateTaskInDb = (index: number, task: Task) => TASKS[index] = task;
export const updatePunchListItemInDb = (index: number, item: PunchListItem) => PUNCH_LIST_ITEMS[index] = item;

export const addCommentToTaskInDb = (taskId: string, comment: Comment) => {
    const task = findTask(taskId);
    if (task) task.comments.push(comment);
    return task;
};
export const addCommentToRFIInDb = (rfiId: string, comment: Comment) => {
    const rfi = findRFI(rfiId);
    if (rfi) rfi.comments.push(comment);
    return rfi;
};
export const addCommentToPunchListItemInDb = (itemId: string, comment: Comment) => {
    const item = findPunchListItem(itemId);
    if (item) item.comments.push(comment);
    return item;
};