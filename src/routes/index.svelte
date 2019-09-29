<script context="module">
  export async function preload(page, session) {
    const res = await this.fetch("neighbors.json");
    const neighbors = await res.json();
    return { neighbors };
  }
</script>

<script>
  import data from "../data";
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

  input {
    @apply border p-2 w-full;
  }

  .list {
    @apply rounded shadow-lg px-6 py-4 m-4 max-h-screen overflow-y-scroll;
  }

  .col {
    @apply w-full;
  }

  @screen lg {
    input,
    .col {
      @apply w-1/2;
    }
  }
</style>

<div class="flex flex-wrap w-100">
  <div class="col">
    <Graph />
  </div>
  <div class="col">
    <div class="list">
      {#each $nodes as n (n.id)}
        <div
          class="flex flex-wrap justify-between mb-2"
          on:click={e => select(n)}>
          <div class="node col" class:selected={n.id === $selected}>{n.id}</div>
          <input bind:value={n.label} bind:this={n.el} />
        </div>
      {/each}
    </div>
  </div>
</div>
