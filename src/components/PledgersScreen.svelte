<script>
  import {
    ShieldCheck,
    FileText,
    Plus,
    UserPlus,
    CheckCircle2,
    Clock,
    Download,
    Sparkles,
    Building,
  } from "lucide-svelte";
  import { slide } from "svelte/transition";
  import { PledgerType, CollateralType } from "../types";

  let { pledgers, onAddPledger, onUpdatePledger } = $props();

  let isAdding = $state(false);
  let name = $state("");
  let type = $state(PledgerType.PRIVATE);
  let collateralType = $state(CollateralType.CASH);
  let collateralValue = $state(1000000);
  let approvedLoans = $state(800000);
  let missionStatement = $state("");
  let impactSummary = $state("");

  function handleSubmit(e) {
    e.preventDefault();
    if (!name) return;

    const newPledger = {
      id: `pledger-${Date.now()}`,
      name,
      type,
      collateralType,
      collateralValue: Number(collateralValue),
      shares: 0,
      signedContract: false,
      contractDate: "",
      approvedLoans: Number(approvedLoans),
      missionStatement: missionStatement || undefined,
      impactSummary: impactSummary || undefined,
      documents: [
        {
          id: `doc-${Date.now()}`,
          name: "Initial Intent Statement & Collateral Declaration",
          category: "Contract",
          dateSigned: new Date().toISOString().split("T")[0],
          version: "v1.0",
        },
      ],
    };

    onAddPledger(newPledger);
    isAdding = false;
    name = "";
    type = PledgerType.PRIVATE;
    collateralType = CollateralType.CASH;
    collateralValue = 1000000;
    approvedLoans = 800000;
    missionStatement = "";
    impactSummary = "";
  }

  function handleSignContract(pledger) {
    const updatedDocs = [
      ...pledger.documents,
      {
        id: `doc-sig-${Date.now()}`,
        name: "EHP Shared Governance Contract (Fully Executed)",
        category: "Contract",
        dateSigned: new Date().toISOString().split("T")[0],
        version: "v2.0",
      },
    ];

    onUpdatePledger({
      ...pledger,
      signedContract: true,
      contractDate: new Date().toISOString().split("T")[0],
      documents: updatedDocs,
    });
  }

  function handleAddLoanApproval(pledger) {
    const updatedDocs = [
      ...pledger.documents,
      {
        id: `doc-loan-${Date.now()}`,
        name: `BNDES Construction Loan Approval Statement ($${pledger.approvedLoans.toLocaleString()})`,
        category: "Loan Approval",
        dateSigned: new Date().toISOString().split("T")[0],
        version: "v1.0",
      },
    ];

    onUpdatePledger({
      ...pledger,
      documents: updatedDocs,
    });
  }
</script>

<div
  class="pb-24 pt-4 px-4 max-w-6xl mx-auto space-y-6"
  id="pledgers-screen-container"
>
  <div
    class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/40 p-6 rounded-2xl border border-slate-800"
  >
    <div>
      <h2 class="text-xl font-bold text-white font-sans flex items-center gap-2">
        <Building class="w-5 h-5 text-teal-400" />
        Consortium of Pledging Entities
      </h2>
      <p class="text-xs text-slate-400 mt-0.5">
        Public institutions, nonprofits, philanthropists, and private companies
        contributing collateral to unlock low-interest housing loans.
      </p>
    </div>
    <button
      id="toggle-add-pledger-btn"
      onclick={() => (isAdding = !isAdding)}
      class="bg-teal-500 hover:bg-teal-400 text-slate-950 px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-1.5 transition-all shadow-md shrink-0"
    >
      <UserPlus class="w-4 h-4" />
      <span>Register Pledging Entity</span>
    </button>
  </div>

  {#if isAdding}
    <div
      transition:slide={{ duration: 200 }}
      class="bg-slate-900 border border-teal-500/30 rounded-2xl p-6 shadow-xl"
      id="add-pledger-form-panel"
    >
      <h3 class="text-base font-semibold text-white font-sans mb-4 flex items-center gap-2">
        <Sparkles class="w-5 h-5 text-teal-400" />
        Onboard Pledging Entity & Register Asset
      </h3>
      <form onsubmit={handleSubmit} class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="space-y-1">
          <label class="text-xs text-slate-400 uppercase font-mono">Entity Name</label>
          <input type="text" required placeholder="e.g. São Paulo Housing Secretariat" bind:value={name}
            class="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
        </div>
        <div class="space-y-1">
          <label class="text-xs text-slate-400 uppercase font-mono">Entity Sector Type</label>
          <select bind:value={type}
            class="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 font-sans">
            {#each Object.values(PledgerType) as t}
              <option value={t}>{t}</option>
            {/each}
          </select>
        </div>
        <div class="space-y-1">
          <label class="text-xs text-slate-400 uppercase font-mono">Collateral Asset Category</label>
          <select bind:value={collateralType}
            class="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 font-sans">
            {#each Object.values(CollateralType) as c}
              <option value={c}>{c}</option>
            {/each}
          </select>
        </div>
        <div class="space-y-1">
          <label class="text-xs text-slate-400 uppercase font-mono">Assessed Asset Valuation (USD)</label>
          <input type="number" bind:value={collateralValue}
            class="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono" />
        </div>
        <div class="space-y-1">
          <label class="text-xs text-slate-400 uppercase font-mono">Pre-Approved Construction Loans (USD)</label>
          <input type="number" bind:value={approvedLoans}
            class="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono" />
        </div>
        <div class="space-y-1 md:col-span-2">
          <label class="text-xs text-slate-400 uppercase font-mono">Mission Statement</label>
          <textarea placeholder="Describe the stakeholder's long-term vision..." bind:value={missionStatement} rows={2}
            class="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 font-sans" />
        </div>
        <div class="space-y-1 md:col-span-2">
          <label class="text-xs text-slate-400 uppercase font-mono">Completed Projects Impact Summary</label>
          <textarea placeholder="Summary of how this stakeholder's contributions..." bind:value={impactSummary} rows={2}
            class="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 font-sans" />
        </div>
        <div class="md:col-span-2 flex justify-end gap-2 pt-2">
          <button type="button" onclick={() => (isAdding = false)}
            class="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs hover:bg-slate-700 font-semibold">Cancel</button>
          <button type="submit"
            class="px-5 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-xs">Commit Collateral & Onboard</button>
        </div>
      </form>
    </div>
  {/if}

  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6" id="pledgers-cards-container">
    {#each pledgers as pledger}
      <div
        id="pledger-card-{pledger.id}"
        class="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 hover:border-slate-700 transition-all flex flex-col justify-between"
      >
        <div class="space-y-4">
          <div class="flex justify-between items-start gap-2">
            <div class="space-y-1">
              <h3 class="text-base font-bold text-white font-sans tracking-tight">{pledger.name}</h3>
              <span class="inline-block text-[10px] uppercase tracking-wider font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                {pledger.type}
              </span>
            </div>
            <div class="text-right">
              <span class="text-[10px] text-slate-500 font-mono uppercase block">Collateral Contributed</span>
              <span class="text-lg font-bold text-teal-400 font-mono block">
                ${pledger.collateralValue.toLocaleString()}
              </span>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4 bg-slate-850 p-4 rounded-xl border border-slate-800/60">
            <div class="space-y-1">
              <span class="text-[10px] text-slate-500 font-mono uppercase block">Approved Housing Loans</span>
              <span class="text-sm font-bold text-slate-200 font-mono block">
                ${pledger.approvedLoans.toLocaleString()}
              </span>
              <span class="text-[9px] text-slate-500 font-mono block">
                Loan ratio: {((pledger.approvedLoans / pledger.collateralValue) * 100).toFixed(0)}% of collateral
              </span>
            </div>
            <div class="space-y-1 text-right">
              <span class="text-[10px] text-slate-500 font-mono uppercase block">Contract Status</span>
              {#if pledger.signedContract}
                <div class="flex items-center justify-end gap-1.5 text-emerald-400 text-xs font-mono font-bold mt-1">
                  <CheckCircle2 class="w-4 h-4 shrink-0" />
                  <span>Signed ({pledger.contractDate})</span>
                </div>
              {:else}
                <div class="flex items-center justify-end gap-1.5 text-amber-400 text-xs font-mono font-bold mt-1">
                  <Clock class="w-4 h-4 shrink-0" />
                  <span>Contract Pending</span>
                </div>
              {/if}
            </div>
          </div>

          {#if pledger.missionStatement}
            <div class="p-3 bg-teal-500/5 rounded-xl border border-teal-500/10 space-y-1">
              <span class="text-[9px] uppercase tracking-wider font-mono text-teal-400 font-bold block">Mission & Alignment</span>
              <p class="text-xs text-slate-300 italic">"{pledger.missionStatement}"</p>
            </div>
          {/if}
          {#if pledger.impactSummary}
            <div class="p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/10 space-y-1">
              <span class="text-[9px] uppercase tracking-wider font-mono text-emerald-400 font-bold block">Consortium Impact Summary</span>
              <p class="text-xs text-slate-300 leading-normal">{pledger.impactSummary}</p>
            </div>
          {/if}

          <div class="space-y-2">
            <span class="text-[10px] text-slate-500 font-mono uppercase tracking-wider block">Signed Shared Documents</span>
            <div class="space-y-1.5 max-h-32 overflow-y-auto pr-1">
              {#each pledger.documents as doc}
                <div class="bg-slate-950 px-3 py-2 rounded-lg border border-slate-900 flex items-center justify-between text-xs">
                  <div class="flex items-center gap-2 truncate">
                    <FileText class="w-4 h-4 text-slate-400 shrink-0" />
                    <div class="truncate">
                      <span class="text-slate-300 font-medium font-sans truncate block">{doc.name}</span>
                      <span class="text-[9px] text-slate-500 font-mono block">
                        Category: {doc.category} • {doc.dateSigned} • {doc.version}
                      </span>
                    </div>
                  </div>
                  <button class="text-slate-500 hover:text-slate-300 ml-2" title="Mock Download">
                    <Download class="w-3.5 h-3.5" />
                  </button>
                </div>
              {/each}
            </div>
          </div>
        </div>

        <div class="flex gap-2 pt-3 border-t border-slate-800/80">
          {#if !pledger.signedContract}
            <button onclick={() => handleSignContract(pledger)}
              class="flex-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 font-semibold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all">
              <ShieldCheck class="w-4 h-4" />
              <span>Execute Governance Contract</span>
            </button>
          {:else}
            <div class="flex-1 bg-emerald-500/5 border border-emerald-500/10 py-2 rounded-xl text-emerald-400/80 text-xs font-mono font-semibold flex items-center justify-center gap-1.5">
              <CheckCircle2 class="w-4 h-4" />
              <span>Governance Authorized</span>
            </div>
          {/if}
          <button onclick={() => handleAddLoanApproval(pledger)}
            class="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1 hover:text-white transition-all border border-slate-700">
            <Plus class="w-3.5 h-3.5" />
            <span>Issue Loan Doc</span>
          </button>
        </div>
      </div>
    {/each}
  </div>
</div>
