<script>
  import { derived } from "svelte/store";
  import { graph, links, map, nodes, selected, zooming } from "../store";
  import { latLng2Point } from "../utils/map";

  const persist = n => {
    let { id, label, lat, lng, latlng } = n;
    latlng = new google.maps.LatLng(lat, lng);
    let point = latLng2Point(latlng, $map);
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
    window.localStorage.setItem("nodes", JSON.stringify($nodes));
  };

  const select = n => {
    if ($selected === n.id) $selected = undefined;
    else $selected = n.id;
    $zooming = false;
  };

  const getAddress = async n => {
    try {
      let request = {
        query: n.address,
        fields: ["name", "geometry"],
        locationBias: $map.getCenter()
      };

      let service = new google.maps.places.PlacesService($map);

      service.findPlaceFromQuery(request, function(results, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
          const loc = results[0].geometry.location;
          n.lat = loc.lat();
          n.lng = loc.lng();
          $nodes = $nodes;
          persist(n);
        }
      });
    } catch (e) {
      console.log("Problem geocoding address", e);
    }
  };

  const init = el => {
    el.focus();
    el.select();
  };

  let sorted;
  $: sorted = ($nodes || []).sort((a, b) => (a.id < b.id ? 1 : -1));

  const remove = n => {
    $nodes.splice($nodes.findIndex(p => n.id === p.id), 1);

    $links = $graph.graphData().links;

    let c = $links.filter(l => l.source.id === n.id).length;
    for (let i = 0; i < c; i++) {
      let x = $links.findIndex(l => l.source.id === n.id);
      $links.splice(x, 1);
    }

    c = $links.filter(l => l.target.id === n.id).length;
    for (let i = 0; i < c; i++) {
      let x = $links.findIndex(l => l.target.id === n.id);
      $links.splice(x, 1);
    }

    window.localStorage.setItem("nodes", JSON.stringify($nodes));
  };
</script>

<style>
  .node {
    @apply border;
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

  .item {
    @apply cursor-pointer p-4;
  }

  .offline {
    @apply bg-red-400;
  }
</style>

<div class="list">
  {#each sorted as n (n.id)}
    <div class="node">
      <div
        on:click={e => {
          e.preventDefault();
          select(n);
        }}
        class="flex item hover:bg-gray-200"
        class:offline={n.offline}>
        <label
          for={n.id}
          class:selected={n.id === $selected}
          class="cursor-pointer">
          {n.label || n.id}
        </label>
        {#if n.offline}
          <img
            src="trash.svg"
            alt="Trash"
            width="20"
            height="20"
            class="ml-auto"
            on:click={() => remove(n)} />
        {/if}
      </div>

      {#if n.id === $selected}
        <div class="p-4 pt-0">
          <div class="mb-2">
            <label for={n.id}>Name</label>
            <input
              id={n.id}
              bind:value={n.label}
              bind:this={n.el}
              on:input={e => persist(n)}
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
            <button class="mt-auto">Set</button>
          </form>

          <div class="mb-2">
            <label>Lat</label>
            <input bind:value={n.lat} on:input={e => persist(n)} />
          </div>

          <div>
            <label>Lng</label>
            <input bind:value={n.lng} on:input={e => persist(n)} />
          </div>
        </div>
      {/if}
    </div>
  {/each}
</div>
