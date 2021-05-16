<script>
  import tabConfig from "../data/tabConfig";
  import groupButtonConfig from "../data/groupButtonConfig";
  import buttonConfig from "../data/buttonConfig";
  import Button from './Button.svelte';

</script>

<div class="menu">
  <ul class="tabs-name__list">
    {#each tabConfig as tab, i}
    <li class="tabs-name__item" data-id="{i}">{tab.name}</li>
    {/each}
  </ul>

  <ul class="tabs-contant__list">
    {#each tabConfig as tab, i}
      <li class="tabs-contant__item" data-id="{i}">
        <ul class="button-group__list">
          {#each tab.groupIdArray as group}
            <li class="button-group__item">
              <div class="button-group__body">
                {#each groupButtonConfig[group].buttonIdArray as btn}
                  <Button {...buttonConfig[btn]}/>
                {/each}
                </div>
              <div class="button-group__title">{groupButtonConfig[group].name}</div>
            </li>
          {/each}
        </ul>
      </li>
    {/each}
  </ul>
</div>

<style>
  /*-------------------- base --------------------*/
  .menu,
  .menu * {
    box-sizing: border-box;
  }
  
  ul,
  li {
    margin: 0;
    padding: 0;
  }

  ul > li {
    list-style: none;
  }
  
  /*--------------------  --------------------*/
  .tabs-name__list {
    display: flex;
    background: #fac;
  }

  .tabs-name__item {
    padding: 5px;
    cursor: pointer;
  }

  .tabs-name__item:hover {
    background: rgb(230, 110, 158);
  }
  
  .tabs-contant__list {
    display: flex;
    border: 1px solid #555;
  }
  
  .tabs-contant__item {
    display: flex;
    padding: 5px;
  }
  
  .button-group__list {
    display: flex;
  }

  .button-group__item {
    display: flex;
    flex-direction: column;
  }

  .button-group__item + .button-group__item {
    border-left: 1px solid #aaa;
  }

  .button-group__body {
    display: flex;
    flex-direction: column;
  }

  .button-group__title {
    text-align: center;
  }
  
/*-------------------- active --------------------*/
/*   .active {
    display: initial;
  }
  
  .inactive {
    display: none;
  } */

</style>

