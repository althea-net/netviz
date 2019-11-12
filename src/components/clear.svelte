<script>
  import { links, map, nodes } from "../store";

  let json = "";
  let show = false;

  const clear = () => {
    $nodes = $nodes.map(n => {
      n.latlng = undefined;
      n.fx = undefined;
      n.fy = undefined;
      window.localStorage.removeItem(n.id);
      return n;
    });
    window.location.reload();
  };
</script>

<style>
  button {
    @apply bg-orange-500 p-4;
  }
</style>

<button on:click={clear}>Reset</button>
