<script>
  import Button from './Button.svelte';
  import { onMount } from 'svelte';

  let tabConfig = [];
  let groupButtonConfig = [];
  let buttonConfig = [];

  onMount(async () => {
    const buttonConfigRes = await fetch('http://localhost:5000/data/buttonConfig.json');
    buttonConfig = await buttonConfigRes.json();
    
    const groupButtonConfigRes = await fetch('http://localhost:5000/data/groupButtonConfig.json');
    groupButtonConfig = await groupButtonConfigRes.json();

    const tabConfigRes = await fetch('http://localhost:5000/data/tabConfig.json');
    tabConfig = await tabConfigRes.json();
  });
  
  function buttonClick(event){
    console.log(event.detail.text);
  };

  let isActive = 0;

</script>

<div class="menu">
  <ul class="tabs-name__list">
    {#each tabConfig as tab, i}
      <li 
        class:active={isActive === i}
        class="tabs-name__item"
        on:click={() => isActive = i}
      >{tab.name}</li>
    {/each}
  </ul>

  <ul class="tabs-contant__list">
    {#each tabConfig as tab, i}
      <li 
        class:inactive={isActive !== i} 
        class="tabs-contant__item"
      >
        <ul class="button-group__list">
          {#each tab.groupIdArray as group}
            <li class="button-group__item">
              <div class="button-group__body">
                {#each groupButtonConfig[group].buttonIdArray as btn}
                  <Button {...buttonConfig[btn]} on:buttonClick={buttonClick}/>
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
    justify-content: space-between;
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
  } */
  
  .inactive {
    display: none;
  }

</style>

