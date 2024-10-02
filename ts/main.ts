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
}

interface FetchResponse {
  jokes: Joke[];
}

const $form = document.querySelector('form') as HTMLFormElement;
const $categories = document.querySelectorAll(
  '[data-category]',
) as NodeListOf<HTMLInputElement>;

if (!$form) throw new Error('$form query failed');
if (!$categories) throw new Error('$categories query failed');

$form.addEventListener('submit', handleSubmit);

async function handleSubmit(event: Event): Promise<void> {
  event.preventDefault();
  if (!$form) return;

  const $formElements = $form.elements as FormElements;
  const categoriesArray: string[] = [];

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
  } catch (err) {
    console.log(err);
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

// function renderJoke(joke: Joke): HTMLDivElement {
//   const $card = document.createElement('div');
//   return $card;
// }
