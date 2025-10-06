import { GoogleGenAI, Type } from '@google/genai';
// Fix: Added .ts extension to imports
import { 
    User, Project, Task, RFI, PunchListItem, Drawing, Document, SiteInstruction, DeliveryItem, DayworkSheet,
    Comment, Notification, ActivityEvent, Company, AISuggestion, AIInsight, AIFeedback, DailyLog, LogItem, Attachment
} from './types.ts';
import * as db from './db.ts';

// Simulate API latency
const LATENCY = 200;
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Fix: Initialized the Gemini API client.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const model = 'gemini-2.5-flash';

const checkPermissions = (user: User, allowedRoles: User['role'][]) => {
    if (!allowedRoles.includes(user.role) && user.role !== 'super_admin') {
        throw new Error('Permission denied.');
    }
};


// --- Auth ---
export const loginUser = async (email: string, password?: string): Promise<User | null> => {
    await delay(LATENCY * 2);
    // Password is not checked in this mock implementation
    const user = db.findUserByEmail(email);
    if (user) {
        return user;
    }
    return null;
}

export const registerUser = async (details: { name: string, email: string, companyName: string }): Promise<User | null> => {
    await delay(LATENCY * 3);
    if (db.findUserByEmail(details.email)) {
        throw new Error("User with this email already exists.");
    }
    
    let company = db.findCompanyByName(details.companyName);
    if (!company) {
        const newCompany: Company = {
            id: `comp-${Date.now()}`,
            name: details.companyName,
        };
        db.addCompany(newCompany);
        company = newCompany;
    }

    const newUser: User = {
        id: `user-${Date.now()}`,
        name: details.name,
        email: details.email,
        role: 'supervisor', // New users default to supervisor for demo purposes
        avatar: `https://i.pravatar.cc/150?u=${details.email}`,
        companyId: company.id,
    };
    db.addUser(newUser);

    return newUser;
};


// --- User & Company ---
export const fetchUsers = async (): Promise<User[]> => {
    await delay(LATENCY);
    return db.getUsers();
};

export const fetchUsersByCompany = async (companyId: string): Promise<User[]> => {
    await delay(LATENCY);
    return db.getUsers().filter(u => u.companyId === companyId);
};

export const fetchCompanies = async (currentUser: User): Promise<Company[]> => {
    await delay(LATENCY);
    if (currentUser.role === 'super_admin') {
        return db.getCompanies();
    }
    return db.getCompanies().filter(c => c.id === currentUser.companyId);
};

// --- Projects ---
export const fetchAllProjects = async (currentUser: User): Promise<Project[]> => {
    await delay(LATENCY);
    if (currentUser.role === 'super_admin') {
        return db.getProjects();
    }
    return db.getProjects().filter(p => p.companyId === currentUser.companyId);
};

export const fetchProjectById = async (id: string): Promise<Project | null> => {
    await delay(LATENCY);
    return db.findProject(id);
};

// --- Tasks ---
export const fetchTasksForProject = async (projectId: string, currentUser: User): Promise<Task[]> => {
    await delay(LATENCY);
    // In a real app, filtering might be more complex based on role
    return db.getTasks().filter(t => t.projectId === projectId);
};

export const fetchTasksForUser = async (user: User): Promise<Task[]> => {
    await delay(LATENCY);
    return db.getTasks().filter(t => t.assignee === user.name || t.targetRoles?.includes(user.role));
};

export const fetchTaskById = async (id: string): Promise<Task | null> => {
    await delay(LATENCY);
    return db.findTask(id);
};

export const createTask = async (taskData: Omit<Task, 'id' | 'comments'>, creator: User): Promise<Task> => {
    await delay(LATENCY);
    checkPermissions(creator, ['company_admin', 'supervisor']);
    const newTask: Task = {
        id: `task-${Date.now()}`,
        comments: [],
        ...taskData
    };
    db.addTask(newTask);

    // If task is assigned to a role, notify all users with that role in the company
    if (newTask.targetRoles && newTask.targetRoles.length > 0) {
        const project = db.findProject(newTask.projectId);
        if (project) {
            const usersToNotify = db.getUsers().filter(u => 
                u.companyId === project.companyId && 
                newTask.targetRoles?.includes(u.role)
            );

            usersToNotify.forEach(user => {
                 db.addNotification({
                    id: `notif-${Date.now()}-${user.id}`,
                    message: `New task for your role (${newTask.targetRoles?.join(', ')}): "${newTask.title}"`,
                    timestamp: new Date().toISOString(),
                    read: false,
                    link: { projectId: newTask.projectId, screen: 'task-detail', params: { taskId: newTask.id } }
                });
            });
        }
    }


    return newTask;
};

export const updateTask = async (updatedTask: Task, user: User): Promise<Task> => {
    await delay(LATENCY);
    checkPermissions(user, ['company_admin', 'supervisor']);
    const { task: originalTask, index } = db.findTaskAndIndex(updatedTask.id);
    
    if (index !== -1 && originalTask) {
        if (originalTask.status !== updatedTask.status) {
            const project = db.findProject(updatedTask.projectId);
            const activity: ActivityEvent = {
                id: `ae-${Date.now()}`,
                type: 'status_change',
                author: user.name,
                description: `updated task "${updatedTask.title}" to ${updatedTask.status}.`,
                timestamp: new Date().toISOString(),
                projectId: updatedTask.projectId,
                projectName: project?.name || 'Unknown Project',
                link: { screen: 'task-detail', params: { taskId: updatedTask.id } }
            };
            db.addActivityEvent(activity);
        }
        db.updateTaskInDb(index, updatedTask);
    }
    return updatedTask;
};

export const addCommentToTask = async (taskId: string, text: string, attachments: Attachment[], author: User): Promise<Comment> => {
    await delay(LATENCY);
    const newComment: Comment = {
        id: `c-${Date.now()}`,
        author: author.name,
        timestamp: new Date().toISOString(),
        text,
        attachments
    };
    const task = db.addCommentToTaskInDb(taskId, newComment);
    
    if (task) {
        const project = db.findProject(task.projectId);
        const activity: ActivityEvent = {
            id: `ae-${Date.now()}`,
            type: 'comment',
            author: author.name,
            description: `commented on task "${task.title}".`,
            timestamp: new Date().toISOString(),
            projectId: task.projectId,
            projectName: project?.name || 'Unknown Project',
            link: { screen: 'task-detail', params: { taskId: task.id } }
        };
        db.addActivityEvent(activity);
    }
    
    return newComment;
};

// --- RFIs ---
export const fetchRFIsForProject = async (projectId: string): Promise<RFI[]> => {
    await delay(LATENCY);
    return db.getRFIs().filter(r => r.projectId === projectId);
};

export const fetchRFIById = async (id: string): Promise<RFI | null> => {
    await delay(LATENCY);
    return db.findRFI(id);
};

export const createRFI = async (rfiData: Omit<RFI, 'id'|'comments'| 'answeredBy' | 'dueDateNotified' | 'response' | 'createdBy' | 'history' | 'responseAttachments'>, createdBy: User): Promise<RFI> => {
    await delay(LATENCY);
    checkPermissions(createdBy, ['company_admin', 'supervisor']);
    const newRFI: RFI = {
        id: `rfi-${Date.now()}`,
        comments: [],
        createdBy: createdBy.id,
        dueDateNotified: false,
        history: [{
            timestamp: new Date().toISOString(),
            author: createdBy.name,
            change: 'Created RFI.'
        }],
        ...rfiData
    };
    db.addRFI(newRFI);
    return newRFI;
};

export const addCommentToRFI = async (rfiId: string, text: string, author: User): Promise<Comment> => {
    await delay(LATENCY);
    const newComment: Comment = {
        id: `c-${Date.now()}`,
        author: author.name,
        timestamp: new Date().toISOString(),
        text
    };
    const rfi = db.addCommentToRFIInDb(rfiId, newComment);

    if (rfi) {
        const project = db.findProject(rfi.projectId);
        const activity: ActivityEvent = {
            id: `ae-${Date.now()}`,
            type: 'comment',
            author: author.name,
            description: `commented on RFI "${rfi.subject}".`,
            timestamp: new Date().toISOString(),
            projectId: rfi.projectId,
            projectName: project?.name || 'Unknown Project',
            link: { screen: 'rfi-detail', params: { rfiId: rfi.id } }
        };
        db.addActivityEvent(activity);
    }

    return newComment;
};

export const addAnswerToRFI = async (rfiId: string, answer: string, attachments: Attachment[], author: User): Promise<RFI | null> => {
    await delay(LATENCY);
    checkPermissions(author, ['company_admin', 'supervisor']);
    const rfi = db.findRFI(rfiId);
    if (rfi) {
        rfi.response = answer;
        rfi.answeredBy = author.name;
        rfi.status = 'Closed';
        rfi.responseAttachments = attachments;

        if (!rfi.history) {
            rfi.history = [];
        }
        rfi.history.push({
            timestamp: new Date().toISOString(),
            author: author.name,
            change: 'Answered RFI and changed status to Closed.'
        });


        // Notify the creator
        if (rfi.createdBy) {
            db.addNotification({
                id: `notif-${Date.now()}`,
                message: `Your RFI "${rfi.subject}" has been answered.`,
                timestamp: new Date().toISOString(),
                read: false,
                link: { projectId: rfi.projectId, screen: 'rfi-detail', params: { rfiId: rfi.id } }
            });
        }
        return rfi;
    }
    return null;
}

// --- Punch List ---
export const fetchPunchListItemsForProject = async (projectId: string): Promise<PunchListItem[]> => {
    await delay(LATENCY);
    return db.getPunchListItems().filter(i => i.projectId === projectId);
};

export const fetchPunchListItemById = async (id: string): Promise<PunchListItem | null> => {
    await delay(LATENCY);
    return db.findPunchListItem(id);
};

export const createPunchListItem = async (itemData: Omit<PunchListItem, 'id' | 'comments'>, creator: User): Promise<PunchListItem> => {
    await delay(LATENCY);
    checkPermissions(creator, ['company_admin', 'supervisor']);
    const newItem: PunchListItem = {
        id: `pl-${Date.now()}`,
        comments: [],
        ...itemData
    };
    db.addPunchListItem(newItem);
    return newItem;
};

export const updatePunchListItem = async (updatedItem: PunchListItem, user: User): Promise<PunchListItem> => {
    await delay(LATENCY);
    const { index, item: originalItem } = db.findPunchListItemAndIndex(updatedItem.id);
    if (index !== -1 && originalItem) {
        // Apply role-based logic for status changes
        if (originalItem.status !== updatedItem.status) {
            // If the status is being changed to 'Closed', only admins/supervisors can do it.
            if (updatedItem.status === 'Closed') {
                checkPermissions(user, ['company_admin', 'supervisor']);
            }
        }
        db.updatePunchListItemInDb(index, updatedItem);
    }
    return updatedItem;
};

export const addCommentToPunchListItem = async (itemId: string, text: string, author: User): Promise<Comment> => {
    await delay(LATENCY);
    const newComment: Comment = {
        id: `c-${Date.now()}`,
        author: author.name,
        timestamp: new Date().toISOString(),
        text
    };
    const item = db.addCommentToPunchListItemInDb(itemId, newComment);
    if (item) {
        const project = db.findProject(item.projectId);
        const activity: ActivityEvent = {
            id: `ae-${Date.now()}`,
            type: 'comment',
            author: author.name,
            description: `commented on punch list item "${item.title}".`,
            timestamp: new Date().toISOString(),
            projectId: item.projectId,
            projectName: project?.name || 'Unknown Project',
            link: { screen: 'punch-list-item-detail', params: { itemId: item.id } }
        };
        db.addActivityEvent(activity);
    }
    return newComment;
};


// --- Drawings, Documents, etc. ---
export const fetchDrawings = async (): Promise<Drawing[]> => {
    await delay(LATENCY);
    return db.getDrawings();
};

export const createDrawing = async (projectId: string, drawingData: { number: string; title: string; revision: number; date: string; file: File }, creator: User): Promise<Drawing> => {
    await delay(LATENCY);
    checkPermissions(creator, ['company_admin', 'supervisor']);
    const newDrawing: Drawing = {
        id: `dwg-${Date.now()}`,
        projectId,
        number: drawingData.number,
        title: drawingData.title,
        revision: drawingData.revision,
        date: drawingData.date,
        // In a real app, this would be a URL from a file storage service
        url: '/sample.pdf' 
    };
    db.addDrawing(newDrawing);
    return newDrawing;
};

export const fetchDocuments = async (): Promise<Document[]> => {
    await delay(LATENCY);
    return db.getDocuments();
};

export const fetchSiteInstructions = async (): Promise<SiteInstruction[]> => {
    await delay(LATENCY);
    return db.getSiteInstructions();
};

export const fetchDeliveryItems = async (): Promise<DeliveryItem[]> => {
    await delay(LATENCY);
    return db.getDeliveryItems();
};


// --- Daywork Sheets (T&M) ---
export const fetchDayworkSheetsForProject = async (projectId: string): Promise<DayworkSheet[]> => {
    await delay(LATENCY);
    return db.getDayworkSheets().filter(s => s.projectId === projectId);
};

export const fetchDayworkSheetById = async (id: string): Promise<DayworkSheet | null> => {
    await delay(LATENCY);
    return db.findDayworkSheet(id);
}

export const createDayworkSheet = async (sheetData: Omit<DayworkSheet, 'id' | 'status' | 'ticketNumber'| 'items' | 'approvedBy' | 'approvedDate'>, creator: User): Promise<DayworkSheet> => {
    await delay(LATENCY);
    checkPermissions(creator, ['company_admin', 'supervisor']);
    const projectSheets = db.getDayworkSheets().filter(s => s.projectId === sheetData.projectId);
    const newTicketNumber = `T&M-${String(projectSheets.length + 1).padStart(3, '0')}`;

    const newSheet: DayworkSheet = {
        id: `dws-${Date.now()}`,
        ticketNumber: newTicketNumber,
        status: 'Pending',
        ...sheetData,
        items: [],
        approvedBy: null,
        approvedDate: null,
    };
    db.addDayworkSheet(newSheet);
    return newSheet;
};

export const updateDayworkSheetStatus = async (sheetId: string, status: 'Approved' | 'Rejected', user: User): Promise<DayworkSheet | null> => {
    await delay(LATENCY);
    checkPermissions(user, ['company_admin', 'supervisor']);
    const sheet = db.findDayworkSheet(sheetId);
    if (sheet) {
        sheet.status = status;
        if (status === 'Approved') {
            sheet.approvedBy = user.name;
            sheet.approvedDate = new Date().toISOString();
            db.addDayworkLedgerItem({ ...sheet });
        }
        return sheet;
    }
    return null;
}

// --- Daily Logs ---
export const fetchDailyLogForUser = async (userId: string, date: string): Promise<DailyLog | null> => {
    await delay(LATENCY);
    return db.findDailyLogsForUserAndDate(userId, date) || null;
};

export const createDailyLog = async (logData: Omit<DailyLog, 'id' | 'submittedAt'>, user: User): Promise<DailyLog> => {
    await delay(LATENCY);
    const newLog: DailyLog = {
        id: `log-${Date.now()}`,
        submittedAt: new Date().toISOString(),
        ...logData
    };
    db.addDailyLog(newLog);
    
    const project = db.findProject(logData.projectId);
    const activity: ActivityEvent = {
        id: `ae-${Date.now()}`,
        type: 'log_submitted',
        author: user.name,
        description: `submitted a daily log for ${new Date(logData.date).toLocaleDateString()}.`,
        timestamp: newLog.submittedAt,
        projectId: logData.projectId,
        projectName: project?.name || 'Unknown Project',
        link: { screen: 'daily-log', params: { logId: newLog.id } } // Assuming a detail screen might exist
    };
    db.addActivityEvent(activity);

    return newLog;
};


// --- Notifications & Activity ---
export const fetchNotificationsForUser = async (user: User): Promise<Notification[]> => {
    await delay(LATENCY);
    // This is a simplified mock; a real app would have user-specific notifications
    return db.getNotifications();
};

export const markNotificationsAsRead = async (ids: string[], user: User): Promise<void> => {
    await delay(LATENCY);
    db.getNotifications().forEach(n => {
        if (ids.includes(n.id)) {
            n.read = true;
        }
    });
};

export const fetchRecentActivity = async (user: User): Promise<ActivityEvent[]> => {
    await delay(LATENCY);
    // Mock: just return all activity
    return db.getActivityEvents();
};

export const checkAndCreateDueDateNotifications = async (user: User) => {
    // This is a mock helper to simulate checking for upcoming due dates on a backend.
    const openRFIs = db.getRFIs().filter(rfi => rfi.status === 'Open' && !rfi.dueDateNotified);
    
    openRFIs.forEach(rfi => {
        const dueDate = new Date(rfi.dueDate);
        const today = new Date();
        dueDate.setHours(0,0,0,0);
        today.setHours(0,0,0,0);

        const timeDiff = dueDate.getTime() - today.getTime();
        const daysDiff = timeDiff / (1000 * 3600 * 24);
        
        // Notify if due within the next 2 days (i.e., daysDiff is 0, 1, or 2)
        if (daysDiff >= 0 && daysDiff <= 2) {
            db.addNotification({
                id: `notif-${Date.now()}-${rfi.id}`,
                message: `Response for RFI "${rfi.subject}" is due soon.`,
                timestamp: new Date().toISOString(),
                read: false,
                link: { projectId: rfi.projectId, screen: 'rfi-detail', params: { rfiId: rfi.id } }
            });
            rfi.dueDateNotified = true; // Mark it so we don't create it again
        }
    });
};


// --- AI / Gemini ---
export const getAISuggestedAction = async (user: User): Promise<AISuggestion | null> => {
    const userTasks = await fetchTasksForUser(user);
    const openTasks = userTasks.filter(t => t.status !== 'Done');
    const overdueTasks = openTasks.filter(t => new Date(t.dueDate) < new Date());

    if (overdueTasks.length === 0) return null;

    const mostUrgentTask = overdueTasks.sort((a,b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0];
    
    const userFeedbackHistory = db.getAIFeedbackForUser(user.id);
    const dislikedPrioritizationSuggestions = userFeedbackHistory.filter(
        f => f.feedback === 'down' && 
             (f.suggestionTitle.includes('Overdue Task') || f.suggestionTitle.includes('urgent action'))
    ).length;
    
    const userDislikesPrioritization = dislikedPrioritizationSuggestions > 1;

    try {
        let prompt = '';
        if (userDislikesPrioritization) {
            prompt = `A user has an overdue task but seems to dislike direct reminders about prioritization. Instead of just telling them to do the task, suggest an action that helps them clarify or get started. For example, suggest they add a comment asking for clarification or add a photo of the current state.
User: ${JSON.stringify(user)}
Most Urgent Overdue Task: ${JSON.stringify(mostUrgentTask)}

Respond in this JSON format:
{
  "title": "Clarify an Overdue Task",
  "reason": "A brief, friendly explanation of why this clarification could help get the task moving.",
  "action": {
    "label": "View & Add Details",
    "link": {
      "projectId": "${mostUrgentTask.projectId}",
      "screen": "task-detail",
      "params": { "taskId": "${mostUrgentTask.id}" }
    }
  }
}`;
        } else {
            prompt = `A user has an overdue task. Create a suggestion to help them address it.
User: ${JSON.stringify(user)}
Most Urgent Overdue Task: ${JSON.stringify(mostUrgentTask)}

Respond in this JSON format:
{
  "title": "Your most urgent action",
  "reason": "A brief, friendly explanation of why this is important.",
  "action": {
    "label": "View Task",
    "link": {
      "projectId": "${mostUrgentTask.projectId}",
      "screen": "task-detail",
      "params": { "taskId": "${mostUrgentTask.id}" }
    }
  }
}`;
        }
        
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: { responseMimeType: 'application/json' }
        });

        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as AISuggestion;

    } catch (error) {
        console.error("AI suggestion failed:", error);
        
        if (userDislikesPrioritization) {
            return {
                title: 'Clarify Overdue Task',
                reason: `Task "${mostUrgentTask.title}" is overdue. Adding a comment or photo might help clarify next steps.`,
                action: {
                    label: 'View & Add Details',
                    link: { 
                        projectId: mostUrgentTask.projectId,
                        screen: 'task-detail', 
                        params: { taskId: mostUrgentTask.id } 
                    }
                }
            };
        } else {
            return { // Original Fallback suggestion
                title: 'Address Overdue Task',
                reason: `Task "${mostUrgentTask.title}" is overdue. Please review it.`,
                action: {
                    label: 'View Task',
                    link: { 
                        projectId: mostUrgentTask.projectId,
                        screen: 'task-detail', 
                        params: { taskId: mostUrgentTask.id } 
                    }
                }
            };
        }
    }
};

export const getAIInsightsForMyDay = async (tasks: Task[], project: Project, weather: any): Promise<AIInsight[]> => {
     try {
        if(tasks.length === 0) return [];
        const prompt = `Analyze the user's tasks for the day and provide helpful insights. Consider the project context and weather.
        Project: ${project.name} - ${project.description}
        Weather: ${JSON.stringify(weather)}
        Tasks: ${JSON.stringify(tasks)}

        Generate 2-3 insights in this JSON format:
        [
            {
                "type": "risk" | "alert" | "tip",
                "title": "Short, catchy title for the insight",
                "message": "A helpful message for the user. Be specific and actionable."
            }
        ]
        
        If there are no tasks, return an empty array.
        Focus on safety, efficiency, and potential blockers. For example, if it's raining and there's outdoor electrical work, that's a risk. If two tasks are in the same location, suggest doing them together.`;
        
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: { responseMimeType: 'application/json' }
        });

        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as AIInsight[];

    } catch (error) {
        console.error("AI insights failed:", error);
        return [];
    }
};

export const submitAIFeedback = async (suggestion: AISuggestion, feedback: 'up' | 'down', user: User): Promise<void> => {
    await delay(LATENCY);
    const feedbackEntry: AIFeedback = {
        id: `feedback-${Date.now()}`,
        suggestionTitle: suggestion.title,
        suggestionReason: suggestion.reason,
        feedback,
        timestamp: new Date().toISOString(),
        userId: user.id,
    };
    db.addAIFeedback(feedbackEntry);
    console.log('AI Feedback submitted:', feedbackEntry);
};

export const getAITaskSuggestions = async (taskDescription: string, allUsers: User[]): Promise<{
    suggestedAssigneeIds: string[];
    suggestedDueDate: string;
    photosRecommended: boolean;
} | null> => {
    try {
        if (!taskDescription.trim()) return null;

        const userProfiles = allUsers.map(u => ({ id: u.id, name: u.name, role: u.role }));
        const currentDate = new Date().toISOString().split('T')[0];

        const prompt = `Based on the task description for a construction project, provide suggestions for assigning and scheduling. The current date is ${currentDate}.

Task Description: "${taskDescription}"

Users available for assignment: ${JSON.stringify(userProfiles)}

Analyze the task description and provide the following:
1.  'suggestedAssigneeIds': An array of the top 2 most suitable user IDs from the provided list, ordered by relevance. Common tasks like 'install drywall' or 'plumbing' should be assigned to 'operative' roles. Coordination tasks like 'schedule' or 'inspect' should be for 'supervisor' roles. If no one is suitable, return an empty array.
2.  'suggestedDueDate': An estimated due date in "YYYY-MM-DD" format. Estimate a reasonable timeframe based on the task. Simple tasks might be 1-3 days, complex ones longer. The date must be in the future.
3.  'photosRecommended': A boolean. Return true if the task involves physical work that should be documented with a photo (e.g., 'install', 'fix', 'pour concrete', 'inspection'). Return false for purely administrative tasks (e.g., 'schedule meeting', 'order materials').

Return a single JSON object with the specified keys.
`;

        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        suggestedAssigneeIds: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.STRING,
                                description: "User ID of a suggested assignee"
                            }
                        },
                        suggestedDueDate: {
                            type: Type.STRING,
                            description: "The estimated due date in YYYY-MM-DD format."
                        },
                        photosRecommended: {
                            type: Type.BOOLEAN,
                            description: "True if photos are recommended for this task."
                        }
                    },
                    required: ['suggestedAssigneeIds', 'suggestedDueDate', 'photosRecommended']
                }
            }
        });

        const jsonText = response.text.trim();
        const result = JSON.parse(jsonText);
        return result;

    } catch (error) {
        console.error("AI task suggestion failed:", error);
        return null;
    }
};