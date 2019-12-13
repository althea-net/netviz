<script>
  import { links, importing, map, nodes } from "../store";

  const reset = () => {
    window.localStorage.removeItem("nodes");
    window.location.reload();
  };

  const toggleDevMode = () => {
    devmode = !devmode;
    window.localStorage.setItem("devmode", devmode);
    window.location.reload();
  };

  let devmode = false;
  if (typeof window !== "undefined") {
    devmode = window.localStorage.getItem("devmode") === "true";
  }

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
    @apply p-4;
  }
</style>

          <div class="mt-2">
            <button class="bg-blue-500" on:click={doExport}>Export</button>
            <button class="bg-green-500" on:click={() => ($importing = !$importing)}>Import</button>
            <button class="bg-orange-500" on:click={reset}>Reset</button>
            <button class="bg-yellow-500" on:click={toggleDevMode}>
              {devmode ? 'Live Mode' : 'Dev Mode'}
            </button>
          </div>
