<script>
  export let buttonGroups = [];

</script>

<ul class="group__list">
  {#each buttonGroups as group}
    <li class="group__item">
      <div class="item__content">
        {#each group.buttons as button}
          <slot {button}></slot>
        {/each}
      </div>
      <div class="item__title">{group.title}</div>
    </li>
  {/each}
</ul>

<style>
  .group__list {
    display: flex;
  }

  .group__item {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 0 5px;
  }

  .group__item:hover .item__title {
    font-weight: bold;
  }

  .group__item + .group__item {
    border-left: 1px solid #aaa;
  }

  .item__content {
    display: flex;
    flex-direction: column;
  }

  .item__title {
    font-size: 12px;
    text-align: center;
  }
</style>