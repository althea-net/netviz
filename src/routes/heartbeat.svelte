<script>
  import { onMount, tick } from "svelte";
  let nodes = [];

  onMount(async () => {
    let res = await fetch("/nodes");
    let json = await res.json();
    let minutes = Array.from(Array(60).keys());
    let data = minutes.map(minute => ({
      minute,
      beats: Math.floor(Math.random() * 13)
    }));
    nodes = Object.keys(json);

    tick().then(() => {
      nodes.map(id => {
        let ndx = crossfilter(data),
          dimension = ndx.dimension(d => d.minute),
          group = dimension.group().reduceSum(d => d.beats);

        let chart = dc.barChart("#a" + id.replace(/\W/g, ""))
          .x(d3.scaleLinear().domain([0, 60]))
          .brushOn(false)
          .xAxisLabel("minute")
          .yAxisLabel("pings")
          .dimension(dimension)
          .group(group)
          .render();
      });
    });
  });
</script>

<div class="flex flex-wrap">
  {#each nodes as id (id)}
    <div>
      <h1 class="text-lg text-center">{id}</h1>
      <div id={'a' + id.replace(/\W/g, '')} />
    </div>
  {/each}
</div>
