<script>
  const tabs = [0, 1, 2]
  let isActive = 0;
</script>

<div class="wrapper">
  <ul class="tab__list">
    {#each tabs as tab, i}
      <li 
      class="tab__item"
      class:active={isActive === i}
      on:click={() => isActive = i}
      >Файлы {tab}</li>
    {/each}
  </ul>
  <ul class="content__list">
    {#each tabs as tab, i}
      <li 
        class="content__item"
        class:inactive={isActive !== i} 
      >Каталог {tab}</li>
    {/each}
  </ul>
</div>

<style>
  .wrapper {
    display: flex;
    height: 100%;
    width: 100%;   
  }

  .tab__list {
    height: 100%;
    background: #ccc;
  }

  .tab__item {
    height: 100px;
    padding: 5px;
    text-align: center;
    writing-mode: vertical-rl;
    cursor: pointer;
    transform: rotate(180deg);
  }

  .tab__item:hover {
    background: rgb(230, 110, 158);
  }

  .content__list {
    width: 100%;
    height: 100%;
    padding: 5px;
    background: #efefef;
  }

/*-------------------- active --------------------*/
  .active {
    background: #56e462;
  }

  .inactive {
    display: none;
  }
</style>