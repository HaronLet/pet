<script>
  import { createEventDispatcher } from 'svelte';

  export let type = "";
	export let title = "";
  export let iconUrl = "";
  export let disabled = false;

  const dispatch = createEventDispatcher();

  function buttonClick() {
    dispatch('buttonClick', {
      text: type
    });
  }
</script>

<button {disabled} on:click={buttonClick}>
  {#if iconUrl !== ""}
    <img src="{iconUrl}" alt="Иконка">
  {/if}  

  <span>{title !== "" ? title : ""}</span>
</button>

<style>
  button {
    display: flex;
    align-items: center;
    min-width: calc(1em + 12px);
    padding: 5px;
    border: 1px solid transparent;
    background-color: transparent;
    text-align: left;
    line-height: 1;
    color: #333;
  }

  button:disabled {
    background: #999;
  }

  button:not(:disabled):hover {
    border-color: #668fe0;
    background-color: #d4e0f8;
    font-weight: bold;
    cursor: pointer;
  }

  button:not(:disabled):active {
    background-color: #eb7272;
  }

  img {
    width: 15px;
    height: 15px;
  }
  
  img + span {
    margin-left: 5px;
  }

  span {
    max-width: 8em;
  }
</style>