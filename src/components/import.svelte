<script>
  import { links, nodes } from "../store";

  let json = "";
  let show = false;

  const doImport = {};
</script>

<style>
  button {
    @apply bg-green-500 p-4;
  }

  textarea {
    @apply p-4 m-4 border block;
  }
</style>

<button on:click={() => (show = !show)}>Import</button>

{#if show}
  <textarea bind:value={json} />
{/if}
