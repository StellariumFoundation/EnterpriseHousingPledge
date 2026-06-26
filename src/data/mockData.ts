/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EnterpriseHousingPledge,
  Pledger,
  BuildingProject,
  HousingUnit,
  PledgerType,
  CollateralType,
  ProjectStatus,
  UnitStatus
} from "../types";

export const INITIAL_PLEDGES: EnterpriseHousingPledge[] = [
  {
    id: "ehp-1",
    name: "Symphony of Unity EHP",
    location: "Recife, Pernambuco, Brazil",
    targetFund: 7000000,
    status: "Active",
    loanInterestRate: 2.5,
    reinvestmentPool: 450000,
    description: "The pilot Enterprise Housing Pledge initiative deploying high-speed pre-fabricated residential blocks to resolve housing deficit with a reinvestment engine below standard market rates."
  },
  {
    id: "ehp-2",
    name: "São Paulo Aurora Block Expansion",
    location: "São Paulo, SP, Brazil",
    targetFund: 15000000,
    status: "Active",
    loanInterestRate: 2.1,
    reinvestmentPool: 120000,
    description: "A large-scale urban regeneration collaboration utilizing public land assets and corporate guarantees to fund rapid modular micro-apartments for key workers."
  },
  {
    id: "ehp-3",
    name: "Amazonas Green Timber Modulars",
    location: "Manaus, AM, Brazil",
    targetFund: 5000000,
    status: "Draft",
    loanInterestRate: 3.0,
    reinvestmentPool: 0,
    description: "Proposed EHP utilizing sustainable certified legal timber engineering for rapid eco-lodgings, supporting active local co-ops and eco-tourism initiatives."
  }
];

export const INITIAL_PLEDGERS: Pledger[] = [
  {
    id: "pledger-1",
    name: "Recife Municipal Development Council",
    type: PledgerType.PUBLIC,
    collateralType: CollateralType.LAND,
    collateralValue: 2500000,
    shares: 35.7,
    signedContract: true,
    contractDate: "2025-06-20",
    approvedLoans: 2000000,
    documents: [
      {
        id: "doc-101",
        name: "Municipal Land Grant & Title Deed #401",
        category: "Contract",
        dateSigned: "2025-06-20",
        version: "v1.2"
      },
      {
        id: "doc-102",
        name: "Joint Shared Covenant Agreement",
        category: "Contract",
        dateSigned: "2025-06-22",
        version: "v2.0"
      }
    ]
  },
  {
    id: "pledger-2",
    name: "The Stellarium Foundation",
    type: PledgerType.NONPROFIT,
    collateralType: CollateralType.CASH,
    collateralValue: 1800000,
    shares: 25.7,
    signedContract: true,
    contractDate: "2025-06-15",
    approvedLoans: 1500000,
    documents: [
      {
        id: "doc-103",
        name: "Stellarium Philanthropic Escrow Instruction",
        category: "Contract",
        dateSigned: "2025-06-15",
        version: "v1.0"
      },
      {
        id: "doc-104",
        name: "Anointed Capital Allocation Clearance",
        category: "Loan Approval",
        dateSigned: "2025-06-18",
        version: "v1.1"
      }
    ]
  },
  {
    id: "pledger-3",
    name: "Stellar Active Philanthropy Fund",
    type: PledgerType.PHILANTHROPIST,
    collateralType: CollateralType.PROPERTY,
    collateralValue: 1200000,
    shares: 17.1,
    signedContract: true,
    contractDate: "2025-07-02",
    approvedLoans: 1000000,
    documents: [
      {
        id: "doc-105",
        name: "Collateral Pledge - Commercial Block B",
        category: "Contract",
        dateSigned: "2025-07-01",
        version: "v1.0"
      }
    ]
  },
  {
    id: "pledger-4",
    name: "Broad Group Prefab Technologies Ltd",
    type: PledgerType.PRIVATE,
    collateralType: CollateralType.GUARANTEE,
    collateralValue: 1500000,
    shares: 21.5,
    signedContract: true,
    contractDate: "2025-06-25",
    approvedLoans: 1200000,
    documents: [
      {
        id: "doc-106",
        name: "Corporate Loan Performance Guarantee",
        category: "Loan Approval",
        dateSigned: "2025-06-25",
        version: "v3.0"
      },
      {
        id: "doc-107",
        name: "BROAD Quick-Build Master Service Contract",
        category: "Supplier Agreement",
        dateSigned: "2025-06-28",
        version: "v2.5"
      }
    ]
  }
];

export const INITIAL_PROJECTS: BuildingProject[] = [
  {
    id: "proj-1",
    ehpId: "ehp-1",
    name: "Symphony Prefab Tower A",
    location: "Boa Viagem Core, Recife",
    imageUrl: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80",
    status: ProjectStatus.CONSTRUCTING,
    totalCost: 3200000,
    loanApproved: 2800000,
    startDate: "2026-01-10",
    completionDate: "2026-08-30",
    constructionMethod: "BROAD Group T30 Multi-Story Stainless Steel Prefab System",
    suppliers: [
      {
        id: "sup-1",
        name: "BROAD Group Prefab",
        role: "Modular Core Manufacturer",
        contractValue: 2200000,
        contact: "+86 731-8408-8888"
      },
      {
        id: "sup-2",
        name: "SteelSync Steel Alloys",
        role: "Structural Joints & Frames",
        contractValue: 400000,
        contact: "+55 81 3322-9011"
      },
      {
        id: "sup-3",
        name: "SolarFlow Technologies",
        role: "Rooftop Photovoltaics & Thermal Pumps",
        contractValue: 350000,
        contact: "+55 11 98823-1111"
      }
    ],
    documents: [
      {
        id: "doc-201",
        name: "Stainless Steel Modular Structural Schema",
        category: "Blueprint",
        dateSigned: "2025-11-15",
        version: "v4.2"
      },
      {
        id: "doc-202",
        name: "Recife Fire Dept Safety & Permit Clearance",
        category: "Loan Approval",
        dateSigned: "2025-12-05",
        version: "v1.0"
      }
    ]
  },
  {
    id: "proj-2",
    ehpId: "ehp-1",
    name: "Eden Heights Block 1",
    location: "Olinda North, Pernambuco",
    imageUrl: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=800&q=80",
    status: ProjectStatus.COMPLETED,
    totalCost: 2600000,
    loanApproved: 2200000,
    startDate: "2025-07-15",
    completionDate: "2025-12-20",
    constructionMethod: "Ultra-Lightweight Pre-cast Carbon Reinforced Framing Assembly",
    suppliers: [
      {
        id: "sup-4",
        name: "PreCast Olinda S.A.",
        role: "Carbon Wall Module Foundry",
        contractValue: 1800000,
        contact: "+55 81 3432-8000"
      },
      {
        id: "sup-5",
        name: "Caxangá Water Solutions",
        role: "Greywater Reclaiming Cycle Installation",
        contractValue: 250000,
        contact: "+55 81 3221-5050"
      }
    ],
    documents: [
      {
        id: "doc-203",
        name: "EHP Sustainable Energy Certificate #A-90",
        category: "Financial Audit",
        dateSigned: "2025-12-22",
        version: "v1.0"
      },
      {
        id: "doc-204",
        name: "Final Environmental and greywater audit.pdf",
        category: "Financial Audit",
        dateSigned: "2025-12-21",
        version: "v2.0"
      }
    ]
  }
];

export const INITIAL_UNITS: HousingUnit[] = [
  // Units for Symphony Prefab Tower A (proj-1)
  {
    id: "unit-101",
    projectId: "proj-1",
    projectName: "Symphony Prefab Tower A",
    unitNumber: "A-101",
    type: "Studio",
    price: 320, // affordable monthly rent
    marketPrice: 950, // local market equivalent
    status: UnitStatus.AVAILABLE,
    subsidyGranted: 630
  },
  {
    id: "unit-102",
    projectId: "proj-1",
    projectName: "Symphony Prefab Tower A",
    unitNumber: "A-102",
    type: "1-Bedroom",
    price: 450,
    marketPrice: 1200,
    status: UnitStatus.LEASED,
    tenantName: "Clara Santos",
    subsidyGranted: 750,
    purchaseDate: "2026-03-01"
  },
  {
    id: "unit-103",
    projectId: "proj-1",
    projectName: "Symphony Prefab Tower A",
    unitNumber: "A-103",
    type: "2-Bedroom",
    price: 580,
    marketPrice: 1550,
    status: UnitStatus.AVAILABLE,
    subsidyGranted: 970
  },
  {
    id: "unit-104",
    projectId: "proj-1",
    projectName: "Symphony Prefab Tower A",
    unitNumber: "A-104",
    type: "3-Bedroom",
    price: 750,
    marketPrice: 2100,
    status: UnitStatus.AVAILABLE,
    subsidyGranted: 1350
  },
  {
    id: "unit-105",
    projectId: "proj-1",
    projectName: "Symphony Prefab Tower A",
    unitNumber: "A-201",
    type: "Studio",
    price: 320,
    marketPrice: 950,
    status: UnitStatus.LEASED,
    tenantName: "Davi Lima",
    subsidyGranted: 630,
    purchaseDate: "2026-04-12"
  },
  {
    id: "unit-106",
    projectId: "proj-1",
    projectName: "Symphony Prefab Tower A",
    unitNumber: "A-202",
    type: "2-Bedroom",
    price: 580,
    marketPrice: 1550,
    status: UnitStatus.AVAILABLE,
    subsidyGranted: 970
  },

  // Units for Eden Heights Block 1 (proj-2)
  {
    id: "unit-201",
    projectId: "proj-2",
    projectName: "Eden Heights Block 1",
    unitNumber: "EH-101",
    type: "1-Bedroom",
    price: 400,
    marketPrice: 1100,
    status: UnitStatus.LEASED,
    tenantName: "Maria Eduarda Silva",
    subsidyGranted: 700,
    purchaseDate: "2025-12-24"
  },
  {
    id: "unit-202",
    projectId: "proj-2",
    projectName: "Eden Heights Block 1",
    unitNumber: "EH-102",
    type: "2-Bedroom",
    price: 520,
    marketPrice: 1400,
    status: UnitStatus.SOLD, // Subsidized first-home buyers
    tenantName: "Gabriel & Amanda Alencar",
    subsidyGranted: 880,
    purchaseDate: "2025-12-28"
  },
  {
    id: "unit-203",
    projectId: "proj-2",
    projectName: "Eden Heights Block 1",
    unitNumber: "EH-103",
    type: "3-Bedroom",
    price: 680,
    marketPrice: 1900,
    status: UnitStatus.LEASED,
    tenantName: "Ana Paula Souza",
    subsidyGranted: 1220,
    purchaseDate: "2026-01-05"
  },
  {
    id: "unit-204",
    projectId: "proj-2",
    projectName: "Eden Heights Block 1",
    unitNumber: "EH-201",
    type: "Studio",
    price: 300,
    marketPrice: 880,
    status: UnitStatus.LEASED,
    tenantName: "Filipe Gouveia",
    subsidyGranted: 580,
    purchaseDate: "2026-01-15"
  },
  {
    id: "unit-205",
    projectId: "proj-2",
    projectName: "Eden Heights Block 1",
    unitNumber: "EH-202",
    type: "2-Bedroom",
    price: 520,
    marketPrice: 1400,
    status: UnitStatus.SOLD,
    tenantName: "Sofia Mendes",
    subsidyGranted: 880,
    purchaseDate: "2026-02-10"
  },
  {
    id: "unit-206",
    projectId: "proj-2",
    projectName: "Eden Heights Block 1",
    unitNumber: "EH-203",
    type: "3-Bedroom",
    price: 680,
    marketPrice: 1900,
    status: UnitStatus.AVAILABLE,
    subsidyGranted: 1220
  }
];
