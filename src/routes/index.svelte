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
  import { onMount } from "svelte";
  import data from "../data";
  import Graph from "../components/graph.svelte";
  import Map from "../components/map.svelte";
  import List from "../components/list.svelte";
  import Export from "../components/export.svelte";
  import Import from "../components/import.svelte";
  import { links, map, nodes } from "../store";

  export let neighbors;
  export let routes;
  export let ip;

  let ready = false;

  if (typeof window !== "undefined") {
    let script_tag = document.createElement("script");
    script_tag.setAttribute("type", "text/javascript");
    script_tag.setAttribute(
      "src",
      "https://maps.googleapis.com/maps/api/js?key=AIzaSyCIqlinIzzCoLCwThCqUcsGgheMjbMg6EQ&callback=initMap"
    );
    (
      document.getElementsByTagName("head")[0] || document.documentElement
    ).appendChild(script_tag);
    window.initMap = () => {
      ready = true;
    };
  }

  const d = data(ip, neighbors, routes);
  $links = d.links;
  $nodes = d.nodes;
</script>

<div class="flex flex-wrap w-100">
  <div class="col relative">
    {#if ready}
      <Map />
    {/if}
    <Graph />
  </div>
  <div class="col">
    <Export />
    <Import />
    <List />
  </div>
</div>
