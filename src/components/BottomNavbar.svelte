<script>
  import { LayoutDashboard, Users, Construction, Home } from "lucide-svelte";

  let { activeScreen, onScreenChange } = $props();

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "pledgers", label: "Pledgers", icon: Users },
    { id: "projects", label: "Projects", icon: Construction },
    { id: "units", label: "Units", icon: Home },
  ];
</script>

<nav
  class="fixed bottom-0 left-0 right-0 z-50 bg-[#1e293b]/95 backdrop-blur-md border-t border-slate-800 shadow-lg px-4 pb-safe-bottom"
  id="bottom-navigation"
>
  <div class="max-w-md mx-auto flex justify-between items-center h-16">
    {#each navItems as item}
      {@const Icon = item.icon}
      {@const isActive = activeScreen === item.id}
      <button
        id="nav-btn-{item.id}"
        onclick={() => onScreenChange(item.id)}
        class="relative flex flex-col items-center justify-center flex-1 h-full transition-all duration-300 {isActive
          ? "text-teal-400 font-medium"
          : "text-slate-400 hover:text-slate-200"}"
      >
        <div
          class="p-1 rounded-xl transition-all duration-300 {isActive
            ? "bg-teal-500/10 scale-110"
            : ""}"
        >
          <Icon class="w-6 h-6" />
        </div>
        <span class="text-[10px] mt-1 tracking-wider uppercase font-mono">
          {item.label}
        </span>
        {#if isActive}
          <div class="absolute top-0 w-8 h-[2px] bg-teal-400 rounded-full" />
        {/if}
      </button>
    {/each}
  </div>
</nav>
