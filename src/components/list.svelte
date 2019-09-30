<script>
  import { links, nodes, selected, zooming } from "../store";

  const select = ({ id, el }) => {
    $selected = id;
    $zooming = false;
    if (el) el.focus();
  };
</script>

<style>
  .node {
    @apply flex flex-wrap justify-between mb-2;
  }

  .node div {
    @apply my-auto cursor-pointer;
  }

  .selected {
    @apply font-bold;
  }

  input {
    @apply border p-2 w-full;
  }

  .list {
    @apply rounded shadow-lg px-6 py-4 m-4 max-h-screen overflow-y-scroll;
  }
</style>

<div class="list">
  {#each $nodes || [] as n (n.id)}
    <div class="node" on:click={e => select(n)}>
      <div class:selected={n.id === $selected}>{n.id}</div>
      <input bind:value={n.label} bind:this={n.el} />
    </div>
  {/each}
</div>
