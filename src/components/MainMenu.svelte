<script>
  import App from '../App.svelte';
import Button from './Button.svelte';
import Fieldset from './Fieldset.svelte';

  const papka = {
    //name: "Папка",
    img: "https://img.icons8.com/metro/344/add-folder.png",
    alt: "Иконка папки"
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
    alt: "Иконка папки"
  };
</script>

<Button {...papka}/>
<Button {...lsr}/>
<Button {...ps}/>
<Button {...ssr}/>
<Button name={"+"}/>

