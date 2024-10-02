/* exported data */
const data: Joke[] = readData();

function writeData(): void {
  const dataJSON = JSON.stringify(data);
  localStorage.setItem('jokeCollection', dataJSON);
}

function readData(): Joke[] {
  const dataJSON = localStorage.getItem('jokeCollection');
  if (!dataJSON) return [];

  return JSON.parse(dataJSON);
}

writeData();
