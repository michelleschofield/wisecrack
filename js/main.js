'use strict';
const $form = document.querySelector('form');
const $categories = document.querySelectorAll('[data-category]');
const $jokesContainer = document.querySelector('.jokes-container');
const $noJokes = document.querySelector('.no-jokes');
const $noCategories = document.querySelector('.no-categories');
const $tabContainer = document.querySelector('.tab-container');
const $views = document.querySelectorAll('[data-view]');
const $tabs = document.querySelectorAll('[data-tab]');
const $collection = document.querySelector('.collection');
const $confirmationDialog = document.querySelector('.delete-confirmation');
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
document.addEventListener('DOMContentLoaded', (event) => {
  handleSubmit(event);
  renderCollection();
});
$jokesContainer.addEventListener('click', handleClick);
$tabContainer.addEventListener('click', viewSwap);
$collection.addEventListener('click', handleClick);
$confirmButton.addEventListener('click', deleteConfirmed);
$cancelButton.addEventListener('click', cancelDelete);
function cancelDelete() {
  $confirmationDialog.close();
  $confirmationDialog.removeAttribute('data-deleting');
}
function deleteConfirmed() {
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
    const $checkButton = $cardInSearch.querySelector('button.checked');
    if ($checkButton) {
      changeToAdd($checkButton);
    }
    const $favedButton = $cardInSearch.querySelector('button.faved');
    if ($favedButton) {
      changeToHollowFav($favedButton);
    }
  }
}
function viewSwap(event) {
  const $eventTarget = event.target;
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
function handleClick(event) {
  const $eventTarget = event.target;
  const $card = $eventTarget.closest('.card');
  if (!$card) return;
  if ($eventTarget.matches('.add')) {
    addToCollection($card);
  } else if ($eventTarget.matches('.trash')) {
    askForConfirmation($eventTarget);
  } else if ($eventTarget.matches('.fav')) {
    markAsFaved($card);
  } else if ($eventTarget.matches('.faved')) {
    unFavorite($card);
  }
}
function unFavorite($card) {
  const id = $card.getAttribute('data-id');
  if (!id) throw new Error('joke does not have an id');
  const jokeInData = data.find((joke) => joke.id === +id);
  delete jokeInData?.favorite;
  writeData();
  $card.removeAttribute('data-favorite');
  const $starButton = $card.querySelector('.faved');
  if (!$starButton) {
    throw new Error(
      'Joke is being marked as no longer favorite with the unfavorite button existing',
    );
  }
  changeToHollowFav($starButton);
  const $view = $card.parentElement;
  let $otherCard;
  if ($view?.matches('.collection')) {
    $otherCard = $jokesContainer?.querySelector(`[data-id="${id}"]`);
    $collection?.appendChild($card);
  } else if ($view?.matches('.jokes-container')) {
    $otherCard = $collection?.querySelector(`[data-id="${id}"]`);
    if ($otherCard) {
      $collection?.appendChild($otherCard);
    }
  }
  if ($otherCard) {
    $otherCard.removeAttribute('data-favorite');
    const $otherFavButton = $otherCard.querySelector('.faved');
    if ($otherFavButton) changeToHollowFav($otherFavButton);
  }
}
function markAsFaved($card) {
  const id = $card?.getAttribute('data-id');
  if (!id) throw new Error('joke does not have an id');
  const $favButton = $card.querySelector('.fav');
  if (!$favButton) throw new Error('$card does not have fav button');
  changeToFaved($favButton);
  const $view = $card.parentElement;
  let $otherCard;
  if ($view?.matches('.collection')) {
    $otherCard = $jokesContainer?.querySelector(`[data-id="${id}"]`);
    $collection?.prepend($card);
  } else if ($view?.matches('.jokes-container')) {
    $otherCard = $collection?.querySelector(`[data-id="${id}"]`);
    if ($otherCard) {
      $collection?.prepend($otherCard);
    }
  }
  if ($otherCard) {
    const $otherFavButton = $otherCard.querySelector('.fav');
    if ($otherFavButton) changeToFaved($otherFavButton);
    $otherCard.setAttribute('data-favorite', 'true');
  }
  $card.setAttribute('data-favorite', 'true');
  const jokeInData = data.find((joke) => joke.id === +id);
  if (jokeInData) {
    jokeInData.favorite = 'true';
    writeData();
  } else {
    addToCollection($card);
  }
}
function askForConfirmation($eventTarget) {
  const $card = $eventTarget.closest('.card');
  if (!$card) {
    throw new Error('cannot remove non-existent joke from collection');
  }
  const id = $card.getAttribute('data-id');
  if (!id) throw new Error('Joke does not have an id');
  $confirmationDialog?.setAttribute(`data-deleting`, id);
  $confirmationDialog?.showModal();
}
function addToCollection($card) {
  const id = $card.getAttribute('data-id');
  const category = $card.getAttribute('data-category');
  const type = $card.getAttribute('data-type');
  const favorite = $card.getAttribute('data-favorite');
  if (!id) throw new Error('Joke does not have an id');
  if (!category) throw new Error('Joke does not have a category');
  if (!type) throw new Error('Joke does not have type');
  const jokeInfo = {
    id: +id,
    category,
    type,
  };
  if (favorite) {
    jokeInfo.favorite = favorite;
  }
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
  data.push(jokeInfo);
  writeData();
  const $rendered = renderJoke(jokeInfo, 'collection');
  if (favorite) {
    $collection?.prepend($rendered);
  } else {
    $collection?.append($rendered);
  }
  const $addButton = $card.querySelector('.add');
  if ($addButton) {
    changeToChecked($addButton);
  }
}
async function handleSubmit(event) {
  event.preventDefault();
  if (!$form) throw new Error('$form does not exist');
  if (!$noJokes) throw new Error('$noJokes does not exist');
  if (!$noCategories) throw new Error('$noCategories does not exist');
  const $formElements = $form.elements;
  const categoriesArray = [];
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
async function getJokes(parameters) {
  const { categories, type, contains } = parameters;
  const typeQuery = type === 'both' ? '' : `&type=${type}`;
  let containsQuery = '';
  if (contains.length) {
    containsQuery = `&contains=${contains}`;
  }
  const url = `https://v2.jokeapi.dev/joke/${categories}?safe-mode${typeQuery}${containsQuery}&amount=10`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP Error! Error: ${response.status}`);
  const jokesAndStuff = await response.json();
  const jokes = jokesAndStuff.jokes;
  return jokes;
}
function renderJoke(joke, view) {
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
  $card.append($buttonHolder);
  const $favButton = renderHollowFavButton();
  $buttonHolder.append($favButton);
  if (joke.favorite) {
    changeToFaved($favButton);
  }
  if (view === 'collection') {
    const $xButton = renderTrashButton();
    $buttonHolder.append($xButton);
  } else if (view === 'search') {
    let isInCollection;
    data.forEach((jokeInData) => {
      if (jokeInData.id === joke.id) {
        isInCollection = jokeInData;
      }
    });
    if (isInCollection) {
      const $checkButton = renderCheckedButton();
      $buttonHolder.append($checkButton);
      if (isInCollection.favorite) {
        changeToFaved($favButton);
      }
    } else {
      const $addButton = renderAddButton();
      $buttonHolder.append($addButton);
    }
  } else {
    throw new Error('Rendered card must be for either search or collection');
  }
  return $card;
}
function renderAddButton() {
  const $addButton = document.createElement('button');
  const $addIcon = document.createElement('i');
  $addButton.className = 'card-button add';
  $addIcon.className = 'fa-solid fa-plus add';
  $addButton.append($addIcon);
  return $addButton;
}
function renderCheckedButton() {
  const $checkButton = document.createElement('button');
  const $checkIcon = document.createElement('i');
  $checkButton.className = 'card-button checked';
  $checkIcon.className = 'fa-solid fa-check checked';
  $checkButton.append($checkIcon);
  return $checkButton;
}
function renderHollowFavButton() {
  const $favButton = document.createElement('button');
  const $favIcon = document.createElement('i');
  $favButton.className = 'card-button fav';
  $favIcon.className = 'fa-regular fa-star fav';
  $favButton.append($favIcon);
  return $favButton;
}
function renderTrashButton() {
  const $trashButton = document.createElement('button');
  const $trashIcon = document.createElement('i');
  $trashButton.className = 'card-button trash';
  $trashIcon.className = 'fa-solid fa-trash trash';
  $trashButton.append($trashIcon);
  return $trashButton;
}
function renderCollection() {
  data.forEach((joke) => {
    const $card = renderJoke(joke, 'collection');
    if (joke.favorite) {
      $collection?.prepend($card);
    } else {
      $collection?.append($card);
    }
  });
}
function changeToChecked($button) {
  const $icon = $button.firstChild;
  $icon.className = 'fa-solid fa-check checked';
  $button.className = 'card-button checked';
}
function changeToFaved($button) {
  const $icon = $button.firstChild;
  $icon.className = 'fa-solid fa-star faved';
  $button.className = 'card-button faved';
}
function changeToHollowFav($button) {
  const $icon = $button.firstChild;
  $icon.className = 'fa-regular fa-star fav';
  $button.className = 'card-button fav';
}
function changeToAdd($button) {
  const $icon = $button.firstChild;
  $icon.className = 'fa-solid fa-plus add';
  $button.className = 'card-button add';
}
