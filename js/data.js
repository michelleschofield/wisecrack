'use strict';
/* exported data */
const data = readData();
function writeData() {
  const dataJSON = JSON.stringify(data);
  localStorage.setItem('jokeCollection', dataJSON);
}
function readData() {
  const dataJSON = localStorage.getItem('jokeCollection');
  if (!dataJSON) return [];
  return JSON.parse(dataJSON);
}
