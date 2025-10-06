import React from 'react';
import { Screen, UserRole } from './types.ts';
import {
    BanknotesIcon,
    CalculatorIcon,
    ScaleIcon,
    ShieldCheckIcon,
    BriefcaseIcon,
    DocumentMagnifyingGlassIcon,
    IdentificationIcon,
    DocumentDuplicateIcon,
    CameraIcon,
    DocumentIcon,
    ClockIcon,
    PresentationChartLineIcon,
    CircleStackIcon,
    CurrencyPoundIcon,
    UsersIcon
} from './components/Icons.tsx';

export interface ToolDefinition {
    title: string;
    description: string;
    icon: React.FC<{ className?: string }>;
    screen: Screen;
    roles: UserRole[];
    requiresProjectContext?: boolean;
}

export const ACCOUNTING_TOOLS: ToolDefinition[] = [
    { title: 'Invoicing', description: 'Create and manage client invoices.', icon: BanknotesIcon, screen: 'placeholder-tool', roles: ['company_admin'] },
    { title: 'Chart of Accounts', description: 'Manage your company\'s financial accounts.', icon: ScaleIcon, screen: 'placeholder-tool', roles: ['company_admin'] },
    { title: 'Tax Preparation', description: 'AI-assisted tax document preparation.', icon: CalculatorIcon, screen: 'placeholder-tool', roles: ['company_admin'] },
];

export const AI_TOOLS: ToolDefinition[] = [
    { title: 'Risk Assessment AI', description: 'Analyze project data to identify potential risks.', icon: ShieldCheckIcon, screen: 'placeholder-tool', roles: ['company_admin', 'supervisor'] },
    { title: 'Procurement AI Agent', description: 'Automated material and subcontractor sourcing.', icon: BriefcaseIcon, screen: 'placeholder-tool', roles: ['company_admin', 'supervisor'] },
    { title: 'Compliance Bot', description: 'Monitor documents for regulatory compliance.', icon: DocumentMagnifyingGlassIcon, screen: 'placeholder-tool', roles: ['company_admin', 'supervisor'] },
    { title: 'HR AI Agent', description: 'Manage training, qualifications, and certifications.', icon: IdentificationIcon, screen: 'placeholder-tool', roles: ['company_admin'] },
];

export const DOCUMENT_MANAGEMENT_TOOLS: ToolDefinition[] = [
    { title: 'Drawing Sets', description: 'View and manage all project drawings.', icon: DocumentDuplicateIcon, screen: 'drawings', roles: ['company_admin', 'supervisor', 'operative'], requiresProjectContext: true },
    { title: 'Photo Galleries', description: 'Browse and upload site photos.', icon: CameraIcon, screen: 'photos', roles: ['company_admin', 'supervisor', 'operative'], requiresProjectContext: true },
    { title: 'Official Documents', description: 'Store contracts, permits, and reports.', icon: DocumentIcon, screen: 'documents', roles: ['company_admin', 'supervisor'], requiresProjectContext: true },
];

export const TIME_TRACKING_TOOLS: ToolDefinition[] = [
    { title: 'Live Time Entry', description: 'Clock in and out for tasks.', icon: ClockIcon, screen: 'placeholder-tool', roles: ['company_admin', 'supervisor', 'operative'] },
    { title: 'Timesheet Reports', description: 'Generate and review timesheets.', icon: PresentationChartLineIcon, screen: 'placeholder-tool', roles: ['company_admin', 'supervisor'] },
];

export const PROJECT_OPERATIONS_TOOLS: ToolDefinition[] = [
    { title: 'Risk Assessments (RAMS)', description: 'Create and manage Risk Assessment Method Statements.', icon: ShieldCheckIcon, screen: 'placeholder-tool', roles: ['company_admin', 'supervisor'] },
    { title: 'Training Matrix', description: 'Track employee qualifications and training.', icon: IdentificationIcon, screen: 'placeholder-tool', roles: ['company_admin'] },
];

export const FINANCIAL_MANAGEMENT_TOOLS: ToolDefinition[] = [
    { title: 'Company Payroll', description: 'Process payroll for all employees.', icon: CurrencyPoundIcon, screen: 'placeholder-tool', roles: ['company_admin'] },
    { title: 'Project Budgets', description: 'Track budgets and spending per project.', icon: CircleStackIcon, screen: 'placeholder-tool', roles: ['company_admin', 'supervisor'] },
];

export const BUSINESS_DEVELOPMENT_TOOLS: ToolDefinition[] = [
    { title: 'CRM', description: 'Manage client relationships and leads.', icon: UsersIcon, screen: 'placeholder-tool', roles: ['company_admin'] },
    { title: 'Procurement Hub', description: 'Manage suppliers and procurement processes.', icon: BriefcaseIcon, screen: 'placeholder-tool', roles: ['company_admin', 'supervisor'] },
];