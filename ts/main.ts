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
const $confirmationDialog = document.querySelector(
  '.delete-confirmation',
) as HTMLDialogElement;
const $confirmButton = document.querySelector('.confirm');
const $cancelButton = document.querySelector('.cancel');

if (!$form) throw new Error('$form query failed');
if (!$categories) throw new Error('$categories query failed');
if (!$jokesContainer) throw new Error('$jokesContainer query failed');
if (!$noJokes) throw new Error('$noJokes query failed');
if (!$noCategories) throw new Error('$noCategories query failed');
if (!$tabContainer) throw new Error('$tabContainer query failed');
if (!$collection) throw new Error('$collection query failed');
if (!$confirmationDialog) throw new Error('$confirmationDialog query failed');
if (!$confirmButton) throw new Error('$confirmButton query failed');
if (!$cancelButton) throw new Error('$cancelButton query failed');

$form.addEventListener('submit', handleSubmit);
document.addEventListener('DOMContentLoaded', (event: Event) => {
  handleSubmit(event);
  renderCollection();
});
$jokesContainer.addEventListener('click', handleClick);
$tabContainer.addEventListener('click', viewSwap);
$collection.addEventListener('click', handleClick);
$confirmButton.addEventListener('click', deleteConfirmed);
$cancelButton.addEventListener('click', cancelDelete);

function cancelDelete(): void {
  $confirmationDialog.close();
  $confirmationDialog.removeAttribute('data-deleting');
}

function deleteConfirmed(): void {
  $confirmationDialog.close();
  const id = $confirmationDialog.getAttribute('data-deleting');
  if (!id) throw new Error('cannot delete without valid id');

  const $cardInCollection = $collection?.querySelector(`[data-id="${id}"]`);
  if (!$cardInCollection) {
    throw new Error('cannot remove joke that is not in collection');
  }
  $cardInCollection.remove();

  const index = data.findIndex((joke) => joke.id === +id);
  data.splice(index, 1);
  writeData();

  $confirmationDialog.removeAttribute('data-deleting');

  const $cardInSearch = $jokesContainer?.querySelector(`[data-id="${id}"]`);
  if ($cardInSearch) {
    const $checkButton = $cardInSearch.querySelector('.checked');
    const $buttonHolder = $checkButton?.parentElement;
    $buttonHolder?.appendChild(renderAddButton());
    $checkButton?.remove();
  }
}

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
    addToCollection($eventTarget);
  }

  if ($eventTarget.matches('.trash')) {
    askForConfirmation($eventTarget);
  }
}

function askForConfirmation($eventTarget: HTMLElement): void {
  const $card = $eventTarget.closest('.card');
  if (!$card) {
    throw new Error('cannot remove non-existent joke from collection');
  }

  const id = $card.getAttribute('data-id');
  if (!id) throw new Error('Joke does not have an id');

  $confirmationDialog?.setAttribute(`data-deleting`, id);
  $confirmationDialog?.showModal();
}

function addToCollection($eventTarget: HTMLElement): void {
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
    $collection?.append(renderJoke(jokeInfo, 'collection'));
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
      const renderedJoke = renderJoke(joke, 'search');
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

function renderJoke(joke: Joke, view: string): HTMLDivElement {
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

  const $buttonHolder = document.createElement('div');
  $buttonHolder.className = 'row justify-right';

  const $favButton = renderHollowFavButton();

  $buttonHolder.append($favButton);
  $card.append($buttonHolder);

  if (view === 'collection') {
    const $xButton = renderTrashButton();
    $buttonHolder.append($xButton);
  } else if (view === 'search') {
    let isInCollection = false;

    data.forEach((jokeInData) => {
      if (jokeInData.id === joke.id) {
        isInCollection = true;
      }
    });

    if (isInCollection) {
      const $checkButton = renderCheckedButton();
      $buttonHolder.append($checkButton);
    } else {
      const $addButton = renderAddButton();
      $buttonHolder.append($addButton);
    }
  } else {
    throw new Error('Rendered card must be for either search or collection');
  }

  return $card;
}

function renderAddButton(): HTMLButtonElement {
  const $addButton = document.createElement('button');
  const $addIcon = document.createElement('i');

  $addButton.className = 'card-button add';
  $addIcon.className = 'fa-solid fa-plus add';

  $addButton.append($addIcon);
  return $addButton;
}

function renderCheckedButton(): HTMLButtonElement {
  const $checkButton = document.createElement('button');
  const $checkIcon = document.createElement('i');

  $checkButton.className = 'card-button checked';
  $checkIcon.className = 'fa-solid fa-check checked';

  $checkButton.append($checkIcon);
  return $checkButton;
}

function renderHollowFavButton(): HTMLButtonElement {
  const $favButton = document.createElement('button');
  const $favIcon = document.createElement('i');

  $favButton.className = 'card-button fav';
  $favIcon.className = 'fa-regular fa-star fav';

  $favButton.append($favIcon);
  return $favButton;
}

function renderTrashButton(): HTMLButtonElement {
  const $trashButton = document.createElement('button');
  const $trashIcon = document.createElement('i');

  $trashButton.className = 'card-button trash';
  $trashIcon.className = 'fa-solid fa-trash trash';

  $trashButton.append($trashIcon);
  return $trashButton;
}

function renderCollection(): void {
  data.forEach((joke) => {
    const $card = renderJoke(joke, 'collection');
    $collection?.append($card);
  });
}
