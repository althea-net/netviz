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
  import { latLng2Point } from "../utils/map";

  let images;
  let mapReady = false;
  let graphReady = false;
  let devmode = false;

  let poll;
  const init =  () => {
    clearInterval(poll);
    if (typeof window !== "undefined") {
      if (devmode) {
        doImport();
      } else {
        getData();
        poll = setInterval(getData, 8000);
      }
    }
  };

  const toggleDevMode = () => {
    devmode = !devmode;
    window.localStorage.setItem("devmode", devmode);
    init();
  };

  if (typeof window !== "undefined") {
    devmode = window.localStorage.getItem("devmode") === "true";
    images = [1, 2, 3, 4, 5].map(i => {
      const img = new Image();
      img.src = `house${i}.svg`;
      return img;
    });

    let script_tag = document.createElement("script");
    script_tag.setAttribute("type", "text/javascript");
    script_tag.setAttribute(
      "src",
      "https://maps.googleapis.com/maps/api/js?key=AIzaSyCIqlinIzzCoLCwThCqUcsGgheMjbMg6EQ&libraries=places&callback=initMap"
    );
    (
      document.getElementsByTagName("head")[0] || document.documentElement
    ).appendChild(script_tag);

    window.initMap = () => {
      mapReady = true;
    };
  }

  const getData = async () => {
    const baseUrl = "http://192.168.10.1:4877";

    let res = await fetch(`${baseUrl}/neighbors`);
    const neighbors = await res.json();

    res = await fetch(`${baseUrl}/routes`);
    const routes = await res.json();

    res = await fetch(`${baseUrl}/mesh_ip`);
    const ip = (await res.json()).mesh_ip;

    const d = data(ip, neighbors, routes);
    $links = d.links;

    let updateNeeded = false;

    if (!$nodes) {
      $nodes = JSON.parse(window.localStorage.getItem("nodes")) || d.nodes;
      $nodes.map(n => (n.img = images[Math.floor(Math.random() * 4)]));
      graphReady = true;
      updateNeeded = true;
    }

    d.nodes.map(n => {
      let prev = $nodes.find(p => p.id === n.id);
      if (!prev) {
        n.img = images[Math.floor(Math.random() * 4)];
        $nodes.push(n);
        updateNeeded = true;
        return;
      }

      Object.keys(n).map(
        k =>
          !["label", "latlng", "fx", "fy", "img"].includes(k) &&
          (prev[k] = n[k])
      );
    });

    $nodes.map(n => {
      let curr = d.nodes.find(p => p.id === n.id);

      if (!curr) {
        n.img = images[4];
        n.offline = true;
      } else if (n.offline) {
        n.offline = false;
        n.img = images[Math.floor(Math.random() * 4)];
        updateNeeded = true;
      }
    });

    $nodes = $nodes;

    if (updateNeeded) {
      $links.map(l => {
        l.source = $nodes.find(n => n.id === l.source.id);
        l.target = $nodes.find(n => n.id === l.target.id);
      });

      if ($graph) $graph.graphData({ links: $links, nodes: $nodes });
    }
  };

  const doImport = async () => {
    $nodes = JSON.parse(window.localStorage.getItem("nodes"));
    const res = await fetch("network.json");
    const json = await res.json();
    let { nodes: savedNodes, links: savedLinks } = json;

    $nodes.map(n => (n.img = images[Math.floor(Math.random() * 4)]));
    if (!$nodes) {
      $nodes = savedNodes;

      $nodes.map(n => (n.img = images[Math.floor(Math.random() * 4)]));
      let numbers = $nodes.map(n => n.metric || n.route_metric).filter(n => n);
      let ratio = Math.max(...numbers) / 10;
      numbers = numbers.map(v => Math.round(v / ratio));
      $nodes.map((n, i) => (n.normalizedMetric = numbers[i]));
    }
    

    $links = savedLinks.map(l => {
      l.source = $nodes.find(n => n.id === l.source.id);
      l.target = $nodes.find(n => n.id === l.target.id);
      l.color = l.target.color;
      return l;
    });

    let interval = setInterval(() => {
      if ($showGraph) {
        $graph.graphData({ nodes: $nodes, links: $links });

        clearInterval(interval);
      }
    }, 50);

    graphReady = true;
  };

  onMount(init);

  let showMenu = true;
  const toggleMenu = () => {
    showMenu = !showMenu;
  };
</script>

<style>
  .menu {
    position: absolute;
    left: 30px;
    top: 30px;
    background: white;
    z-index: 3;
  }

  @media (max-width: 600px) {
    .menu {
      top: 0;
      left: 0;
      width: 100vw;
    }
  }

  img {
    width: 30px;
  }
</style>

{#if graphReady}
  <Graph />
  {#if mapReady}
    <Map />
  {/if}
{/if}

{#if $showGraph}
  <div class="menu">
    <div class="p-4">
      <div class="flex">
        <img
          src="menu.svg"
          alt="Menu"
          class="mb-auto mr-2 mt-1 cursor-pointer hover:opacity-75"
          on:click={toggleMenu} />
        <Location />
      </div>
      {#if showMenu}
        <div class="mt-2">
          <Export />
          <Import />
          <Clear />
          <button class="p-4 bg-yellow-500" on:click={toggleDevMode}>
            {devmode ? 'Live Mode' : 'Dev Mode'}
          </button>
        </div>
      {/if}
    </div>
    {#if showMenu}
      <List />
    {/if}
  </div>
{/if}
