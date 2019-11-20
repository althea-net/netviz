<script>
  import { links, map, nodes } from "../store";

  let json = "";
  let show = false;

  const clear = () => {
    window.localStorage.removeItem("nodes");
    window.location.reload();
  };
</script>

<style>
  button {
    @apply bg-orange-500 p-4;
  }
</style>

<button on:click={clear}>Reset</button>
