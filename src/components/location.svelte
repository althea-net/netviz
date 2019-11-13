<script>
  import { onMount } from "svelte";
  import { showGraph, map } from "../store";
  let lat, lng, latInput, lngInput, address, error;
  
  const getCenter = () => {
    if (latInput !== document.activeElement && lngInput !== document.activeElement) {
      let center = $map.getCenter();
      lat = center.lat();
      lng = center.lng();
    }
  };

const getAddress = async e => {
  error = false;
  e.preventDefault();
  try {
    const res = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=AIzaSyCIqlinIzzCoLCwThCqUcsGgheMjbMg6EQ`);
    const json = await res.json();
    ({ lat, lng } = json.results[0].geometry.location);
    setCenter();
  } catch (e) {
    error = true;
  } 
} 

  onMount(async () => {
    let interval = setInterval(getCenter, 500);
    return () => clearInterval(interval);
  });

const setCenter = () => {
  const latlng = new google.maps.LatLng(lat, lng);
  window.localStorage.setItem("center", JSON.stringify(latlng));
  $map.setCenter(latlng);
} 

const init = el => el.focus();
</script>

<style>
  .error {
    @apply border-red-500 border-4;
  } 
</style>

<div class="mb-2">
<form class="mb-2" on:submit={getAddress}>
  <div>
  <input id="address" bind:value={address} class:error use:init />
  <button>Search</button>
  </div>
</form>

<label>Lat:</label>
<input bind:value={lat} on:keyup={setCenter} bind:this={latInput} />

<label>Lng:</label>
<input bind:value={lng} on:keyup={setCenter} bind:this={lngInput} />
</div>
