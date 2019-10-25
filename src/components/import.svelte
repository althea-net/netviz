<script>
  import { links, map, nodes } from "../store";

  let json = "";
  let show = false;

  const doImport = () => {
    let saved = JSON.parse(json);
      $nodes = $nodes.map(n => {
        try {
          if (saved[n.id]) {
            let { label, lat, lng } = saved[n.id];

            if (label) {
              n.label = label;
            }

            if (lat) {
              let fx, fy;
              n.latlng = new google.maps.LatLng(lat, lng);
              let point = latLng2Point(n.latlng, $map);
              ({ x: fx, y: fy } = point);

              n.fx = fx;
              n.fy = fy;
            }
          }

          return n;
        } catch (e) {
          window.localStorage.removeItem(n.id);
        }
      });
  };
</script>

<style>
  button {
    @apply bg-green-500 p-4;
  }

  textarea {
    @apply p-4 m-4 border block;
  }
</style>

<button on:click={() => (show = !show)}>Import</button>

{#if show}
  <textarea bind:value={json} />
  <button on:click={doImport}>Go</button>
{/if}
