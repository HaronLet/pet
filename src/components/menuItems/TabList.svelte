<script>
  export let tabs = [];
  export let activeTabId = 0;
</script>

<ul class="tab__list">
  {#each tabs as tab, i}
    <li class="tab__item" class:inactive={activeTabId !== i}>
      <slot buttonGroups={tab.buttonGroups}></slot>
    </li>
  {/each}
</ul>

<style>
  .tab__list {
    display: flex;
    border: 1px solid #555;
  }

  .tab__item {
    display: flex;
    padding: 5px;
  }

  .inactive {
    display: none;
  }
</style>