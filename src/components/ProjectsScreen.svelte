<script>
  import { onMount } from "svelte";
  import { api } from "../api";
  import { ProjectStatus } from "../types";
  import {
    Plus, Construction, Calendar, Layers, ChevronRight, DollarSign, Phone,
    FileSpreadsheet, FileText, UserCheck, Zap, CheckCircle, Clock, Compass,
    MapPin, Flame, Droplets, Wrench, Sparkles, Info,
  } from "lucide-svelte";
  import { slide } from "svelte/transition";

  let { projects, onAddProject, onUpdateProject } = $props();

  let isAdding = $state(false);
  let expandedProjId = $state(null);
  let focusedProjId = $state("");
  let milestones = $state([]);
  let addingMilestone = $state(false);
  let newMilestoneTitle = $state("");
  let newMilestoneDesc = $state("");
  let newMilestoneDate = $state("");
  let prefabFloors = $state(6);
  let activeHotspot = $state("none");

  // Form states
  let name = $state("");
  let location = $state("");
  let totalCost = $state(3000000);
  let loanApproved = $state(2500000);
  let startDate = $state("2026-06-01");
  let completionDate = $state("2026-12-01");
  let constructionMethod = $state("BROAD Group Stainless Steel Quick-Build Prefab");
  let supplierName = $state("");
  let supplierRole = $state("");
  let supplierValue = $state(1500000);
  let supplierContact = $state("");

  const PREFAB_IMAGES = [
    "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
  ];

  let focusedProj = $derived(projects.find((p) => p.id === focusedProjId) || projects[0]);

  onMount(() => {
    if (!focusedProjId && projects[0]?.id) focusedProjId = projects[0].id;
  });

  async function loadMilestones() {
    if (focusedProjId) {
      try {
        milestones = await api.getProjectMilestones(focusedProjId);
      } catch (err) {
        console.error("Error loading project milestones:", err);
      }
    }
  }

  // Reload milestones when focused project changes
  $effect(() => {
    if (focusedProjId) loadMilestones();
  });

  async function handleAddMilestone(e) {
    e.preventDefault();
    if (!focusedProjId || !newMilestoneTitle) return;
    try {
      const created = await api.createMilestone({
        project_id: focusedProjId,
        title: newMilestoneTitle,
        description: newMilestoneDesc,
        target_date: newMilestoneDate || new Date().toISOString().split("T")[0],
        status: "Pending",
      });
      milestones = [...milestones, created];
      newMilestoneTitle = "";
      newMilestoneDesc = "";
      newMilestoneDate = "";
      addingMilestone = false;
    } catch (err) {
      console.error("Failed to create milestone", err);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!name || !location) return;
    const initialSuppliers = supplierName
      ? [{ id: `sup-${Date.now()}`, name: supplierName, role: supplierRole || "Primary Modular Constructor", contractValue: Number(supplierValue), contact: supplierContact || "+55 81" }]
      : [{ id: `sup-def-${Date.now()}`, name: "BROAD Group Modular Systems", role: "Structural Module Fabricator", contractValue: Number(totalCost * 0.7), contact: "+86 731-8408-8888" }];

    onAddProject({
      id: `proj-${Date.now()}`,
      ehpId: "ehp-1",
      name,
      location,
      imageUrl: PREFAB_IMAGES[Math.floor(Math.random() * PREFAB_IMAGES.length)],
      status: ProjectStatus.PLANNING,
      totalCost: Number(totalCost),
      loanApproved: Number(loanApproved),
      startDate,
      completionDate,
      constructionMethod,
      suppliers: initialSuppliers,
      documents: [{ id: `doc-proj-${Date.now()}`, name: "Prefab Assembly Logistics Plan & Schedule", category: "Blueprint", dateSigned: new Date().toISOString().split("T")[0], version: "v1.0" }],
    });

    isAdding = false;
    name = ""; location = ""; totalCost = 3000000; loanApproved = 2500000;
    startDate = "2026-06-01"; completionDate = "2026-12-01";
    constructionMethod = "BROAD Group Stainless Steel Quick-Build Prefab";
    supplierName = ""; supplierRole = ""; supplierValue = 1500000; supplierContact = "";
  }

  function handleToggleStatus(proj) {
    let nextStatus = ProjectStatus.PLANNING;
    if (proj.status === ProjectStatus.PLANNING) nextStatus = ProjectStatus.CONSTRUCTING;
    else if (proj.status === ProjectStatus.CONSTRUCTING) nextStatus = ProjectStatus.COMPLETED;
    onUpdateProject({ ...proj, status: nextStatus });
  }
</script>

<div class="pb-24 pt-4 px-4 max-w-6xl mx-auto space-y-6" id="projects-screen-container">
  <!-- Header -->
  <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/40 p-6 rounded-2xl border border-slate-800">
    <div>
      <h2 class="text-xl font-bold text-white font-sans flex items-center gap-2">
        <Construction class="w-5 h-5 text-teal-400" /> Prefabricated Construction Projects
      </h2>
      <p class="text-xs text-slate-400 mt-0.5">Maximizing efficiency using stainless steel modular building systems.</p>
    </div>
    <button id="toggle-add-project-btn" onclick={() => isAdding = !isAdding}
      class="bg-teal-500 hover:bg-teal-400 text-slate-950 px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-1.5 transition-all shadow-md shrink-0">
      <Plus class="w-4 h-4" /><span>Incept Prefab Project</span>
    </button>
  </div>

  <!-- Add Form -->
  {#if isAdding}
    <div transition:slide class="bg-slate-900 border border-teal-500/30 rounded-2xl p-6 shadow-xl" id="add-project-form-panel">
      <h3 class="text-base font-semibold text-white font-sans mb-4 flex items-center gap-2"><Compass class="w-5 h-5 text-teal-400" /> Initiate Rapid Modular Housing Build</h3>
      <form onsubmit={handleSubmit} class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="space-y-1"><label class="text-xs text-slate-400 uppercase font-mono">Project Name</label><input type="text" required placeholder="e.g. Symphony Prefab Tower B" bind:value={name} class="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-slate-200 text-sm" /></div>
        <div class="space-y-1"><label class="text-xs text-slate-400 uppercase font-mono">Build Location</label><input type="text" required placeholder="e.g. Olinda Coastal Hub" bind:value={location} class="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-slate-200 text-sm" /></div>
        <div class="space-y-1"><label class="text-xs text-slate-400 uppercase font-mono">Total Budget Cost (USD)</label><input type="number" bind:value={totalCost} class="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-slate-200 text-sm font-mono" /></div>
        <div class="space-y-1"><label class="text-xs text-slate-400 uppercase font-mono">Collateral Loan (USD)</label><input type="number" bind:value={loanApproved} class="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-slate-200 text-sm font-mono" /></div>
        <div class="space-y-1"><label class="text-xs text-slate-400 uppercase font-mono">Start Date</label><input type="date" bind:value={startDate} class="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-slate-200 text-sm font-mono" /></div>
        <div class="space-y-1"><label class="text-xs text-slate-400 uppercase font-mono">Completion Date</label><input type="date" bind:value={completionDate} class="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-slate-200 text-sm font-mono" /></div>
        <div class="space-y-1 md:col-span-2"><label class="text-xs text-slate-400 uppercase font-mono">Construction Method</label><input type="text" placeholder="e.g. BROAD Group Stainless Steel Prefab" bind:value={constructionMethod} class="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-slate-200 text-sm" /></div>
        <div class="md:col-span-2 border-t border-slate-800 pt-4 mt-2">
          <h4 class="text-xs font-bold text-teal-400 uppercase font-mono mb-3">Primary Modular Supplier</h4>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div class="space-y-1"><label class="text-[10px] text-slate-400 font-mono uppercase">Name</label><input type="text" placeholder="e.g. BROAD Group" bind:value={supplierName} class="w-full bg-slate-800 border border-slate-700 rounded-lg p-1.5 text-xs" /></div>
            <div class="space-y-1"><label class="text-[10px] text-slate-400 font-mono uppercase">Role</label><input type="text" placeholder="e.g. Modular Foundry" bind:value={supplierRole} class="w-full bg-slate-800 border border-slate-700 rounded-lg p-1.5 text-xs" /></div>
            <div class="space-y-1"><label class="text-[10px] text-slate-400 font-mono uppercase">Contract ($)</label><input type="number" bind:value={supplierValue} class="w-full bg-slate-800 border border-slate-700 rounded-lg p-1.5 text-xs font-mono" /></div>
            <div class="space-y-1"><label class="text-[10px] text-slate-400 font-mono uppercase">Contact</label><input type="text" placeholder="Phone" bind:value={supplierContact} class="w-full bg-slate-800 border border-slate-700 rounded-lg p-1.5 text-xs" /></div>
          </div>
        </div>
        <div class="md:col-span-2 flex justify-end gap-2 pt-2">
          <button type="button" onclick={() => isAdding = false} class="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs hover:bg-slate-700 font-semibold">Cancel</button>
          <button type="submit" class="px-5 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-xs">Assemble & Commit Build</button>
        </div>
      </form>
    </div>
  {/if}

  <!-- Visualization Hub -->
  {#if projects.length > 0}
    <div class="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6" id="visualization-hub-container">
      <div class="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-4 gap-4">
        <div>
          <h3 class="text-base font-bold text-white font-sans flex items-center gap-2">
            <Sparkles class="w-5 h-5 text-teal-400" /> EHP Regional Map & Interactive 3D Prefab Simulator
          </h3>
          <p class="text-[10px] text-slate-500 font-mono uppercase">Focused: <strong class="text-teal-400">{focusedProj?.name}</strong></p>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-[10px] uppercase font-mono text-slate-400 shrink-0">Focus:</span>
          <select bind:value={focusedProjId} class="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-3 py-1.5 text-xs font-mono">
            {#each projects as p}
              <option value={p.id}>{p.name}</option>
            {/each}
          </select>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <!-- Map -->
        <div class="lg:col-span-5 bg-slate-950 rounded-2xl p-4 border border-slate-800/80 space-y-4 relative overflow-hidden flex flex-col justify-between">
          <div class="space-y-1">
            <span class="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-wider block">Recife & Regional Plotter Grid</span>
            <p class="text-[9px] text-slate-500">Interactive telemetry pins track active modular construction sites.</p>
          </div>
          <div class="relative w-full aspect-[4/3] bg-slate-900/60 rounded-xl border border-slate-800 overflow-hidden flex items-center justify-center">
            <div class="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:24px_24px] opacity-40" />
            <svg class="absolute inset-0 w-full h-full text-slate-800/40" viewBox="0 0 100 100" fill="none">
              <path d="M 10 30 Q 30 20 50 40 T 90 20 L 100 100 L 0 100 Z" fill="currentColor" opacity="0.1" />
              <path d="M 0 50 Q 25 35 45 60 T 90 70 L 100 100 L 0 100 Z" fill="currentColor" opacity="0.15" />
            </svg>
            <Compass class="absolute top-3 right-3 w-8 h-8 text-slate-800 opacity-30" />
            {#each projects as proj, idx}
              {@const hashX = (proj.id.charCodeAt(5) || 50) % 70 + 15}
              {@const hashY = (proj.id.charCodeAt(proj.id.length - 1) || 50) % 60 + 20}
              {#if proj}
                <button onclick={() => focusedProjId = proj.id} class="absolute group focus:outline-none" style="left: {hashX}%; top: {hashY}%">
                  <span class="absolute -inset-4 rounded-full bg-teal-400/20 animate-ping {proj.id === focusedProjId ? 'opacity-100 scale-125' : 'opacity-0 group-hover:opacity-100 scale-90'}" />
                  <div class="relative p-1.5 rounded-full border transition-all {proj.id === focusedProjId ? 'bg-teal-500 text-slate-950 border-teal-300 scale-125 shadow-lg shadow-teal-500/20' : 'bg-slate-800 text-slate-400 border-slate-700 group-hover:bg-slate-700 group-hover:text-slate-200'}">
                    <MapPin class="w-3.5 h-3.5" />
                  </div>
                  <div class="absolute top-7 left-1/2 -translate-x-1/2 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-[8px] font-mono text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20">{proj.name}</div>
                </button>
              {/if}
            {/each}
          </div>
          <div class="bg-slate-900/50 p-2.5 rounded-xl border border-slate-850 flex items-center gap-2.5">
            <Info class="w-3.5 h-3.5 text-teal-400 shrink-0" />
            <span class="text-[9px] text-slate-400 leading-normal">Click pins to cycle focus. System tracks engineering variables.</span>
          </div>
        </div>

        <!-- 3D Visualizer -->
        <div class="lg:col-span-7 bg-slate-950 rounded-2xl p-5 border border-slate-800/80 flex flex-col justify-between space-y-4">
          <div class="flex justify-between items-start">
            <div class="space-y-0.5">
              <span class="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-wider block">Interactive Prefab 3D Tower</span>
              <p class="text-[9px] text-slate-500">Live-render BROAD Quick-Build levels.</p>
            </div>
            <span class="bg-teal-500/10 text-teal-400 border border-teal-500/20 text-[9px] font-bold font-mono px-2 py-0.5 rounded">Stainless Steel Core</span>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            <div class="md:col-span-4 space-y-3">
              <div class="bg-slate-900/40 p-3 rounded-xl border border-slate-850 space-y-1.5">
                <div class="flex justify-between text-[10px] font-mono">
                  <span class="text-slate-400">TOWER FLOORS:</span>
                  <strong class="text-teal-400">{prefabFloors} F</strong>
                </div>
                <input type="range" min={3} max={15} bind:value={prefabFloors} class="w-full accent-teal-400 bg-slate-800 cursor-pointer h-1 rounded-lg" />
                <div class="flex justify-between text-[8px] font-mono text-slate-500"><span>3 Min</span><span>15 Max</span></div>
              </div>
              <div class="space-y-1">
                <span class="text-[8px] font-bold font-mono text-slate-500 uppercase tracking-wide block">Highlight Systems</span>
                <button onclick={() => activeHotspot = activeHotspot === "solar" ? "none" : "solar"} class="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg border text-left text-[10px] font-mono transition-all {activeHotspot === 'solar' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30 font-bold' : 'bg-slate-900/20 text-slate-400 border-transparent hover:bg-slate-900/50'}">
                  <Zap class="w-3.5 h-3.5 shrink-0 text-amber-500" /><span>Solar Roof Grid</span>
                </button>
                <button onclick={() => activeHotspot = activeHotspot === "greywater" ? "none" : "greywater"} class="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg border text-left text-[10px] font-mono transition-all {activeHotspot === 'greywater' ? 'bg-teal-500/10 text-teal-400 border-teal-500/30 font-bold' : 'bg-slate-900/20 text-slate-400 border-transparent hover:bg-slate-900/50'}">
                  <Droplets class="w-3.5 h-3.5 shrink-0 text-teal-400" /><span>Wastewater Recycler</span>
                </button>
                <button onclick={() => activeHotspot = activeHotspot === "chassis" ? "none" : "chassis"} class="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg border text-left text-[10px] font-mono transition-all {activeHotspot === 'chassis' ? 'bg-purple-500/10 text-purple-400 border-purple-500/30 font-bold' : 'bg-slate-900/20 text-slate-400 border-transparent hover:bg-slate-900/50'}">
                  <Wrench class="w-3.5 h-3.5 shrink-0 text-purple-400" /><span>Core Alloy Chassis</span>
                </button>
              </div>
            </div>
            <div class="md:col-span-8 h-60 bg-slate-900/40 rounded-xl border border-slate-850 flex items-center justify-center relative overflow-hidden">
              <div class="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] bg-[size:16px_16px] opacity-20" />
              <div class="relative w-28 flex flex-col-reverse justify-end items-center gap-1 mt-4">
                {#each Array(prefabFloors) as _, index}
                  {@const isRoof = index === prefabFloors - 1}
                  {@const levelClass = isRoof && activeHotspot === 'solar' ? 'bg-amber-500/40 border-amber-400 text-amber-200 animate-pulse' : activeHotspot === 'chassis' ? 'bg-purple-500/20 border-purple-500/80 text-purple-300' : activeHotspot === 'greywater' && index % 2 === 0 ? 'bg-teal-500/40 border-teal-400 text-teal-100' : 'bg-slate-800 border-slate-700 text-slate-400'}
                  <div class="w-full h-4 rounded border transition-all relative flex items-center justify-center text-[8px] font-mono select-none {levelClass}" style="transform: perspective(400px) rotateX(25deg) rotateY(-10deg) translateY({-index * 2}px)">
                    <span>Lvl {index + 1}</span>
                    {#if isRoof}<div class="absolute -top-1 w-full h-1 bg-gradient-to-r from-amber-400 to-amber-600 rounded-t opacity-80" />{/if}
                  </div>
                {/each}
              </div>
              <div class="absolute bottom-2.5 right-2.5 text-right font-mono text-[8px] text-slate-500 space-y-0.5">
                <p>Prefab: BROAD Core B-30</p>
                <p>Yield: ${(prefabFloors * 12 * 450).toLocaleString()}/Mo</p>
                <p>Area: {prefabFloors * 240} m²</p>
              </div>
            </div>
          </div>
          <div class="bg-slate-900 border border-slate-850 p-3 rounded-xl flex items-start gap-3">
            <div class="p-1.5 rounded-lg bg-teal-500/10 text-teal-400"><Sparkles class="w-4 h-4" /></div>
            <div class="space-y-0.5">
              <span class="text-[10px] font-bold text-slate-300 font-sans block">
                {activeHotspot === "solar" && "Solar Roof Array System"}{activeHotspot === "greywater" && "Integrated Greywater Recycling Matrix"}{activeHotspot === "chassis" && "Core Stainless Steel Alloy Chassis"}{activeHotspot === "none" && "Self-Replenishing Prefab Specs"}
              </span>
              <p class="text-[10px] text-slate-400 leading-normal">
                {activeHotspot === "solar" && "Captures clean solar energy feeding back into local micro-grids, offsetting utility costs by 80%."}
                {activeHotspot === "greywater" && "Siphon system routes waste flows into microfilter tubes, recycling 60% of water for sanitation."}
                {activeHotspot === "chassis" && "High corrosion-resistance BROAD stainless steel. Built to last 100+ years with 24-hour bolt assembly."}
                {activeHotspot === "none" && "Adjust structural sliders. Real-time engineering models sync with construction suppliers."}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Milestones -->
      <div class="bg-slate-950 rounded-2xl p-5 border border-slate-800/80 space-y-4">
        <div class="flex justify-between items-center">
          <div class="space-y-0.5">
            <h4 class="text-xs font-bold text-white uppercase font-mono flex items-center gap-1.5"><Calendar class="w-4 h-4 text-teal-400" /> SQLite Construction Milestones</h4>
            <p class="text-[9px] text-slate-500">Milestones for: {focusedProj?.name}</p>
          </div>
          <button onclick={() => addingMilestone = !addingMilestone} class="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1 rounded-lg text-[10px] font-mono flex items-center gap-1 border border-slate-700">
            <Plus class="w-3 h-3" /> Add Milestone
          </button>
        </div>

        {#if addingMilestone}
          <form onsubmit={handleAddMilestone} class="grid grid-cols-1 md:grid-cols-4 gap-3 bg-slate-900/40 p-4 rounded-xl border border-slate-850">
            <div class="space-y-1"><label class="text-[9px] text-slate-400 uppercase font-mono">Title</label><input type="text" required placeholder="Roof Solars" bind:value={newMilestoneTitle} class="w-full bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-xs" /></div>
            <div class="space-y-1"><label class="text-[9px] text-slate-400 uppercase font-mono">Description</label><input type="text" placeholder="Specify deliverables" bind:value={newMilestoneDesc} class="w-full bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-xs" /></div>
            <div class="space-y-1"><label class="text-[9px] text-slate-400 uppercase font-mono">Deadline</label><input type="date" bind:value={newMilestoneDate} class="w-full bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-xs font-mono" /></div>
            <div class="flex items-end gap-2">
              <button type="submit" class="flex-1 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold py-1.5 rounded-lg text-xs">Commit</button>
              <button type="button" onclick={() => addingMilestone = false} class="px-2.5 py-1.5 bg-slate-800 text-slate-400 rounded-lg text-xs">Cancel</button>
            </div>
          </form>
        {/if}

        {#if milestones.length > 0}
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            {#each milestones as mil, idx}
              <div class="bg-slate-900/50 p-4 rounded-xl border border-slate-850 space-y-2 relative">
                <div class="hidden lg:block absolute top-1/2 -right-2.5 w-5 h-[1px] bg-slate-800 z-0" />
                <div class="flex justify-between items-start">
                  <span class="font-mono text-[9px] text-teal-400">0{idx + 1}. Step</span>
                  <span class="px-1.5 py-0.5 rounded text-[8px] font-mono uppercase {mil.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}">{mil.status}</span>
                </div>
                <div class="space-y-1">
                  <h5 class="text-xs font-bold text-white font-sans">{mil.title}</h5>
                  <p class="text-[10px] text-slate-400 leading-relaxed font-sans">{mil.description || "Core prefab delivery step."}</p>
                </div>
                <div class="flex items-center gap-1 font-mono text-[9px] text-slate-500 pt-1"><Calendar class="w-3 h-3" /><span>Deadline: {mil.target_date}</span></div>
              </div>
            {/each}
          </div>
        {:else}
          <div class="flex flex-col items-center justify-center p-8 text-center bg-slate-900/20 rounded-xl border border-slate-850 text-slate-500">
            <Calendar class="w-8 h-8 text-slate-700 mb-2" />
            <p class="text-[10px] font-mono">No milestones committed. Register new milestones above.</p>
          </div>
        {/if}
      </div>
    </div>
  {/if}

  <!-- Project Cards -->
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6" id="projects-grid-list">
    {#each projects as proj}
      {@const isExpanded = expandedProjId === proj.id}
      <div class="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700 transition-all flex flex-col justify-between" id="project-card-{proj.id}">
        <div>
          <div class="relative h-48 w-full bg-slate-950 overflow-hidden">
            <img referrerpolicy="no-referrer" src={proj.imageUrl} alt={proj.name} class="w-full h-full object-cover object-center opacity-85 hover:scale-105 transition-all duration-700" />
            <div class="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />
            <div class="absolute top-4 left-4 flex gap-2">
              <span class="px-2.5 py-1 rounded-full text-[10px] font-bold font-mono border {proj.status === 'Completed & Occupied' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : proj.status === 'Prefab Assembly' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-slate-800 text-slate-300 border-slate-700'}">
                {proj.status}
              </span>
            </div>
            <div class="absolute bottom-4 left-4 right-4">
              <h3 class="text-lg font-bold text-white font-sans tracking-tight">{proj.name}</h3>
              <p class="text-xs text-teal-400 font-mono mt-0.5">{proj.location}</p>
            </div>
          </div>
          <div class="p-6 space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-0.5">
                <span class="text-[10px] text-slate-500 font-mono uppercase block">Budget Cost</span>
                <span class="text-base font-bold text-white font-mono block">${proj.totalCost.toLocaleString()}</span>
              </div>
              <div class="space-y-0.5 text-right">
                <span class="text-[10px] text-slate-500 font-mono uppercase block">Collateral Loan</span>
                <span class="text-base font-bold text-teal-400 font-mono block">${proj.loanApproved.toLocaleString()}</span>
              </div>
            </div>
            <div class="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-2">
              <div class="flex items-center gap-1.5 text-xs text-slate-400">
                <Layers class="w-4 h-4 text-teal-400 shrink-0" /><span class="font-semibold text-slate-300">Method:</span><span class="truncate">{proj.constructionMethod}</span>
              </div>
              <div class="flex items-center gap-1.5 text-xs text-slate-400">
                <Calendar class="w-4 h-4 text-teal-400 shrink-0" /><span class="font-semibold text-slate-300">Timeline:</span><span class="font-mono">{proj.startDate} to {proj.completionDate}</span>
              </div>
            </div>

            {#if isExpanded}
              <div transition:slide class="space-y-4 pt-4 border-t border-slate-800">
                <div class="space-y-2">
                  <span class="text-[10px] text-slate-400 uppercase font-mono block tracking-wider">Prefabs Supply Chain</span>
                  {#each proj.suppliers as sup}
                    <div class="bg-slate-950 p-3 rounded-xl border border-slate-800 flex justify-between items-start text-xs">
                      <div class="space-y-0.5">
                        <span class="font-bold text-slate-200 block">{sup.name}</span>
                        <span class="text-slate-500 text-[10px] font-sans block">{sup.role}</span>
                        <span class="text-slate-400 text-[10px] font-mono flex items-center gap-1 mt-0.5"><Phone class="w-3 h-3 text-slate-500" /> {sup.contact}</span>
                      </div>
                      <span class="text-teal-400 font-bold font-mono">${sup.contractValue.toLocaleString()}</span>
                    </div>
                  {/each}
                </div>
                <div class="space-y-2">
                  <span class="text-[10px] text-slate-400 uppercase font-mono block tracking-wider">Document Vault</span>
                  {#each proj.documents as doc}
                    <div class="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                      <div class="flex items-center gap-2 truncate">
                        <FileSpreadsheet class="w-4 h-4 text-slate-400 shrink-0" />
                        <div class="truncate">
                          <span class="text-slate-300 font-semibold truncate block">{doc.name}</span>
                          <span class="text-[9px] text-slate-500 font-mono block">Released: {doc.dateSigned} • v{doc.version}</span>
                        </div>
                      </div>
                    </div>
                  {/each}
                </div>
              </div>
            {/if}
          </div>
        </div>
        <div class="p-6 border-t border-slate-800/80 flex gap-2">
          <button onclick={() => expandedProjId = isExpanded ? null : proj.id} class="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1">
            <span>{isExpanded ? "Hide Blueprint Details" : "View Blueprint & Suppliers"}</span>
            <ChevronRight class="w-4 h-4 transition-transform {isExpanded ? 'rotate-90' : ''}" />
          </button>
          <button onclick={() => handleToggleStatus(proj)} class="bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 border border-teal-500/30 px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-1">
            {#if proj.status === "Planning & Design"}
              <Clock class="w-3.5 h-3.5" /><span>Start Build</span>
            {:else if proj.status === "Prefab Assembly"}
              <CheckCircle class="w-3.5 h-3.5" /><span>Deliver Build</span>
            {:else}
              <CheckCircle class="w-3.5 h-3.5 text-emerald-400" /><span>Completed</span>
            {/if}
          </button>
        </div>
      </div>
    {/each}
  </div>
</div>
