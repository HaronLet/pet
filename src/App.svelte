<script>
  import MainMenu from './components/MainMenu.svelte';
  import Navigation from './components/Navigation.svelte';
  import { onMount } from 'svelte';

  let books = [];
  let FERmp = {};

  onMount(async () => {
    const FERmpres = await fetch('http://localhost:5000/data/FERmp.json');
    FERmp = await FERmpres.json();
    books = FERmp.ResourcesDirectory.ResourceCategory.Section;
  });

</script>

<div class="wrapper">
  <header class="header">
    <MainMenu/>
  </header>
  
  <div class="content">
    <aside class="aside">
      <Navigation/>
    </aside>

    <main class="main">
      <!-- <table>
        <tr>
          <th rowspan="2">№ п/п</th>
          <th rowspan="2">Обоснование</th>
          <th rowspan="2">Наименование работ и затрат</th>
          <th rowspan="2">Единица измерения</th>
          <th colspan="3">Количество</th>
          <th colspan="3">Сметная стоимость в базисном уровне цен (в текущем уровне цен (гр. 8) для ресурсов отсутствующих в СНБ), руб.</th>
          <th rowspan="2">Индексы</th>
          <th rowspan="2">Сметная стоимость в текущем уровне цен, руб.</th>
        </tr>
        <tr>
          <th>на единицу</th>
          <th>коэффициенты</th>
          <th>всего с учётом коэффициентов</th>
          <th>на единицу</th>
          <th>коэффициенты</th>
          <th>всего</th>
        </tr>
        <tr>
          <td>1</td>
          <td>2</td>
          <td>3</td>
          <td>4</td>
          <td>5</td>
          <td>6</td>
          <td>7</td>
          <td>8</td>
          <td>9</td>
          <td>10</td>
          <td>11</td>
          <td>12</td>
        </tr>
        <tr>
          <td>1</td>
          <td>2</td>
          <td>3</td>
          <td>4</td>
          <td>5</td>
          <td>6</td>
          <td>7</td>
          <td>8</td>
          <td>9</td>
          <td>10</td>
          <td>11</td>
          <td>12</td>
        </tr>
      </table> -->
      <ul>
        {#each books as book}
          <li>
            <h2>{book.Type} {book.Code} {book.Name}</h2>
            <ul>
              {#each book.Section as part}
                <li>
                  <span>{part.Type} {part.Code} {part.Name}</span>
                  <ul>
<!--                     {#each part.Section as table}
                      <li>
                        <span>{table.Type} {table.Code} {table.Name}</span>
                        <ul>
                          {#each table.NameGroup as work}
                            <li>
                              <span>{work.BeginName}</span>
                            </li>
                          {/each}
                        </ul>
                      </li>
                    {/each} -->
                  </ul>
                </li>
              {/each}
            </ul>
          </li>
        {/each}
      </ul>

    </main>
  </div>
  <footer class="footer">

  </footer>
</div>

<style>
  .wrapper {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
  }

  .header {
    height: 200px;
  }

  .content {
    display: flex;
    justify-content: space-between;
    width: 100%;
    height: 100%;
  } 
  
  .aside {
    width: 30%;
    height: 85%;
  }

  .main {
    width: 100%;
    height: 85%;
    background: #fca;
    overflow: scroll;
  }

  .footer {
    height: 20px;
    background: rgb(196, 170, 255);
  }

  table, td, th {
    border-collapse: collapse;
    border: 1px solid #000;
/*    color: red; */
  }

  ul > li {
    padding-left: 20px;
  }

  ul {
    padding-top: 10px;
    margin-bottom: 10px;
  }
</style>