<script>
  import { onMount, tick } from "svelte";
  let keys = [];
  let names = {};
  let nodes;
  let minutes = Array.from(Array(60).keys());
  let initialized = false;
  let organizer;
  let password;
  let failed;

  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json"
  };

  const getData = async () => {
    let res = await fetch("/network/heartbeats", {
      method: "POST",
      body: JSON.stringify({ list: Object.keys(names) }),
      headers
    });

    let curr = await res.json();

    if (!initialized) keys = Object.keys(curr);

    tick().then(() => {
      keys.map(async id => {
        let offset = new Date().getMinutes() - 59;
        let data = minutes.map(minute => {
          let start = minute * 60;
          let end = (minute + 1) * 60;
          let pings = 0;
          if (60 - (minute - offset) < 0) offset += 59;
          Object.keys(curr[id])
            .filter(t => t > start && t <= end)
            .map(k => (pings += curr[id][k]));
          return { minute: 60 - (minute - offset), pings };
        });

        if (!initialized) {
          tick().then(() => {
            nodes = curr;
            nodes[id].ndx = crossfilter(data);
            let dimension = nodes[id].ndx.dimension(d => d.minute);
            let group = dimension.group().reduceSum(d => d.pings);

            dc.barChart("#a" + id.replace(/\W/g, ""))
              .x(d3.scaleLinear().domain([60, 0]))
              .y(d3.scaleLinear().domain([0, 12]))
              .elasticY(false)
              .evadeDomainFilter(true)
              .brushOn(false)
              .xAxisLabel("minutes ago")
              .yAxisLabel("pings")
              .dimension(dimension)
              .group(group);

            dc.renderAll();
            initialized = true;
          });
        } else {
          nodes[id].ndx.remove(() => true);
          nodes[id].ndx.add(data);
          dc.redrawAll();
        }
      });
    });
  };

  onMount(() => {
    names = JSON.parse(window.localStorage.getItem("names")) || {};
    getData();
    setInterval(getData, 5000);
  });

  let node;
  const addNode = () => {
    names[node] = "";
    window.localStorage.setItem("names", JSON.stringify(names));
    initialized = false;
  };

  const delNode = id => {
    delete names[id];
    window.localStorage.setItem("names", JSON.stringify(names));
    initialized = false;
  };

  const loadNodes = async e => {
    try {
      let res = await fetch("/network/nodes", {
        method: "POST",
        body: JSON.stringify({ organizer, password }),
        headers
      });

      if (res.status === 401) failed = true;

      if (res.ok) {
        failed = false;
        names = await res.json();
        Object.keys(res).map(k => {
          if (!names[k]) names[k] = res[k];
        });
        window.localStorage.setItem("names", JSON.stringify(names));
      }
    } catch (e) {
      console.log("err", e);
    }
  };
</script>

<style>
  .failed {
    border: 1px solid red;
  }
</style>

<div class="w-full p-4 flex flex-wrap">
  <form on:submit|preventDefault={addNode} class="mr-2 mb-2">
    <input bind:value={node} placeholder="WG Pubkey" />
    <button>Add Node</button>
  </form>

  <form on:submit|preventDefault={loadNodes}>
    <input
      bind:value={organizer}
      placeholder="Organizer Address"
      class:failed />
    <input
      bind:value={password}
      placeholder="Password"
      type="password"
      class:failed />
    <button>Load Nodes</button>
  </form>
</div>

<div class="flex flex-wrap -mx-2">
  {#each keys as id (id)}
    <div class="card w-full md:w-1/2 px-2">
      <div class="flex">
        <h1 class="text-lg text-center mr-2 break-all">{names[id] || id}</h1>
        <img
          src="trash.svg"
          alt="Trash Can Icon"
          on:click={() => delNode(id)}
          style="width: 20px"
          class="ml-auto cursor-pointer" />
      </div>
      <div id={'a' + id.replace(/\W/g, '')} />
    </div>
  {/each}
</div>
