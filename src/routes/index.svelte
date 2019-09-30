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
  import List from "../components/list.svelte";
  import { links, nodes } from "../store";

  export let neighbors;
  const res = data(neighbors);
  $links = res.links;
  $nodes = res.nodes;
</script>

<div class="flex flex-wrap w-100">
  <div class="col">
    <Graph />
  </div>
  <div class="col">
    <List />
  </div>
</div>
