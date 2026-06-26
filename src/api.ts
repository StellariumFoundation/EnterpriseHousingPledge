/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Pledger, BuildingProject, HousingUnit, EnterpriseHousingPledge } from "./types";

// Types matching the backend response
export interface FinancialSummary {
  totalLoansDisbursed: number;
  totalRepaymentsReceived: number;
  totalInterestAccrued: number;
  netOutstandingDebt: number;
  upcomingPaymentsAlerts: RepaymentSchedule[];
}

export interface Milestone {
  id: string;
  project_id: string;
  title: string;
  description: string;
  target_date: string;
  status: 'Pending' | 'In Progress' | 'Completed';
}

export interface FinancialTransaction {
  id: string;
  project_id: string;
  projectName?: string;
  type: 'Disbursement' | 'Repayment' | 'Interest Accrual';
  amount: number;
  date: string;
  description: string;
}

export interface RepaymentSchedule {
  id: string;
  project_id: string;
  projectName?: string;
  due_date: string;
  amount_due: number;
  interest_accrued: number;
  status: 'Upcoming' | 'Paid' | 'Overdue';
}

export const api = {
  // Stakeholders
  async getStakeholders(): Promise<Pledger[]> {
    const res = await fetch("/api/stakeholders");
    if (!res.ok) throw new Error("Failed to fetch stakeholders");
    const data = await res.json();
    return data.map((item: any) => ({
      id: item.id,
      name: item.name,
      type: item.type,
      collateralType: item.collateral_type,
      collateralValue: item.collateral_value,
      shares: item.shares,
      signedContract: item.signed_contract === 1,
      contractDate: item.contract_date || "",
      approvedLoans: item.approved_loans,
      missionStatement: item.mission_statement || "",
      impactSummary: item.impact_summary || "",
      documents: [
        {
          id: `doc-${item.id}`,
          name: "Initial Intent Statement & Collateral Declaration",
          category: "Contract" as const,
          dateSigned: item.contract_date || "2025-06-15",
          version: "v1.0"
        }
      ]
    }));
  },

  async createStakeholder(payload: Partial<Pledger>): Promise<Pledger> {
    const res = await fetch("/api/stakeholders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: payload.name,
        type: payload.type,
        mission_statement: payload.missionStatement || "",
        collateral_type: payload.collateralType,
        collateral_value: payload.collateralValue,
        approved_loans: payload.approvedLoans,
        signed_contract: payload.signedContract ? 1 : 0,
        contract_date: payload.contractDate || new Date().toISOString().split("T")[0],
        impact_summary: payload.impactSummary || ""
      })
    });
    if (!res.ok) throw new Error("Failed to create stakeholder");
    return res.json();
  },

  async updateStakeholder(id: string, payload: Partial<Pledger>): Promise<Pledger> {
    const res = await fetch(`/api/stakeholders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: payload.name,
        type: payload.type,
        mission_statement: payload.missionStatement || "",
        collateral_type: payload.collateralType,
        collateral_value: payload.collateralValue,
        approved_loans: payload.approvedLoans,
        signed_contract: payload.signedContract ? 1 : 0,
        contract_date: payload.contractDate,
        impact_summary: payload.impactSummary || ""
      })
    });
    if (!res.ok) throw new Error("Failed to update stakeholder");
    return res.json();
  },

  // Projects
  async getProjects(): Promise<BuildingProject[]> {
    const res = await fetch("/api/projects");
    if (!res.ok) throw new Error("Failed to fetch projects");
    const data = await res.json();
    return data.map((item: any) => ({
      id: item.id,
      ehpId: item.ehp_id,
      name: item.name,
      location: item.location,
      imageUrl: item.image_url,
      status: item.status,
      totalCost: item.total_cost,
      loanApproved: item.loan_approved,
      loanDisbursed: item.loan_disbursed,
      loanRemaining: item.loan_remaining,
      interestRate: item.interest_rate,
      startDate: item.start_date,
      completionDate: item.completion_date,
      constructionMethod: item.construction_method,
      latitude: item.latitude,
      longitude: item.longitude,
      model3dType: item.model_3d_type || "broad_t30",
      suppliers: [
        {
          id: `sup-${item.id}`,
          name: "BROAD Group Modular Systems",
          role: "Structural Module Fabricator",
          contractValue: Math.round(item.total_cost * 0.7),
          contact: "+86 731-8408-8888"
        }
      ],
      documents: [
        {
          id: `doc-${item.id}`,
          name: "Prefab Assembly Logistics Plan & Schedule",
          category: "Blueprint" as const,
          dateSigned: item.start_date,
          version: "v1.0"
        }
      ]
    }));
  },

  async createProject(payload: Partial<BuildingProject & { latitude?: number, longitude?: number, model3dType?: string }>): Promise<BuildingProject> {
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: payload.name,
        location: payload.location,
        image_url: payload.imageUrl,
        status: payload.status,
        total_cost: payload.totalCost,
        loan_approved: payload.loanApproved,
        loan_disbursed: payload.loanDisbursed || 0,
        interest_rate: payload.interestRate || 2.5,
        start_date: payload.startDate,
        completion_date: payload.completionDate,
        construction_method: payload.constructionMethod,
        latitude: payload.latitude || -8.0,
        longitude: payload.longitude || -34.9,
        model_3d_type: payload.model3dType || "broad_t30"
      })
    });
    if (!res.ok) throw new Error("Failed to create project");
    return res.json();
  },

  async updateProject(id: string, payload: Partial<BuildingProject & { model3dType?: string }>): Promise<BuildingProject> {
    const res = await fetch(`/api/projects/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: payload.name,
        location: payload.location,
        status: payload.status,
        total_cost: payload.totalCost,
        loan_approved: payload.loanApproved,
        loan_disbursed: payload.loanDisbursed,
        interest_rate: payload.interestRate,
        start_date: payload.startDate,
        completion_date: payload.completionDate,
        construction_method: payload.constructionMethod,
        model_3d_type: payload.model3dType
      })
    });
    if (!res.ok) throw new Error("Failed to update project");
    return res.json();
  },

  // Milestones
  async getProjectMilestones(projectId: string): Promise<Milestone[]> {
    const res = await fetch(`/api/projects/${projectId}/milestones`);
    if (!res.ok) throw new Error("Failed to fetch project milestones");
    return res.json();
  },

  async createMilestone(payload: Partial<Milestone>): Promise<Milestone> {
    const res = await fetch("/api/milestones", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error("Failed to create milestone");
    return res.json();
  },

  async updateMilestone(id: string, payload: Partial<Milestone>): Promise<Milestone> {
    const res = await fetch(`/api/milestones/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error("Failed to update milestone");
    return res.json();
  },

  // Housing Units
  async getUnits(): Promise<HousingUnit[]> {
    const res = await fetch("/api/units");
    if (!res.ok) throw new Error("Failed to fetch housing units");
    const data = await res.json();
    return data.map((item: any) => ({
      id: item.id,
      projectId: item.project_id,
      projectName: item.projectName || "EHP Building",
      unitNumber: item.unit_number,
      type: item.type,
      price: item.price,
      marketPrice: item.market_price,
      status: item.status,
      tenantName: item.tenant_name || undefined,
      subsidyGranted: item.subsidy_granted,
      purchaseDate: item.purchase_date || undefined
    }));
  },

  async createUnit(payload: Partial<HousingUnit>): Promise<HousingUnit> {
    const res = await fetch("/api/units", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        project_id: payload.projectId,
        unit_number: payload.unitNumber,
        type: payload.type,
        price: payload.price,
        market_price: payload.marketPrice,
        status: payload.status,
        tenant_name: payload.tenantName
      })
    });
    if (!res.ok) throw new Error("Failed to create housing unit");
    return res.json();
  },

  async updateUnit(id: string, payload: Partial<HousingUnit>): Promise<HousingUnit> {
    const res = await fetch(`/api/units/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        price: payload.price,
        market_price: payload.marketPrice,
        status: payload.status,
        tenant_name: payload.tenantName
      })
    });
    if (!res.ok) throw new Error("Failed to update housing unit");
    return res.json();
  },

  // Financial Systems
  async getFinancialSummary(): Promise<FinancialSummary> {
    const res = await fetch("/api/financials/summary");
    if (!res.ok) throw new Error("Failed to fetch financials summary");
    return res.json();
  },

  async disburseLoan(projectId: string, amount: number, date?: string, description?: string): Promise<any> {
    const res = await fetch("/api/financials/disburse", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ project_id: projectId, amount, date, description })
    });
    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || "Failed to disburse loan");
    }
    return res.json();
  },

  async accrueInterest(): Promise<any> {
    const res = await fetch("/api/financials/accrue-interest", {
      method: "POST"
    });
    if (!res.ok) throw new Error("Failed to accrue interest");
    return res.json();
  },

  async submitRepayment(projectId: string, amount: number, scheduleId?: string, date?: string, description?: string): Promise<any> {
    const res = await fetch("/api/financials/repay", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ project_id: projectId, amount, schedule_id: scheduleId, date, description })
    });
    if (!res.ok) throw new Error("Failed to submit loan repayment");
    return res.json();
  },

  async getRepayments(): Promise<RepaymentSchedule[]> {
    const res = await fetch("/api/repayments");
    if (!res.ok) throw new Error("Failed to fetch repayments schedule");
    return res.json();
  },

  async getTransactions(): Promise<FinancialTransaction[]> {
    const res = await fetch("/api/transactions");
    if (!res.ok) throw new Error("Failed to fetch financial transactions");
    return res.json();
  }
};
