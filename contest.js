
let url = 'https://codeforces.com/api/contest.list';

let presentContests = [];
let pastContests = [];
let futureContests = [];
let nonPastContests = []
let contestsList = [];
let typeICPC = [];
let typeCF = [];

let footer = document.querySelector('footer');
let pastStartIndex = 0;
let pastEndIndex;
let nonPastStartIndex = 0;
let nonPastEndIndex;

// Fetching data from API
fetch(url)
  .then(res => res.json())
  .then(data => {
    contestsList = data.result;
    differentContests(contestsList);
    makeButtons();
  });

// For Search to not trigger on each keystroke
function debounce(func, wait, immediate) {
  var timeout;
  return function() {
    var context = this,
      args = arguments;
    var later = function() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
};

// Differentiating contests in 3 categories
function differentContests(arr) {

  pastContests = arr.filter(contest => contest.phase == 'FINISHED');
  presentContests = arr.filter(contest => contest.phase == 'CODING');
  futureContests = arr.filter(contest => contest.phase == 'BEFORE');

  //Ongoing and Upcoming contests to be displayed in 1 section
  let pastContestsCount = pastContests.length;
  let nonPastContestsCount = presentContests.length + futureContests.length;

  // Since single page has 30 cards
  if (pastContests.length > 30) {
    pastEndIndex = 30;
  } else {
    pastEndIndex = pastContestsCount;
  }

  if (nonPastContestsCount > 30) {
    nonPastEndIndex = 30;
  } else {
    nonPastEndIndex = nonPastContestsCount;
  }

  makeNonPastCards(presentContests, futureContests);

  makePastCards(pastContests);

}

let searchBar = debounce(function() {
  let card = document.querySelectorAll('.card');
  let noOfCards = card.length;
  let input = document.querySelector('#search');
  let filter = input.value.toUpperCase();

  for (let i = 0; i < noOfCards; i++) {
    let name = contestsList[i].name.toUpperCase();
    if (name.indexOf(filter) < 0) {
      card[i].style.display = 'none';
    } else {
      card[i].style.display = '';
    }
  }
}, 300);

// Filter By dropdown to list in accordance to the type of contest
function filterBy() {

  // Selecting an option form dropdown filter by list
  let type = document.getElementById('typeSelect').value;

  // Comparing the value selected with the types of cards.
  if (type === 'ICPC') {
    typeICPC = contestsList.filter(contest => contest.type == 'ICPC');
    differentContests(typeICPC);
  } else if (type === 'CF') {
    typeCF = contestsList.filter(contest => contest.type == 'CF');
    differentContests(typeCF);
  }
}

// To get to the next page
function nextPage() {

  if (pastContests.length > pastEndIndex + 30) {
    pastStartIndex = pastStartIndex + 30;
    pastEndIndex = pastEndIndex + 30;
  }

  if (nonPastContests.length >= nonPastEndIndex + 30) {
    nonPastStartIndex = nonPastStartIndex + 30;
    nonPastEndIndex = nonPastEndIndex + 30;
  }

  makePastCards(pastContests);
  makeNonPastCards(presentContests, futureContests);
}

// Previous page
function prevPage() {

  if (pastStartIndex >= 30 && pastEndIndex >= 60) {
    pastStartIndex = pastStartIndex - 30;
    pastEndIndex = pastEndIndex - 30;
    makePastCards(pastContests);
  }

  if (nonPastStartIndex >= 30 && nonPastStartIndex >= 60) {
    nonPastStartIndex = nonPastStartIndex - 30;
    nonPastEndIndex = nonPastEndIndex - 30;
    makeNonPastCards(presentContests, futureContests);
  }
}

//Formation of present and future contests cards
function makeNonPastCards(present = [], future = []) {

  // to merge the two arrays.
  nonPastContests = [...present, ...future];

  let mainSection = document.querySelector('#mainSection');

  // On every filter, make section empty
  mainSection.innerHTML = '';

  for (let contest = nonPastStartIndex; contest < nonPastEndIndex; contest++) {

    let cardSection = document.createElement('div');
    cardSection.classList.add('card');

    // Card divided into 3 major sections
    divTitle = cardTitle(nonPastContests[contest].name);

    // Label only for ongoing and future contests
    let label = document.createElement('span');
    label.classList.add('label');
    let labelText = document.createTextNode(`${nonPastContests[contest].phase === 'BEFORE' ? 'OPEN' : 'ONGOING'} `);
    label.appendChild(labelText);
    divTitle.appendChild(label);

    divContent = cardContent(nonPastContests[contest].startTimeSeconds, nonPastContests[contest].durationSeconds, nonPastContests[contest].type);

    divFooter = cardFooter("Register", "Closing Until ", nonPastContests[contest].relativeTimeSeconds);

    cardSection = appendToCard(cardSection, divTitle, divContent, divFooter);

    mainSection.appendChild(cardSection);

  }
  // If there are no cards to display in the section
  if (nonPastContests.length == 0) {
    mainSection.innerHTML = 'No contests.';
  }
}

//Formation of past contest cards
function makePastCards(past = []) {

  let pastSection = document.querySelector('#pastSection');
  pastSection.innerHTML = '';

  for (let contest = pastStartIndex; contest < pastEndIndex; contest++) {

    //Card
    let cardSection = document.createElement('div');
    cardSection.classList.add('card');

    divTitle = cardTitle(past[contest].name);

    divContent = cardContent(past[contest].startTimeSeconds, past[contest].durationSeconds, past[contest].type);

    divFooter = cardFooter("Results", "Before Registration ", past[contest].relativeTimeSeconds);

    cardSection = appendToCard(cardSection, divTitle, divContent, divFooter);

    pastSection.appendChild(cardSection);

  }

  // If no contests present in the section
  if (past.length == 0) {
    pastSection.innerHTML = 'No contests.';
  }

}

//To navigate through different pages
function makeButtons() {

  let prevButton = document.createElement('button');
  let prevButtonText = document.createTextNode('Previous');
  prevButton.appendChild(prevButtonText);

  let nextButton = document.createElement('button');
  let nextButtonText = document.createTextNode('Next');
  nextButton.appendChild(nextButtonText);

  prevButton.addEventListener('click', prevPage);
  nextButton.addEventListener('click', nextPage);
  prevButton.classList.add('reg-button');
  nextButton.classList.add('reg-button');
  footer.appendChild(prevButton);
  footer.appendChild(nextButton);

}

//To convert given seconds to a readable format
function secondsToString(seconds) {
  let secs = Math.abs(seconds);
  let numdays = Math.floor(secs / 86400);
  let numhours = Math.floor((secs % 86400) / 3600);
  let numminutes = Math.floor(((secs % 86400) % 3600) / 60);

  if (numdays > 0) {
    return numdays + ' days'
  } else {
    return numhours + ' hours ' + numminutes + ' minutes '
  };

}

// To create HTML elements for card header
function cardTitle(element) {

  let divTitle = document.createElement('div');
  divTitle.classList.add('title');
  let name = document.createElement('span');
  name.classList.add('content-title');
  let nameText = document.createTextNode(element);
  name.appendChild(nameText);

  divTitle.appendChild(name);
  return divTitle;
}

// To create HTML elements for card content
function cardContent(startSec, durationSec, conType) {

  let divContent = document.createElement('div');
  divContent.classList.add('card-content');

  //Start Time Span
  let sTime = document.createElement('span');

  let timePlaceholder = document.createElement('div');
  let timePlaceholderText = document.createTextNode('Started On');
  timePlaceholder.classList.add('content-label');
  timePlaceholder.appendChild(timePlaceholderText);

  let startTime = document.createElement('div');
  let startTimeText = document.createTextNode(`${new Date(startSec * 3000).toLocaleString()}`)
  startTime.classList.add('content-value');
  startTime.appendChild(startTimeText);

  sTime.appendChild(timePlaceholder);
  sTime.appendChild(startTime);

  divContent.appendChild(sTime);

  //Duration Time span
  let dTime = document.createElement('span');

  let dTimePlaceholder = document.createElement('div');
  let dTimePlaceholderText = document.createTextNode('Duration');
  dTimePlaceholder.classList.add('content-label');
  dTimePlaceholder.appendChild(dTimePlaceholderText);

  let durationTime = document.createElement('div');
  let durationTimeText = document.createTextNode(`${secondsToString(durationSec)}`)
  durationTime.classList.add('content-value');
  durationTime.appendChild(durationTimeText);

  dTime.appendChild(dTimePlaceholder);
  dTime.appendChild(durationTime);

  divContent.appendChild(dTime);

  //Contest Type Span
  let typeSpan = document.createElement('span');

  let typePlaceHolder = document.createElement('div');
  let typePlaceHolderText = document.createTextNode('Type');
  typePlaceHolder.classList.add('content-label');
  typePlaceHolder.appendChild(typePlaceHolderText);

  let type = document.createElement('div');
  let typeText = document.createTextNode(conType);
  type.classList.add('content-value');
  type.appendChild(typeText);

  typeSpan.appendChild(typePlaceHolder);
  typeSpan.appendChild(type);

  divContent.appendChild(typeSpan);

  return divContent;
}

// To create HTML elements for card footer
function cardFooter(buttonText, closingText, relTime) {

  let divFooter = document.createElement('div');
  divFooter.classList.add('card-footer');

  let registerSpan = document.createElement('span');

  //Register/Result span
  let regButton = document.createElement('button');
  let regButtonText = document.createTextNode(buttonText);

  regButton.appendChild(regButtonText);
  regButton.classList.add('reg-button');
  registerSpan.appendChild(regButton);

  //End time span
  let closingSpan = document.createElement('span');
  let closingSpanText = document.createTextNode(closingText + secondsToString(relTime));
  closingSpan.appendChild(closingSpanText);

  divFooter.appendChild(registerSpan);
  divFooter.appendChild(closingSpan);

  return divFooter;
}

// Appending the 3 elements to a single card
function appendToCard(cardSec, title, content, footer) {

  cardSec.appendChild(title);
  cardSec.appendChild(content);
  cardSec.appendChild(footer);

  return cardSec;

}
