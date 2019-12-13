'use strict';

/* globals */
const apiKey = 'xvxyuFNm6Q3vDPZYzEeStdi9PXSdbLnVVjJlw7EY'; 
const searchURL = 'https://developer.nps.gov/api/v1/parks';
let pageNumber = 1;
let cachedPages = {};

/* formatting helper */
function formatQueryParams(params) {
  const queryItems = Object.keys(params)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
  return queryItems.join('&');
}

/* display results list and the pagination buttons */
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
  $('#results-list').attr('start',responseJson.start);
  // iterate through the items array and append to results element
  for (let i = 0; i < responseJson.data.length; i++){
    let site = responseJson.data[i];
    let addressStr = '';
    if (site.addresses.find(obj => obj.type == `Physical`)) {
      let addressObj = site.addresses.find(obj => obj.type == `Physical`);
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
    );
  };
  // append the prev and next buttons to results
  if (pageNumber > 1){
    $('#prev').addClass('active');
  } else {
    $('#prev').removeClass('active');
  }
  if (pageNumber < Math.floor(responseJson.total/responseJson.limit)+1) {
    $('#next').addClass('active');
  } else {
    $('#next').removeClass('active');
  }
  // unhide the results section to display it
  $('#results').removeClass('hidden');
  // on every display animate to the top of the list
  console.log('scrolling to ' + $('form').offset().top);
  $('html, body').animate(
    {
      scrollTop: $('#results').offset().top,
    },
    500,
    'linear'
  );

};

/* fetches results from the cache or from the NPS api */
function fetchResults(query, maxResults, states) {
  // check page cache, fetch if found
  if (pageNumber in cachedPages) {
    $('#js-waiting-message').empty();
    displayResults(cachedPages[pageNumber]);
  }
  // if not in cache, fetch from api
  else {
    const start = 1 + ((pageNumber-1)*maxResults);
    const params = {
      api_key: apiKey,
      q: query,
      start: start,
      limit: maxResults,
      stateCode: states,
      fields: `addresses`
    };
    const queryString = formatQueryParams(params)
    const url = searchURL + '?' + queryString;
  
    fetch(url)
      .then(response => {
        if (response.ok) {
          $('#js-waiting-message').empty();
          return response.json();
        }
        $('#js-waiting-message').empty();
        throw new Error(response.statusText);
      })
      .then(responseJson => {
        cachedPages[pageNumber] = responseJson;
        displayResults(responseJson);
      })
      .catch(err => {
        $('#js-error-message').text(`Something went wrong: ${err.message}`);
      });
  }
}

/* event listener and handler for form submit */
function watchFormSubmit() {
  $('form').submit(event => {
    event.preventDefault();
    // clear pagination data
    pageNumber = 1;
    cachedPages = {};
    // get form input
    const searchTerm = $('#js-search-term').val();
    const maxResults = $('#js-max-results').val();
    const searchStates = $('.states-select').val().join();
    // fetch the results
    $('#js-waiting-message').text(`Searching...`);
    fetchResults(searchTerm, maxResults, searchStates);
  });
}

/* event listener and handler for pagination button clicks */
function listenPaginationClicks() {
  $('#prev, #next').click(event => {
    event.preventDefault();
    event.stopPropagation();
    // make sure the button clicked has the active class
    if ($(event.target).hasClass('active')) {
      const clickedID = $(event.target).attr('id');
      // advance page backward or forward
      if(clickedID === 'prev') {
        pageNumber = pageNumber - 1;
      }
      if(clickedID === 'next') {
        pageNumber = pageNumber + 1;
      }
      // fetch the results
      $('#js-waiting-message').text(`Getting page...`);
      fetchResults($('#js-search-term').val(), $('#js-max-results').val(), $('.states-select').val().join());
    }
  });
}

/* attach event listeners */
$(function() {
  watchFormSubmit();
  listenPaginationClicks();
});