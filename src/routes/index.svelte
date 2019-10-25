<script>
  import { onMount, tick } from "svelte";
  import data from "../data";
  import Graph from "../components/graph.svelte";
  import Map from "../components/map.svelte";
  import List from "../components/list.svelte";
  import Clear from "../components/clear.svelte";
  import Export from "../components/export.svelte";
  import Import from "../components/import.svelte";
  import { graph, links, map, nodes } from "../store";

  let mapReady = false;
  let graphReady = false;

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
      mapReady = true;
    };
  }

  const getData = async () => {
    if (typeof window !== "undefined") {
      let res = await fetch("http://192.168.10.1:4877/neighbors");
      // let res = await fetch("neighbors.json");
      const neighbors = await res.json();

      res = await fetch("http://192.168.10.1:4877/routes");
      // res = await fetch("routes.json");
      const routes = await res.json();

      res = await fetch("http://192.168.10.1:4877/mesh_ip");
      const ip = (await res.json()).mesh_ip;

      const d = data(ip, neighbors, routes);

      if ($nodes) {
        $nodes = d.nodes.map(n => {
          let prev = $nodes.find(d => d.id === n.id);
          Object.keys(n).map(k => !(['label', 'latlng'].includes(k)) && (prev[k] = n[k]))
          return prev
        });
      } else {
        $nodes = d.nodes;
        $links = d.links;
        graphReady = true;
        tick().then(() => setTimeout(() => $graph.zoom(1), 50));
      }
    }
  };

  onMount(() => {
    getData();
    setInterval(getData, 5000);
  });
</script>

<div class="flex flex-wrap w-100">
  <div class="col relative">
    {#if graphReady}
      <Graph />
      {#if mapReady}
        <Map />
      {/if}
    {/if}
  </div>
  <div class="col">
    <Export />
    <Import />
    <Clear />
    <List />
  </div>
</div>
