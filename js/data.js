'use strict';
/* exported writeData */
const data = readData();
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function writeData() {
  const dataJSON = JSON.stringify(data);
  localStorage.setItem('jokeCollection', dataJSON);
}
function readData() {
  const dataJSON = localStorage.getItem('jokeCollection');
  if (!dataJSON) return [];
  return JSON.parse(dataJSON);
}
