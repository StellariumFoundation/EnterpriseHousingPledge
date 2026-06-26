<script>
  import { onMount } from "svelte";
  import {
    INITIAL_PLEDGES,
    INITIAL_PLEDGERS,
    INITIAL_PROJECTS,
    INITIAL_UNITS,
  } from "./data/mockData";
  import { api } from "./api";
  import BottomNavbar from "./components/BottomNavbar.svelte";
  import DashboardScreen from "./components/DashboardScreen.svelte";
  import PledgersScreen from "./components/PledgersScreen.svelte";
  import ProjectsScreen from "./components/ProjectsScreen.svelte";
  import UnitsScreen from "./components/UnitsScreen.svelte";
  import stellariumLogo from "./assets/images/logo.jpg";
  import {
    HelpCircle,
    ChevronRight,
    Award,
    Sparkles,
    Heart,
    Scale,
    Database,
    Loader2,
  } from "lucide-svelte";

  let activeScreen = $state("dashboard");
  let showConceptModal = $state(false);
  let loading = $state(true);
  let error = $state(null);

  // Core Data States with LocalStorage Backup
  let pledges = $state(
    JSON.parse(localStorage.getItem("ehp_pledges") || "null") ||
      INITIAL_PLEDGES,
  );
  let pledgers = $state([]);
  let projects = $state([]);
  let units = $state([]);

  // Persist to localStorage reactively
  $effect(() => {
    localStorage.setItem("ehp_pledges", JSON.stringify(pledges));
  });
  $effect(() => {
    if (pledgers.length > 0)
      localStorage.setItem("ehp_pledgers", JSON.stringify(pledgers));
  });
  $effect(() => {
    if (projects.length > 0)
      localStorage.setItem("ehp_projects", JSON.stringify(projects));
  });
  $effect(() => {
    if (units.length > 0)
      localStorage.setItem("ehp_units", JSON.stringify(units));
  });

  // Recalculate Share Ratios
  let updatedPledgersWithShares = $derived(
    (() => {
      const totalVal = pledgers.reduce(
        (sum, p) => sum + p.collateralValue,
        0,
      );
      return pledgers.map((p) => ({
        ...p,
        shares: totalVal
          ? Number(((p.collateralValue / totalVal) * 100).toFixed(1))
          : 0,
      }));
    })(),
  );

  // DB Sync
  async function fetchAllDataFromDb() {
    loading = true;
    try {
      const [stkData, projData, unitData] = await Promise.all([
        api.getStakeholders(),
        api.getProjects(),
        api.getUnits(),
      ]);
      pledgers = stkData;
      projects = projData;
      units = unitData;
      error = null;
    } catch (err) {
      console.error("Failed to fetch EHP database:", err);
      error = "SQLite Database connection offline. Using mock values.";
      const localStk = localStorage.getItem("ehp_pledgers");
      const localProj = localStorage.getItem("ehp_projects");
      const localUnits = localStorage.getItem("ehp_units");
      pledgers = localStk ? JSON.parse(localStk) : INITIAL_PLEDGERS;
      projects = localProj ? JSON.parse(localProj) : INITIAL_PROJECTS;
      units = localUnits ? JSON.parse(localUnits) : INITIAL_UNITS;
    } finally {
      loading = false;
    }
  }

  onMount(() => {
    fetchAllDataFromDb();
  });

  function handleAddPledge(newPledge) {
    pledges = [newPledge, ...pledges];
  }

  async function handleAddPledger(newPledger) {
    try {
      await api.createStakeholder(newPledger);
      await fetchAllDataFromDb();
    } catch (err) {
      pledgers = [newPledger, ...pledgers];
    }
  }

  async function handleUpdatePledger(updatedPledger) {
    try {
      await api.updateStakeholder(updatedPledger.id, updatedPledger);
      await fetchAllDataFromDb();
    } catch (err) {
      pledgers = pledgers.map((p) =>
        p.id === updatedPledger.id ? updatedPledger : p,
      );
    }
  }

  async function handleAddProject(newProj) {
    try {
      await api.createProject(newProj);
      await fetchAllDataFromDb();
    } catch (err) {
      projects = [newProj, ...projects];
    }
  }

  async function handleUpdateProject(updatedProj) {
    try {
      await api.updateProject(updatedProj.id, updatedProj);
      await fetchAllDataFromDb();
    } catch (err) {
      projects = projects.map((p) =>
        p.id === updatedProj.id ? updatedProj : p,
      );
    }
  }

  async function handleAddUnit(newUnit) {
    try {
      await api.createUnit(newUnit);
      await fetchAllDataFromDb();
    } catch (err) {
      units = [newUnit, ...units];
    }
  }

  async function handleUpdateUnit(updatedUnit) {
    try {
      await api.updateUnit(updatedUnit.id, updatedUnit);
      await fetchAllDataFromDb();
    } catch (err) {
      units = units.map((u) => (u.id === updatedUnit.id ? updatedUnit : u));
    }
  }
</script>

<div
  class="min-h-screen bg-[#0b0f19] text-slate-100 font-sans antialiased selection:bg-teal-500/20 selection:text-teal-400"
>
  <!-- Top Brand Banner -->
  <header
    class="sticky top-0 z-40 bg-[#070b13]/90 backdrop-blur-md border-b border-slate-800/80 px-4 py-3"
  >
    <div class="max-w-6xl mx-auto flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div
          class="relative w-10 h-10 rounded-full overflow-hidden border border-teal-500/30 shadow-[0_0_15px_rgba(20,184,166,0.25)] bg-slate-950 shrink-0"
        >
          <img
            src={stellariumLogo}
            alt="Stellarium Foundation Logo"
            class="w-full h-full object-cover"
            referrerpolicy="no-referrer"
          />
        </div>
        <div>
          <span
            class="text-xs uppercase tracking-widest font-space font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-pink-400 to-amber-300 block leading-none pb-0.5"
          >
            Stellarium Foundation
          </span>
          <span class="text-[10px] font-mono text-slate-400 tracking-wider block">
            Enterprise Housing Pledge (EHP)
          </span>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <span class="hidden sm:inline-block text-[10px] uppercase font-mono tracking-wider text-slate-500">
          “Do Good • Make Money • Have Fun”
        </span>

        <button
          onclick={() => (showConceptModal = true)}
          class="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-700 transition-all cursor-pointer"
          id="concept-ref-btn"
        >
          <HelpCircle class="w-4 h-4" />
          <span>Concept Reference</span>
        </button>
      </div>
    </div>
  </header>

  <!-- Main Core Router -->
  <main class="min-h-[calc(100vh-130px)] space-y-4">
    <!-- SQLite Status Badge -->
    <div class="max-w-6xl mx-auto px-4 pt-4">
      {#if !error}
        <div
          class="flex items-center gap-1.5 px-3 py-1 bg-teal-500/5 border border-teal-500/10 rounded-lg text-[10px] font-mono text-teal-400/80 w-fit"
        >
          <span class="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
          <Database class="w-3 h-3" />
          <span>SQLite Database actively synchronized (ehp.db)</span>
        </div>
      {:else}
        <div
          class="flex items-center gap-1.5 px-3 py-1 bg-amber-500/5 border border-amber-500/10 rounded-lg text-[10px] font-mono text-amber-400/80 w-fit"
        >
          <span class="w-1.5 h-1.5 rounded-full bg-amber-400" />
          <Database class="w-3 h-3" />
          <span>SQLite Server Offline. Running in Local Client Storage Sandbox.</span>
        </div>
      {/if}
    </div>

    {#if loading}
      <div class="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Loader2 class="w-8 h-8 text-teal-400 animate-spin" />
        <p class="text-xs font-mono text-slate-400">
          Querying Enterprise SQLite Database...
        </p>
      </div>
    {:else}
      {#if activeScreen === "dashboard"}
        <DashboardScreen
          {pledges}
          pledgers={updatedPledgersWithShares}
          {projects}
          {units}
          onAddPledge={handleAddPledge}
          onRefreshData={fetchAllDataFromDb}
        />
      {/if}

      {#if activeScreen === "pledgers"}
        <PledgersScreen
          pledgers={updatedPledgersWithShares}
          onAddPledger={handleAddPledger}
          onUpdatePledger={handleUpdatePledger}
        />
      {/if}

      {#if activeScreen === "projects"}
        <ProjectsScreen
          {projects}
          onAddProject={handleAddProject}
          onUpdateProject={handleUpdateProject}
        />
      {/if}

      {#if activeScreen === "units"}
        <UnitsScreen
          {units}
          {projects}
          onAddUnit={handleAddUnit}
          onUpdateUnit={handleUpdateUnit}
        />
      {/if}
    {/if}
  </main>

  <!-- Concept reference Modal -->
  {#if showConceptModal}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <div
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto"
      onclick={() => (showConceptModal = false)}
      id="concept-modal-overlay"
    >
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <div
        class="bg-slate-900 border border-slate-800 max-w-2xl w-full rounded-2xl p-6 md:p-8 space-y-6 shadow-2xl relative"
        onclick={(e) => e.stopPropagation()}
        id="concept-modal-content"
      >
        <div class="flex justify-between items-start">
          <div class="flex items-center gap-2">
            <Award class="w-6 h-6 text-amber-400" />
            <h3 class="text-lg font-bold text-white font-sans tracking-tight">
              EHP Active Philanthropy Concept
            </h3>
          </div>
          <button
            onclick={() => (showConceptModal = false)}
            class="text-slate-400 hover:text-slate-200 font-mono text-sm"
          >
            ✕ Close
          </button>
        </div>

        <div
          class="space-y-4 text-xs md:text-sm text-slate-300 leading-relaxed font-sans overflow-y-auto max-h-[70vh] pr-2"
        >
          <div
            class="p-4 bg-slate-955 rounded-xl border border-slate-850 space-y-2"
          >
            <span
              class="text-xs uppercase font-mono text-teal-400 font-bold flex items-center gap-1"
            >
              <Sparkles class="w-4 h-4" />
              A Revolutionary Model for Affordable Housing
            </span>
            <p class="text-xs">
              The Enterprise Housing Pledge (EHP) merges public authority assets,
              nonprofit agility, philanthropists' goodwill, and private enterprise
              guarantees into a unified corporate model.
            </p>
          </div>

          <div class="space-y-2">
            <h4 class="font-bold text-white font-sans flex items-center gap-1.5">
              <ChevronRight class="w-4 h-4 text-teal-400 shrink-0" />
              1. Pooling Assets & Guaranteeing Collateral
            </h4>
            <p class="pl-5 text-xs text-slate-400">
              Multiple entities pledge cash, property, land, or corporate backing as
              pooled collateral. This minimizes developer risk ratios, allowing them to
              secure low-interest construction loans from national and developmental
              banks.
            </p>
          </div>

          <div class="space-y-2">
            <h4 class="font-bold text-white font-sans flex items-center gap-1.5">
              <ChevronRight class="w-4 h-4 text-teal-400 shrink-0" />
              2. Pre-fabricated Engineering & Assembling
            </h4>
            <p class="pl-5 text-xs text-slate-400">
              Construction relies on pre-fabricated, modular residential blocks (such as
              those pioneered by BROAD Group) which are rapidly assembled on-site in a
              matter of days.
            </p>
          </div>

          <div class="space-y-2">
            <h4 class="font-bold text-white font-sans flex items-center gap-1.5">
              <ChevronRight class="w-4 h-4 text-teal-400 shrink-0" />
              3. The Reinvestment Rent Engine
            </h4>
            <p class="pl-5 text-xs text-slate-400">
              Occupancy rents are set far below local market rate but high enough to
              service operational costs and loan repayments. Rents feed back directly
              into the EHP Treasury.
            </p>
          </div>

          <div class="space-y-2">
            <h4 class="font-bold text-white font-sans flex items-center gap-1.5">
              <ChevronRight class="w-4 h-4 text-teal-400 shrink-0" />
              4. The Perpetually Self-Replenishing Cycle
            </h4>
            <p class="pl-5 text-xs text-slate-400">
              As soon as a project's developmental loan is fully repaid, the building
              remains a permanent asset of the EHP. The cash flow is diverted to lock in
              low rents permanently, or to be leveraged as collateral to fund new
              pre-fabricated modular block initiatives elsewhere.
            </p>
          </div>

          <div
            class="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500 font-mono"
          >
            <span class="flex items-center gap-1 text-rose-400/70">
              <Heart class="w-3.5 h-3.5 shrink-0" />
              Active Goodwill
            </span>
            <span class="flex items-center gap-1 text-teal-400/70">
              <Scale class="w-3.5 h-3.5 shrink-0" />
              Systemic Alignment
            </span>
          </div>
        </div>
      </div>
    </div>
  {/if}

  <!-- Bottom Sticky Selector -->
  <BottomNavbar {activeScreen} onScreenChange={(s) => (activeScreen = s)} />
</div>
