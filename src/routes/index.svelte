<script>
  import { onMount, tick } from "svelte";
  import data from "../data";
  import Graph from "../components/graph.svelte";
  import Map from "../components/map.svelte";
  import List from "../components/list.svelte";
  import Clear from "../components/clear.svelte";
  import Export from "../components/export.svelte";
  import Import from "../components/import.svelte";
  import { graph, showGraph, links, map, nodes } from "../store";

  let mapReady = false;
  let graphReady = false;
  let devmode = false;
  let images;

  const toggleDevMode = () => {
    devmode = !devmode;
    window.localStorage.setItem("devmode", devmode)
  } 

  if (typeof window !== "undefined") {
    devmode = window.localStorage.getItem("devmode");
    images = [1, 2, 3, 4].map(i => {
      const img = new Image();
      img.src = `house${i}.svg`;
      return img;
    });

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
      let res = await fetch(
        devmode ? "neighbors.json" : "http://192.168.10.1:4877/neighbors"
      );
      const neighbors = await res.json();

      res = await fetch(
        devmode ? "routes.json" : "http://192.168.10.1:4877/routes"
      );
      // res = await fetch("routes.json");
      const routes = await res.json();

      res = await fetch(
        devmode ? "ip.json" : "http://192.168.10.1:4877/mesh_ip"
      );
      const ip = (await res.json()).mesh_ip;

      const d = data(ip, neighbors, routes);


      if ($nodes) {
        let updateLinks = false;
        $nodes = d.nodes
          .map(n => {
            let prev = $nodes.find(p => p.id === n.id);
            if (!prev) {
              updateLinks = true;
              n.img = images[Math.floor(Math.random() * 4)];
              return n;
            } 

            Object.keys(n).map(
              k =>
                !["label", "latlng", "fx", "fy", "img"].includes(k) && (prev[k] = n[k])
            );

            return prev;
          })
          .filter(n => n);

          if (updateLinks) {
            $links = d.links;
            const graphData = { nodes: $nodes, links: $links };
            $graph.graphData(graphData);
          } 
      } else {
        $nodes = d.nodes.map(n => (n.img = images[Math.floor(Math.random() * 4)]) && n)
        // .map(n => (n.img = images[2]));
        $links = d.links;
        graphReady = true;
        tick().then(() => setTimeout(() => $graph.zoom(1), 50));
      }
    }
  };

  onMount(() => {
    getData();
    setInterval(getData, 3000);
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
  {#if showGraph}
  <div class="col">
    <Export />
    <Import />
    <Clear />
    <button class="p-4 bg-yellow-500" on:click={toggleDevMode}>
      {devmode ? "Live Mode" : "Dev Mode"}
    </button>
    <List />
  </div>
  {/if}
</div>
