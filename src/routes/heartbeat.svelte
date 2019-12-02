<script>
  import { onMount, tick } from "svelte";
  let keys = [];
  let names;
  let nodes;
  let minutes = Array.from(Array(60).keys());
  let initialized = false;

  const loop = async () => {
    let res = await fetch("/nodes");
    let newnodes = await res.json();
    res = await fetch("/names");
    names = await res.json();

    if (!keys.length) keys = Object.keys(newnodes);

    tick().then(() => {
      keys.map(id => {
        let data = minutes.map(minute => {
          let start = minute * 60;
          let end = (minute+1) * 60;
          let pings = 0;
          Object.keys(newnodes[id]).filter(t => t > start && t <= end).map(k => pings += newnodes[id][k]);
          return { minute, pings }
        });

        if (!initialized) {
          nodes = newnodes;
          nodes[id].ndx = crossfilter(data);
          let dimension = nodes[id].ndx.dimension(d => d.minute);
          let group = dimension.group().reduceSum(d => d.pings);

          dc.barChart("#a" + id.replace(/\W/g, ""))
            .x(d3.scaleLinear().domain([0, 60]))
            .brushOn(false)
            .xAxisLabel("minutes ago")
            .yAxisLabel("pings")
            .dimension(dimension)
            .group(group);

          dc.renderAll();
          initialized = true;
        } else {
          nodes[id].ndx.remove(() => true);
          nodes[id].ndx.add(data);
          dc.redrawAll();
        } 
      });
    });
  } 


  onMount(() => {
    loop();
    setInterval(loop, 5000);
  });

</script>

<div class="flex flex-wrap">
  {#each keys as id (id)}
    <div class="card">
      <h1 class="text-lg text-center">{names[id] || id}</h1>
      <div id={'a' + id.replace(/\W/g, '')} />
    </div>
  {/each}
</div>
