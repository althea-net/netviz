<script>
  import { confirming, notification } from "../store";
  import { fade } from 'svelte/transition';
</script>

<style>
  .notification {
    @apply flex w-full mb-2 text-white font-bold p-4;
    height: 60px;
  } 
</style>


{#if $confirming}
  <div class="notification bg-orange-500" transition:fade style="height: 120px">
    <div class="m-auto">
      <div>{$notification}</div>
      <div class="flex mt-2">
        <button on:click={$confirming} class="bg-green-500 w-1/2">Yes</button>
        <button on:click={() => { $confirming = null; $notification = null; }} class="bg-red-500 w-1/2">No</button>
      </div>
    </div>
  </div>
{:else if $notification}
  <div class="notification bg-green-500" transition:fade>
    <div class="m-auto">{$notification}</div>
  </div>
{/if}
