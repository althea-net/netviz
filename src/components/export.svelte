<script>
  import { links, nodes } from "../store";

  const doExport = () => {
    const filename = "network.json";
    let blob = new Blob([JSON.stringify({ nodes: $nodes, links: $links }, null, 2)], { type: "text/json;charset=utf-8;" });
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
