<script>
  import { onMount } from "svelte";
  import { showGraph, map } from "../store";
  let lat, lng, latInput, lngInput;
  
  const getCenter = () => {
    if (latInput !== document.activeElement && lngInput !== document.activeElement) {
      let center = $map.getCenter();
      lat = center.lat();
      lng = center.lng();
    }
  };

  onMount(async () => {
    let interval = setInterval(getCenter, 500);
    return () => clearInterval(interval);
  });

  const setCentre = () => $map.setCenter(new google.maps.LatLng(lat, lng));
</script>

<h1 class="text-lg">Map Center</h1>

Lat:
<input bind:value={lat} on:keyup={setCentre} bind:this={latInput} />

Lng:
<input bind:value={lng} on:keyup={setCentre} bind:this={lngInput} />
