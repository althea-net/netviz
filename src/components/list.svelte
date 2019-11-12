<script>
  import { graph, links, map, nodes, selected, zooming } from "../store";
  import { latLng2Point } from "../utils/map";

  const persist = ({ id, label, latlng }) =>
    window.localStorage.setItem(id, JSON.stringify({ id, label, latlng }));

  const update = n => {
    let node = $graph.graphData().nodes.find(node => node.id === n.id);
    node.x = n.fx;
    node.y = n.fy;
    node.fx = n.fx;
    node.fy = n.fy;
  };

  const select = n => {
    $selected = n.id;
    $zooming = false;
  };

  const getAddress = async n => {
    try {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${n.address}&key=AIzaSyCIqlinIzzCoLCwThCqUcsGgheMjbMg6EQ`
      );
      const json = await res.json();
      const { lat, lng } = json.results[0].geometry.location;
      n = $graph.graphData().nodes.find(node => node.id === n.id);
      n.lat = lat;
      n.lng = lng;
      n.latlng = new google.maps.LatLng(lat, lng);
      persist(n);
      let point = latLng2Point(n.latlng, $map);
      const center = JSON.parse(window.localStorage.getItem("center"));
      let referenceLatLng = new google.maps.LatLng(center.lat, center.lng);
      let referencePoint = latLng2Point(referenceLatLng, $map);
      let z = 1;
      switch ($map.getZoom()) {
        case 17:
          z = 4;
          break;
        case 16:
          z = 2;
          break;
        case 14:
          z = 0.5;
          break;
        case 13:
          z = 0.25;
          break;
        default:
        case 15:
          z = 1;
          break;
      }

      n.x = (point.x - referencePoint.x) / z;
      n.y = (point.y - referencePoint.y) / z;
      n.fx = (point.x - referencePoint.x) / z;
      n.fy = (point.y - referencePoint.y) / z;
    } catch (e) {
      console.log("Problem geocoding address", e);
    }
  };

const init = el => { el.focus(); el.select(); };
</script>

<style>
  .node {
    @apply border p-4 cursor-pointer;
  }

  .node label {
    @apply my-auto;
  }

  .selected {
    @apply font-bold;
  }

  input {
    @apply w-full;
  }

  .list {
    @apply max-h-screen overflow-y-scroll;
  }
</style>

<div class="list">
  {#each ($nodes || []).sort((a, b) => (a.id < b.id ? 1 : -1)) as n (n.id)}
    <div class="node" on:click={e => select(n)}>
      <div class="mb-2">
        <label for={n.id} class:selected={n.id === $selected}>{n.label || n.id}</label>
      </div>

      {#if n.id === $selected}
        <div class="mb-2">
          <label for={n.id}>Name</label>
          <input
            id={n.id}
            bind:value={n.label}
            bind:this={n.el}
            on:keyup={e => persist(n)}
            use:init />
        </div>

        <form
          class="flex mb-2"
          on:submit={e => {
            e.preventDefault();
            getAddress(n);
          }}>
          <div class="mr-2">
            <label for={`${n.id}_address`}>Address</label>
            <input id={`${n.id}_address`} bind:value={n.address} />
          </div>
          <button class="mt-auto">Search</button>
        </form>

        <div class="flex flex-wrap">
          <div class="mr-2">
            <label>Lat</label>
            <input bind:value={n.lat} on:keyup={e => persist(n)} />
          </div>

          <div>
            <label>Lng</label>
            <input bind:value={n.lng} on:keyup={e => persist(n)} />
          </div>
        </div>
      {/if}
    </div>
  {/each}
</div>
