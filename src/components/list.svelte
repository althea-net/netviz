<script>
  import { links, nodes, selected, zooming } from "../store";

  const persist = ({ id, label, latlng }) => {
    console.log(label);
    if (latlng) console.log(latlng.lat());
    window.localStorage.setItem(id, JSON.stringify({ id, label, latlng }));
  } 
  const select = ({ id }) => {
    $selected = id;
    $zooming = false;
  };
</script>

<style>
  .node {
    @apply flex flex-wrap justify-between mb-2;
  }

  .node label {
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
      <label for={n.id} class:selected={n.id === $selected}>{n.id}</label>
      <input
        id={n.id}
        bind:value={n.label}
        bind:this={n.el}
        on:keyup={e => persist(n)} />
    </div>
  {/each}
</div>
