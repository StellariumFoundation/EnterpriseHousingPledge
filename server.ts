/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Hono } from "hono";
import { serveStatic } from "hono/bun";
import { openTursoDatabase, Database } from "./src/db/tursoDb";

const PORT = parseInt(process.env.PORT || "3000", 10);

// Turso credentials from .env
const TURSO_URL = process.env.TURSO_URL || "";
const TURSO_AUTH_TOKEN = process.env.TURSO_AUTH_TOKEN || "";

if (!TURSO_URL || !TURSO_AUTH_TOKEN) {
  console.error("❌ Missing Turso credentials. Set TURSO_URL and TURSO_AUTH_TOKEN in .env");
  process.exit(1);
}

// Define TypeScript Interfaces for Database Entities
interface DbStakeholder {
  id: string;
  name: string;
  type: string;
  mission_statement: string;
  collateral_type: string;
  collateral_value: number;
  approved_loans: number;
  signed_contract: number;
  contract_date: string;
  shares: number;
  impact_summary: string;
}

interface DbProject {
  id: string;
  ehp_id: string;
  name: string;
  location: string;
  image_url: string;
  status: string;
  total_cost: number;
  loan_approved: number;
  loan_disbursed: number;
  loan_remaining: number;
  interest_rate: number;
  start_date: string;
  completion_date: string;
  construction_method: string;
  latitude: number;
  longitude: number;
  model_3d_type: string;
}

interface DbMilestone {
  id: string;
  project_id: string;
  title: string;
  description: string;
  target_date: string;
  status: string;
}

interface DbUnit {
  id: string;
  project_id: string;
  unit_number: string;
  type: string;
  price: number;
  market_price: number;
  status: string;
  tenant_name: string | null;
  subsidy_granted: number;
  purchase_date: string | null;
}

interface DbTransaction {
  id: string;
  project_id: string;
  type: "Disbursement" | "Repayment" | "Interest Accrual";
  amount: number;
  date: string;
  description: string;
}

interface DbRepaymentSchedule {
  id: string;
  project_id: string;
  due_date: string;
  amount_due: number;
  interest_accrued: number;
  status: "Upcoming" | "Paid" | "Overdue";
}

async function initDb(): Promise<Database> {
  console.log("🔌 Connecting to Turso database...");
  const db = await openTursoDatabase(TURSO_URL, TURSO_AUTH_TOKEN);
  console.log("✅ Connected to Turso");

  await db.exec(`
    CREATE TABLE IF NOT EXISTS stakeholders (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      mission_statement TEXT,
      collateral_type TEXT NOT NULL,
      collateral_value REAL DEFAULT 0,
      approved_loans REAL DEFAULT 0,
      signed_contract INTEGER DEFAULT 0,
      contract_date TEXT,
      shares REAL DEFAULT 0,
      impact_summary TEXT
    );
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      ehp_id TEXT NOT NULL,
      name TEXT NOT NULL,
      location TEXT NOT NULL,
      image_url TEXT,
      status TEXT NOT NULL,
      total_cost REAL NOT NULL,
      loan_approved REAL NOT NULL,
      loan_disbursed REAL DEFAULT 0,
      loan_remaining REAL DEFAULT 0,
      interest_rate REAL DEFAULT 2.5,
      start_date TEXT NOT NULL,
      completion_date TEXT NOT NULL,
      construction_method TEXT,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      model_3d_type TEXT DEFAULT 'broad_t30'
    );
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS milestones (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      target_date TEXT NOT NULL,
      status TEXT NOT NULL,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS housing_units (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      unit_number TEXT NOT NULL,
      type TEXT NOT NULL,
      price REAL NOT NULL,
      market_price REAL NOT NULL,
      status TEXT NOT NULL,
      tenant_name TEXT,
      subsidy_granted REAL DEFAULT 0,
      purchase_date TEXT,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS financial_transactions (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      type TEXT NOT NULL,
      amount REAL NOT NULL,
      date TEXT NOT NULL,
      description TEXT,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS repayment_schedules (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      due_date TEXT NOT NULL,
      amount_due REAL NOT NULL,
      interest_accrued REAL DEFAULT 0,
      status TEXT NOT NULL,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );
  `);

  const count = await db.get("SELECT COUNT(*) as count FROM stakeholders");
  if (count.count === 0) {
    console.log("Seeding SQLite database with rich Enterprise Housing Pledge records...");

    const initialStakeholders: DbStakeholder[] = [
      {
        id: "stk-1",
        name: "Recife Municipal Development Council",
        type: "Public Institution",
        mission_statement: "To mobilize municipal land assets, eliminate bureaucracy, and build wealth for lower-income communities in Recife through strategic public alliances.",
        collateral_type: "Community Land CLT",
        collateral_value: 2500000,
        approved_loans: 2000000,
        signed_contract: 1,
        contract_date: "2025-06-20",
        shares: 35.7,
        impact_summary: "Contributed 3.5 hectares of coastal land for Symphony Tower A, cutting project pre-development costs by 30% and locking in perpetual affordability."
      },
      {
        id: "stk-2",
        name: "The Stellarium Foundation",
        type: "Nonprofit",
        mission_statement: "Promoting active collaborative philanthropy by aligning capital incentives with pre-fabricated speed to achieve post-scarcity 'Elevation to Eden'.",
        collateral_type: "Cash Contribution",
        collateral_value: 1800000,
        approved_loans: 1500000,
        signed_contract: 1,
        contract_date: "2025-06-15",
        shares: 25.7,
        impact_summary: "Supplied the principal liquid collateral backing for development loans and structured the automated reinvestment engines for rental collections."
      },
      {
        id: "stk-3",
        name: "Stellar Active Philanthropy Fund",
        type: "Philanthropist",
        mission_statement: "Deploying individual and foundation wealth into high-yield social utilities, creating sustainable community wealth rather than passive charity.",
        collateral_type: "Real Estate Asset",
        collateral_value: 1200000,
        approved_loans: 1000000,
        signed_contract: 1,
        contract_date: "2025-07-02",
        shares: 17.1,
        impact_summary: "Pledged legal ownership of commercial properties as loan guarantees, enabling 2.1% low-interest rate structures for rapid precast modules."
      },
      {
        id: "stk-4",
        name: "Broad Group Prefab Technologies",
        type: "Private Company",
        mission_statement: "To provide world-leading multi-story modular steel building structures manufactured off-site in days, guaranteeing maximum speed, quality, and thermal efficiency.",
        collateral_type: "Sovereign/Corporate Guarantee",
        collateral_value: 1500000,
        approved_loans: 1200000,
        signed_contract: 1,
        contract_date: "2025-06-15",
        shares: 21.4,
        impact_summary: "Delivered 120 structural components for Symphony Tower A, demonstrating pre-fabricated safety and zero carbon waste during assembly."
      }
    ];

    for (const stk of initialStakeholders) {
      await db.run(
        `INSERT INTO stakeholders (id, name, type, mission_statement, collateral_type, collateral_value, approved_loans, signed_contract, contract_date, shares, impact_summary)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [stk.id, stk.name, stk.type, stk.mission_statement, stk.collateral_type, stk.collateral_value, stk.approved_loans, stk.signed_contract, stk.contract_date, stk.shares, stk.impact_summary]
      );
    }

    const initialProjects: DbProject[] = [
      {
        id: "proj-1",
        ehp_id: "ehp-1",
        name: "Symphony Prefab Tower A",
        location: "Boa Viagem Core, Recife, PE",
        image_url: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80",
        status: "Prefab Assembly",
        total_cost: 3200000,
        loan_approved: 2800000,
        loan_disbursed: 1800000,
        loan_remaining: 1000000,
        interest_rate: 2.5,
        start_date: "2026-01-10",
        completion_date: "2026-08-30",
        construction_method: "BROAD Group T30 Multi-Story Stainless Steel Prefab System",
        latitude: -8.1136,
        longitude: -34.8998,
        model_3d_type: "broad_t30"
      },
      {
        id: "proj-2",
        ehp_id: "ehp-1",
        name: "Eden Heights Block 1",
        location: "Olinda North, Recife, PE",
        image_url: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=800&q=80",
        status: "Completed & Occupied",
        total_cost: 2600000,
        loan_approved: 2200000,
        loan_disbursed: 2200000,
        loan_remaining: 0,
        interest_rate: 2.1,
        start_date: "2025-07-15",
        completion_date: "2025-12-20",
        construction_method: "Ultra-Lightweight Pre-cast Carbon Reinforced Framing Assembly",
        latitude: -7.9986,
        longitude: -34.8461,
        model_3d_type: "modular_cube"
      },
      {
        id: "proj-3",
        ehp_id: "ehp-2",
        name: "São Paulo Aurora Block",
        location: "Paraisopolis Central, São Paulo, SP",
        image_url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
        status: "Planning & Design",
        total_cost: 4500000,
        loan_approved: 4000000,
        loan_disbursed: 500000,
        loan_remaining: 3500000,
        interest_rate: 2.0,
        start_date: "2026-07-01",
        completion_date: "2027-02-15",
        construction_method: "BROAD Quick-Build Pre-fabricated Matrix Columns",
        latitude: -23.6151,
        longitude: -46.7265,
        model_3d_type: "eco_dome"
      }
    ];

    for (const proj of initialProjects) {
      await db.run(
        `INSERT INTO projects (id, ehp_id, name, location, image_url, status, total_cost, loan_approved, loan_disbursed, loan_remaining, interest_rate, start_date, completion_date, construction_method, latitude, longitude, model_3d_type)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [proj.id, proj.ehp_id, proj.name, proj.location, proj.image_url, proj.status, proj.total_cost, proj.loan_approved, proj.loan_disbursed, proj.loan_remaining, proj.interest_rate, proj.start_date, proj.completion_date, proj.construction_method, proj.latitude, proj.longitude, proj.model_3d_type]
      );
    }

    const initialMilestones: DbMilestone[] = [
      { id: "m-101", project_id: "proj-1", title: "Site Excavation & Foundations", description: "Piling and installing main support pillars in Boa Viagem soil", target_date: "2026-02-15", status: "Completed" },
      { id: "m-102", project_id: "proj-1", title: "BROAD Steel Modules Delivery", description: "Shipment arrived at Suape port and transported to site", target_date: "2026-04-10", status: "Completed" },
      { id: "m-103", project_id: "proj-1", title: "Erection of Floors 1-15", description: "Assembling modular steel levels using crane coordination", target_date: "2026-06-20", status: "In Progress" },
      { id: "m-104", project_id: "proj-1", title: "HVAC and Smart Solar Pumps Integration", description: "Fitting solar tiles and internal pipelines", target_date: "2026-07-25", status: "Pending" },
      { id: "m-105", project_id: "proj-1", title: "Tenant Onboarding & Key Transfer", description: "Final structural audits and lease handovers", target_date: "2026-08-30", status: "Pending" },
      { id: "m-201", project_id: "proj-2", title: "Land Clearing Olinda CLT", description: "Securing environmental permits and clearance", target_date: "2025-07-30", status: "Completed" },
      { id: "m-202", project_id: "proj-2", title: "Carbon Panel Assembly", description: "Laying modular pre-cast carbon blocks on main foundation", target_date: "2025-10-15", status: "Completed" },
      { id: "m-203", project_id: "proj-2", title: "Greywater Reclaiming Circuitry", description: "Installing ecological recycling tubes and sub-filtration storage", target_date: "2025-11-30", status: "Completed" },
      { id: "m-204", project_id: "proj-2", title: "Inauguration and Dedication", description: "Stellarium Foundation ceremonial ribbon-cutting", target_date: "2025-12-20", status: "Completed" },
      { id: "m-301", project_id: "proj-3", title: "Shared Covenant Approval", description: "Obtaining joint signatures from SP Secretariat and private lenders", target_date: "2026-05-10", status: "Completed" },
      { id: "m-302", project_id: "proj-3", title: "Soil Compaction", description: "Testing high-density clay in Paraisopolis valley", target_date: "2026-07-15", status: "Pending" },
      { id: "m-303", project_id: "proj-3", title: "First Batch Module Assembly", description: "On-site crane placement of prefabricated units", target_date: "2026-10-01", status: "Pending" }
    ];

    for (const m of initialMilestones) {
      await db.run(
        `INSERT INTO milestones (id, project_id, title, description, target_date, status)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [m.id, m.project_id, m.title, m.description, m.target_date, m.status]
      );
    }

    const initialUnits: DbUnit[] = [
      { id: "u-101", project_id: "proj-1", unit_number: "A-101", type: "Studio", price: 320, market_price: 950, status: "Available", tenant_name: null, subsidy_granted: 630, purchase_date: null },
      { id: "u-102", project_id: "proj-1", unit_number: "A-102", type: "1-Bedroom", price: 450, market_price: 1200, status: "Leased", tenant_name: "Clara Santos", subsidy_granted: 750, purchase_date: "2026-03-01" },
      { id: "u-103", project_id: "proj-1", unit_number: "A-103", type: "2-Bedroom", price: 580, market_price: 1550, status: "Available", tenant_name: null, subsidy_granted: 970, purchase_date: null },
      { id: "u-104", project_id: "proj-1", unit_number: "A-104", type: "3-Bedroom", price: 750, market_price: 2100, status: "Available", tenant_name: null, subsidy_granted: 1350, purchase_date: null },
      { id: "u-105", project_id: "proj-1", unit_number: "A-201", type: "Studio", price: 320, market_price: 950, status: "Leased", tenant_name: "Davi Lima", subsidy_granted: 630, purchase_date: "2026-04-12" },
      { id: "u-201", project_id: "proj-2", unit_number: "EH-101", type: "1-Bedroom", price: 400, market_price: 1100, status: "Leased", tenant_name: "Maria Eduarda Silva", subsidy_granted: 700, purchase_date: "2025-12-24" },
      { id: "u-202", project_id: "proj-2", unit_number: "EH-102", type: "2-Bedroom", price: 520, market_price: 1400, status: "Sold", tenant_name: "Gabriel & Amanda Alencar", subsidy_granted: 880, purchase_date: "2025-12-28" },
      { id: "u-203", project_id: "proj-2", unit_number: "EH-103", type: "3-Bedroom", price: 680, market_price: 1900, status: "Leased", tenant_name: "Ana Paula Souza", subsidy_granted: 1220, purchase_date: "2026-01-05" },
      { id: "u-204", project_id: "proj-2", unit_number: "EH-201", type: "Studio", price: 300, market_price: 880, status: "Leased", tenant_name: "Filipe Gouveia", subsidy_granted: 580, purchase_date: "2026-01-15" }
    ];

    for (const u of initialUnits) {
      await db.run(
        `INSERT INTO housing_units (id, project_id, unit_number, type, price, market_price, status, tenant_name, subsidy_granted, purchase_date)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [u.id, u.project_id, u.unit_number, u.type, u.price, u.market_price, u.status, u.tenant_name, u.subsidy_granted, u.purchase_date]
      );
    }

    const initialTransactions: DbTransaction[] = [
      { id: "t-001", project_id: "proj-1", type: "Disbursement", amount: 1000000, date: "2026-01-15", description: "Initial foundations setup disbursement" },
      { id: "t-002", project_id: "proj-1", type: "Disbursement", amount: 800000, date: "2026-04-12", description: "Suape modular core custom clearance disbursement" },
      { id: "t-003", project_id: "proj-2", type: "Disbursement", amount: 2200000, date: "2025-07-20", description: "Complete project assembly disbursement" },
      { id: "t-004", project_id: "proj-2", type: "Repayment", amount: 150000, date: "2026-02-01", description: "Initial tenant rents reinvestment pool allocation" },
      { id: "t-005", project_id: "proj-2", type: "Repayment", amount: 180000, date: "2026-05-01", description: "Spring quarters rental revenue repayment collection" },
      { id: "t-006", project_id: "proj-3", type: "Disbursement", amount: 500000, date: "2026-05-15", description: "Pre-development architectural schema fee" }
    ];

    for (const tx of initialTransactions) {
      await db.run(
        `INSERT INTO financial_transactions (id, project_id, type, amount, date, description)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [tx.id, tx.project_id, tx.type, tx.amount, tx.date, tx.description]
      );
    }

    const initialSchedules: DbRepaymentSchedule[] = [
      { id: "rs-101", project_id: "proj-1", due_date: "2026-07-01", amount_due: 45000, interest_accrued: 3750, status: "Upcoming" },
      { id: "rs-102", project_id: "proj-1", due_date: "2026-08-01", amount_due: 45000, interest_accrued: 3750, status: "Upcoming" },
      { id: "rs-201", project_id: "proj-2", due_date: "2026-01-01", amount_due: 150000, interest_accrued: 0, status: "Paid" },
      { id: "rs-202", project_id: "proj-2", due_date: "2026-04-01", amount_due: 180000, interest_accrued: 0, status: "Paid" },
      { id: "rs-203", project_id: "proj-2", due_date: "2026-07-01", amount_due: 80000, interest_accrued: 0, status: "Upcoming" },
      { id: "rs-301", project_id: "proj-3", due_date: "2026-09-01", amount_due: 12000, interest_accrued: 830, status: "Upcoming" }
    ];

    for (const rs of initialSchedules) {
      await db.run(
        `INSERT INTO repayment_schedules (id, project_id, due_date, amount_due, interest_accrued, status)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [rs.id, rs.project_id, rs.due_date, rs.amount_due, rs.interest_accrued, rs.status]
      );
    }
  }

  return db;
}

// ============================================
// SETUP HONO APP
// ============================================
const app = new Hono();

// Global error handler
app.onError((err, c) => {
  console.error("Unhandled error:", err);
  return c.json({ error: err instanceof Error ? err.message : "Internal server error" }, 500);
});

// Initialize SQLite Connection
const db = await initDb();

// ============================================
// API ENDPOINTS
// ============================================

// 1. STAKEHOLDERS (PLEDGERS) ENDPOINTS
app.get("/api/stakeholders", async (c) => {
  try {
    const stakeholders = await db.all("SELECT * FROM stakeholders ORDER BY collateral_value DESC");
    return c.json(stakeholders);
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

app.post("/api/stakeholders", async (c) => {
  try {
    const { name, type, mission_statement, collateral_type, collateral_value, approved_loans, signed_contract, contract_date, impact_summary } = await c.req.json();
    const id = `stk-${Date.now()}`;

    const stats = await db.get("SELECT SUM(collateral_value) as total FROM stakeholders");
    const currentTotal = (stats.total || 0) + Number(collateral_value);
    const shares = currentTotal > 0 ? Number(((Number(collateral_value) / currentTotal) * 100).toFixed(1)) : 100;

    await db.run(
      `INSERT INTO stakeholders (id, name, type, mission_statement, collateral_type, collateral_value, approved_loans, signed_contract, contract_date, shares, impact_summary)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, name, type, mission_statement, collateral_type, Number(collateral_value), Number(approved_loans), signed_contract ? 1 : 0, contract_date, shares, impact_summary]
    );

    const allStks = await db.all("SELECT * FROM stakeholders");
    const nextTotal = allStks.reduce((sum, item) => sum + item.collateral_value, 0);
    for (const item of allStks) {
      const nextShare = nextTotal > 0 ? Number(((item.collateral_value / nextTotal) * 100).toFixed(1)) : 0;
      await db.run("UPDATE stakeholders SET shares = ? WHERE id = ?", [nextShare, item.id]);
    }

    const created = await db.get("SELECT * FROM stakeholders WHERE id = ?", [id]);
    return c.json(created, 201);
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

app.put("/api/stakeholders/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const { name, type, mission_statement, collateral_type, collateral_value, approved_loans, signed_contract, contract_date, impact_summary } = await c.req.json();

    await db.run(
      `UPDATE stakeholders
       SET name = ?, type = ?, mission_statement = ?, collateral_type = ?, collateral_value = ?, approved_loans = ?, signed_contract = ?, contract_date = ?, impact_summary = ?
       WHERE id = ?`,
      [name, type, mission_statement, collateral_type, Number(collateral_value), Number(approved_loans), signed_contract ? 1 : 0, contract_date, impact_summary, id]
    );

    const allStks = await db.all("SELECT * FROM stakeholders");
    const nextTotal = allStks.reduce((sum, item) => sum + item.collateral_value, 0);
    for (const item of allStks) {
      const nextShare = nextTotal > 0 ? Number(((item.collateral_value / nextTotal) * 100).toFixed(1)) : 0;
      await db.run("UPDATE stakeholders SET shares = ? WHERE id = ?", [nextShare, item.id]);
    }

    const updated = await db.get("SELECT * FROM stakeholders WHERE id = ?", [id]);
    return c.json(updated);
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// 2. PROJECTS ENDPOINTS
app.get("/api/projects", async (c) => {
  try {
    const projects = await db.all("SELECT * FROM projects");
    return c.json(projects);
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

app.post("/api/projects", async (c) => {
  try {
    const { name, location, image_url, status, total_cost, loan_approved, loan_disbursed, interest_rate, start_date, completion_date, construction_method, latitude, longitude, model_3d_type } = await c.req.json();
    const id = `proj-${Date.now()}`;
    const loanRemaining = Number(loan_approved) - Number(loan_disbursed || 0);

    await db.run(
      `INSERT INTO projects (id, ehp_id, name, location, image_url, status, total_cost, loan_approved, loan_disbursed, loan_remaining, interest_rate, start_date, completion_date, construction_method, latitude, longitude, model_3d_type)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, "ehp-1", name, location, image_url, status, Number(total_cost), Number(loan_approved), Number(loan_disbursed || 0), loanRemaining, Number(interest_rate || 2.5), start_date, completion_date, construction_method, Number(latitude || -8.0), Number(longitude || -34.9), model_3d_type || "broad_t30"]
    );

    const milestones = [
      { id: `m-aut1-${Date.now()}`, title: "Site Assessment & Clearances", desc: "Verifying local zoning regulations and soil compact integrity" },
      { id: `m-aut2-${Date.now()}`, title: "Modular Framework Delivery", desc: "Transporting pre-fabricated components from factory to project location" },
      { id: `m-aut3-${Date.now()}`, title: "Structural Rigging & Fitting", desc: "Crane-assisted assembly and joining of modular steel frames" }
    ];

    for (const m of milestones) {
      await db.run(
        "INSERT INTO milestones (id, project_id, title, description, target_date, status) VALUES (?, ?, ?, ?, ?, ?)",
        [m.id, id, m.title, m.desc, start_date, "Pending"]
      );
    }

    const created = await db.get("SELECT * FROM projects WHERE id = ?", [id]);
    return c.json(created, 201);
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

app.put("/api/projects/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const { name, location, status, total_cost, loan_approved, loan_disbursed, interest_rate, start_date, completion_date, construction_method, model_3d_type } = await c.req.json();
    const loanRemaining = Number(loan_approved) - Number(loan_disbursed || 0);

    await db.run(
      `UPDATE projects
       SET name = ?, location = ?, status = ?, total_cost = ?, loan_approved = ?, loan_disbursed = ?, loan_remaining = ?, interest_rate = ?, start_date = ?, completion_date = ?, construction_method = ?, model_3d_type = ?
       WHERE id = ?`,
      [name, location, status, Number(total_cost), Number(loan_approved), Number(loan_disbursed || 0), loanRemaining, Number(interest_rate), start_date, completion_date, construction_method, model_3d_type || "broad_t30", id]
    );
    const updated = await db.get("SELECT * FROM projects WHERE id = ?", [id]);
    return c.json(updated);
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// 3. PROJECT MILESTONES
app.get("/api/projects/:projectId/milestones", async (c) => {
  try {
    const projectId = c.req.param("projectId");
    const milestones = await db.all("SELECT * FROM milestones WHERE project_id = ? ORDER BY target_date ASC", [projectId]);
    return c.json(milestones);
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

app.post("/api/milestones", async (c) => {
  try {
    const { project_id, title, description, target_date, status } = await c.req.json();
    const id = `m-${Date.now()}`;
    await db.run(
      "INSERT INTO milestones (id, project_id, title, description, target_date, status) VALUES (?, ?, ?, ?, ?, ?)",
      [id, project_id, title, description, target_date, status || "Pending"]
    );
    const created = await db.get("SELECT * FROM milestones WHERE id = ?", [id]);
    return c.json(created, 201);
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

app.put("/api/milestones/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const { title, description, target_date, status } = await c.req.json();
    await db.run(
      "UPDATE milestones SET title = ?, description = ?, target_date = ?, status = ? WHERE id = ?",
      [title, description, target_date, status, id]
    );
    const updated = await db.get("SELECT * FROM milestones WHERE id = ?", [id]);
    return c.json(updated);
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// 4. HOUSING UNITS
app.get("/api/units", async (c) => {
  try {
    const units = await db.all(`
      SELECT hu.*, p.name as projectName
      FROM housing_units hu
      JOIN projects p ON hu.project_id = p.id
      ORDER BY hu.unit_number ASC
    `);
    return c.json(units);
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

app.post("/api/units", async (c) => {
  try {
    const { project_id, unit_number, type, price, market_price, status, tenant_name } = await c.req.json();
    const id = `u-${Date.now()}`;
    const subsidy = Math.max(0, Number(market_price) - Number(price));
    const purchaseDate = status !== "Available" ? new Date().toISOString().split("T")[0] : null;

    await db.run(
      `INSERT INTO housing_units (id, project_id, unit_number, type, price, market_price, status, tenant_name, subsidy_granted, purchase_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, project_id, unit_number, type, Number(price), Number(market_price), status, tenant_name || null, subsidy, purchaseDate]
    );
    const created = await db.get("SELECT * FROM housing_units WHERE id = ?", [id]);
    return c.json(created, 201);
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

app.put("/api/units/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const { price, market_price, status, tenant_name } = await c.req.json();
    const subsidy = Math.max(0, Number(market_price) - Number(price));
    const purchaseDate = status !== "Available" ? new Date().toISOString().split("T")[0] : null;

    await db.run(
      `UPDATE housing_units
       SET price = ?, market_price = ?, status = ?, tenant_name = ?, subsidy_granted = ?, purchase_date = ?
       WHERE id = ?`,
      [Number(price), Number(market_price), status, tenant_name || null, subsidy, purchaseDate, id]
    );
    const updated = await db.get("SELECT * FROM housing_units WHERE id = ?", [id]);
    return c.json(updated);
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// 5. FINANCIAL SYSTEMS
app.get("/api/financials/summary", async (c) => {
  try {
    const projects = await db.all("SELECT * FROM projects");
    const transactions = await db.all("SELECT * FROM financial_transactions");
    const schedules = await db.all("SELECT * FROM repayment_schedules");

    let totalLoansDisbursed = 0;
    let totalRepaymentsReceived = 0;
    let totalInterestAccrued = 0;

    for (const p of projects) {
      totalLoansDisbursed += p.loan_disbursed;
    }

    for (const tx of transactions) {
      if (tx.type === "Repayment") {
        totalRepaymentsReceived += tx.amount;
      } else if (tx.type === "Interest Accrual") {
        totalInterestAccrued += tx.amount;
      }
    }

    const unpaidScheduledInterest = schedules
      .filter((s) => s.status !== "Paid")
      .reduce((sum, s) => sum + s.interest_accrued, 0);

    const netOutstandingDebt = Math.max(0, (totalLoansDisbursed + totalInterestAccrued) - totalRepaymentsReceived);

    const now = new Date();
    const upcomingPayments = schedules.filter((s) => {
      const dueDate = new Date(s.due_date);
      const diffTime = dueDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return s.status !== "Paid" && diffDays <= 45;
    });

    return c.json({
      totalLoansDisbursed,
      totalRepaymentsReceived,
      totalInterestAccrued: totalInterestAccrued + unpaidScheduledInterest,
      netOutstandingDebt,
      upcomingPaymentsAlerts: upcomingPayments
    });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

app.post("/api/financials/disburse", async (c) => {
  try {
    const { project_id, amount, date, description } = await c.req.json();
    const proj = await db.get("SELECT * FROM projects WHERE id = ?", [project_id]);
    if (!proj) return c.json({ error: "Project not found" }, 404);

    const newDisbursed = proj.loan_disbursed + Number(amount);
    const newRemaining = proj.loan_approved - newDisbursed;

    if (newDisbursed > proj.loan_approved) {
      return c.json({ error: `Disbursement amount exceeds authorized loan cap ($${proj.loan_approved.toLocaleString()})` }, 400);
    }

    await db.run(
      "UPDATE projects SET loan_disbursed = ?, loan_remaining = ? WHERE id = ?",
      [newDisbursed, newRemaining, project_id]
    );

    const txId = `tx-dis-${Date.now()}`;
    await db.run(
      "INSERT INTO financial_transactions (id, project_id, type, amount, date, description) VALUES (?, ?, ?, ?, ?, ?)",
      [txId, project_id, "Disbursement", Number(amount), date || new Date().toISOString().split("T")[0], description || "Modular development loan disbursement"]
    );

    return c.json({ success: true, disbursed: newDisbursed, remaining: newRemaining });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

app.post("/api/financials/accrue-interest", async (c) => {
  try {
    const projects = await db.all("SELECT * FROM projects");
    const accrualDate = new Date().toISOString().split("T")[0];
    const details: any[] = [];

    for (const p of projects) {
      if (p.loan_disbursed > 0) {
        const monthlyRate = (p.interest_rate / 100) / 12;
        const accrued = Math.round(p.loan_disbursed * monthlyRate);

        if (accrued > 0) {
          const txId = `tx-int-${Date.now()}-${p.id}`;
          await db.run(
            "INSERT INTO financial_transactions (id, project_id, type, amount, date, description) VALUES (?, ?, ?, ?, ?, ?)",
            [txId, p.id, "Interest Accrual", accrued, accrualDate, `Compounded monthly interest accrual (${p.interest_rate}%)`]
          );

          const rsId = `rs-int-${Date.now()}-${p.id}`;
          const upcomingDueDate = new Date();
          upcomingDueDate.setMonth(upcomingDueDate.getMonth() + 1);

          await db.run(
            "INSERT INTO repayment_schedules (id, project_id, due_date, amount_due, interest_accrued, status) VALUES (?, ?, ?, ?, ?, ?)",
            [rsId, p.id, upcomingDueDate.toISOString().split("T")[0], accrued + 15000, accrued, "Upcoming"]
          );

          details.push({ project: p.name, interestAccrued: accrued, scheduledDueDate: upcomingDueDate.toISOString().split("T")[0] });
        }
      }
    }

    return c.json({ success: true, accruedAt: accrualDate, details });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

app.post("/api/financials/repay", async (c) => {
  try {
    const { project_id, amount, schedule_id, date, description } = await c.req.json();
    const txId = `tx-rep-${Date.now()}`;
    await db.run(
      "INSERT INTO financial_transactions (id, project_id, type, amount, date, description) VALUES (?, ?, ?, ?, ?, ?)",
      [txId, project_id, "Repayment", Number(amount), date || new Date().toISOString().split("T")[0], description || "Rental reinvestment pool repayment collection"]
    );

    if (schedule_id) {
      await db.run(
        "UPDATE repayment_schedules SET status = 'Paid' WHERE id = ?",
        [schedule_id]
      );
    }

    return c.json({ success: true, amountPaid: amount });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

app.get("/api/repayments", async (c) => {
  try {
    const list = await db.all(`
      SELECT rs.*, p.name as projectName
      FROM repayment_schedules rs
      JOIN projects p ON rs.project_id = p.id
      ORDER BY rs.due_date ASC
    `);
    return c.json(list);
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

app.get("/api/transactions", async (c) => {
  try {
    const list = await db.all(`
      SELECT t.*, p.name as projectName
      FROM financial_transactions t
      JOIN projects p ON t.project_id = p.id
      ORDER BY t.date DESC
    `);
    return c.json(list);
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// ============================================
// STATIC FILE SERVING (Bun-built assets in dist/)
// ============================================

// Serve static files from dist/ (Vite build output)
app.get("*", serveStatic({ root: "./dist" }));

// SPA fallback: serve index.html for all non-API routes
// serveStatic passes through if file doesn't exist
app.get("*", async (c) => {
  if (!c.req.path.startsWith("/api")) {
    const file = Bun.file("./dist/index.html");
    if (await file.exists()) {
      return c.html(await file.text());
    }
    return c.text("index.html not found - have you built the frontend? (bun run build)", 503);
  }
  return c.notFound();
});

// ============================================
// START SERVER
// ============================================
export default {
  port: PORT,
  hostname: "0.0.0.0",
  fetch: app.fetch,
};

console.log(`EHP Enterprise Portal server actively listening at http://localhost:${PORT}`);
