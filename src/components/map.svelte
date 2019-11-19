<script>
  import { onMount } from "svelte";
  import { styles } from "../utils/map";
  import { graph, map, nodes, showGraph } from "../store";
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
      zoom: 12,
      styles,
      disableDefaultUI: true
    });

    google.maps.event.addListenerOnce($map, "tilesloaded", function() {
      let center = JSON.parse(window.localStorage.getItem("center"));
      if (center) {
        const latlng = new google.maps.LatLng(center.lat, center.lng);
        $map.setCenter(latlng);
      } else {
        window.localStorage.setItem("center", JSON.stringify($map.getCenter()));
      } 

      $graph.zoom(1);
      setTimeout(() => $showGraph = true, 150);
    });
  });
</script>

<style>
  #map {
    position: absolute;
    top: 0;
    z-index: -1;
  }
</style>

<div id="map" />
