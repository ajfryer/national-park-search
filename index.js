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
  if (responseJson.data.length == 0) {
    $('#results-list').empty();
    $('#results').append(
      `<p class="no-results-message">No results found. Please try another search.</p>`
    )
    $('#results').removeClass('hidden');
    return;
  }
  $('#results-list').empty();
  // iterate through the items array
  for (let i = 0; i < responseJson.data.length; i++){
    // for each video object in the items 
    //array, add a list item to the results 
    //list with the video title, description,
    //and thumbnail
    let site = responseJson.data[i];
    let addressStr = '';
    if (site.addresses.find(obj => obj.type == `Physical`)) {
      let addressObj = site.addresses.find(obj => obj.type == `Physical`);
      console.log(addressObj);
      let addressKeys = Object.keys(addressObj)
      addressStr = 
        `${addressObj.line1} 
        ${addressObj.line2 !== 'undefined' ? addressObj.line2 : ""} 
        ${addressObj.line3 !== 'undefined' ? addressObj.line3 : ""}  
        ${addressObj.city} ${addressObj.stateCode} 
        ${addressObj.postalCode}`;
    }
    /*for (let j=0; j<addressKeys.length; j++) {
      let addressVal = addressObj[addressKeys[j]]

      if (typeof addressVal !== 'undefined' && addressKeys[j] !== 'type') {
        addressStr += ` ${addressVal}`;
      } 
    }*/
    $('#results-list').append(
      `<li><h3><a href="${site.url}">${site.fullName}</a></h3>
      <h4>${addressStr}</h4>
      <p>${site.description}</p>
      </li>`
    )
  };
  //display the results section  
  $('#results').removeClass('hidden');
};

function fetchResults(query, maxResults=10, states) {
  const params = {
    api_key: apiKey,
    q: query,
    start: 1,
    limit: maxResults,
    stateCode: states,
    fields: `addresses`
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