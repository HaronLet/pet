<script>
  import App from '../App.svelte';
  import Button from './Button.svelte';
  import Fieldset from './Fieldset.svelte';

  const papka = {
    //name: "Папка",
    img: "https://img.icons8.com/metro/344/add-folder.png",
    alt: "Иконка папки",
    isActive: true
  };
  const lsr = {
    name: "Локальная смета",
    img: "https://img.icons8.com/metro/344/add-folder.png",
    alt: "Иконка папки"
  };
  const ps = {
    name: "Проектная смета",
    img: "https://img.icons8.com/metro/344/add-folder.png",
    alt: "Иконка папки"
  };
  const ssr = {
    name: "Сводный сметный расчёт",
    img: "https://img.icons8.com/metro/344/add-folder.png",
    alt: "Иконка папки",
    isActive: false
  };

  function  handlClick() {
    console.log("Click")
  };
  function  handlClick2() {
    console.log("Click2")
  };
</script>

<div class="fieldset">
  <Button {...papka}/>
  <Button {...lsr}/>
  <Button {...ps}/>
  <Button {...ssr}/>
  <Button name={"+"}/>
</div>
<div class="fieldset">
  <Button {...papka}/>
  <Button {...lsr}/>
  <Button {...ps}/>
  <Button {...ssr} on:click={handlClick2}/>
  <Button name={"+"} on:click={handlClick}/>
</div>

<style>
  .fieldset {
    width: 200px;
    border: 1px solid #000;
  }
</style>