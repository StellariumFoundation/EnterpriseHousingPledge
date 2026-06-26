<script>
  import {
    DollarSign,
    TrendingUp,
    Percent,
    Layers,
    Briefcase,
    Play,
    Plus,
    Compass,
    Zap,
    Globe,
    Award,
  } from "lucide-svelte";
  import { fade, slide } from "svelte/transition";
  import TreasuryCenter from "./TreasuryCenter.svelte";
  import stellariumLogo from "../assets/images/logo.jpg";

  let {
    pledges,
    pledgers,
    projects,
    units,
    onAddPledge,
    onRefreshData,
  } = $props();

  let selectedPledgeId = $state(pledges[0]?.id || "");
  let isCreatingPledge = $state(false);
  let activeTab = $state("overview");

  // Keep selectedPledgeId in sync when pledges change
  $effect(() => {
    if (pledges.length > 0 && !pledges.find((p) => p.id === selectedPledgeId)) {
      selectedPledgeId = pledges[0].id;
    }
  });

  // New Pledge Form
  let newPledgeName = $state("");
  let newPledgeLocation = $state("");
  let newPledgeTarget = $state(5000000);
  let newPledgeInterest = $state(2.5);
  let newPledgeDescription = $state("");

  // Simulation params
  let simYears = $state(5);
  let simRentalRate = $state(450);
  let simOperationalRatio = $state(25);
  let simResult = $state(null);

  let currentPledge = $derived(
    pledges.find((p) => p.id === selectedPledgeId) || pledges[0],
  );

  let totalCollateralValue = $derived(
    pledgers.reduce((sum, p) => sum + p.collateralValue, 0),
  );

  let totalLoansApproved = $derived(
    pledgers.reduce((sum, p) => sum + p.approvedLoans, 0),
  );

  let totalProjectCosts = $derived(
    projects
      .filter((p) => p.ehpId === currentPledge?.id)
      .reduce((sum, p) => sum + p.totalCost, 0),
  );

  let pledgeProjects = $derived(
    projects.filter((p) => p.ehpId === currentPledge?.id),
  );

  let pledgeUnits = $derived(
    units.filter((u) => pledgeProjects.some((p) => p.id === u.projectId)),
  );

  let occupiedUnitsCount = $derived(
    pledgeUnits.filter(
      (u) =>
        u.status === "Leased Below-Market" ||
        u.status === "Sold & Transferred",
    ).length,
  );

  let totalSharesValue = $derived(
    pledgers.reduce((sum, p) => sum + p.collateralValue, 0),
  );

  function handleCreatePledge(e) {
    e.preventDefault();
    if (!newPledgeName || !newPledgeLocation) return;

    const newPledge = {
      id: `ehp-${Date.now()}`,
      name: newPledgeName,
      location: newPledgeLocation,
      targetFund: Number(newPledgeTarget),
      status: "Active",
      loanInterestRate: Number(newPledgeInterest),
      reinvestmentPool: 0,
      description: newPledgeDescription,
    };

    onAddPledge(newPledge);
    selectedPledgeId = newPledge.id;
    isCreatingPledge = false;
    newPledgeName = "";
    newPledgeLocation = "";
    newPledgeTarget = 5000000;
    newPledgeInterest = 2.5;
    newPledgeDescription = "";
  }

  function runSimulation() {
    const years = Number(simYears);
    const monthlyRent = Number(simRentalRate);
    const opRatio = Number(simOperationalRatio) / 100;
    const initialDebt = totalLoansApproved;
    const totalUnits = pledgeUnits.length || 20;

    let cumulativeRevenue = 0;
    let debtRemaining = initialDebt;
    let pool = currentPledge?.reinvestmentPool || 0;
    let additionalUnitsFunded = 0;
    let avgCostPerUnit = 150000;
    const results = [];

    for (let year = 1; year <= years; year++) {
      const annualRentIncome = totalUnits * monthlyRent * 12;
      const operationalCosts = annualRentIncome * opRatio;
      const netSurplus = annualRentIncome - operationalCosts;
      cumulativeRevenue += annualRentIncome;

      const annualDebtService = Math.min(
        debtRemaining * 0.15 +
          debtRemaining * ((currentPledge?.loanInterestRate || 2.5) / 100),
        debtRemaining,
      );
      debtRemaining = Math.max(0, debtRemaining - annualDebtService);

      const surplusToPool = netSurplus - annualDebtService;
      pool += Math.max(0, surplusToPool);

      if (pool >= avgCostPerUnit) {
        const newUnitsCount = Math.floor(pool / avgCostPerUnit);
        additionalUnitsFunded += newUnitsCount;
        pool = pool % avgCostPerUnit;
      }

      results.push({
        year,
        annualRevenue: annualRentIncome,
        debtRemaining,
        cumulativeSurplus: pool,
        additionalUnits: additionalUnitsFunded,
        totalNetAssetValue:
          totalUnits * avgCostPerUnit +
          additionalUnitsFunded * avgCostPerUnit -
          debtRemaining,
      });
    }

    simResult = results;
  }
</script>

<div
  class="pb-24 pt-4 px-4 max-w-6xl mx-auto space-y-6"
  id="dashboard-screen-container"
>
  <!-- Brand Header -->
  <div
    class="flex flex-col md:flex-row md:items-center md:justify-between bg-slate-900/40 p-6 rounded-2xl border border-slate-800/80 backdrop-blur-md gap-4 relative overflow-hidden"
  >
    <div
      class="absolute top-0 left-0 w-64 h-64 bg-pink-500/5 blur-3xl rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none"
    />
    <div
      class="absolute bottom-0 right-0 w-64 h-64 bg-teal-500/5 blur-3xl rounded-full translate-x-1/2 translate-y-1/2 pointer-events-none"
    />

    <div class="flex items-center gap-4 relative z-10">
      <div
        class="relative w-16 h-16 rounded-full overflow-hidden border border-teal-500/30 shadow-[0_0_20px_rgba(236,72,153,0.3)] bg-black flex items-center justify-center shrink-0"
      >
        <img
          src={stellariumLogo}
          alt="Stellarium Cosmic Logo"
          class="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
          referrerpolicy="no-referrer"
        />
        <div
          class="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none mix-blend-overlay animate-pulse"
        />
      </div>
      <div>
        <h1 class="text-2xl font-bold font-sans tracking-tight text-white flex items-center gap-2">
          <span
            class="font-display italic text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-pink-400 to-amber-300 font-extrabold"
          >
            Stellarium
          </span>
          <span class="font-space text-slate-100 font-bold">Housing Pledge</span>
          <span
            class="text-[9px] px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20 uppercase font-mono tracking-wider font-semibold"
          >
            Model
          </span>
        </h1>
        <p class="text-xs text-slate-400 max-w-xl">
          Fostering systemic altruism & Goodwill. Fully synchronized SQLite ledger with
          rapid steel assembly simulators.
        </p>
      </div>
    </div>

    <div class="flex items-center gap-2">
      <select
        id="ehp-switcher"
        bind:value={selectedPledgeId}
        class="bg-slate-800 border border-slate-700 text-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
      >
        {#each pledges as p}
          <option value={p.id}>{p.name} ({p.status})</option>
        {/each}
      </select>

      <button
        id="create-ehp-btn"
        onclick={() => (isCreatingPledge = !isCreatingPledge)}
        class="bg-teal-500 hover:bg-teal-400 text-slate-950 px-3.5 py-2 rounded-xl text-sm font-semibold flex items-center gap-1.5 transition-all"
      >
        <Plus class="w-4 h-4" />
        <span>New EHP</span>
      </button>
    </div>
  </div>

  <!-- Create Pledge Panel -->
  {#if isCreatingPledge}
    <div
      transition:slide={{ duration: 200 }}
      class="bg-slate-900 border border-teal-500/30 rounded-2xl p-6 shadow-xl"
      id="create-pledge-form-panel"
    >
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-semibold text-white font-sans flex items-center gap-2">
          <Compass class="w-5 h-5 text-teal-400" />
          Incept New Enterprise Housing Pledge (EHP)
        </h3>
        <button
          onclick={() => (isCreatingPledge = false)}
          class="text-slate-400 hover:text-slate-200 text-sm font-mono"
        >
          ✕ Close
        </button>
      </div>

      <form onsubmit={handleCreatePledge} class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="space-y-1">
          <label class="text-xs text-slate-400 uppercase font-mono">Pledge Name</label>
          <input
            type="text"
            required
            placeholder="e.g. Manaus Sustainable Eco-Modulars"
            bind:value={newPledgeName}
            class="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <div class="space-y-1">
          <label class="text-xs text-slate-400 uppercase font-mono">Location</label>
          <input
            type="text"
            required
            placeholder="e.g. Manaus, AM, Brazil"
            bind:value={newPledgeLocation}
            class="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <div class="space-y-1">
          <label class="text-xs text-slate-400 uppercase font-mono">
            Target Fundraising (USD)
          </label>
          <input
            type="number"
            bind:value={newPledgeTarget}
            class="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <div class="space-y-1">
          <label class="text-xs text-slate-400 uppercase font-mono">
            Construction Loan Interest Rate (%)
          </label>
          <input
            type="number"
            step="0.1"
            bind:value={newPledgeInterest}
            class="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <div class="space-y-1 md:col-span-2">
          <label class="text-xs text-slate-400 uppercase font-mono">
            Mission Statement / Description
          </label>
          <textarea
            placeholder="Describe how this pledge unites stakeholders..."
            bind:value={newPledgeDescription}
            rows={2}
            class="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <div class="md:col-span-2 flex justify-end pt-2">
          <button
            type="submit"
            class="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-6 py-2 rounded-xl text-sm"
          >
            Launch EHP Initiative
          </button>
        </div>
      </form>
    </div>
  {/if}

  <!-- Sub-navigation Tabs -->
  <div class="flex border-b border-slate-800 gap-2">
    <button
      onclick={() => (activeTab = "overview")}
      class="px-4 py-2 text-xs font-bold uppercase tracking-wider font-mono border-b-2 transition-all {activeTab ===
      'overview'
        ? 'border-teal-400 text-teal-400 font-bold'
        : 'border-transparent text-slate-400 hover:text-slate-200'}"
    >
      Overview & Projections Simulation
    </button>
    <button
      onclick={() => (activeTab = "treasury")}
      class="px-4 py-2 text-xs font-bold uppercase tracking-wider font-mono border-b-2 transition-all {activeTab ===
      'treasury'
        ? 'border-teal-400 text-teal-400 font-bold'
        : 'border-transparent text-slate-400 hover:text-slate-200'}"
    >
      Treasury & Automated Loans Tracker
    </button>
  </div>

  {#if activeTab === "overview"}
    {#if currentPledge}
      <div class="bg-slate-900/40 p-6 rounded-2xl border border-slate-800" id="pledge-info-panel">
        <div class="flex justify-between items-start gap-4">
          <div>
            <h2 class="text-xl font-bold text-white font-sans">{currentPledge.name}</h2>
            <p class="text-sm text-teal-400 font-mono flex items-center gap-1.5 mt-0.5">
              <Globe class="w-4 h-4" />
              {currentPledge.location}
            </p>
          </div>
          <span
            class="px-3 py-1 rounded-full text-xs font-mono font-bold {currentPledge.status ===
            'Active'
              ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20'
              : 'bg-slate-800 text-slate-400 border border-slate-700'}"
          >
            {currentPledge.status}
          </span>
        </div>
        <p class="text-sm text-slate-300 mt-4 leading-relaxed max-w-4xl">
          {currentPledge.description}
        </p>
      </div>
    {/if}

    <!-- KPI Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="kpi-cards-grid">
      <div class="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center gap-4 hover:border-slate-700 transition-all shadow-sm">
        <div class="p-3 bg-amber-500/10 rounded-xl text-amber-400"><DollarSign class="w-6 h-6" /></div>
        <div>
          <span class="text-xs text-slate-400 uppercase font-mono tracking-wider block">Total Collateral</span>
          <span class="text-lg font-bold text-white font-mono block">
            ${totalCollateralValue.toLocaleString()}
          </span>
          <span class="text-[10px] text-slate-500 font-mono block">
            {pledgers.length} Pledging Entities
          </span>
        </div>
      </div>
      <div class="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center gap-4 hover:border-slate-700 transition-all shadow-sm">
        <div class="p-3 bg-teal-500/10 rounded-xl text-teal-400"><TrendingUp class="w-6 h-6" /></div>
        <div>
          <span class="text-xs text-slate-400 uppercase font-mono tracking-wider block">Approved Loans</span>
          <span class="text-lg font-bold text-white font-mono block">
            ${totalLoansApproved.toLocaleString()}
          </span>
          <span class="text-[10px] text-teal-400/80 font-mono block">
            LVR Rate: {((totalLoansApproved / (totalCollateralValue || 1)) * 100).toFixed(1)}%
          </span>
        </div>
      </div>
      <div class="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center gap-4 hover:border-slate-700 transition-all shadow-sm">
        <div class="p-3 bg-emerald-500/10 rounded-xl text-emerald-400"><Layers class="w-6 h-6" /></div>
        <div>
          <span class="text-xs text-slate-400 uppercase font-mono tracking-wider block">Reinvestment Pool</span>
          <span class="text-lg font-bold text-white font-mono block">
            ${currentPledge?.reinvestmentPool?.toLocaleString() || "0"}
          </span>
          <span class="text-[10px] text-slate-500 font-mono block">
            Interest rate: {currentPledge?.loanInterestRate || "0"}%
          </span>
        </div>
      </div>
      <div class="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center gap-4 hover:border-slate-700 transition-all shadow-sm">
        <div class="p-3 bg-rose-500/10 rounded-xl text-rose-400"><Percent class="w-6 h-6" /></div>
        <div>
          <span class="text-xs text-slate-400 uppercase font-mono tracking-wider block">Occupied Units</span>
          <span class="text-lg font-bold text-white font-mono block">
            {occupiedUnitsCount} / {pledgeUnits.length}
          </span>
          <span class="text-[10px] text-rose-400/80 font-mono block">
            Occupancy: {((occupiedUnitsCount / (pledgeUnits.length || 1)) * 100).toFixed(1)}%
          </span>
        </div>
      </div>
    </div>

    <!-- Debt Status -->
    <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4" id="debt-status-panel">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <h3 class="text-base font-semibold text-white font-sans flex items-center gap-1.5">
            <Zap class="w-5 h-5 text-amber-400" />
            EHP Collateral & Debt Repayment Ratio
          </h3>
          <p class="text-xs text-slate-400">
            Rents service construction debt. Once loans are repaid, collateral unlocks.
          </p>
        </div>
        <span class="text-sm font-mono text-slate-300">
          Repaid: <strong class="text-teal-400">
            ${((currentPledge?.reinvestmentPool || 0) * 1.5).toLocaleString()}
          </strong> / ${totalLoansApproved.toLocaleString()}
        </span>
      </div>
      <div class="space-y-2">
        <div class="w-full bg-slate-800 rounded-full h-3.5 overflow-hidden">
          <div
            class="bg-gradient-to-r from-teal-500 to-emerald-400 h-full rounded-full transition-all duration-500"
            style="width: {Math.min(100, (((currentPledge?.reinvestmentPool || 0) * 1.5) / (totalLoansApproved || 1)) * 100)}%"
          />
        </div>
        <div class="flex justify-between text-[11px] font-mono text-slate-500">
          <span>
            Debt Outstanding: ${Math.max(0, totalLoansApproved - ((currentPledge?.reinvestmentPool || 0) * 1.5)).toLocaleString()}
          </span>
          <span>Unearned Interest Saved: ${((totalLoansApproved * 0.12) || 0).toLocaleString()}</span>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <!-- Stakeholder Shares -->
      <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6 lg:col-span-5 space-y-4" id="ownership-shares-panel">
        <h3 class="text-base font-semibold text-white font-sans flex items-center gap-1.5">
          <Briefcase class="w-5 h-5 text-teal-400" />
          Pledged Collateral Ownership Shares
        </h3>
        <p class="text-xs text-slate-400">
          Determined by ratio of assets pledged to the EHP.
        </p>
        <div class="space-y-4 pt-2">
          {#each pledgers as p}
            {@const sharePercentage = totalSharesValue ? ((p.collateralValue / totalSharesValue) * 100) : 0}
            <div class="space-y-1">
              <div class="flex justify-between text-xs font-mono">
                <span class="text-slate-300 font-medium truncate max-w-[200px]">{p.name}</span>
                <span class="text-teal-400 font-bold">{sharePercentage.toFixed(1)}%</span>
              </div>
              <div class="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div class="bg-teal-500 h-full rounded-full" style="width: {sharePercentage}%" />
              </div>
              <div class="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>{p.collateralType}</span>
                <span>${p.collateralValue.toLocaleString()}</span>
              </div>
            </div>
          {/each}
        </div>
      </div>

      <!-- Simulator -->
      <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6 lg:col-span-7 space-y-4" id="projection-simulator-panel">
        <div class="flex justify-between items-center border-b border-slate-800 pb-3">
          <div>
            <h3 class="text-base font-semibold text-white font-sans flex items-center gap-1.5">
              <TrendingUp class="w-5 h-5 text-teal-400" />
              EHP Core Reinvestment Cycle Simulator
            </h3>
            <p class="text-xs text-slate-400">
              Project the cumulative compounding impact of pre-fabricated speeds.
            </p>
          </div>
          <button
            onclick={runSimulation}
            class="bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold px-4 py-1.5 rounded-xl text-xs flex items-center gap-1.5"
          >
            <Play class="w-3.5 h-3.5" />
            Simulate
          </button>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div class="space-y-1 bg-slate-800/40 p-3 rounded-xl border border-slate-800">
            <label class="text-[10px] text-slate-400 uppercase font-mono block">Sim Timeline</label>
            <select
              bind:value={simYears}
              class="w-full bg-slate-800 text-white rounded-lg p-1 text-xs border border-slate-700"
            >
              <option value={3}>3 Years</option>
              <option value={5}>5 Years</option>
              <option value={10}>10 Years</option>
              <option value={20}>20 Years</option>
            </select>
          </div>
          <div class="space-y-1 bg-slate-800/40 p-3 rounded-xl border border-slate-800">
            <label class="text-[10px] text-slate-400 uppercase font-mono block">Monthly Rent ($)</label>
            <input
              type="number"
              bind:value={simRentalRate}
              class="w-full bg-slate-800 text-white rounded-lg p-1 text-xs border border-slate-700 font-mono"
            />
          </div>
          <div class="space-y-1 bg-slate-800/40 p-3 rounded-xl border border-slate-800">
            <label class="text-[10px] text-slate-400 uppercase font-mono block">Op Expense (%)</label>
            <input
              type="number"
              bind:value={simOperationalRatio}
              class="w-full bg-slate-800 text-white rounded-lg p-1 text-xs border border-slate-700 font-mono"
            />
          </div>
        </div>

        {#if simResult}
          <div class="overflow-x-auto border border-slate-800 rounded-xl" id="sim-results-table">
            <table class="w-full text-left border-collapse text-xs">
              <thead>
                <tr class="bg-slate-800/50 border-b border-slate-800 text-[10px] text-slate-400 uppercase font-mono">
                  <th class="p-2.5">Year</th>
                  <th class="p-2.5">Debt Left</th>
                  <th class="p-2.5">Reinvestment Pool</th>
                  <th class="p-2.5">Added Units</th>
                  <th class="p-2.5 text-right">Net Value Created</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800 font-mono text-slate-300">
                {#each simResult as row}
                  <tr class="hover:bg-slate-800/30">
                    <td class="p-2.5 font-bold text-teal-400">Yr {row.year}</td>
                    <td class="p-2.5">${row.debtRemaining.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                    <td class="p-2.5">${row.cumulativeSurplus.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                    <td class="p-2.5 font-bold text-emerald-400">+{row.additionalUnits} units</td>
                    <td class="p-2.5 text-right text-white font-bold">
                      ${row.totalNetAssetValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
            <div class="p-3 bg-slate-800/20 text-[11px] text-slate-400 leading-normal flex items-start gap-2 border-t border-slate-800">
              <Award class="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <span>
                <strong>Self-Replenishing Power:</strong> Over {simYears} years, this EHP creates a net asset value of
                <strong class="text-white">
                  ${simResult[simResult.length - 1]?.totalNetAssetValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </strong>
                and builds <strong class="text-emerald-400">+{simResult[simResult.length - 1]?.additionalUnits}</strong> debt-free houses.
              </span>
            </div>
          </div>
        {:else}
          <div class="flex flex-col items-center justify-center p-8 bg-slate-800/10 rounded-xl border border-dashed border-slate-800 text-slate-500 text-xs">
            <Compass class="w-8 h-8 text-slate-600 mb-2" />
            <span>Adjust parameters and click "Simulate" to calculate EHP progression.</span>
          </div>
        {/if}
      </div>
    </div>
  {:else}
    <TreasuryCenter {projects} onRefreshData={onRefreshData} />
  {/if}
</div>
