<script>
  import { Search, Filter, Home, Plus, TrendingDown, UserCheck, Info, Sparkles } from "lucide-svelte";
  import { UnitStatus } from "../types";

  let { units, projects, onAddUnit, onUpdateUnit } = $props();

  let searchTerm = $state("");
  let statusFilter = $state("all");
  let typeFilter = $state("all");
  let isAdding = $state(false);
  let selectedProjectId = $state(projects[0]?.id || "");
  let unitNumber = $state("");

  // Keep selectedProjectId in sync when projects change
  $effect(() => {
    if (projects.length > 0 && !projects.find((p) => p.id === selectedProjectId)) {
      selectedProjectId = projects[0].id;
    }
  });
  let type = $state("1-Bedroom");
  let price = $state(400);
  let marketPrice = $state(1200);
  let status = $state(UnitStatus.AVAILABLE);
  let tenantName = $state("");
  let allocatingUnitId = $state(null);
  let allocationName = $state("");
  let allocationStatus = $state(UnitStatus.LEASED);

  let filteredUnits = $derived(
    units.filter((u) => {
      const matchesSearch =
        u.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.unitNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.tenantName && u.tenantName.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus = statusFilter === "all" || u.status === statusFilter;
      const matchesType = typeFilter === "all" || u.type === typeFilter;
      return matchesSearch && matchesStatus && matchesType;
    }),
  );

  let totalSavings = $derived(
    units
      .filter((u) => u.status !== UnitStatus.AVAILABLE)
      .reduce((sum, u) => sum + (u.marketPrice - u.price), 0),
  );

  function handleSubmit(e) {
    e.preventDefault();
    if (!unitNumber || !selectedProjectId) return;
    const matchedProj = projects.find((p) => p.id === selectedProjectId);
    const newUnit = {
      id: `unit-${Date.now()}`,
      projectId: selectedProjectId,
      projectName: matchedProj ? matchedProj.name : "EHP Building",
      unitNumber,
      type,
      price: Number(price),
      marketPrice: Number(marketPrice),
      status,
      tenantName: status !== UnitStatus.AVAILABLE ? tenantName : undefined,
      subsidyGranted: Math.max(0, Number(marketPrice) - Number(price)),
      purchaseDate: status !== UnitStatus.AVAILABLE ? new Date().toISOString().split("T")[0] : undefined,
    };
    onAddUnit(newUnit);
    isAdding = false;
    unitNumber = "";
    type = "1-Bedroom";
    price = 400;
    marketPrice = 1200;
    status = UnitStatus.AVAILABLE;
    tenantName = "";
  }

  function handleConfirmAllocation(unit) {
    if (!allocationName) return;
    onUpdateUnit({
      ...unit,
      status: allocationStatus,
      tenantName: allocationName,
      purchaseDate: new Date().toISOString().split("T")[0],
      subsidyGranted: Math.max(0, unit.marketPrice - unit.price),
    });
    allocatingUnitId = null;
    allocationName = "";
  }

  function handleReleaseUnit(unit) {
    onUpdateUnit({
      ...unit,
      status: UnitStatus.AVAILABLE,
      tenantName: undefined,
      purchaseDate: undefined,
    });
  }
</script>

<div class="pb-24 pt-4 px-4 max-w-6xl mx-auto space-y-6" id="units-screen-container">
  <div class="grid grid-cols-1 md:grid-cols-12 gap-6 bg-slate-900/40 p-6 rounded-2xl border border-slate-800">
    <div class="md:col-span-8">
      <h2 class="text-xl font-bold text-white font-sans flex items-center gap-2">
        <Home class="w-5 h-5 text-teal-400" />
        Affordable Housing Unit Allocations
      </h2>
      <p class="text-xs text-slate-400 mt-0.5">
        EHP units are leased and sold below market values. Rents are set as reinvestment engines.
      </p>
    </div>
    <div class="md:col-span-4 flex items-center md:justify-end gap-3 shrink-0">
      <div class="bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-xl text-right">
        <span class="text-[10px] text-slate-500 uppercase font-mono block">Monthly Mutual Savings</span>
        <span class="text-sm font-bold text-emerald-400 font-mono block">+${totalSavings.toLocaleString()}/mo</span>
      </div>
      <button id="toggle-add-unit-btn" onclick={() => isAdding = !isAdding}
        class="bg-teal-500 hover:bg-teal-400 text-slate-950 px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-1.5 transition-all shadow-md shrink-0">
        <Plus class="w-4 h-4" /><span>Create Unit</span>
      </button>
    </div>
  </div>

  {#if isAdding}
    <div transition:slide class="bg-slate-900 border border-teal-500/30 rounded-2xl p-6 shadow-xl" id="add-unit-form-panel">
      <h3 class="text-base font-semibold text-white font-sans mb-4 flex items-center gap-2">
        <Sparkles class="w-5 h-5 text-teal-400" /> Register Housing Unit on EHP Grid
      </h3>
      <form onsubmit={handleSubmit} class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div class="space-y-1">
          <label class="text-xs text-slate-400 uppercase font-mono">Select Project</label>
          <select bind:value={selectedProjectId} class="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-slate-200 text-sm">
            {#each projects as p}
              <option value={p.id}>{p.name}</option>
            {/each}
          </select>
        </div>
        <div class="space-y-1">
          <label class="text-xs text-slate-400 uppercase font-mono">Unit Number</label>
          <input type="text" required placeholder="e.g. A-304" bind:value={unitNumber} class="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-slate-200 text-sm" />
        </div>
        <div class="space-y-1">
          <label class="text-xs text-slate-400 uppercase font-mono">Unit Type</label>
          <select bind:value={type} class="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-slate-200 text-sm">
            <option value="Studio">Studio</option>
            <option value="1-Bedroom">1-Bedroom</option>
            <option value="2-Bedroom">2-Bedroom</option>
            <option value="3-Bedroom">3-Bedroom</option>
          </select>
        </div>
        <div class="space-y-1">
          <label class="text-xs text-slate-400 uppercase font-mono">Affordable Price/Rent ($)</label>
          <input type="number" bind:value={price} class="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-slate-200 text-sm font-mono" />
        </div>
        <div class="space-y-1">
          <label class="text-xs text-slate-400 uppercase font-mono">Local Market Equivalent ($)</label>
          <input type="number" bind:value={marketPrice} class="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-slate-200 text-sm font-mono" />
        </div>
        <div class="space-y-1">
          <label class="text-xs text-slate-400 uppercase font-mono">Initial Status</label>
          <select bind:value={status} class="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-slate-200 text-sm">
            <option value={UnitStatus.AVAILABLE}>Available</option>
            <option value={UnitStatus.LEASED}>Leased Below-Market</option>
            <option value={UnitStatus.SOLD}>Sold & Transferred</option>
          </select>
        </div>
        {#if status !== UnitStatus.AVAILABLE}
          <div class="space-y-1 md:col-span-2">
            <label class="text-xs text-slate-400 uppercase font-mono">Beneficiary / Tenant Name</label>
            <input type="text" required placeholder="e.g. Jose de Alencar" bind:value={tenantName} class="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-slate-200 text-sm" />
          </div>
        {/if}
        <div class="md:col-span-2 lg:col-span-3 flex justify-end gap-2 pt-2">
          <button type="button" onclick={() => isAdding = false} class="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs hover:bg-slate-700 font-semibold">Cancel</button>
          <button type="submit" class="px-5 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-xs">Register & Allocate Unit</button>
        </div>
      </form>
    </div>
  {/if}

  <!-- Filters -->
  <div class="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row gap-3 items-center">
    <div class="relative w-full md:flex-1">
      <Search class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
      <input type="text" placeholder="Search by project, unit code, or beneficiary..." bind:value={searchTerm}
        class="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500" />
    </div>
    <div class="flex gap-2 w-full md:w-auto">
      <div class="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 w-1/2 md:w-auto">
        <Filter class="w-3.5 h-3.5 text-slate-500" />
        <select id="status-filter" bind:value={statusFilter} class="bg-transparent border-none text-slate-300 text-xs focus:outline-none font-medium font-sans cursor-pointer">
          <option value="all">All Statuses</option>
          <option value={UnitStatus.AVAILABLE}>Available</option>
          <option value={UnitStatus.LEASED}>Leased</option>
          <option value={UnitStatus.SOLD}>Sold</option>
        </select>
      </div>
      <div class="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 w-1/2 md:w-auto">
        <Home class="w-3.5 h-3.5 text-slate-500" />
        <select id="type-filter" bind:value={typeFilter} class="bg-transparent border-none text-slate-300 text-xs focus:outline-none font-medium font-sans cursor-pointer">
          <option value="all">All Sizes</option>
          <option value="Studio">Studio</option>
          <option value="1-Bedroom">1-Bedroom</option>
          <option value="2-Bedroom">2-Bedroom</option>
          <option value="3-Bedroom">3-Bedroom</option>
        </select>
      </div>
    </div>
  </div>

  <!-- Unit Cards -->
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" id="units-cards-grid">
    {#each filteredUnits as unit}
      {@const monthlySavings = unit.marketPrice - unit.price}
      {@const isAllocating = allocatingUnitId === unit.id}
      <div class="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all flex flex-col justify-between" id="unit-card-{unit.id}">
        <div class="space-y-4">
          <div class="flex justify-between items-start gap-2">
            <div class="space-y-1">
              <span class="text-xs font-bold text-teal-400 font-mono tracking-wide">{unit.unitNumber}</span>
              <h4 class="text-xs font-semibold text-slate-400 line-clamp-1">{unit.projectName}</h4>
            </div>
            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono {unit.status === UnitStatus.AVAILABLE ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20' : unit.status === UnitStatus.SOLD ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}">
              {unit.status.split(" ")[0]}
            </span>
          </div>
          <div class="grid grid-cols-2 gap-2 bg-slate-950 p-3 rounded-xl border border-slate-850 text-xs">
            <div>
              <span class="text-[10px] text-slate-500 font-mono block">EHP Pricing</span>
              <strong class="text-slate-100 font-mono text-sm">${unit.price}/mo</strong>
            </div>
            <div class="text-right">
              <span class="text-[10px] text-slate-500 font-mono block">Market Equivalent</span>
              <span class="text-slate-400 font-mono text-xs line-through block">${unit.marketPrice}/mo</span>
            </div>
          </div>
          <div class="flex items-center gap-1.5 bg-emerald-500/5 px-2.5 py-1.5 rounded-lg border border-emerald-500/10 text-[11px] text-emerald-400 font-mono font-medium">
            <TrendingDown class="w-3.5 h-3.5 shrink-0" />
            <span>Altruistic Subsidy: ${monthlySavings}/mo saved</span>
          </div>
          <div class="pt-2 border-t border-slate-850">
            {#if unit.status !== UnitStatus.AVAILABLE && unit.tenantName}
              <div class="space-y-1">
                <span class="text-[9px] uppercase tracking-wider font-mono text-slate-500 block">Beneficiary Allocation</span>
                <div class="flex items-center gap-1.5 text-xs text-slate-200">
                  <UserCheck class="w-4 h-4 text-teal-400 shrink-0" />
                  <span class="font-semibold truncate">{unit.tenantName}</span>
                </div>
              </div>
            {:else}
              <div class="flex items-center gap-1.5 text-xs text-slate-500 font-mono italic">
                <Info class="w-4 h-4 text-slate-600 shrink-0" />
                <span>Ready for Allocation</span>
              </div>
            {/if}
          </div>
        </div>
        <div class="pt-4 mt-4 border-t border-slate-850 flex flex-col gap-2">
          {#if isAllocating}
            <div class="space-y-2 bg-slate-950 p-3 rounded-xl border border-teal-500/20">
              <input type="text" placeholder="Enter Beneficiary Name..." bind:value={allocationName} class="w-full bg-slate-800 border border-slate-700 rounded-lg p-1.5 text-xs text-slate-200" />
              <div class="flex gap-2">
                <select bind:value={allocationStatus} class="bg-slate-800 text-slate-300 text-[10px] rounded p-1 font-mono flex-1 border border-slate-700">
                  <option value={UnitStatus.LEASED}>Leased</option>
                  <option value={UnitStatus.SOLD}>Sold</option>
                </select>
                <button onclick={() => handleConfirmAllocation(unit)} class="bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold px-3 py-1 rounded text-[10px] shrink-0">Confirm</button>
                <button onclick={() => allocatingUnitId = null} class="bg-slate-800 text-slate-400 px-2 py-1 rounded text-[10px] shrink-0">Cancel</button>
              </div>
            </div>
          {:else if unit.status === UnitStatus.AVAILABLE}
            <button onclick={() => allocatingUnitId = unit.id} class="w-full bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 border border-teal-500/20 font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5">
              <Plus class="w-3.5 h-3.5" /><span>Allocate Unit</span>
            </button>
          {:else}
            <button onclick={() => handleReleaseUnit(unit)} class="w-full bg-slate-800 hover:bg-slate-750 text-rose-400/80 hover:text-rose-400 font-semibold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 border border-slate-700/60">
              <span>Release / Vacate Unit</span>
            </button>
          {/if}
        </div>
      </div>
    {/each}
    {#if filteredUnits.length === 0}
      <div class="col-span-full flex flex-col items-center justify-center p-12 bg-slate-900/10 border border-dashed border-slate-800 rounded-2xl text-slate-500 text-xs">
        <Home class="w-8 h-8 text-slate-600 mb-2 animate-bounce" />
        <span>No units match current search filters.</span>
      </div>
    {/if}
  </div>
</div>
