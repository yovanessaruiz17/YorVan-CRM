/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { CRMProvider, useCRM } from "./context/CRMContext";
import { Sidebar, NavSection } from "./components/layout/Sidebar";
import { Header } from "./components/layout/Header";
import { GlobalSearchModal } from "./components/layout/GlobalSearchModal";
import { NotificationDrawer } from "./components/layout/NotificationDrawer";
import { OnboardingModal } from "./components/layout/OnboardingModal";
import { AICopilotDrawer } from "./components/ai/AICopilotDrawer";

// Main Views
import { DashboardContainer } from "./components/dashboard/DashboardContainer";
import { LeadsList } from "./components/leads/LeadsList";
import { PipelineKanban } from "./components/pipeline/PipelineKanban";
import { CompaniesList } from "./components/companies/CompaniesList";
import { ContactsList } from "./components/contacts/ContactsList";
import { TasksList } from "./components/tasks/TasksList";
import { CommercialCalendar } from "./components/calendar/CommercialCalendar";
import { CampaignsList } from "./components/campaigns/CampaignsList";
import { SequencesList } from "./components/sequences/SequencesList";
import { TemplatesList } from "./components/templates/TemplatesList";
import { DeliverabilityCenter } from "./components/deliverability/DeliverabilityCenter";
import { AnalyticsDashboard } from "./components/analytics/AnalyticsDashboard";
import { SegmentsView } from "./components/segments/SegmentsView";
import { AutomationsView } from "./components/automations/AutomationsView";
import { TeamView } from "./components/team/TeamView";
import { AuditLogsView } from "./components/audit/AuditLogsView";
import { SettingsView } from "./components/settings/SettingsView";

// Modals
import { LeadDetailModal } from "./components/leads/LeadDetailModal";
import { LeadFormModal } from "./components/leads/LeadFormModal";
import { LeadImportModal } from "./components/leads/LeadImportModal";
import { OpportunityDetailModal } from "./components/pipeline/OpportunityDetailModal";
import { OpportunityFormModal } from "./components/pipeline/OpportunityFormModal";
import { TaskModal } from "./components/tasks/TaskModal";

const CRMAppContent: React.FC = () => {
  const [currentSection, setCurrentSection] = useState<NavSection>("dashboard");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Global Modals State
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isAIOpen, setIsAIOpen] = useState(false);

  // Entity Modals
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [isLeadFormOpen, setIsLeadFormOpen] = useState(false);
  const [editingLeadId, setEditingLeadId] = useState<string | null>(null);
  const [isLeadImportOpen, setIsLeadImportOpen] = useState(false);

  const [selectedOpportunityId, setSelectedOpportunityId] = useState<string | null>(null);
  const [isOpportunityFormOpen, setIsOpportunityFormOpen] = useState(false);
  const [editingOpportunityId, setEditingOpportunityId] = useState<string | null>(null);

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

  const handleNavigate = (section: NavSection, entityId?: string) => {
    setCurrentSection(section);
    if (entityId) {
      if (section === "leads") setSelectedLeadId(entityId);
      if (section === "pipeline") setSelectedOpportunityId(entityId);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex">
      {/* Navigation Sidebar */}
      <Sidebar
        currentSection={currentSection}
        onSelectSection={(sec) => setCurrentSection(sec)}
        onOpenAI={() => setIsAIOpen(true)}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main App Container */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Top Header */}
        <Header
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenAI={() => setIsAIOpen(true)}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          onOpenOnboarding={() => setIsOnboardingOpen(true)}
          onOpenNewLead={() => {
            setEditingLeadId(null);
            setIsLeadFormOpen(true);
          }}
          onOpenNewOpportunity={() => {
            setEditingOpportunityId(null);
            setIsOpportunityFormOpen(true);
          }}
          onOpenNewTask={() => {
            setEditingTaskId(null);
            setIsTaskModalOpen(true);
          }}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        />

        {/* View Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {currentSection === "dashboard" && (
            <DashboardContainer
              onNavigate={handleNavigate}
              onOpenAI={() => setIsAIOpen(true)}
              onSelectLead={(id) => setSelectedLeadId(id)}
            />
          )}

          {currentSection === "leads" && (
            <LeadsList
              onSelectLead={(id) => setSelectedLeadId(id)}
              onOpenNewLeadModal={() => {
                setEditingLeadId(null);
                setIsLeadFormOpen(true);
              }}
              onOpenImportModal={() => setIsLeadImportOpen(true)}
            />
          )}

          {currentSection === "pipeline" && (
            <PipelineKanban
              onSelectOpportunity={(id) => setSelectedOpportunityId(id)}
              onOpenNewOpportunityModal={() => {
                setEditingOpportunityId(null);
                setIsOpportunityFormOpen(true);
              }}
            />
          )}

          {currentSection === "companies" && <CompaniesList />}

          {currentSection === "contacts" && <ContactsList />}

          {currentSection === "tasks" && <TasksList />}

          {currentSection === "calendar" && <CommercialCalendar />}

          {currentSection === "campaigns" && <CampaignsList />}

          {currentSection === "sequences" && <SequencesList />}

          {currentSection === "templates" && <TemplatesList />}

          {currentSection === "deliverability" && <DeliverabilityCenter />}

          {currentSection === "reports" && <AnalyticsDashboard />}

          {currentSection === "segments" && <SegmentsView />}

          {currentSection === "automations" && <AutomationsView />}

          {currentSection === "team" && <TeamView />}

          {currentSection === "audit" && <AuditLogsView />}

          {currentSection === "settings" && <SettingsView />}
        </main>
      </div>

      {/* Global Modals & Drawers */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigate={handleNavigate}
      />

      <NotificationDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        onNavigate={handleNavigate}
      />

      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onNavigate={handleNavigate}
      />

      <AICopilotDrawer
        isOpen={isAIOpen}
        onClose={() => setIsAIOpen(false)}
      />

      {/* Lead Modals */}
      {selectedLeadId && (
        <LeadDetailModal
          leadId={selectedLeadId}
          onClose={() => setSelectedLeadId(null)}
          onEdit={(id) => {
            setSelectedLeadId(null);
            setEditingLeadId(id);
            setIsLeadFormOpen(true);
          }}
          onNavigate={(sec) => setCurrentSection(sec as NavSection)}
        />
      )}

      {isLeadFormOpen && (
        <LeadFormModal
          isOpen={isLeadFormOpen}
          leadIdToEdit={editingLeadId}
          onClose={() => {
            setIsLeadFormOpen(false);
            setEditingLeadId(null);
          }}
        />
      )}

      {isLeadImportOpen && (
        <LeadImportModal
          isOpen={isLeadImportOpen}
          onClose={() => setIsLeadImportOpen(false)}
        />
      )}

      {/* Opportunity Modals */}
      {selectedOpportunityId && (
        <OpportunityDetailModal
          opportunityId={selectedOpportunityId}
          onClose={() => setSelectedOpportunityId(null)}
          onEdit={(id) => {
            setSelectedOpportunityId(null);
            setEditingOpportunityId(id);
            setIsOpportunityFormOpen(true);
          }}
        />
      )}

      {isOpportunityFormOpen && (
        <OpportunityFormModal
          isOpen={isOpportunityFormOpen}
          opportunityIdToEdit={editingOpportunityId}
          onClose={() => {
            setIsOpportunityFormOpen(false);
            setEditingOpportunityId(null);
          }}
        />
      )}

      {/* Task Modal */}
      {isTaskModalOpen && (
        <TaskModal
          isOpen={isTaskModalOpen}
          taskIdToEdit={editingTaskId}
          onClose={() => {
            setIsTaskModalOpen(false);
            setEditingTaskId(null);
          }}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <CRMProvider>
        <CRMAppContent />
      </CRMProvider>
    </AuthProvider>
  );
}
