<script>
  import { onMount, tick } from "svelte";
  let nodes = [];

  onMount(async () => {
    let res = await fetch("/nodes");
    let nodes = await res.json();
    let minutes = Array.from(Array(60).keys());
    let keys = Object.keys(nodes);
    let values = Object.values(nodes);

    tick().then(() => {
      keys.map(id => {
        let data = minutes.map(minute => {
          let start = minute * 60;
          let end = (minute+1) * 60;
          let pings = 0;
          Object.keys(nodes[id]).filter(t => t > start && t <= end).map(k => pings += nodes[id][k]);
          return { minute, pings }
        });

        data = [{ minute: 1, pings: 5 }];

        let ndx = crossfilter(data),
          dimension = ndx.dimension(d => d.minute),
          group = dimension.group().reduceSum(d => d.pings);

        console.log(ndx);

        let chart = dc
          .barChart("#a" + id.replace(/\W/g, ""))
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
