interface FormElements extends HTMLFormControlsCollection {
  contains: HTMLInputElement;
  type: HTMLInputElement;
}

interface FetchParameters {
  contains: string;
  type: string;
  categories: string;
}

interface Joke {
  type: string;
  setup?: string;
  delivery?: string;
  joke?: string;
  category: string;
  id: number;
}

interface FetchResponse {
  jokes: Joke[];
}

const $form = document.querySelector('form') as HTMLFormElement;
const $categories = document.querySelectorAll(
  '[data-category]',
) as NodeListOf<HTMLInputElement>;
const $jokesContainer = document.querySelector('.jokes-container');
const $noJokes = document.querySelector('.no-jokes');
const $noCategories = document.querySelector('.no-categories');
const $tabContainer = document.querySelector('.tab-container');
const $views = document.querySelectorAll('[data-view]');
const $tabs = document.querySelectorAll('[data-tab]');
const $collection = document.querySelector('.collection');

if (!$form) throw new Error('$form query failed');
if (!$categories) throw new Error('$categories query failed');
if (!$jokesContainer) throw new Error('$jokesContainer query failed');
if (!$noJokes) throw new Error('$noJokes query failed');
if (!$noCategories) throw new Error('$noCategories query failed');
if (!$tabContainer) throw new Error('$tabContainer query failed');
if (!$collection) throw new Error('$collection query failed');

$form.addEventListener('submit', handleSubmit);
document.addEventListener('DOMContentLoaded', (event: Event) => {
  handleSubmit(event);
  renderCollection();
});
$jokesContainer.addEventListener('click', handleClick);
$tabContainer.addEventListener('click', viewSwap);

function viewSwap(event: Event): void {
  const $eventTarget = event.target as HTMLElement;
  const view = $eventTarget.getAttribute('data-tab');

  $tabs.forEach(($tab) => {
    if ($tab.getAttribute('data-tab') === view) {
      $tab.className = 'tab active';
    } else {
      $tab.className = 'tab';
    }
  });

  $views.forEach(($view) => {
    if ($view.getAttribute('data-view') === view) {
      $view.className = 'view-container';
    } else {
      $view.className = 'view-container hidden';
    }
  });
}

function handleClick(event: Event): void {
  const $eventTarget = event.target as HTMLElement;
  if ($eventTarget.matches('.add')) {
    const $card = $eventTarget.closest('.card');
    if (!$card) {
      throw new Error(
        'cannot add non-existent joke to collection and add button should only exist inside card',
      );
    }
    const id = $card.getAttribute('data-id');
    const category = $card.getAttribute('data-category');
    const type = $card.getAttribute('data-type');

    if (!id) throw new Error('Joke does not have an id');
    if (!category) throw new Error('Joke does not have a category');
    if (!type) throw new Error('Joke does not have type');

    const jokeInfo: Joke = {
      id: +id,
      category,
      type,
    };

    if (type === 'single') {
      const joke = $card.textContent;
      if (!joke) throw new Error('Joke does not have any text content');

      jokeInfo.joke = joke;
    } else if (type === 'twopart') {
      const setup = $card.querySelector('.setup')?.textContent;
      const delivery = $card.querySelector('.delivery')?.textContent;

      if (!setup || !delivery) {
        throw new Error('Joke does not have setup or delivery');
      }

      jokeInfo.setup = setup;
      jokeInfo.delivery = delivery;
    } else {
      throw new Error('Joke is neither type single or twopart');
    }

    let inCollection = false;

    data.forEach((joke) => {
      if (joke.id === jokeInfo.id) {
        inCollection = true;
      }
    });

    if (!inCollection) {
      data.push(jokeInfo);
      writeData();
      $collection?.append(renderJoke(jokeInfo));
    }

    if ($eventTarget.tagName === 'BUTTON') {
      $eventTarget.className = 'card-button checked';

      const $icon = $eventTarget.firstChild as HTMLElement;
      if (!$icon) throw new Error('button does not have icon');

      $icon.className = 'fa-solid fa-check checked';
    } else if ($eventTarget.tagName === 'I') {
      $eventTarget.className = 'fa-solid fa-check checked';

      const $button = $eventTarget.parentElement;
      if (!$button) throw new Error('Add button does not have a button');

      $button.className = 'card-button checked';
    }
  }
}

async function handleSubmit(event: Event): Promise<void> {
  event.preventDefault();

  if (!$form) throw new Error('$form does not exist');
  if (!$noJokes) throw new Error('$noJokes does not exist');
  if (!$noCategories) throw new Error('$noCategories does not exist');

  const $formElements = $form.elements as FormElements;
  const categoriesArray: string[] = [];

  $categories.forEach((checkbox) => {
    if (checkbox.checked) categoriesArray.push(checkbox.value);
  });
  const categories = categoriesArray.join(',');

  $jokesContainer?.replaceChildren();

  if (!categories.length) {
    $noCategories.className = 'no-categories card';
    $noJokes.className = 'no-jokes card hidden';
    return;
  }

  const formValues = {
    contains: $formElements.contains.value,
    type: $formElements.type.value,
    categories,
  };

  try {
    const jokes = await getJokes(formValues);

    jokes.forEach((joke) => {
      const renderedJoke = renderJoke(joke);
      $jokesContainer?.append(renderedJoke);
    });

    $noCategories.className = 'no-categories card hidden';
    $noJokes.className = 'no-jokes card hidden';
  } catch {
    $noJokes.className = 'no-jokes card';
    $noCategories.className = 'no-categories card hidden';
  }
}

async function getJokes(parameters: FetchParameters): Promise<Joke[]> {
  const { categories, type, contains } = parameters;

  const typeQuery = type === 'both' ? '' : `&type=${type}`;

  let containsQuery = '';
  if (contains.length) {
    containsQuery = `&contains=${contains}`;
  }

  const url = `https://v2.jokeapi.dev/joke/${categories}?safe-mode${typeQuery}${containsQuery}&amount=10`;
  const response = await fetch(url);

  if (!response.ok) throw new Error(`HTTP Error! Error: ${response.status}`);

  const jokesAndStuff = (await response.json()) as FetchResponse;

  const jokes = jokesAndStuff.jokes;
  return jokes;
}

function renderJoke(joke: Joke): HTMLDivElement {
  const $card = document.createElement('div');

  $card.className = 'card';
  $card.setAttribute('data-id', `${joke.id}`);
  $card.setAttribute('data-category', joke.category);
  $card.setAttribute('data-type', joke.type);

  if (joke.joke) {
    const $joke = document.createElement('p');

    $joke.textContent = joke.joke;
    $joke.className = 'setup delivery';

    $card.appendChild($joke);
  } else if (joke.setup && joke.delivery) {
    const $jokeHolder = document.createElement('div');
    const $setup = document.createElement('p');
    const $delivery = document.createElement('p');

    $setup.textContent = joke.setup;
    $delivery.textContent = joke.delivery;

    $setup.className = 'setup';
    $delivery.className = 'delivery';

    $jokeHolder.append($setup, $delivery);
    $card.append($jokeHolder);
  }

  let isInCollection = false;

  data.forEach((jokeInData) => {
    if (jokeInData.id === joke.id) {
      isInCollection = true;
    }
  });

  const $buttonHolder = document.createElement('div');

  if (isInCollection) {
    const $checkButton = document.createElement('button');
    const $checkIcon = document.createElement('i');

    $checkButton.className = 'card-button checked';
    $checkIcon.className = 'fa-solid fa-check checked';

    $checkButton.append($checkIcon);
    $buttonHolder.append($checkButton);
  } else {
    const $addButton = document.createElement('button');
    const $addIcon = document.createElement('i');

    $addButton.className = 'card-button add';
    $addIcon.className = 'fa-solid fa-plus add';

    $addButton.append($addIcon);
    $buttonHolder.append($addButton);
  }

  const $favButton = document.createElement('button');
  const $favIcon = document.createElement('i');

  $buttonHolder.className = 'row justify-right';
  $favButton.className = 'card-button fav';
  $favIcon.className = 'fa-regular fa-star fav';

  $favButton.append($favIcon);
  $buttonHolder.prepend($favButton);
  $card.append($buttonHolder);

  return $card;
}

function renderCollection(): void {
  data.forEach((joke) => {
    const $card = renderJoke(joke);
    $collection?.append($card);
  });
}
