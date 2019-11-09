<script>
  import { graph, showGraph, map, nodes } from "../store";
  import { latLng2Point } from "../utils/map";

  let tr, bl;
  setInterval(() => {
    tr = $map.getBounds().getNorthEast();
    bl = $map.getBounds().getSouthWest();
  }, 500);

  $: touched = $nodes && $nodes.find(n => n.lastTouched);
</script>

<div class="p-4">
  <div>tr {tr}</div>
  <div>bl {bl}</div>
  <br />
  {#if touched && touched.latlng}
    <div>latlng {JSON.stringify(touched.latlng)}</div>
    <div>
      fx, fy {JSON.stringify({ x: touched.fx, y: touched.fy })}
    </div>
    <div>
      px, py {JSON.stringify(latLng2Point(touched.latlng, $map))}
    </div>
  {/if}
</div>
