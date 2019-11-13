<script>
  import { links, map, nodes } from "../store";

  let json = "";
  let show = false;

  const clear = () => {
    $nodes.map(n => {
      n.latlng = undefined;
      n.fx = undefined;
      n.fy = undefined;
      const { id, label, latlng } = n;
      window.localStorage.setItem(n.id, JSON.stringify({ id, label, latlng }));
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
