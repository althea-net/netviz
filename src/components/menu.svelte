<script>
  import { confirming ,links, importing, map, nodes, notification } from "../store";

  const confirm = () => {
    warn("Resetting will clear all node labels and locations. Are you sure?");
  };

  const reset = () => {
      window.localStorage.removeItem("nodes");
      window.location.reload();
      $notification = null;
      $confirming = null;
  }

  const warn = msg => {
    $notification = msg;
    $confirming = reset;
  } 

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
            <button class="bg-orange-500" on:click={confirm}>Reset</button>
            <button class="bg-yellow-500" on:click={toggleDevMode}>
              {devmode ? 'Live Mode' : 'Demo Mode'}
            </button>
          </div>
