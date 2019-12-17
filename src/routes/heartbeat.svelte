<script>
  import { onMount, tick } from "svelte";
  let keys = [];
  let names = {};
  let nodes;
  let nodeList;
  let minutes = Array.from(Array(60).keys());
  let initialized = false;
  let organizer;
  let password;

  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json"
  };

  const getData = async () => {

    let res = await fetch("/network/heartbeats", {
      method: "POST",
      body: JSON.stringify({ list: nodeList }),
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
    nodeList = JSON.parse(window.localStorage.getItem("heartbeatNodes")) || [];
    getData();
    setInterval(getData, 5000);
  });

  let node;
  const addNode = () => {
    nodeList.push(node);
    window.localStorage.setItem("heartbeatNodes", JSON.stringify(nodeList));
    initialized = false;
  };

const delNode = id => {
  let i = nodeList.findIndex(n => n === id);
  if (i > -1) nodeList.splice(i, 1);
  window.localStorage.setItem("heartbeatNodes", JSON.stringify(nodeList));
  initialized = false;
} 

const loadNodes = async () => {
  let res = await fetch("/network/nodes", {
    method: "POST",
    body: JSON.stringify({ organizer, password }),
    headers
  });
  let list = await res.json();
  Object.keys(list).map(n => nodeList.push(n));
  nodeList = nodeList.filter((v, i, self) => self.indexOf(v) === i);
  window.localStorage.setItem("heartbeatNodes", JSON.stringify(nodeList));
} 
</script>

<style>
  .card { min-width: 550px; } 
</style>

<div class="w-full p-4">
  <input bind:value={node} placeholder="WG Pubkey" />
  <button on:click={addNode}>Add Node</button>

  <input bind:value={organizer} placeholder="Organizer Address" />
  <input bind:value={password} placeholder="Password" type="password" />
  <button on:click={loadNodes}>Load Nodes</button>
</div>

  <div class="flex flex-wrap">
    {#each keys as id (id)}
      <div class="card">
        <div class="flex">
          <h1 class="text-lg text-center mr-2">{names[id] || id}</h1>
          <img src="trash.svg" alt="Trash Can Icon" on:click={() => delNode(id)} style="width: 20px" class="ml-auto cursor-pointer" />
        </div>
        <div id={'a' + id.replace(/\W/g, '')} />
      </div>
    {/each}
  </div>
