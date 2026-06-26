<script>
  let { data, dataKey, xKey, color = "#14b8a6", height = 256 } = $props();

  let svgHeight = $derived(height);
  let svgWidth = $derived(600);

  let points = $derived(
    data.map((d, i) => ({
      x: i,
      y: d[dataKey] || 0,
      label: d[xKey] || "",
      value: d[dataKey] || 0,
    })),
  );

  let maxVal = $derived(Math.max(...points.map((p) => p.value), 1));
  let paddedMax = $derived(maxVal * 1.15);

  function xPos(i) {
    return 40 + (i / Math.max(points.length - 1, 1)) * (svgWidth - 80);
  }

  function yPos(val) {
    return svgHeight - 30 - (val / paddedMax) * (svgHeight - 60);
  }

  let pathD = $derived(
    points
      .map((p, i) => `${i === 0 ? "M" : "L"} ${xPos(i).toFixed(1)} ${yPos(p.value).toFixed(1)}`)
      .join(" "),
  );

  let areaD = $derived(
    pathD +
      ` L ${xPos(points.length - 1).toFixed(1)} ${svgHeight - 30} L ${xPos(0).toFixed(1)} ${svgHeight - 30} Z`,
  );
</script>

<div class="w-full" style="height: {height}px">
  {#if points.length > 0}
    <svg
      viewBox="0 0 {svgWidth} {svgHeight}"
      class="w-full h-full"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stop-color={color} stop-opacity="0.2" />
          <stop offset="95%" stop-color={color} stop-opacity="0" />
        </linearGradient>
      </defs>

      <!-- Grid lines -->
      {#each [0, 0.25, 0.5, 0.75, 1] as frac}
        {@const y = yPos(paddedMax * frac)}
        <line
          x1={40}
          y1={y}
          x2={svgWidth - 40}
          y2={y}
          stroke="#1e293b"
          stroke-dasharray="3 3"
        />
      {/each}

      <!-- Area fill -->
      <path d={areaD} fill="url(#areaGrad)" />

      <!-- Line -->
      <path d={pathD} stroke={color} stroke-width="2" fill="none" />

      <!-- Dots -->
      {#each points as p, i}
        <circle cx={xPos(i)} cy={yPos(p.value)} r="3" fill={color} />
      {/each}

      <!-- X-axis labels -->
      {#each points as p, i}
        {#if i === 0 || i === points.length - 1 || i % Math.ceil(points.length / 5) === 0}
          <text
            x={xPos(i)}
            y={svgHeight - 8}
            text-anchor="middle"
            fill="#64748b"
            font-size="10"
          >
            {p.label}
          </text>
        {/if}
      {/each}

      <!-- Y-axis labels -->
      <text x={35} y={yPos(paddedMax)} text-anchor="end" fill="#64748b" font-size="10">
        ${(paddedMax / 1000000).toFixed(1)}M
      </text>
      {#if points.length > 0}
        <text x={35} y={yPos(0)} text-anchor="end" fill="#64748b" font-size="10">
          $0
        </text>
      {/if}
    </svg>
  {:else}
    <div class="flex h-full items-center justify-center text-slate-500 text-xs font-mono">
      No data to display
    </div>
  {/if}
</div>
