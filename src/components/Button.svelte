<script>
	export let name = "";
  export let img = "";
  export let isActive = true;
</script>

{#if isActive}
  <button on:click>
    {#if img !== ""}
      <img src="{img}" alt="Иконка">
    {/if}  

    {#if name !== ""}
      <span>{name}</span>
    {/if}  
  </button>
{:else}
  <button disabled>
  {#if img !== ""}
    <img src="{img}" alt="Иконка">
  {/if}  

  {#if name !== ""}
    <span>{name}</span>
  {/if}  
  </button>
{/if}


<style>
  button {
    display: flex;
    align-items: center;
    /* width: 100%; */
    min-width: calc(1em + 12px);
    padding: 5px;
    margin: 5px;
    text-align: left;
    line-height: 1;
  }

  img {
    width: 20px;
    height: 20px;
  }
  
  img + span {
    margin-left: 5px;
  }

  span {
    width: 100%;
  }
</style>