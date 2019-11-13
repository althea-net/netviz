<script>
  import { onMount, tick } from "svelte";
  import data from "../data";
  import Graph from "../components/graph.svelte";
  import Map from "../components/map.svelte";
  import List from "../components/list.svelte";
  import Clear from "../components/clear.svelte";
  import Export from "../components/export.svelte";
  import Import from "../components/import.svelte";
  import Debugging from "../components/debugging.svelte";
  import Location from "../components/location.svelte";
  import { graph, showGraph, links, map, nodes } from "../store";

  let mapReady = false;
  let graphReady = false;
  let devmode = false;
  let images;

  const toggleDevMode = () => {
    devmode = !devmode;
    window.localStorage.setItem("devmode", devmode);
    getData();
  };

  if (typeof window !== "undefined") {
    devmode = window.localStorage.getItem("devmode") === "true";
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
      const routes = await res.json();

      res = await fetch(
        devmode ? "ip.json" : "http://192.168.10.1:4877/mesh_ip"
      );
      const ip = (await res.json()).mesh_ip;

      const d = data(ip, neighbors, routes);

      if ($nodes) {
        d.nodes
          .map(n => {
            let prev = $nodes.find(p => p.id === n.id);
            if (!prev) {
              n.img = images[Math.floor(Math.random() * 4)];
              return $nodes.push(n);
            }

            Object.keys(n).map(
              k =>
                !["label", "latlng", "fx", "fy", "img"].includes(k) &&
                (prev[k] = n[k])
            );

            return prev;
          });
      } else {
        $nodes = d.nodes.map(
          n => (n.img = images[Math.floor(Math.random() * 4)]) && n
        );
        // .map(n => (n.img = images[2]));
        $links = d.links;
        graphReady = true;
        tick().then(() => setTimeout(() => $graph.zoom(1), 50));
      }
    }
  };

  onMount(() => {
    getData();
    setInterval(getData, 8000);
  });
</script>

<style>
  .controls {
    position: absolute;
    left: 30px;
    top: 30px;
    background: white;
  } 
</style>

{#if graphReady}
  <Graph />
  {#if mapReady}
    <Map />
  {/if}
{/if}
{#if $showGraph}
  <div class="controls">
  <Export />
  <Import />
  <Clear />
  <button class="p-4 bg-yellow-500" on:click={toggleDevMode}>
    {devmode ? 'Live Mode' : 'Dev Mode'}
  </button>
  <Location />
  <List />
  </div>
{/if}

