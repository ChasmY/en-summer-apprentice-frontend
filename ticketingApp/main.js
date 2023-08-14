import './style.css'
import javascriptLogo from './javascript.svg'
import viteLogo from '/vite.svg'
import { setupCounter } from './counter.js'


async function renderEventTemplate(){
  const mainContentDiv = document.querySelector('.main-content-component');
  mainContentDiv.innerHTML = getEventsTemplate() + fieldInput;

  
  renderVenues(mainContentDiv)

  await displayCards(); 

  const inputElement = document.getElementById("myInput");
  inputElement.addEventListener("keyup", eventFilter);
}

const fieldInput = `<input type="text" id="myInput" placeholder="Search for names.." title="Type in a name">`


async function getAllOrders(){
  const response = await fetch('http://localhost:7042/api/Order/GetAllOrders', {mode: 'cors'});
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
  const venuesSet = { all: 'All Venues' };
  events.forEach(event => {
    venuesSet[event.venue.venueId] = event.venue.location;
  });

  const venuesContainer = document.createElement('div');
  const venueSelectorHTML = `
    <label for="venueSelector">Select a Venue:</label>
    <select id="venueSelector" name="venue">
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

  const venueSelector = document.getElementById('venueSelector');
  venueSelector.addEventListener('change', () => {
    const selectedVenueId = venueSelector.value;
    filterEventsByVenue(selectedVenueId);
  });
}

function filterEventsByVenue(venueId) {
  console.log("Filtering events by venue:", venueId);

  const eventCards = document.querySelectorAll('[data-venue-id]');
  eventCards.forEach(card => {
    const cardVenueId = card.getAttribute('data-venue-id');
    console.log("Card Venue ID:", cardVenueId);

    if (venueId === 'all' || cardVenueId === venueId) {
      card.style.display = 'block';
    } else {
      card.style.display = 'none';
    }
  });
}


async function getAllEvents() {
  const response = await fetch('http://localhost:7042/api/Event/GetAllEvents', {mode:'cors'});
  const data = await response.json();
  return data;
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
  newCard.classList.add("card-container");
  newCard.setAttribute("data-venue-id", element.venue.venueId);

  const imageUrl = ["https://play-lh.googleusercontent.com/ypVb0U7-YUPC3JqDyC9vEeeNNWxTxXVPeFZPLwMcVuUXrYFx2xJQxq3jBsyu8Dd1WQQ",
  "https://electriccastle.ro/assets/img/ec-official-logo.jpg",
  "https://3willowdesign.com/wp-content/uploads/2016/05/WineFest-logo-standard.jpg",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTvQwF25ly5E1xqdG7OwS7LoiW1rtiENfHRIkGCK-g&s"];

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
  default:
    image = imageUrl[3];
}

const ticketSet = {};
element.ticketCategories.forEach(event => {
  ticketSet[event.ticketCategoryId] = event.description
})

const ticketSelectorHTML = `
<select id="ticketSelector" name="ticket">
  ${Object.entries(ticketSet).map(([ticketCategoryId, description]) => `
    <option value="${ticketCategoryId}">${description}</option>
  `).join("\n")}
</select>
`;

  const content = `
    <div class="card-container" data-venue-id="${element.venueId}">
      <img src="${image}" alt="${element.name}" class="event-img">
      <div class="card-content">
          <ul class="noList">
            <li class="event-name">${element.name}</li>
            <li>${element.description}</li>
            <li id="${element.venue.venueId}">${element.venue.location}</li>
            <li>${element.venue.capacity}</li>
            <li>${element.startDate}</li>
            <li>${element.endDate}</li>
            ${ticketSelectorHTML}
            <input type = "number" name="number" min="0" class = "number-input">
            <input type ="text" id="name" class="name-input">
            <label for="name">Name</label>
            <button id="add-to-cart-${element.eventId}">AddToCart</button>
          </ul>
      </div>
    </div>
    `;
    const createDomElement = document.createElement("div");
    createDomElement.innerHTML = content;
    while (createDomElement.firstChild) {
      newCard.appendChild(createDomElement.firstChild);
    }

    
  createEventListener(newCard, element)
    

  return newCard;

}

function createEventListener(newCard, element){
  let addToCartButton = newCard.querySelector(`#add-to-cart-${element.eventId}`)
  addToCartButton.addEventListener("click", () => handleAddToCart(newCard, element));
}

async function handleAddToCart (newCard, element){
  console.log("Loading...")

  const customerNamesMap = await associateCustomerNames();

  const customerName = newCard.querySelector('.name-input').value;
  const customerId = Object.keys(customerNamesMap).find(key => customerNamesMap[key] === customerName);
  console.log(customerId)
  const numberOfTickets = newCard.querySelector('.number-input').value
  
  const ticketCategoryId = newCard.querySelector('.ticket-select').value
  console.log("Post beginning" , "customerId: " + customerId, "numberOfTickets: " + numberOfTickets, "Ticket categoryId: " + ticketCategoryId)

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
    newCard.querySelector('.ticket-select').selectedIndex = 0;
    newCard.querySelector('.number-input').value = '';
    newCard.querySelector('.name-input').value = '';
  })
  .finally(() =>{});
}

async function associateCustomerNames(){
  const customerNames = {};
  const orders = await getAllOrders();
  console.log(cust0omerId)
  orders.forEach(order => {
    if (!customerNames[order.customerId]) {
      customerNames[order.customerId] = order.clientName;
    }
  });
  return customerNames;
}

export const addOrder = (data) =>{
  const purchasedTicket = JSON.parse(localStorage.getItem('purchasedTicket')) || [];
  purchasedTicket.push(data);
  localStorage.setItem('purchasedTicket', JSON.stringify(purchasedTicket));
}





function eventFilter() {
  var input, filter, ul, li, i, txtValue;
  input = document.getElementById("myInput");
  filter = input.value.toUpperCase();
  ul = document.querySelector(".card-container");
  li = ul.getElementsByClassName("event-name"); 
  for (i = 0; i < li.length; i++) {
    txtValue = li[i].textContent || li[i].innerText;
    const card = li[i].closest(".card-container"); 
    if (txtValue.toUpperCase().indexOf(filter) > -1) {
      card.style.display = ""; 
    } else {
      card.style.display = "none"; //
    }
  }
}

renderEventTemplate();