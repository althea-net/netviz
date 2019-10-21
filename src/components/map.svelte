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
        lat: 46.103418,
        lng: -123.201742
      },
      zoom: 15,
      styles,
      disableDefaultUI: true
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
