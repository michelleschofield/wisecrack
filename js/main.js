'use strict';
const $form = document.querySelector('form');
const $categories = document.querySelectorAll('[data-category]');
const $jokesContainer = document.querySelector('.jokes-container');
if (!$form) throw new Error('$form query failed');
if (!$categories) throw new Error('$categories query failed');
if (!$jokesContainer) throw new Error('$jokesContainer query failed');
$form.addEventListener('submit', handleSubmit);
async function handleSubmit(event) {
  event.preventDefault();
  if (!$form) return;
  const $formElements = $form.elements;
  const categoriesArray = [];
  $categories.forEach((checkbox) => {
    if (checkbox.checked) categoriesArray.push(checkbox.value);
  });
  const categories = categoriesArray.join(',');
  if (!categories.length) throw new Error('must select at least one category');
  const formValues = {
    contains: $formElements.contains.value,
    type: $formElements.type.value,
    categories,
  };
  try {
    const jokes = await getJokes(formValues);
    console.log(jokes);
    $jokesContainer?.replaceChildren();
    jokes.forEach((joke) => {
      const renderedJoke = renderJoke(joke);
      $jokesContainer?.append(renderedJoke);
    });
  } catch (err) {
    console.log(err);
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
  $favIcon.className = 'fa-regular fa-star';
  $addIcon.className = 'fa-solid fa-plus';
  $favButton.append($favIcon);
  $addButton.append($addIcon);
  $buttonHolder.append($favButton, $addButton);
  $card.append($buttonHolder);
  return $card;
}
