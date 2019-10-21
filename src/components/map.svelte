<script>
  import { onMount } from "svelte";
  import styles from "../mapStyles";
  import { map } from "../store";

  onMount(async () => {
    const mapEl = document.getElementById("map");
    const graphEl = document.getElementById("graph");
    mapEl.style.width = `${graphEl.offsetWidth + 2}px`;
    mapEl.style.height = `${graphEl.offsetHeight}px`;

    if (!mapEl) return;

    $map = new google.maps.Map(mapEl, {
      center: {
        lat: 38.44630556,
        lng: -122.38444444
      },
      zoom: 14,
      styles,
      disableDefaultUI: true
    });

    console.log($map.setZoom);
  });
</script>

<style>
  #map {
    position: absolute;
    margin: 30px;
  }
</style>

<div id="map">hiii</div>
