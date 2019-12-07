<script>
  import { onMount, tick } from "svelte";
  let keys = [];
  let names;
  let nodes;
  let minutes = Array.from(Array(60).keys());
  let initialized = false;

  const loop = async () => {

  let headers = {
    Accept: "application/json",
    "Content-Type": "application/json"
  };
    let res = await fetch("/network/nodes", {
      method: "POST",
      body: JSON.stringify({
        nodes: ["ycRUJju+RCBTpkveFRZUWwjkxg0gPSP8iNG8tx8jBV0="]
      }),
      headers
    });
    let curr = await res.json();

    if (!keys.length) keys = Object.keys(curr);

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
          res = await fetch("/network/names");
          names = await res.json();

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
    loop();
    setInterval(loop, 5000);
  });
</script>

{#if names}
  <div class="flex flex-wrap">
    {#each keys as id (id)}
      <div class="card">
        <h1 class="text-lg text-center">{names[id] || id}</h1>
        <div id={'a' + id.replace(/\W/g, '')} />
      </div>
    {/each}
  </div>
{/if}
