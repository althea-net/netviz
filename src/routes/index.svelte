<script context="module">
  export async function preload(page, session) {
    //let res = await this.fetch("http://192.168.10.1:4877/neighbors");
    let res = await this.fetch("neighbors.json");
    const neighbors = await res.json();

    // res = await this.fetch("http://192.168.10.1:4877/routes");
    res = await this.fetch("routes.json");
    const routes = await res.json();

    res = await this.fetch("http://192.168.10.1:4877/mesh_ip");
    const ip = (await res.json()).mesh_ip;

    return { neighbors, routes, ip };
  }
</script>

<script>
  import data from "../data";
  import Graph from "../components/graph.svelte";
  import List from "../components/list.svelte";
  import Export from "../components/export.svelte";
  import Import from "../components/import.svelte";
  import { links, nodes } from "../store";

  export let neighbors;
  export let routes;
  export let ip;

  const d = data(ip, neighbors, routes);
  $links = d.links;
  $nodes = d.nodes;

  let labelled;

  if (!labelled && typeof window !== "undefined") {
    labelled = $nodes.map(n => ({
      label: window.localStorage.getItem(n.id),
      ...n
    }));

    $nodes = labelled;
  }
</script>

<div class="flex flex-wrap w-100">
  <div class="col">
    <Graph />
  </div>
  <div class="col">
    <Export />
    <Import />
    <List />
  </div>
</div>
