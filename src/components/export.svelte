<script>
  import { links, nodes } from "../store";

  const o = {};
  const doExport = () => {
    $nodes.map(({ id, label, latlng }) => {
      let lat, lng;
      if (latlng) {
        lat = latlng.lat();
        lng = latlng.lng();
      } 

      return (label || lat) && (o[id] = { label, lat, lng });
    });
    const filename = "nodes.json";
    let blob = new Blob([JSON.stringify(o)], { type: "text/json;charset=utf-8;" });
    if (navigator.msSaveBlob) {
      navigator.msSaveBlob(blob, filename);
    } else {
      let link = document.createElement("a");
      if (link.download !== undefined) {
        let url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", filename);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }
  };
</script>

<style>
  button {
    @apply bg-blue-500 p-4;
  }
</style>

<button on:click={doExport}>Export</button>
