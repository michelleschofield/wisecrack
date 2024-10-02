'use strict';
const $form = document.querySelector('form');
const $categories = document.querySelectorAll('[data-category]');
if (!$form) throw new Error('$form query failed');
if (!$categories) throw new Error('$categories query failed');
$form.addEventListener('submit', handleSubmit);
function handleSubmit(event) {
  event.preventDefault();
  if (!$form) return;
  const $formElements = $form.elements;
  const categoriesArray = [];
  $categories.forEach((checkbox) => {
    if (checkbox.checked) categoriesArray.push(checkbox.value);
  });
  const categories = categoriesArray.join(',');
  const formValues = {
    contains: $formElements.contains.value,
    type: $formElements.type.value,
    categories,
  };
  try {
    getJokes(formValues);
  } catch (err) {
    console.log(err);
  }
}
async function getJokes(parameters) {
  const { categories, type, contains } = parameters;
  if (!categories.length) throw new Error('must select at least one category');
  const typeQuery = type === 'both' ? '' : `&type=${type}`;
  let containsQuery = '';
  if (contains.length) {
    containsQuery = `&contains=${contains}`;
  }
  const url = `https://v2.jokeapi.dev/joke/${categories}?safe-mode${typeQuery}${containsQuery}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP Error! Error: ${response.status}`);
  console.log(response);
}
