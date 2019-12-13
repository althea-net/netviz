<script>
  import { onMount } from "svelte";
  import data from "../data";
  import Graph from "../components/graph.svelte";
  import Map from "../components/map.svelte";
  import List from "../components/list.svelte";
  import Import from "../components/import.svelte";
  import Menu from "../components/menu.svelte";
  import Debugging from "../components/debugging.svelte";
  import Location from "../components/location.svelte";
  import { graph, showGraph, importing, ip, links, map, nodes } from "../store";
  import { latLng2Point } from "../utils/map";
  import { SHA3 } from "sha3";

  let baseUrl = "http://192.168.10.1:4877";
  let images;
  let mapReady = false;
  let graphReady = false;
  let loginFailed = false;
  let needPassword = false;
  let noConnection = true;
  let password;

  const loadImage = n => {
    n.img = images[0];
    if (n.offline) {
      n.img = images[4];
    } else if (n.neighbor) {
      n.img = images[2];
    } else if (n.id === $ip) {
      n.img = images[1];
    }
  };

  let poll;
  const init = () => {
    clearInterval(poll);
    if (typeof window !== "undefined") {
      if (window.localStorage.getItem("devmode") === "true") {
        doImport();
      } else {
        getData();
        poll = setInterval(getData, 8000);
      }
    }
  };

  if (typeof window !== "undefined") {
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

  const login = async () => {
    let salt = "RitaSalt";
    let Authorization =
      "Basic " +
      btoa(
        "rita:" +
          SHA3(512)
            .update(password + salt)
            .digest("hex")
      );
    let headers = { Authorization };

    try {
      let res = await fetch(baseUrl + "/info", { headers });
      if (res.status === 403) throw new Error("wrong password");
      let json = await res.json();

      window.sessionStorage.setItem("Authorization", Authorization);
      needPassword = false;
      getData();
    } catch (e) {
      loginFailed = true;
      console.log(e);
    }

    return json;
  };

  const getData = async () => {
    if (!window.location.href.includes("althea.net")) baseUrl = "/api";

    let Authorization = window.sessionStorage.getItem("Authorization");
    let headers = { Authorization };

    let res = await fetch(`${baseUrl}/neighbors`, { headers });
    if (!res.ok) {
      noConnection = true;
      if (res.status === 403) needPassword = true;
      return;
    }

    const neighbors = await res.json();

    res = await fetch(`${baseUrl}/routes`, { headers });
    const routes = await res.json();

    res = await fetch(`${baseUrl}/mesh_ip`, { headers });
    $ip = (await res.json()).mesh_ip;

    const d = data($ip, neighbors, routes);
    $links = d.links;

    let updateNeeded = false;

    if (!$nodes) {
      $nodes = JSON.parse(window.localStorage.getItem("nodes")) || d.nodes;
      $nodes.map(n => loadImage(n));
      graphReady = true;
      updateNeeded = true;
    }

    d.nodes.map(n => {
      let prev = $nodes.find(p => p.id === n.id);
      if (!prev) {
        loadImage(n);
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
        n.offline = true;
      } else if (n.offline) {
        n.offline = false;
        updateNeeded = true;
      }

      loadImage(n);
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
    $nodes = JSON.parse(window.localStorage.getItem("nodes")) || [];
    const res = await fetch("network.json");
    const json = await res.json();
    let { nodes: savedNodes, links: savedLinks } = json;


    $nodes.map(n => loadImage(n));
    if (!$nodes || !$nodes.length) {
      $nodes = savedNodes;
      $nodes.map(n => loadImage(n));
    }

    $links = savedLinks.map(l => {
      l.source = $nodes.find(n => n.id === l.source.id);
      l.target = $nodes.find(n => n.id === l.target.id);
      if (!l.source || !l.target) return undefined;
      return l;
    }).filter(l => l);

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

  .menu img {
    width: 30px;
  }
</style>

{#if needPassword}
  <div class="flex w-100">
    <div class="m-auto mt-5">
      <label>Password</label>
      <div>
        <input name="password" bind:value={password} />
        <button on:click={login}>Submit</button>
        {#if loginFailed}
          <div class="text-red-700">Incorrect</div>
        {/if}
      </div>
    </div>
  </div>
{:else}
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
          <Menu />
        {/if}
        {#if $importing}
          <Import />
        {/if}
      </div>
      {#if showMenu}
        <List />
      {/if}
    </div>
  {/if}
{/if}
