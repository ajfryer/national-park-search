'use strict';

/*
TODO:
- Pagination with previous and next buttons
- turn off click to prevent multiple submits
- prevent blank input (" ")
- more detailed display messaging
- styling
*/

// put your own value below!
const apiKey = 'xvxyuFNm6Q3vDPZYzEeStdi9PXSdbLnVVjJlw7EY'; 
const searchURL = 'https://developer.nps.gov/api/v1/parks';


function formatQueryParams(params) {
  const queryItems = Object.keys(params)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
  return queryItems.join('&');
}

function displayResults(responseJson) {
  // if there are previous results, remove them
  console.log(responseJson);
  console.log(responseJson.data.length);
  $('#results-list').empty();
  // iterate through the items array
  for (let i = 0; i < responseJson.data.length; i++){
    // for each video object in the items 
    //array, add a list item to the results 
    //list with the video title, description,
    //and thumbnail
    $('#results-list').append(
      `<li><h3>${responseJson.data[i].name}</h3>
      <p>${responseJson.data[i].url}</p>
      </li>`
    )};
  //display the results section  
  $('#results').removeClass('hidden');
};

function fetchResults(query, maxResults=10, states) {
  const params = {
    api_key: apiKey,
    q: query,
    start: 1,
    limit: maxResults,
    stateCode: states
  };
  const queryString = formatQueryParams(params)
  const url = searchURL + '?' + queryString;

  console.log(url);

  fetch(url)
    .then(response => {
      if (response.ok) {
        $('#js-waiting-message').empty();
        return response.json();
      }
      $('#js-waiting-message').empty();
      throw new Error(response.statusText);
    })
    .then(responseJson => displayResults(responseJson))
    .catch(err => {
      $('#js-error-message').text(`Something went wrong: ${err.message}`);
    });
}

function watchForm() {
  $('form').submit(event => {
    event.preventDefault();
    const searchTerm = $('#js-search-term').val();
    const maxResults = $('#js-max-results').val();
    const searchStates = $('.states-select').val().join();
    console.log(searchStates);
    console.log(searchTerm);
    console.log(maxResults);
    $('#js-waiting-message').text(`Searching...`);
    $('#results-list').empty();
    fetchResults(searchTerm, maxResults, searchStates);
  });
}

$(function() {
  $('.states-select').select2({
    data: stateCodes
  });
  watchForm();
});