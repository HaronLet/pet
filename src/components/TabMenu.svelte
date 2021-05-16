<script>
  import Button from "./Button.svelte";
  import buttonConfig from "../data/buttonConfig";
  export let name = "";

  function  handlClick() {
    console.log("Click")
  };
  function  handlClick2() {
    console.log("Click2")
  };
</script>

<div class="tabs">
  <ul class="name__list">
    <li class="name__item">{name}</li>
  </ul>
  <ul class="body__list">
    <li class="body__item">
      <div class="fieldset">
        <Button {...buttonConfig.papka}/>
        <Button {...buttonConfig.lsr}/>
        <Button {...buttonConfig.ps}/>
        <Button {...buttonConfig.ssr}/>
        <Button name={"++"}/>
      </div>
      <div class="fieldset">
        <Button {...buttonConfig.papka}/>
        <Button {...buttonConfig.lsr}/>
        <Button {...buttonConfig.ps}/>
        <Button {...buttonConfig.ssr} on:click={handlClick2}/>
        <Button name={"+"} on:click={handlClick}/>
      </div>
    </li>
  </ul>
</div>



<style>
  .tabs {
    display: flex;
    flex-direction: column;
  }

  .body__item {
    display: flex;
  }

  .fieldset {
    width: 200px;
    border: 1px solid #000;
  }
</style>