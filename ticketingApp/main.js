import './style.css'
import javascriptLogo from './javascript.svg'
import viteLogo from '/vite.svg'

let selectedVenueId = 'all';
let selectedEventTypeId = 'all';
const fieldInput = `<div class="search-container"><input type="text" class="search-input" placeholder="Search for names..." title="Type in a name"></div>`
export let globalTicketSelector = ``



async function renderEventTemplate() {
  loader();
  await new Promise(resolve => setTimeout(resolve, 3000)); // Wait for the loader to be visible

  const mainContentDiv = document.querySelector('.main-content-component');
  if (!mainContentDiv) {
    return;
  }

  mainContentDiv.innerHTML = getEventsTemplate() + fieldInput;

  const inputElement = document.querySelector(".search-input");
  inputElement.addEventListener("keyup", eventFilter);
  

  
  await renderFilters(mainContentDiv);
  

  await displayCards();

  filterEvents();
}

async function renderFilters(mainContentDiv) {
  await renderVenues(mainContentDiv);
  await renderEventTypes(mainContentDiv);

  const applyFiltersContainer = document.createElement('div');
  applyFiltersContainer.classList.add('apply-filters-button-container');
  applyFiltersContainer.innerHTML = '<button class="applyFiltersButton">Apply Filters</button>';
  mainContentDiv.appendChild(applyFiltersContainer);

  const applyFiltersButton = document.querySelector('.applyFiltersButton');
  applyFiltersButton.addEventListener('click', () => {
    filterEvents();
  });

  setupEventListeners();
}



async function getAllCustomers(){
  const response = await fetch('http://localhost:7042/api/Customer/GetAllCustomers', {mode: "cors"});
  const data = await response.json();
  return data
}

 async function getAllEvents() {
  const response = await fetch('http://localhost:7042/api/Event/GetAllEvents', {mode:'cors'});
  const data = await response.json();
  return data;
}


 async function getEventById(eventId){
  const response = await fetch(`http://172.localhost:7042/api/Event/GetEventById?id=${eventId}`, {mode:'cors'});
  const data = await response.json();
  return data
}


function getEventsTemplate(){
  return `
  <header>
  <nav>
    <ul class="menu">
      <li>
        <a href="index.html">Events</a>
      </li>  
      <li>
        <a href="order.html">Orders</a>
      </li>
    </ul>
  
  </nav>
  </header> 

    <footer></footer>`
}

async function renderVenues(mainContentDiv) {
  const events = await getAllEvents();
  const venuesSet = {};
  events.forEach(event => {
    venuesSet[event.venue.venueId] = event.venue.location;
  });

  const venuesContainer = document.createElement('div');
  const venueSelectorHTML = `
    <label for="venueSelector" class="venueLabel">Select a Venue:</label>
    <select class="venueSelector" name="venue">
      <option value="all">All venues</option>
      ${Object.entries(venuesSet).map(([venueId, location]) => `
        <option value="${venueId}">${location}</option>
      `).join('')}
    </select>
  `;
  venuesContainer.innerHTML = venueSelectorHTML;
  mainContentDiv.appendChild(venuesContainer);

  venueFilter();
}


function venueFilter(){

  const venueSelector = document.querySelector('.venueSelector');
  
  venueSelector.addEventListener('change', () => {
    selectedVenueId = venueSelector.value;
  });

}

async function renderEventTypes(mainContentDiv){
  const events = await getAllEvents();
  const eventTypeSet = {}
  events.forEach(event => {
    eventTypeSet[event.eventType.eventTypeId] = event.eventType.name;
  });

  const eventTypeContainer = document.createElement('div');
  const eventTypeSelectorHTML = `
    <label for="eventTypeSelector" class="eventTypeLabel">Select an Event Type:</label>
    <select class="eventTypeSelector" name="venue">
      <option value="all">All Event Types</option>
      ${Object.entries(eventTypeSet).map(([eventTypeId, name]) => `
        <option value="${eventTypeId}">${name}</option>
      `).join('')}
    </select>
  `;
  eventTypeContainer.innerHTML = eventTypeSelectorHTML;
  mainContentDiv.appendChild(eventTypeContainer);

  eventTypeFilter();
}

function eventTypeFilter(){
  const eventTypeSelector = document.querySelector('.eventTypeSelector');
  
  eventTypeSelector.addEventListener('change', () => {
    selectedEventTypeId = eventTypeSelector.value;
    
  });
  
}

function setupEventListeners() {
  const venueSelector = document.querySelector('.venueSelector');
  const applyFiltersButton = document.querySelector('.applyFiltersButton');
  
  venueSelector.addEventListener('change', () => {
    selectedVenueId = venueSelector.value;
  });

  applyFiltersButton.addEventListener('click', () => {
    selectedVenueId = venueSelector.value;
    selectedEventTypeId = eventTypeSelector.value;
    filterEvents();
  });
}

async function displayCards(){
  const container = document.querySelector('.card-container');
  const events = await getAllEvents();

  events.forEach(element => {
    const tempEvent = createEventElement(element);
    container.appendChild(tempEvent);
  });
}

function createEventElement(element){
  const newCard = document.createElement("div");
  newCard.classList.add("card");
  newCard.setAttribute("data-venue-id", element.venue.venueId);
  newCard.setAttribute("data-eventType-id", element.eventType.eventTypeId)

  const imageUrl = ["https://play-lh.googleusercontent.com/ypVb0U7-YUPC3JqDyC9vEeeNNWxTxXVPeFZPLwMcVuUXrYFx2xJQxq3jBsyu8Dd1WQQ",
  "https://electriccastle.ro/assets/img/ec-official-logo.jpg",
  "https://3willowdesign.com/wp-content/uploads/2016/05/WineFest-logo-standard.jpg",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTvQwF25ly5E1xqdG7OwS7LoiW1rtiENfHRIkGCK-g&s",
  "https://upload.wikimedia.org/wikipedia/commons/1/1f/Logo-tomorrowland.jpg",
  "https://summerwell.ro/images/SW_FB_event_cover.png",
  "data:image/jpeg;base64,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",
  "data:image/png;base64,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"]


  let image = "";
switch (element.name) {
  case "Untold":
    image = imageUrl[0];
    break;
  case "Electric Castle":
    image = imageUrl[1];
    break;
  case "Wine Festival":
    image = imageUrl[2];
    break;
  case "Tomorrowland":
    image = imageUrl[4];
    break;
  case "Summerwell":
    image = imageUrl[5] ;
    break;
  case "Meci de fotbal":
    image = imageUrl[6];
    break;
  case "Jazz in the park":
    image = imageUrl[7];
    break;
  default:
    image = imageUrl[3];
}

const ticketSet = {};
element.ticketCategories.forEach(event => {
  ticketSet[event.ticketCategoryId] = {
    description:event.description,
    price: event.price
  }
})

const ticketSelectorHTML = `
<select id="ticketSelector" name="ticket">
  ${Object.entries(ticketSet).map(([ticketCategoryId, { description, price }]) => `
    <option value="${ticketCategoryId}">Category: ${description} Price: ${price}</option>
  `).join("\n")}
</select>
`;


  const content = `
    <div class="card-${element.eventId}" data-venue-id="${element.venueId}">
      <div class="container"><img src="${image}" alt="${element.name}"></div>
      <div class="card-content">
        <h1 class="event-name">${element.name}</h1>
        <p class="event-description">${element.description}</p>
        <p>${element.venue.location}</p>
        <p>${element.eventType.name}</p>
        <p>${element.venue.capacity}</p>
        <p>${element.startDate}</;>
        <p>${element.endDate}</p>      
        ${ticketSelectorHTML}

        <div class="numberInput">
          <button id="decrement"> - </button>
          <input type="number" name="number" min="0" class = "number-input" placeholder=0 readonly>
          <button id="increment"> + </button>
        </div>

        <div class="inputBox">
            <input type ="text" class="name-input" required="required">
            <span class="inputLabel">Name</span>
        </div>
        <button id="add-to-cart-${element.eventId}">AddToCart</button>
      </div>
    </div>
    `;


    const createDomElement = document.createElement("div");
    createDomElement.innerHTML = content;
    while (createDomElement.firstChild) {
      newCard.appendChild(createDomElement.firstChild);
    }

    globalTicketSelector = ticketSelectorHTML

  const decreaseButton = newCard.querySelector("#decrement");
  decreaseButton.addEventListener("click", () => decreaseValue(newCard));

  const increaseButton = newCard.querySelector("#increment");
  increaseButton.addEventListener("click", () => increaseValue(newCard));

  

    createEventListener(newCard, element)
    
    return newCard;

}

function increaseValue(newCard) {
  const valueInput = newCard.querySelector(".number-input");
  let value = parseInt(valueInput.value);
  value = isNaN(value) ? 0 : value;
  value++;
  valueInput.value = value;
}

function decreaseValue(newCard) {
  const valueInput = newCard.querySelector(".number-input");
  let value = parseInt(valueInput.value);
  value = isNaN(value) ? 0 : value;
  value = value < 1 ? 1 : value - 1;
  valueInput.value = value;
}



function createEventListener(newCard, element){
  let addToCartButton = newCard.querySelector(`#add-to-cart-${element.eventId}`)
  addToCartButton.addEventListener("click", () => handleAddToCart(newCard, element));
}

async function handleAddToCart (newCard, element){
  console.log("Loading...")

  const customers = await getAllCustomers();
  console.log(customers)

  const customerName = newCard.querySelector('.name-input').value;

  const customer = customers.find(customer => customer.name === customerName);
  const customerId = customer.customerId
  console.log(customerId)
  const numberOfTickets = newCard.querySelector('.number-input').value
  
  const ticketCategoryId = newCard.querySelector('#ticketSelector').value

  if(numberOfTickets)
  fetch('http://localhost:7042/api/Order/OrderPost', {

    method:"POST",
    headers:{ 
      'Content-type':'application/json',
      'Acces-Control-Request-Headers': 'content-type'
    },
    body: JSON.stringify({
      customerId: +customerId,
      numberOfTickets: +numberOfTickets,
      ticketCategoryId: + ticketCategoryId
    }),
  })
  .then((response) =>{
    return response.json().then((data) =>{
      if(!response.ok){
        throw Error(data.message);
      }
      return data;
    });
  })
  .then((data) =>{
    addOrder(data);
    console.log("Done")
    newCard.querySelector('#ticketSelector').selectedIndex = 0;
    newCard.querySelector('.number-input').value = '';
    newCard.querySelector('.name-input').value = '';
  })
  .finally(() =>{});
}

export const addOrder = (data) =>{
  const purchasedTicket = JSON.parse(localStorage.getItem('purchasedTicket')) || [];
  purchasedTicket.push(data);
  localStorage.setItem('purchasedTicket', JSON.stringify(purchasedTicket));
}


function eventFilter() {
  const inputElement = document.getElementById("myInput");
  const cards = document.querySelectorAll(".card");

  inputElement.addEventListener("keyup", () => {
    const filterValue = inputElement.value.toLowerCase();

    cards.forEach(card => {
      const venueId = card.getAttribute("data-venue-id");
      const eventTypeId = card.getAttribute("data-eventType-id");
      const cardText = card.textContent || card.innerText;

      if (
        (selectedVenueId === "all" || selectedVenueId === venueId) &&
        (selectedEventTypeId === "all" || selectedEventTypeId === eventTypeId) &&
        cardText.toLowerCase().indexOf(filterValue) > -1
      ) {
        card.style.display = "block";
      } else {
        card.style.display = "none";
      }
    });
  });
}

async function filterEvents() {
  const eventCards = document.querySelectorAll('.card');
  eventCards.forEach(card => {
    const cardVenueId = card.getAttribute('data-venue-id');
    const cardEtId = card.getAttribute('data-eventType-id');
    
    const venueFilterPassed = selectedVenueId === 'all' || cardVenueId === selectedVenueId;
    const eventTypeFilterPassed = selectedEventTypeId === 'all' || cardEtId === selectedEventTypeId;
    
    if (venueFilterPassed && eventTypeFilterPassed) {
      card.style.display = 'block';
      console.log(card)
    } else {
      card.style.display = 'none';
    }
  });
}

function loader(){
  const loader = document.querySelector('.loader');


  const styleElement = document.createElement('style');
  document.head.appendChild(styleElement);

  // Apply animation to loader
  setTimeout(() => {
    loader.style.display = 'none';
  }, 3000);
}


export {getAllEvents, getEventById}


renderEventTemplate();

