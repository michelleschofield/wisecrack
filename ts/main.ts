interface FormElements extends HTMLFormControlsCollection {
  contains: HTMLInputElement;
  type: HTMLInputElement;
}

interface FetchParameters {
  contains: string;
  type: string;
  categories: string;
}

const $form = document.querySelector('form') as HTMLFormElement;
const $categories = document.querySelectorAll(
  '[data-category]',
) as NodeListOf<HTMLInputElement>;

if (!$form) throw new Error('$form query failed');
if (!$categories) throw new Error('$categories query failed');

$form.addEventListener('submit', handleSubmit);

function handleSubmit(event: Event): void {
  event.preventDefault();
  if (!$form) return;

  const $formElements = $form.elements as FormElements;
  const categoriesArray: string[] = [];

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

async function getJokes(parameters: FetchParameters): Promise<void> {
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
