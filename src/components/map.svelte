<script>
  import { onMount } from "svelte";
  import { styles } from "../utils/map";
  import { map, nodes } from "../store";
  import { latLng2Point, point2LatLng } from "../utils/map";

  onMount(async () => {
    const mapEl = document.getElementById("map");
    const graphEl = document.getElementById("graph");
    mapEl.style.width = `${graphEl.offsetWidth + 2}px`;
    mapEl.style.height = `${graphEl.offsetHeight}px`;

    if (!mapEl) return;

    $map = new google.maps.Map(mapEl, {
      center: {
        lat: 46.103418,
        lng: -123.201742
      },
      zoom: 15,
      styles,
      disableDefaultUI: true
    });

    google.maps.event.addListenerOnce($map, "idle", function() {
      $nodes = $nodes.map(n => {
        try {
          let saved = window.localStorage.getItem(n.id)
          if (saved) {
            let { id, latlng, label } = JSON.parse(saved);

            let fx, fy;

            if (latlng) {
              n.latlng = new google.maps.LatLng(latlng.lat, latlng.lng);
              let point = latLng2Point(n.latlng, $map);
              ({ x: fx, y: fy } = point);
            }

            n.label = label;
            n.fx = fx;
            n.fy = fy;
          }

          return n;
        } catch (e) {
          window.localStorage.removeItem(n.id);
        } 
      });
    });
  });
</script>

<style>
  #map {
    position: absolute;
    margin: 30px;
  }
</style>

<div id="map" />
