'use strict';
const $form = document.querySelector('form');
const $categories = document.querySelectorAll('[data-category]');
const $jokesContainer = document.querySelector('.jokes-container');
const $noJokes = document.querySelector('.no-jokes');
const $noCategories = document.querySelector('.no-categories');
if (!$form) throw new Error('$form query failed');
if (!$categories) throw new Error('$categories query failed');
if (!$jokesContainer) throw new Error('$jokesContainer query failed');
if (!$noJokes) throw new Error('$noJokes query failed');
if (!$noCategories) throw new Error('$noCategories query failed');
$form.addEventListener('submit', handleSubmit);
document.addEventListener('DOMContentLoaded', handleSubmit);
$jokesContainer.addEventListener('click', handleClick);
function handleClick(event) {
  const $eventTarget = event.target;
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
    const jokeInfo = {
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
    }
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
function renderJoke(joke) {
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
  const $favButton = document.createElement('button');
  const $addButton = document.createElement('button');
  const $favIcon = document.createElement('i');
  const $addIcon = document.createElement('i');
  $buttonHolder.className = 'row justify-right';
  $favButton.className = 'card-button fav';
  $addButton.className = 'card-button add';
  $favIcon.className = 'fa-regular fa-star fav';
  $addIcon.className = 'fa-solid fa-plus add';
  $favButton.append($favIcon);
  $addButton.append($addIcon);
  $buttonHolder.append($favButton, $addButton);
  $card.append($buttonHolder);
  return $card;
}
