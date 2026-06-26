<script>
  import { onMount } from "svelte";
  import { slide } from "svelte/transition";
  import { api } from "../api";
  import AreaChart from "./AreaChart.svelte";
  import {
    DollarSign,
    TrendingUp,
    Clock,
    AlertCircle,
    CheckCircle2,
    ArrowUpRight,
    ArrowDownLeft,
    Coins,
    RefreshCw,
    Activity,
    Plus,
    Loader2,
  } from "lucide-svelte";

  let { projects, onRefreshData } = $props();

  let loading = $state(true);
  let error = $state(null);
  let summary = $state(null);
  let schedules = $state([]);
  let transactions = $state([]);
  let activeForm = $state(null);
  let submitting = $state(false);
  let selectedProjectId = $state(projects[0]?.id || "");
  let disburseAmount = $state(250000);

  // Keep selectedProjectId in sync when projects change
  $effect(() => {
    if (projects.length > 0 && !projects.find((p) => p.id === selectedProjectId)) {
      selectedProjectId = projects[0].id;
    }
  });
  let disburseDesc = $state("Phase 1 Prefab Foundation & Assembly");
  let repayAmount = $state(50000);
  let selectedScheduleId = $state("");
  let repayDesc = $state("EHP Monthly Rental Pool Reinvestment");

  let chartData = $derived(
    (() => {
      let cumulativeDebt = 0;
      const sorted = [...transactions].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      );
      return sorted.map((t) => {
        if (t.type === "Disbursement") cumulativeDebt += t.amount;
        else if (t.type === "Repayment") cumulativeDebt -= t.amount;
        else if (t.type === "Interest Accrual") cumulativeDebt += t.amount;
        return {
          date: new Date(t.date).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
          }),
          amount: t.amount,
          type: t.type,
          outstandingDebt: Math.max(0, cumulativeDebt),
        };
      });
    })(),
  );

  let overdueAlerts = $derived(schedules.filter((s) => s.status === "Overdue"));
  let upcomingAlerts = $derived(schedules.filter((s) => s.status === "Upcoming"));

  async function loadFinancialData() {
    loading = true;
    try {
      const [sumData, schedData, transData] = await Promise.all([
        api.getFinancialSummary(),
        api.getRepayments(),
        api.getTransactions(),
      ]);
      summary = sumData;
      schedules = schedData;
      transactions = transData;
      error = null;
    } catch (err) {
      console.error(err);
      error = "Failed to fetch SQLite financial datasets.";
    } finally {
      loading = false;
    }
  }

  onMount(() => {
    loadFinancialData();
  });

  async function handleAccrueInterest() {
    submitting = true;
    try {
      await api.accrueInterest();
      await loadFinancialData();
      if (onRefreshData) onRefreshData();
    } catch (err) {
      alert(err.message || "Failed to accrue compound interest");
    } finally {
      submitting = false;
    }
  }

  async function handleDisburseLoan(e) {
    e.preventDefault();
    if (!selectedProjectId || disburseAmount <= 0) return;
    submitting = true;
    try {
      await api.disburseLoan(selectedProjectId, disburseAmount, undefined, disburseDesc);
      activeForm = null;
      await loadFinancialData();
      if (onRefreshData) onRefreshData();
    } catch (err) {
      alert(err.message || "Loan disbursement failed.");
    } finally {
      submitting = false;
    }
  }

  async function handleRepayLoan(e) {
    e.preventDefault();
    if (!selectedProjectId || repayAmount <= 0) return;
    submitting = true;
    try {
      await api.submitRepayment(selectedProjectId, repayAmount, selectedScheduleId || undefined, undefined, repayDesc);
      activeForm = null;
      await loadFinancialData();
      if (onRefreshData) onRefreshData();
    } catch (err) {
      alert(err.message || "Loan repayment record failed.");
    } finally {
      submitting = false;
    }
  }
</script>

<div class="space-y-6" id="ehp-treasury-center">
  {#if loading}
    <div class="flex flex-col items-center justify-center p-16 space-y-3 bg-slate-900/20 border border-slate-800 rounded-2xl">
      <Loader2 class="w-8 h-8 text-teal-400 animate-spin" />
      <span class="text-xs font-mono text-slate-500">Retrieving EHP Ledger...</span>
    </div>
  {:else}
    <!-- KPI Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="bg-slate-900 border border-slate-800/80 p-5 rounded-2xl space-y-2">
        <div class="flex justify-between items-start">
          <span class="text-[10px] uppercase font-mono tracking-wider text-slate-500">Cumulative Disbursed</span>
          <div class="p-2 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20"><ArrowUpRight class="w-4 h-4" /></div>
        </div>
        <div>
          <span class="text-xl font-bold text-white font-mono block">
            ${summary?.totalLoansDisbursed?.toLocaleString() || "0"}
          </span>
          <span class="text-[9px] text-slate-400 font-mono block">Active EHP capital deployments</span>
        </div>
      </div>
      <div class="bg-slate-900 border border-slate-800/80 p-5 rounded-2xl space-y-2">
        <div class="flex justify-between items-start">
          <span class="text-[10px] uppercase font-mono tracking-wider text-slate-500">Total Repaid</span>
          <div class="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"><ArrowDownLeft class="w-4 h-4" /></div>
        </div>
        <div>
          <span class="text-xl font-bold text-white font-mono block">
            ${summary?.totalRepaymentsReceived?.toLocaleString() || "0"}
          </span>
          <span class="text-[9px] text-emerald-400 font-mono block">Reinvestment pool feeding grid</span>
        </div>
      </div>
      <div class="bg-slate-900 border border-slate-800/80 p-5 rounded-2xl space-y-2">
        <div class="flex justify-between items-start">
          <span class="text-[10px] uppercase font-mono tracking-wider text-slate-500">Interest Accrued</span>
          <div class="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20"><TrendingUp class="w-4 h-4" /></div>
        </div>
        <div>
          <span class="text-xl font-bold text-white font-mono block">
            ${summary?.totalInterestAccrued?.toLocaleString() || "0"}
          </span>
          <span class="text-[9px] text-slate-400 font-mono block">Accruing compounding yields</span>
        </div>
      </div>
      <div class="bg-slate-900 border border-slate-850 p-5 rounded-2xl space-y-2 relative overflow-hidden">
        <div class="flex justify-between items-start">
          <span class="text-[10px] uppercase font-mono tracking-wider text-slate-500">Net Outstanding Debt</span>
          <div class="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20"><Coins class="w-4 h-4" /></div>
        </div>
        <div>
          <span class="text-xl font-bold text-white font-mono block">
            ${summary?.netOutstandingDebt?.toLocaleString() || "0"}
          </span>
          <span class="text-[9px] text-slate-400 font-mono block">Secured by pledged collateral assets</span>
        </div>
        <div class="absolute right-0 bottom-0 w-24 h-24 bg-teal-500/5 blur-3xl rounded-full" />
      </div>
    </div>

    <!-- Action Panel -->
    <div class="flex flex-wrap items-center justify-between gap-4 bg-slate-900/40 p-4 rounded-xl border border-slate-800">
      <div class="space-y-1">
        <h4 class="text-xs font-bold text-white uppercase font-mono">Automated Ledger Actions</h4>
        <p class="text-[10px] text-slate-400">Trigger smart-contract interest routines or record portfolio actions.</p>
      </div>
      <div class="flex flex-wrap gap-2">
        <button onclick={() => activeForm = activeForm === "disburse" ? null : "disburse"}
          class="bg-teal-500 hover:bg-teal-400 text-slate-950 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all">
          <Plus class="w-3.5 h-3.5" />
          <span>Disburse Development Loan</span>
        </button>
        <button onclick={() => activeForm = activeForm === "repay" ? null : "repay"}
          class="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all">
          <Coins class="w-3.5 h-3.5" />
          <span>Record Repayment</span>
        </button>
        <button onclick={handleAccrueInterest} disabled={submitting}
          class="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all border border-slate-700 disabled:opacity-50">
          <RefreshCw class="w-3.5 h-3.5 {submitting ? 'animate-spin' : ''}" />
          <span>Recalculate Interest (30-Day Cycle)</span>
        </button>
      </div>
    </div>

    <!-- Forms -->
    {#if activeForm === "disburse"}
      <div transition:slide class="bg-slate-950 border border-teal-500/20 p-5 rounded-2xl space-y-4">
        <h5 class="text-xs font-bold font-mono uppercase text-teal-400 flex items-center gap-1.5">
          <ArrowUpRight class="w-4 h-4" /> Disburse Loan capital to Construction Project
        </h5>
        <form onsubmit={handleDisburseLoan} class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="space-y-1">
            <label class="text-[10px] text-slate-400 uppercase font-mono">Select Destination Project</label>
            <select bind:value={selectedProjectId} class="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 text-xs">
              {#each projects as p}
                <option value={p.id}>{p.name}</option>
              {/each}
            </select>
          </div>
          <div class="space-y-1">
            <label class="text-[10px] text-slate-400 uppercase font-mono">Amount to Disburse ($)</label>
            <input type="number" bind:value={disburseAmount} class="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 text-xs font-mono" />
          </div>
          <div class="space-y-1">
            <label class="text-[10px] text-slate-400 uppercase font-mono">Ledger Description</label>
            <input type="text" bind:value={disburseDesc} class="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 text-xs" />
          </div>
          <div class="md:col-span-3 flex justify-end gap-2 pt-2">
            <button type="button" onclick={() => activeForm = null} class="px-3 py-1.5 bg-slate-900 text-slate-400 rounded-lg text-[10px]">Cancel</button>
            <button type="submit" disabled={submitting} class="px-4 py-1.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-lg text-[10px] disabled:opacity-50">
              Authorize Ledger Disbursement
            </button>
          </div>
        </form>
      </div>
    {/if}

    {#if activeForm === "repay"}
      <div transition:slide class="bg-slate-950 border border-emerald-500/20 p-5 rounded-2xl space-y-4">
        <h5 class="text-xs font-bold font-mono uppercase text-emerald-400 flex items-center gap-1.5">
          <ArrowDownLeft class="w-4 h-4" /> Record Loan Repayment
        </h5>
        <form onsubmit={handleRepayLoan} class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="space-y-1">
            <label class="text-[10px] text-slate-400 uppercase font-mono">Select Debtor Project</label>
            <select bind:value={selectedProjectId} class="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 text-xs">
              {#each projects as p}
                <option value={p.id}>{p.name}</option>
              {/each}
            </select>
          </div>
          <div class="space-y-1">
            <label class="text-[10px] text-slate-400 uppercase font-mono">Relate Repayment Schedule</label>
            <select bind:value={selectedScheduleId} class="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 text-xs">
              <option value="">-- No Direct Schedule --</option>
              {#each schedules.filter(s => s.project_id === selectedProjectId && s.status !== "Paid") as s}
                <option value={s.id}>Due: {s.due_date} (${s.amount_due.toLocaleString()} remaining)</option>
              {/each}
            </select>
          </div>
          <div class="space-y-1">
            <label class="text-[10px] text-slate-400 uppercase font-mono">Repayment Amount ($)</label>
            <input type="number" bind:value={repayAmount} class="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 text-xs font-mono" />
          </div>
          <div class="space-y-1">
            <label class="text-[10px] text-slate-400 uppercase font-mono">Source/Description</label>
            <input type="text" bind:value={repayDesc} class="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 text-xs" />
          </div>
          <div class="md:col-span-4 flex justify-end gap-2 pt-2">
            <button type="button" onclick={() => activeForm = null} class="px-3 py-1.5 bg-slate-900 text-slate-400 rounded-lg text-[10px]">Cancel</button>
            <button type="submit" disabled={submitting} class="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-[10px] disabled:opacity-50">Record Repayment</button>
          </div>
        </form>
      </div>
    {/if}

    <!-- Alerts + Chart -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 space-y-4 col-span-1">
        <h4 class="text-xs font-bold text-white uppercase font-mono flex items-center gap-1.5">
          <AlertCircle class="w-4 h-4 text-amber-400" /> Payment & Accrual Alerts
        </h4>
        {#if overdueAlerts.length > 0 || upcomingAlerts.length > 0}
          <div class="space-y-2 max-h-96 overflow-y-auto pr-1">
            {#each overdueAlerts as sched}
              <div class="bg-red-500/5 border border-red-500/20 p-3 rounded-xl flex items-start gap-2.5 text-xs">
                <AlertCircle class="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div class="space-y-1">
                  <div class="flex items-center gap-1.5">
                    <span class="font-bold text-rose-400 uppercase text-[9px] px-1.5 py-0.5 rounded bg-red-500/10 font-mono">Overdue</span>
                    <span class="text-[10px] text-slate-400 font-mono">Due: {sched.due_date}</span>
                  </div>
                  <p class="text-slate-300 font-medium font-sans leading-tight">{sched.projectName}</p>
                  <p class="text-slate-200 font-mono text-xs">Amount Due: <strong class="text-rose-400">${sched.amount_due.toLocaleString()}</strong></p>
                </div>
              </div>
            {/each}
            {#each upcomingAlerts as sched}
              <div class="bg-amber-500/5 border border-amber-500/15 p-3 rounded-xl flex items-start gap-2.5 text-xs">
                <Clock class="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div class="space-y-1">
                  <div class="flex items-center gap-1.5">
                    <span class="font-bold text-amber-400 uppercase text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 font-mono">Upcoming</span>
                    <span class="text-[10px] text-slate-400 font-mono">Due: {sched.due_date}</span>
                  </div>
                  <p class="text-slate-300 font-medium font-sans leading-tight">{sched.projectName}</p>
                  <p class="text-slate-200 font-mono text-xs">Amount Due: <strong class="text-slate-100">${sched.amount_due.toLocaleString()}</strong></p>
                </div>
              </div>
            {/each}
          </div>
        {:else}
          <div class="flex flex-col items-center justify-center p-8 text-center bg-slate-950 rounded-xl border border-slate-900/40 text-slate-500">
            <CheckCircle2 class="w-8 h-8 text-slate-700 mb-2" />
            <p class="text-[10px] font-mono leading-relaxed">No pending repayment alerts detected on ledger.</p>
          </div>
        {/if}
      </div>

      <div class="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 space-y-4 col-span-1 md:col-span-2">
        <h4 class="text-xs font-bold text-white uppercase font-mono flex items-center gap-1.5">
          <Activity class="w-4 h-4 text-teal-400" /> Portfolio Debt Progression Curve
        </h4>
        <div class="w-full bg-slate-950 rounded-xl p-2 border border-slate-900" style="height: 260px">
          {#if chartData.length > 0}
            <AreaChart data={chartData} dataKey="outstandingDebt" xKey="date" color="#14b8a6" height={256} />
          {:else}
            <div class="flex h-full items-center justify-center text-slate-500 text-xs font-mono">
              No ledger transactions recorded to trace progression.
            </div>
          {/if}
        </div>
      </div>
    </div>

    <!-- Transactions Ledger -->
    <div class="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 space-y-4">
      <div class="flex justify-between items-center">
        <h4 class="text-xs font-bold text-white uppercase font-mono">SQLite Real-time Transaction Ledger Log</h4>
        <span class="text-[9px] font-mono text-slate-500 uppercase">Non-repudiable Audit Trail</span>
      </div>
      <div class="overflow-x-auto rounded-xl border border-slate-800/80">
        <table class="w-full text-left border-collapse text-xs">
          <thead>
            <tr class="bg-slate-950 border-b border-slate-800 text-slate-400 font-mono text-[10px]">
              <th class="p-3">Transaction Date</th>
              <th class="p-3">EHP Project</th>
              <th class="p-3">Type</th>
              <th class="p-3">Amount (USD)</th>
              <th class="p-3">Allocation Log Details</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800/60 bg-slate-900/60 font-sans">
            {#each transactions as t}
              <tr class="hover:bg-slate-850/40">
                <td class="p-3 font-mono text-[11px] text-slate-400">{t.date}</td>
                <td class="p-3 font-semibold text-slate-200">{t.projectName || "EHP Portfolio Pool"}</td>
                <td class="p-3">
                  <span class="px-2 py-0.5 rounded font-mono text-[9px] font-bold {t.type === 'Disbursement' ? 'bg-teal-500/10 text-teal-400' : t.type === 'Repayment' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}">
                    {t.type}
                  </span>
                </td>
                <td class="p-3 font-mono font-bold text-slate-100">${t.amount.toLocaleString()}</td>
                <td class="p-3 text-slate-400 font-medium truncate max-w-xs" title={t.description}>{t.description}</td>
              </tr>
            {/each}
            {#if transactions.length === 0}
              <tr><td colspan={5} class="p-8 text-center text-slate-500 font-mono">No ledger records discovered.</td></tr>
            {/if}
          </tbody>
        </table>
      </div>
    </div>
  {/if}
</div>
