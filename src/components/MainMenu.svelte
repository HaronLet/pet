<script>
  import Button from './Button.svelte';
  import ButtonGroupList from './menuItems/ButtonGroupList.svelte';
  import TabList from './menuItems/TabList.svelte';
  import TabTitleList from './menuItems/TabTitleList.svelte';
  import { onMount } from 'svelte';

  let buttonConfig = [];
  let mainMenuConfig = {};
  let tabs = [];
  let activeTabId = 0;

  onMount(async () => {
    const buttonConfigRes = await fetch('http://localhost:5000/data/buttonConfig.json');
    buttonConfig = await buttonConfigRes.json();
    
    const mainMenuConfigRes = await fetch('http://localhost:5000/data/mainMenuConfig.json');
    mainMenuConfig = await mainMenuConfigRes.json();
    tabs = await mainMenuConfig.tabs;
  });
  
  function buttonClick(event){
    console.log(event.detail.text);
  };
</script>

<div class="menu">
  <TabTitleList
    {tabs}
    {activeTabId}
    let:title
    let:tabId
  >
    <Button
      {title}
      type={tabId}
      on:buttonClick={(event) => activeTabId = event.detail.text}/>
  </TabTitleList>

  <TabList
    {tabs}
    {activeTabId}
    let:buttonGroups
  >
    <ButtonGroupList {buttonGroups} let:button>
      <Button {...buttonConfig[button]} on:buttonClick={buttonClick}/>
    </ButtonGroupList>
  </TabList>
</div>

<style>

</style>

