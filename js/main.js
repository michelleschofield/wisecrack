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
  console.log(formValues);
}
