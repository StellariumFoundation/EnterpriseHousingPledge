/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum PledgerType {
  PUBLIC = "Public Institution",
  NONPROFIT = "Nonprofit",
  PHILANTHROPIST = "Philanthropist",
  PRIVATE = "Private Company"
}

export enum CollateralType {
  CASH = "Cash Contribution",
  LAND = "Community Land CLT",
  PROPERTY = "Real Estate Asset",
  GUARANTEE = "Sovereign/Corporate Guarantee"
}

export enum ProjectStatus {
  PLANNING = "Planning & Design",
  CONSTRUCTING = "Prefab Assembly",
  COMPLETED = "Completed & Occupied"
}

export enum UnitStatus {
  AVAILABLE = "Available",
  SOLD = "Sold & Transferred",
  LEASED = "Leased Below-Market"
}

export interface EHPDocument {
  id: string;
  name: string;
  category: "Contract" | "Blueprint" | "Loan Approval" | "Financial Audit" | "Supplier Agreement";
  url?: string;
  dateSigned: string;
  version: string;
}

export interface Supplier {
  id: string;
  name: string;
  role: string;
  contractValue: number;
  contact: string;
}

export interface Pledger {
  id: string;
  name: string;
  type: PledgerType;
  collateralType: CollateralType;
  collateralValue: number;
  shares: number; // percentage of total collateral
  signedContract: boolean;
  contractDate: string;
  approvedLoans: number;
  documents: EHPDocument[];
  missionStatement?: string;
  impactSummary?: string;
}

export interface BuildingProject {
  id: string;
  ehpId: string;
  name: string;
  location: string;
  imageUrl: string;
  status: ProjectStatus;
  totalCost: number;
  loanApproved: number;
  startDate: string;
  completionDate: string;
  constructionMethod: string; // e.g. "Broad Group T30 Prefab System"
  suppliers: Supplier[];
  documents: EHPDocument[];
  loanDisbursed?: number;
  loanRemaining?: number;
  interestRate?: number;
  latitude?: number;
  longitude?: number;
  model3dType?: string;
}

export interface HousingUnit {
  id: string;
  projectId: string;
  projectName: string;
  unitNumber: string;
  type: "Studio" | "1-Bedroom" | "2-Bedroom" | "3-Bedroom";
  price: number; // actual price/monthly rent charged
  marketPrice: number; // local market benchmark price/rent
  status: UnitStatus;
  tenantName?: string;
  subsidyGranted?: number; // amount of government/enterprise subsidy
  purchaseDate?: string;
}

export interface EnterpriseHousingPledge {
  id: string;
  name: string;
  location: string;
  targetFund: number;
  status: "Active" | "Completed" | "Draft";
  loanInterestRate: number; // e.g. 2.5% low-interest construction loan
  reinvestmentPool: number; // accumulated rental surplus
  description: string;
}
