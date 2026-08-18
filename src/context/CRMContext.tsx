import React, { createContext, useContext, useState, useEffect } from "react";
import {
  Lead,
  Company,
  Contact,
  Opportunity,
  Task,
  Activity,
  PipelineStage,
  LeadScoreRule,
  DynamicSegment,
  PipelineStageId,
  LeadStatus,
} from "../types/crm";
import {
  EmailTemplate,
  Sequence,
  Campaign,
  DeliverabilityConfig,
  SuppressionEntry,
} from "../types/email";
import { AutomationRule, CompanySettings, IntegrationConfig } from "../types/automations";
import { AuditLog, Notification, User } from "../types/auth";
import {
  MOCK_COMPANIES,
  MOCK_CONTACTS,
  MOCK_LEADS,
  MOCK_OPPORTUNITIES,
  MOCK_TASKS,
  MOCK_ACTIVITIES,
  MOCK_EMAIL_TEMPLATES,
  MOCK_SEQUENCES,
  MOCK_CAMPAIGNS,
  MOCK_SUPPRESSION_LIST,
  MOCK_AUTOMATIONS,
  MOCK_SEGMENTS,
  MOCK_AUDIT_LOGS,
  MOCK_NOTIFICATIONS,
} from "../data/mockData";
import {
  INITIAL_PIPELINE_STAGES,
  INITIAL_LEAD_SCORE_RULES,
  INITIAL_COMPANY_SETTINGS,
  INITIAL_DELIVERABILITY_CONFIG,
  INITIAL_INTEGRATIONS,
} from "../data/initialConfig";
import { useAuth } from "./AuthContext";

interface CRMContextType {
  leads: Lead[];
  companies: Company[];
  contacts: Contact[];
  opportunities: Opportunity[];
  tasks: Task[];
  activities: Activity[];
  pipelineStages: PipelineStage[];
  leadScoreRules: LeadScoreRule[];
  companySettings: CompanySettings;
  systemConfig: CompanySettings;
  users: User[];
  deliverabilityConfig: DeliverabilityConfig;
  integrations: IntegrationConfig[];
  campaigns: Campaign[];
  sequences: Sequence[];
  templates: EmailTemplate[];
  suppressionList: SuppressionEntry[];
  automations: AutomationRule[];
  segments: DynamicSegment[];
  auditLogs: AuditLog[];
  notifications: Notification[];

  // State Setters (for Supabase and bulk sync)
  setLeads?: React.Dispatch<React.SetStateAction<Lead[]>>;
  setCompanies?: React.Dispatch<React.SetStateAction<Company[]>>;
  setContacts?: React.Dispatch<React.SetStateAction<Contact[]>>;
  setOpportunities?: React.Dispatch<React.SetStateAction<Opportunity[]>>;
  setTasks?: React.Dispatch<React.SetStateAction<Task[]>>;

  // Lead actions
  addLead: (lead: Omit<Lead, "id" | "createdAt" | "score" | "scoreLevel">) => void;
  updateLead: (id: string, updates: Partial<Lead>) => void;
  deleteLead: (id: string) => void;
  importLeads: (leads: Omit<Lead, "id" | "createdAt" | "score" | "scoreLevel">[]) => void;
  convertLeadToOpportunity: (leadId: string, opportunityData?: Partial<Opportunity>) => void;

  // Company actions
  addCompany: (company: Omit<Company, "id" | "createdAt" | "contactsCount" | "opportunitiesCount">) => void;
  updateCompany: (id: string, updates: Partial<Company>) => void;
  deleteCompany: (id: string) => void;

  // Contact actions
  addContact: (contact: Omit<Contact, "id" | "createdAt">) => void;
  updateContact: (id: string, updates: Partial<Contact>) => void;
  deleteContact: (id: string) => void;

  // Opportunity actions
  addOpportunity: (opp: Omit<Opportunity, "id" | "createdAt" | "weightedValue">) => void;
  updateOpportunity: (id: string, updates: Partial<Opportunity>) => void;
  updateOpportunityStage: (id: string, newStage: PipelineStageId, wonNotes?: string, lostReason?: string) => void;
  deleteOpportunity: (id: string) => void;

  // Task actions
  addTask: (task: Omit<Task, "id" | "createdAt">) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  toggleTaskStatus: (id: string) => void;
  deleteTask: (id: string) => void;

  // Activity actions
  addActivity: (activity: Omit<Activity, "id" | "timestamp">) => void;

  // Campaign & Email actions
  addCampaign: (campaign: Omit<Campaign, "id" | "createdAt" | "sentCount" | "deliveredCount" | "openedCount" | "clickedCount" | "repliedCount" | "bouncedCount" | "unsubscribedCount">) => void;
  updateCampaignStatus: (id: string, status: Campaign["status"]) => void;
  simulateCampaignExecution: (id: string) => void;
  addTemplate: (template: Omit<EmailTemplate, "id" | "createdAt" | "usageCount">) => void;
  updateTemplate: (id: string, updates: Partial<EmailTemplate>) => void;
  addSequence: (seq: Omit<Sequence, "id" | "createdAt" | "enrolledLeadsCount" | "completedLeadsCount" | "repliedCount" | "meetingsBookedCount">) => void;
  toggleSequenceStatus: (id: string) => void;
  addToSuppressionList: (entry: Omit<SuppressionEntry, "id" | "addedAt">) => void;
  removeFromSuppressionList: (id: string) => void;
  updateDeliverabilityConfig: (updates: Partial<DeliverabilityConfig>) => void;

  // Automation & Segment actions
  addAutomation: (rule: AutomationRule) => void;
  updateAutomation: (id: string, updates: Partial<AutomationRule>) => void;
  deleteAutomation: (id: string) => void;
  addAutomationRule: (rule: Omit<AutomationRule, "id" | "createdAt" | "timesExecuted">) => void;
  toggleAutomationRule: (id: string) => void;
  addSegment: (segment: Omit<DynamicSegment, "id" | "createdAt" | "leadsCount">) => void;
  updateSegment: (id: string, updates: Partial<DynamicSegment>) => void;
  deleteSegment: (id: string) => void;

  // Settings & Integrations
  updateCompanySettings: (settings: Partial<CompanySettings>) => void;
  updateSystemConfig: (settings: Partial<CompanySettings>) => void;
  updateIntegration: (id: string, updates: Partial<IntegrationConfig>) => void;
  updateLeadScoreRules: (rules: LeadScoreRule[]) => void;

  // Notification actions
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;

  // Global reset
  resetToDemoData: () => void;
}

const CRMContext = createContext<CRMContextType | undefined>(undefined);

export const CRMProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, users = [] } = useAuth();

  const [leads, setLeads] = useState<Lead[]>(() => {
    const s = localStorage.getItem("yorvar_crm_leads");
    return s ? JSON.parse(s) : MOCK_LEADS;
  });

  const [companies, setCompanies] = useState<Company[]>(() => {
    const s = localStorage.getItem("yorvar_crm_companies");
    return s ? JSON.parse(s) : MOCK_COMPANIES;
  });

  const [contacts, setContacts] = useState<Contact[]>(() => {
    const s = localStorage.getItem("yorvar_crm_contacts");
    return s ? JSON.parse(s) : MOCK_CONTACTS;
  });

  const [opportunities, setOpportunities] = useState<Opportunity[]>(() => {
    const s = localStorage.getItem("yorvar_crm_opportunities");
    return s ? JSON.parse(s) : MOCK_OPPORTUNITIES;
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    const s = localStorage.getItem("yorvar_crm_tasks");
    return s ? JSON.parse(s) : MOCK_TASKS;
  });

  const [activities, setActivities] = useState<Activity[]>(() => {
    const s = localStorage.getItem("yorvar_crm_activities");
    return s ? JSON.parse(s) : MOCK_ACTIVITIES;
  });

  const [pipelineStages, setPipelineStages] = useState<PipelineStage[]>(() => {
    const s = localStorage.getItem("yorvar_crm_stages");
    return s ? JSON.parse(s) : INITIAL_PIPELINE_STAGES;
  });

  const [leadScoreRules, setLeadScoreRules] = useState<LeadScoreRule[]>(() => {
    const s = localStorage.getItem("yorvar_crm_scoring_rules");
    return s ? JSON.parse(s) : INITIAL_LEAD_SCORE_RULES;
  });

  const [companySettings, setCompanySettings] = useState<CompanySettings>(() => {
    const s = localStorage.getItem("yorvar_crm_company_settings");
    return s ? JSON.parse(s) : INITIAL_COMPANY_SETTINGS;
  });

  const [deliverabilityConfig, setDeliverabilityConfig] = useState<DeliverabilityConfig>(() => {
    const s = localStorage.getItem("yorvar_crm_deliverability");
    return s ? JSON.parse(s) : INITIAL_DELIVERABILITY_CONFIG;
  });

  const [integrations, setIntegrations] = useState<IntegrationConfig[]>(() => {
    const s = localStorage.getItem("yorvar_crm_integrations");
    return s ? JSON.parse(s) : INITIAL_INTEGRATIONS;
  });

  const [campaigns, setCampaigns] = useState<Campaign[]>(() => {
    const s = localStorage.getItem("yorvar_crm_campaigns");
    return s ? JSON.parse(s) : MOCK_CAMPAIGNS;
  });

  const [sequences, setSequences] = useState<Sequence[]>(() => {
    const s = localStorage.getItem("yorvar_crm_sequences");
    return s ? JSON.parse(s) : MOCK_SEQUENCES;
  });

  const [templates, setTemplates] = useState<EmailTemplate[]>(() => {
    const s = localStorage.getItem("yorvar_crm_templates");
    return s ? JSON.parse(s) : MOCK_EMAIL_TEMPLATES;
  });

  const [suppressionList, setSuppressionList] = useState<SuppressionEntry[]>(() => {
    const s = localStorage.getItem("yorvar_crm_suppression");
    return s ? JSON.parse(s) : MOCK_SUPPRESSION_LIST;
  });

  const [automations, setAutomations] = useState<AutomationRule[]>(() => {
    const s = localStorage.getItem("yorvar_crm_automations");
    return s ? JSON.parse(s) : MOCK_AUTOMATIONS;
  });

  const [segments, setSegments] = useState<DynamicSegment[]>(() => {
    const s = localStorage.getItem("yorvar_crm_segments");
    return s ? JSON.parse(s) : MOCK_SEGMENTS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const s = localStorage.getItem("yorvar_crm_audit_logs");
    return s ? JSON.parse(s) : MOCK_AUDIT_LOGS;
  });

  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const s = localStorage.getItem("yorvar_crm_notifications");
    return s ? JSON.parse(s) : MOCK_NOTIFICATIONS;
  });

  // Sync to LocalStorage
  useEffect(() => { localStorage.setItem("yorvar_crm_leads", JSON.stringify(leads)); }, [leads]);
  useEffect(() => { localStorage.setItem("yorvar_crm_companies", JSON.stringify(companies)); }, [companies]);
  useEffect(() => { localStorage.setItem("yorvar_crm_contacts", JSON.stringify(contacts)); }, [contacts]);
  useEffect(() => { localStorage.setItem("yorvar_crm_opportunities", JSON.stringify(opportunities)); }, [opportunities]);
  useEffect(() => { localStorage.setItem("yorvar_crm_tasks", JSON.stringify(tasks)); }, [tasks]);
  useEffect(() => { localStorage.setItem("yorvar_crm_activities", JSON.stringify(activities)); }, [activities]);
  useEffect(() => { localStorage.setItem("yorvar_crm_stages", JSON.stringify(pipelineStages)); }, [pipelineStages]);
  useEffect(() => { localStorage.setItem("yorvar_crm_campaigns", JSON.stringify(campaigns)); }, [campaigns]);
  useEffect(() => { localStorage.setItem("yorvar_crm_sequences", JSON.stringify(sequences)); }, [sequences]);
  useEffect(() => { localStorage.setItem("yorvar_crm_templates", JSON.stringify(templates)); }, [templates]);
  useEffect(() => { localStorage.setItem("yorvar_crm_suppression", JSON.stringify(suppressionList)); }, [suppressionList]);
  useEffect(() => { localStorage.setItem("yorvar_crm_automations", JSON.stringify(automations)); }, [automations]);
  useEffect(() => { localStorage.setItem("yorvar_crm_segments", JSON.stringify(segments)); }, [segments]);
  useEffect(() => { localStorage.setItem("yorvar_crm_audit_logs", JSON.stringify(auditLogs)); }, [auditLogs]);
  useEffect(() => { localStorage.setItem("yorvar_crm_notifications", JSON.stringify(notifications)); }, [notifications]);
  useEffect(() => { localStorage.setItem("yorvar_crm_deliverability", JSON.stringify(deliverabilityConfig)); }, [deliverabilityConfig]);
  useEffect(() => { localStorage.setItem("yorvar_crm_integrations", JSON.stringify(integrations)); }, [integrations]);

  // Helper for audit logging
  const logAudit = (action: string, entityType: AuditLog["entityType"], entityId: string, entityName: string, oldValue?: string, newValue?: string) => {
    const log: AuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      userId: currentUser.id,
      userName: `${currentUser.name} ${currentUser.lastName}`,
      userRole: currentUser.role,
      action,
      entityType,
      entityId,
      entityName,
      oldValue,
      newValue,
      timestamp: new Date().toISOString(),
      ipAddress: "186.84.90.12",
    };
    setAuditLogs((prev) => [log, ...prev]);
  };

  // Calculate score level
  const calculateScoreLevel = (score: number) => {
    if (score >= 121) return "muy_caliente";
    if (score >= 71) return "caliente";
    if (score >= 31) return "tibio";
    return "frio";
  };

  // Lead CRUD
  const addLead = (leadData: Omit<Lead, "id" | "createdAt" | "score" | "scoreLevel">) => {
    const baseScore = 20;
    const leadId = `lead-${Date.now()}`;
    const cleanCompany = (leadData.company || "Empresa Sin Nombre").trim();
    
    // 1. Auto-create or link Company in CRM
    let companyId = leadData.companyId;
    if (cleanCompany) {
      const existingComp = companies.find((c) => c.name.toLowerCase() === cleanCompany.toLowerCase());
      if (existingComp) {
        companyId = existingComp.id;
        setCompanies((prev) =>
          prev.map((c) =>
            c.id === existingComp.id
              ? {
                  ...c,
                  contactsCount: (c.contactsCount || 0) + 1,
                  potentialValue: (c.potentialValue || 0) + (leadData.estimatedValue || 0),
                  opportunitiesCount: (leadData.estimatedValue && leadData.estimatedValue > 0) ? (c.opportunitiesCount || 0) + 1 : c.opportunitiesCount,
                }
              : c
          )
        );
      } else {
        companyId = `comp-${Date.now()}`;
        const newCompany: Company = {
          id: companyId,
          name: cleanCompany,
          taxId: "NIT-Pendiente",
          industry: leadData.industry || "General",
          size: leadData.companySize || "11-50",
          website: leadData.website || "",
          city: leadData.city || "Bogotá",
          country: leadData.country || "Colombia",
          address: "Sede Principal",
          phone: leadData.phone || "",
          assignedToUserId: leadData.assignedToUserId,
          assignedToName: leadData.assignedToName,
          status: "prospecto",
          potentialValue: leadData.estimatedValue || 20000000,
          currency: leadData.currency || companySettings.currency,
          contactsCount: 1,
          opportunitiesCount: (leadData.estimatedValue && leadData.estimatedValue > 0) ? 1 : 0,
          createdAt: new Date().toISOString(),
        };
        setCompanies((prev) => [newCompany, ...prev]);
      }
    }

    // 2. Auto-create or link Contact in CRM
    const contactEmail = leadData.email?.trim().toLowerCase();
    const contactFullName = `${leadData.name} ${leadData.lastName}`.trim().toLowerCase();
    const existingContact = contacts.find(
      (c) =>
        (contactEmail && c.email.toLowerCase() === contactEmail) ||
        (`${c.name} ${c.lastName}`.toLowerCase() === contactFullName && c.companyName.toLowerCase() === cleanCompany.toLowerCase())
    );

    let contactId = existingContact?.id;
    if (!existingContact) {
      contactId = `cnt-${Date.now()}`;
      const newContact: Contact = {
        id: contactId,
        name: leadData.name,
        lastName: leadData.lastName,
        email: leadData.email,
        phone: leadData.phone,
        whatsapp: leadData.whatsapp || leadData.phone,
        companyId: companyId || "",
        companyName: cleanCompany,
        jobTitle: leadData.jobTitle || "Contacto Comercial",
        decisionRole: "Decisor Principal",
        linkedin: leadData.linkedin,
        assignedToUserId: leadData.assignedToUserId,
        assignedToName: leadData.assignedToName,
        createdAt: new Date().toISOString(),
        isPrimary: true,
      };
      setContacts((prev) => [newContact, ...prev]);
    }

    // 3. Auto-create in Sales Pipeline (Opportunity) if value/deal is specified
    if (leadData.estimatedValue && leadData.estimatedValue > 0) {
      const oppValue = leadData.estimatedValue;
      const oppProb = leadData.pipelineStage === "negociacion" ? 70 : leadData.pipelineStage === "propuesta_enviada" ? 50 : 25;
      const newOpp: Opportunity = {
        id: `opp-${Date.now()}`,
        title: `Negocio - ${cleanCompany}`,
        companyId: companyId || "",
        companyName: cleanCompany,
        contactId: contactId || "",
        contactName: `${leadData.name} ${leadData.lastName}`,
        assignedToUserId: leadData.assignedToUserId,
        assignedToName: leadData.assignedToName,
        productService: "YORVAR CRM Solution Suite",
        value: oppValue,
        currency: leadData.currency || companySettings.currency,
        probability: oppProb,
        weightedValue: oppValue * (oppProb / 100),
        stage: leadData.pipelineStage || "prospecto",
        estimatedCloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        source: leadData.source,
        score: baseScore + 25,
        createdAt: new Date().toISOString(),
        lastActivityAt: new Date().toISOString(),
      };
      setOpportunities((prev) => [newOpp, ...prev]);
    }

    const newLead: Lead = {
      ...leadData,
      id: leadId,
      companyId: companyId || "",
      score: baseScore,
      scoreLevel: calculateScoreLevel(baseScore),
      createdAt: new Date().toISOString(),
      tags: leadData.tags || ["Nuevo"],
      currency: leadData.currency || companySettings.currency,
    };
    setLeads((prev) => [newLead, ...prev]);

    logAudit("Creación de Lead", "lead", newLead.id, `${newLead.name} ${newLead.lastName} (${newLead.company})`, "-", "Nuevo Lead");

    // Add activity
    addActivity({
      type: "nota",
      title: "Lead creado en el CRM",
      description: `Prospecto registrado desde la fuente: ${newLead.source}`,
      userId: currentUser.id,
      userName: `${currentUser.name} ${currentUser.lastName}`,
      leadId: newLead.id,
      leadName: `${newLead.name} ${newLead.lastName}`,
      companyName: newLead.company,
    });

    // Auto-create task if assigned
    if (newLead.assignedToUserId) {
      addTask({
        title: `Realizar primer contacto a ${newLead.name} ${newLead.lastName}`,
        description: `Prospección inicial para la empresa ${newLead.company}. Cargo: ${newLead.jobTitle}`,
        assignedToUserId: newLead.assignedToUserId,
        assignedToName: newLead.assignedToName,
        createdByUserId: currentUser.id,
        createdByName: `${currentUser.name} ${currentUser.lastName}`,
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        dueTime: "10:00",
        priority: "alta",
        status: "pendiente",
        leadId: newLead.id,
        leadName: `${newLead.name} ${newLead.lastName}`,
        companyName: newLead.company,
        type: "llamada",
      });
    }
  };

  const updateLead = (id: string, updates: Partial<Lead>) => {
    setLeads((prev) =>
      prev.map((l) => {
        if (l.id === id) {
          const updatedScore = updates.score !== undefined ? updates.score : l.score;
          const updatedLead = {
            ...l,
            ...updates,
            score: updatedScore,
            scoreLevel: calculateScoreLevel(updatedScore),
          };
          logAudit("Actualización de Lead", "lead", l.id, `${l.name} ${l.lastName}`, `Score: ${l.score}`, `Score: ${updatedLead.score}`);
          return updatedLead;
        }
        return l;
      })
    );
  };

  const deleteLead = (id: string) => {
    const target = leads.find((l) => l.id === id);
    if (target) {
      setLeads((prev) => prev.filter((l) => l.id !== id));
      logAudit("Eliminación de Lead", "lead", id, `${target.name} ${target.lastName}`, "Activo", "Eliminado");
    }
  };

  const importLeads = (newLeads: Omit<Lead, "id" | "createdAt" | "score" | "scoreLevel">[]) => {
    // 1. Process each lead to ensure companies and contacts exist
    const newCompaniesToAdd: Company[] = [];
    const newContactsToAdd: Contact[] = [];
    const newOppsToAdd: Opportunity[] = [];

    const formatted = newLeads.map((item, idx) => {
      const cleanCompany = (item.company || "Empresa Importada").trim();
      const compId = item.companyId || `comp-imp-${Date.now()}-${idx}`;
      
      if (cleanCompany && !companies.some((c) => c.name.toLowerCase() === cleanCompany.toLowerCase()) && !newCompaniesToAdd.some((c) => c.name.toLowerCase() === cleanCompany.toLowerCase())) {
        newCompaniesToAdd.push({
          id: compId,
          name: cleanCompany,
          taxId: "NIT-Pendiente",
          industry: item.industry || "General",
          size: item.companySize || "11-50",
          website: item.website || "",
          city: item.city || "Bogotá",
          country: item.country || "Colombia",
          address: "Sede Principal",
          phone: item.phone || "",
          assignedToUserId: item.assignedToUserId,
          assignedToName: item.assignedToName,
          status: "prospecto",
          potentialValue: item.estimatedValue || 20000000,
          currency: item.currency || companySettings.currency,
          contactsCount: 1,
          opportunitiesCount: item.estimatedValue && item.estimatedValue > 0 ? 1 : 0,
          createdAt: new Date().toISOString(),
        });
      }

      const contactFullName = `${item.name} ${item.lastName}`.trim().toLowerCase();
      if (!contacts.some((c) => `${c.name} ${c.lastName}`.toLowerCase() === contactFullName) && !newContactsToAdd.some((c) => `${c.name} ${c.lastName}`.toLowerCase() === contactFullName)) {
        newContactsToAdd.push({
          id: `cnt-imp-${Date.now()}-${idx}`,
          name: item.name,
          lastName: item.lastName,
          email: item.email,
          phone: item.phone,
          whatsapp: item.whatsapp || item.phone,
          companyId: compId,
          companyName: cleanCompany,
          jobTitle: item.jobTitle || "Contacto Importado",
          decisionRole: "Decisor Principal",
          linkedin: item.linkedin,
          assignedToUserId: item.assignedToUserId,
          assignedToName: item.assignedToName,
          createdAt: new Date().toISOString(),
          isPrimary: true,
        });
      }

      if (item.estimatedValue && item.estimatedValue > 0) {
        newOppsToAdd.push({
          id: `opp-imp-${Date.now()}-${idx}`,
          title: `Negocio - ${cleanCompany}`,
          companyId: compId,
          companyName: cleanCompany,
          contactId: `cnt-imp-${Date.now()}-${idx}`,
          contactName: `${item.name} ${item.lastName}`,
          assignedToUserId: item.assignedToUserId,
          assignedToName: item.assignedToName,
          productService: "YORVAR CRM Suite",
          value: item.estimatedValue,
          currency: item.currency || companySettings.currency,
          probability: 30,
          weightedValue: item.estimatedValue * 0.3,
          stage: item.pipelineStage || "prospecto",
          estimatedCloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
          source: item.source,
          score: 50,
          createdAt: new Date().toISOString(),
          lastActivityAt: new Date().toISOString(),
        });
      }

      return {
        ...item,
        id: `lead-import-${Date.now()}-${idx}`,
        companyId: compId,
        score: 25,
        scoreLevel: "frio" as const,
        createdAt: new Date().toISOString(),
        tags: item.tags || ["Importado"],
        currency: item.currency || companySettings.currency,
      };
    });

    if (newCompaniesToAdd.length > 0) {
      setCompanies((prev) => [...newCompaniesToAdd, ...prev]);
    }
    if (newContactsToAdd.length > 0) {
      setContacts((prev) => [...newContactsToAdd, ...prev]);
    }
    if (newOppsToAdd.length > 0) {
      setOpportunities((prev) => [...newOppsToAdd, ...prev]);
    }

    setLeads((prev) => [...formatted, ...prev]);
    logAudit("Importación Masiva de Leads", "lead", "bulk", `${newLeads.length} leads importados`, "-", `${newLeads.length} registros`);
  };

  const convertLeadToOpportunity = (leadId: string, oppData?: Partial<Opportunity>) => {
    const lead = leads.find((l) => l.id === leadId);
    if (!lead) return;

    // 1. Ensure company exists or create
    let compId = lead.companyId;
    if (!compId) {
      const newComp: Company = {
        id: `comp-${Date.now()}`,
        name: lead.company,
        taxId: "NIT-Pendiente",
        industry: lead.industry || "General",
        size: lead.companySize || "11-50",
        website: lead.website || "",
        city: lead.city || "Bogotá",
        country: lead.country || "Colombia",
        address: "Sede Principal",
        phone: lead.phone,
        assignedToUserId: lead.assignedToUserId,
        assignedToName: lead.assignedToName,
        status: "prospecto",
        potentialValue: lead.estimatedValue || 25000000,
        currency: lead.currency || companySettings.currency,
        contactsCount: 1,
        opportunitiesCount: 1,
        createdAt: new Date().toISOString(),
      };
      setCompanies((prev) => [newComp, ...prev]);
      compId = newComp.id;
    }

    // 2. Ensure contact exists or create
    const newContact: Contact = {
      id: `cnt-${Date.now()}`,
      name: lead.name,
      lastName: lead.lastName,
      email: lead.email,
      phone: lead.phone,
      whatsapp: lead.whatsapp,
      companyId: compId,
      companyName: lead.company,
      jobTitle: lead.jobTitle,
      decisionRole: "Decisor Principal",
      linkedin: lead.linkedin,
      assignedToUserId: lead.assignedToUserId,
      assignedToName: lead.assignedToName,
      createdAt: new Date().toISOString(),
      isPrimary: true,
    };
    setContacts((prev) => [newContact, ...prev]);

    // 3. Create opportunity
    const oppValue = oppData?.value || lead.estimatedValue || 30000000;
    const oppProb = oppData?.probability || 35;
    const newOpp: Opportunity = {
      id: `opp-${Date.now()}`,
      title: oppData?.title || `Oportunidad Comercial - ${lead.company}`,
      companyId: compId,
      companyName: lead.company,
      contactId: newContact.id,
      contactName: `${lead.name} ${lead.lastName}`,
      assignedToUserId: lead.assignedToUserId,
      assignedToName: lead.assignedToName,
      productService: oppData?.productService || "YORVAR CRM Solution Suite",
      value: oppValue,
      currency: lead.currency || companySettings.currency,
      probability: oppProb,
      weightedValue: oppValue * (oppProb / 100),
      stage: oppData?.stage || "calificado",
      estimatedCloseDate: oppData?.estimatedCloseDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      source: lead.source,
      score: lead.score + 20,
      createdAt: new Date().toISOString(),
      lastActivityAt: new Date().toISOString(),
    };
    setOpportunities((prev) => [newOpp, ...prev]);

    // 4. Update lead status
    updateLead(leadId, {
      status: "convertido",
      pipelineStage: "calificado",
      companyId: compId,
      score: lead.score + 30,
    });

    logAudit("Conversión de Lead a Oportunidad", "opportunity", newOpp.id, newOpp.title, "Lead", "Oportunidad Creada");
  };

  // Company CRUD
  const addCompany = (comp: Omit<Company, "id" | "createdAt" | "contactsCount" | "opportunitiesCount">) => {
    const newCompany: Company = {
      ...comp,
      id: `comp-${Date.now()}`,
      contactsCount: 0,
      opportunitiesCount: 0,
      createdAt: new Date().toISOString(),
    };
    setCompanies((prev) => [newCompany, ...prev]);
    logAudit("Creación de Empresa", "company", newCompany.id, newCompany.name);
  };

  const updateCompany = (id: string, updates: Partial<Company>) => {
    setCompanies((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  };

  const deleteCompany = (id: string) => {
    setCompanies((prev) => prev.filter((c) => c.id !== id));
  };

  // Contact CRUD
  const addContact = (cnt: Omit<Contact, "id" | "createdAt">) => {
    const newContact: Contact = {
      ...cnt,
      id: `cnt-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setContacts((prev) => [newContact, ...prev]);
    logAudit("Creación de Contacto", "contact", newContact.id, `${newContact.name} ${newContact.lastName}`);
  };

  const updateContact = (id: string, updates: Partial<Contact>) => {
    setContacts((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  };

  const deleteContact = (id: string) => {
    setContacts((prev) => prev.filter((c) => c.id !== id));
  };

  // Opportunity CRUD
  const addOpportunity = (opp: Omit<Opportunity, "id" | "createdAt" | "weightedValue">) => {
    const weighted = opp.value * (opp.probability / 100);
    const newOpp: Opportunity = {
      ...opp,
      id: `opp-${Date.now()}`,
      weightedValue: weighted,
      createdAt: new Date().toISOString(),
      lastActivityAt: new Date().toISOString(),
      score: opp.score || 70,
    };
    setOpportunities((prev) => [newOpp, ...prev]);
    logAudit("Creación de Oportunidad", "opportunity", newOpp.id, newOpp.title);
  };

  const updateOpportunity = (id: string, updates: Partial<Opportunity>) => {
    setOpportunities((prev) =>
      prev.map((o) => {
        if (o.id === id) {
          const val = updates.value !== undefined ? updates.value : o.value;
          const prob = updates.probability !== undefined ? updates.probability : o.probability;
          return {
            ...o,
            ...updates,
            weightedValue: val * (prob / 100),
            lastActivityAt: new Date().toISOString(),
          };
        }
        return o;
      })
    );
  };

  const updateOpportunityStage = (
    id: string,
    newStage: PipelineStageId,
    wonNotes?: string,
    lostReason?: string
  ) => {
    const stageObj = pipelineStages.find((s) => s.id === newStage);
    const prob = stageObj ? stageObj.probability : 50;

    setOpportunities((prev) =>
      prev.map((opp) => {
        if (opp.id === id) {
          const oldStageName = pipelineStages.find((s) => s.id === opp.stage)?.name || opp.stage;
          const newStageName = stageObj?.name || newStage;

          logAudit(
            "Cambio de Etapa de Oportunidad",
            "opportunity",
            opp.id,
            opp.title,
            oldStageName,
            newStageName
          );

          addActivity({
            type: "cambio_etapa",
            title: `Oportunidad movida a ${newStageName}`,
            description: wonNotes || lostReason || `Negocio avanzado a la etapa ${newStageName} con probabilidad ${prob}%.`,
            userId: currentUser.id,
            userName: `${currentUser.name} ${currentUser.lastName}`,
            opportunityId: opp.id,
            opportunityName: opp.title,
            companyId: opp.companyId,
            companyName: opp.companyName,
          });

          return {
            ...opp,
            stage: newStage,
            probability: prob,
            weightedValue: opp.value * (prob / 100),
            wonAt: newStage === "cierre_ganado" ? new Date().toISOString() : opp.wonAt,
            lostReason: newStage === "cierre_perdido" ? lostReason : undefined,
            lostNotes: newStage === "cierre_perdido" ? wonNotes : undefined,
            lastActivityAt: new Date().toISOString(),
          };
        }
        return opp;
      })
    );
  };

  const deleteOpportunity = (id: string) => {
    setOpportunities((prev) => prev.filter((o) => o.id !== id));
  };

  // Task CRUD
  const addTask = (task: Omit<Task, "id" | "createdAt">) => {
    const newTask: Task = {
      ...task,
      id: `tsk-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setTasks((prev) => [newTask, ...prev]);
    logAudit("Creación de Tarea", "task", newTask.id, newTask.title);
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
  };

  const toggleTaskStatus = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const nextStatus = t.status === "completada" ? "pendiente" : "completada";
          const completedAt = nextStatus === "completada" ? new Date().toISOString() : undefined;
          return { ...t, status: nextStatus, completedAt };
        }
        return t;
      })
    );
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  // Activities
  const addActivity = (activity: Omit<Activity, "id" | "timestamp">) => {
    const newAct: Activity = {
      ...activity,
      id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
    };
    setActivities((prev) => [newAct, ...prev]);
  };

  // Campaigns & Email
  const addCampaign = (campaign: Omit<Campaign, "id" | "createdAt" | "sentCount" | "deliveredCount" | "openedCount" | "clickedCount" | "repliedCount" | "bouncedCount" | "unsubscribedCount">) => {
    const newCmp: Campaign = {
      ...campaign,
      id: `cmp-${Date.now()}`,
      sentCount: 0,
      deliveredCount: 0,
      openedCount: 0,
      clickedCount: 0,
      repliedCount: 0,
      bouncedCount: 0,
      unsubscribedCount: 0,
      createdAt: new Date().toISOString(),
    };
    setCampaigns((prev) => [newCmp, ...prev]);
    logAudit("Creación de Campaña", "campaign", newCmp.id, newCmp.name);
  };

  const updateCampaignStatus = (id: string, status: Campaign["status"]) => {
    setCampaigns((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)));
  };

  const simulateCampaignExecution = (id: string) => {
    setCampaigns((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const total = c.totalRecipients || 50;
          const sent = total;
          const delivered = Math.floor(sent * 0.98);
          const opened = Math.floor(delivered * 0.65);
          const clicked = Math.floor(opened * 0.4);
          const replied = Math.floor(opened * 0.22);
          const bounced = total - delivered;

          return {
            ...c,
            status: "completed",
            sentCount: sent,
            deliveredCount: delivered,
            openedCount: opened,
            clickedCount: clicked,
            repliedCount: replied,
            bouncedCount: bounced,
            launchedAt: new Date().toISOString(),
            completedAt: new Date().toISOString(),
          };
        }
        return c;
      })
    );
  };

  const addTemplate = (template: Omit<EmailTemplate, "id" | "createdAt" | "usageCount">) => {
    const newTmpl: EmailTemplate = {
      ...template,
      id: `tmpl-${Date.now()}`,
      usageCount: 0,
      createdAt: new Date().toISOString(),
    };
    setTemplates((prev) => [newTmpl, ...prev]);
  };

  const updateTemplate = (id: string, updates: Partial<EmailTemplate>) => {
    setTemplates((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
  };

  const addSequence = (seq: Omit<Sequence, "id" | "createdAt" | "enrolledLeadsCount" | "completedLeadsCount" | "repliedCount" | "meetingsBookedCount">) => {
    const newSeq: Sequence = {
      ...seq,
      id: `seq-${Date.now()}`,
      enrolledLeadsCount: 0,
      completedLeadsCount: 0,
      repliedCount: 0,
      meetingsBookedCount: 0,
      createdAt: new Date().toISOString(),
    };
    setSequences((prev) => [newSeq, ...prev]);
  };

  const toggleSequenceStatus = (id: string) => {
    setSequences((prev) => prev.map((s) => (s.id === id ? { ...s, isActive: !s.isActive } : s)));
  };

  const addToSuppressionList = (entry: Omit<SuppressionEntry, "id" | "addedAt">) => {
    const newEntry: SuppressionEntry = {
      ...entry,
      id: `sup-${Date.now()}`,
      addedAt: new Date().toISOString(),
    };
    setSuppressionList((prev) => [newEntry, ...prev]);
  };

  const removeFromSuppressionList = (id: string) => {
    setSuppressionList((prev) => prev.filter((s) => s.id !== id));
  };

  const updateDeliverabilityConfig = (updates: Partial<DeliverabilityConfig>) => {
    setDeliverabilityConfig((prev) => ({ ...prev, ...updates }));
  };

  // Automations & Segments
  const addAutomation = (rule: AutomationRule) => {
    setAutomations((prev) => [rule, ...prev]);
    logAudit("Creación de Automatización", "setting", rule.id, rule.name);
  };

  const updateAutomation = (id: string, updates: Partial<AutomationRule>) => {
    setAutomations((prev) => prev.map((a) => (a.id === id ? { ...a, ...updates } : a)));
  };

  const deleteAutomation = (id: string) => {
    setAutomations((prev) => prev.filter((a) => a.id !== id));
  };

  const addAutomationRule = (rule: Omit<AutomationRule, "id" | "createdAt" | "timesExecuted">) => {
    const newRule: AutomationRule = {
      ...rule,
      id: `auto-${Date.now()}`,
      timesExecuted: 0,
      createdAt: new Date().toISOString(),
    };
    setAutomations((prev) => [newRule, ...prev]);
  };

  const toggleAutomationRule = (id: string) => {
    setAutomations((prev) => prev.map((a) => (a.id === id ? { ...a, isActive: !a.isActive } : a)));
  };

  const addSegment = (seg: Omit<DynamicSegment, "id" | "createdAt" | "leadsCount">) => {
    const newSeg: DynamicSegment = {
      ...seg,
      id: `seg-${Date.now()}`,
      leadsCount: 10,
      createdAt: new Date().toISOString(),
    };
    setSegments((prev) => [newSeg, ...prev]);
    logAudit("Creación de Segmento", "lead", newSeg.id, newSeg.name);
  };

  const updateSegment = (id: string, updates: Partial<DynamicSegment>) => {
    setSegments((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  const deleteSegment = (id: string) => {
    setSegments((prev) => prev.filter((s) => s.id !== id));
  };

  // Settings
  const updateCompanySettings = (settings: Partial<CompanySettings>) => {
    setCompanySettings((prev) => ({ ...prev, ...settings }));
  };

  const updateIntegration = (id: string, updates: Partial<IntegrationConfig>) => {
    setIntegrations((prev) => prev.map((i) => (i.id === id ? { ...i, ...updates } : i)));
  };

  const updateLeadScoreRules = (rules: LeadScoreRule[]) => {
    setLeadScoreRules(rules);
  };

  // Notifications
  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  // Reset to initial demo datasets
  const resetToDemoData = () => {
    setLeads(MOCK_LEADS);
    setCompanies(MOCK_COMPANIES);
    setContacts(MOCK_CONTACTS);
    setOpportunities(MOCK_OPPORTUNITIES);
    setTasks(MOCK_TASKS);
    setActivities(MOCK_ACTIVITIES);
    setPipelineStages(INITIAL_PIPELINE_STAGES);
    setLeadScoreRules(INITIAL_LEAD_SCORE_RULES);
    setCompanySettings(INITIAL_COMPANY_SETTINGS);
    setDeliverabilityConfig(INITIAL_DELIVERABILITY_CONFIG);
    setIntegrations(INITIAL_INTEGRATIONS);
    setCampaigns(MOCK_CAMPAIGNS);
    setSequences(MOCK_SEQUENCES);
    setTemplates(MOCK_EMAIL_TEMPLATES);
    setSuppressionList(MOCK_SUPPRESSION_LIST);
    setAutomations(MOCK_AUTOMATIONS);
    setSegments(MOCK_SEGMENTS);
    setAuditLogs(MOCK_AUDIT_LOGS);
    setNotifications(MOCK_NOTIFICATIONS);

    localStorage.clear();
    alert("Se han restablecido todos los datos demo del CRM con éxito.");
  };

  return (
    <CRMContext.Provider
      value={{
        leads,
        companies,
        contacts,
        opportunities,
        tasks,
        activities,
        pipelineStages,
        leadScoreRules,
        companySettings,
        systemConfig: companySettings,
        users,
        deliverabilityConfig,
        integrations,
        campaigns,
        sequences,
        templates,
        suppressionList,
        automations,
        segments,
        auditLogs,
        notifications,
        setLeads,
        setCompanies,
        setContacts,
        setOpportunities,
        setTasks,
        addLead,
        updateLead,
        deleteLead,
        importLeads,
        convertLeadToOpportunity,
        addCompany,
        updateCompany,
        deleteCompany,
        addContact,
        updateContact,
        deleteContact,
        addOpportunity,
        updateOpportunity,
        updateOpportunityStage,
        deleteOpportunity,
        addTask,
        updateTask,
        toggleTaskStatus,
        deleteTask,
        addActivity,
        addCampaign,
        updateCampaignStatus,
        simulateCampaignExecution,
        addTemplate,
        updateTemplate,
        addSequence,
        toggleSequenceStatus,
        addToSuppressionList,
        removeFromSuppressionList,
        updateDeliverabilityConfig,
        addAutomation,
        updateAutomation,
        deleteAutomation,
        addAutomationRule,
        toggleAutomationRule,
        addSegment,
        updateSegment,
        deleteSegment,
        updateCompanySettings,
        updateSystemConfig: updateCompanySettings,
        updateIntegration,
        updateLeadScoreRules,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        resetToDemoData,
      }}
    >
      {children}
    </CRMContext.Provider>
  );
};

export const useCRM = () => {
  const context = useContext(CRMContext);
  if (!context) {
    throw new Error("useCRM must be used within a CRMProvider");
  }
  return context;
};
