<script>
	export let name = "";
  export let img = "";
  export let alt = "";
</script>

<button>
  {#if img !== ""}
    <img src="{img}" alt="{alt}">
  {/if}  

  {#if name !== ""}
    {name}
  {/if}  
</button>

<style>
  button {
    display: flex;
    align-items: center;
    padding: 5px;
    margin: 5px;
  }

  img {
    width: 20px;
    height: 20px;
    margin-right: 5px;
  }
</style>