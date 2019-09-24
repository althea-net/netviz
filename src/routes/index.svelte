<script context="module">
  import data from "../data";

  export async function preload(page, session) {
    const res = await this.fetch("installed.json");
    const neighbors = await res.json();
    return { neighbors };
  }
</script>

<script>
  import Graph from "../components/graph.svelte";
  import { links, nodes, selected, zooming } from "../store";

  export let neighbors;
  const res = data(neighbors);
  $links = res.links;
  $nodes = res.nodes;

  const select = n => {
    $selected = n.id;
    $zooming = false;
    if (n.el) n.el.focus();
  };
</script>

<style>
  .node {
    @apply my-auto cursor-pointer;
  }

  .node.selected {
    @apply font-bold;
  }
</style>

<div class="flex flex-wrap w-100">
  <div class="w-full md:w-1/2">
    <Graph />
  </div>
  <div class="w-full md:w-1/2">
    <div class="rounded shadow-lg px-6 py-4 m-4 max-h-screen overflow-y-scroll">
      {#each $nodes as n (n.id)}
        <div
          class="flex flex-wrap justify-between mb-2"
          on:click={e => select(n)}>
          <div class="node w-full lg:w-1/2" class:selected={n.id === $selected}>
            {n.id}
          </div>
          <input
            bind:value={n.label}
            class="border p-2 w-full lg:w-1/2"
            bind:this={n.el} />
        </div>
      {/each}
    </div>
  </div>
</div>
