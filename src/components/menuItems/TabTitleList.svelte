<script>
  export let tabs = [];
  export let activeTabId = 0;
</script>

<ul class="tab-title__list">
  {#each tabs as tab, i}
    <li class="tab-title__item" class:active={activeTabId === i}>
      <slot
        title={tab.title}
        tabId={i}
      ></slot>
    </li>
  {/each}
</ul>

<style>
  .tab-title__list {
    display: flex;
  }

  .active {
    background: #56e462;
  }
</style>