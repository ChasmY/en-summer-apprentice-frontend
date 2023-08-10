import './style.css'
import javascriptLogo from './javascript.svg'
import viteLogo from '/vite.svg'
import { setupCounter } from './counter.js'


async function renderEventTemplate(){
  const mainContentDiv = document.querySelector('.main-content-component');
  mainContentDiv.innerHTML = getEventsTemplate();
  await displayCards();
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

async function getAllEvents() {
  const response = await fetch('http://localhost:7042/api/Event/GetAllEvents', {mode:'cors'});
  const data = await response.json();
  console.log(response);
  console.log(data);
  return data;
}


const addEvents = (events) =>{
  const eventsDiv = document.querySelector('.events');
  eventsDiv.innerHTML="No events";
  if(events.length){
    eventsDiv.innerHTML="";
    events.forEach((event) => {
      eventsDiv.appendChild(createEventElement(event))
    })
  }
}
function displayCards(){
  const container = document.querySelector('.card-container');
  
  const events = getAllEvents().then(events => events.forEach(element => {
                const tempEvent = createEventElement(element)
                container.appendChild(tempEvent);
                }));
  console.log(events);
}


function createEventElement(element){
  console.log("Create element", element)
  const newCard = document.createElement("div");
  newCard.classList.add("card-container");
  var imageUrl = ["https://play-lh.googleusercontent.com/ypVb0U7-YUPC3JqDyC9vEeeNNWxTxXVPeFZPLwMcVuUXrYFx2xJQxq3jBsyu8Dd1WQQ",
  "https://electriccastle.ro/assets/img/ec-official-logo.jpg",
  "https://3willowdesign.com/wp-content/uploads/2016/05/WineFest-logo-standard.jpg",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTvQwF25ly5E1xqdG7OwS7LoiW1rtiENfHRIkGCK-g&s"];

  // var imageUrl =[];

  if(element.name == "Untold"){
    var image = imageUrl[0];
    var tempText = element.name;
  }
  else if(element.name == "Electric Castle"){
    image = imageUrl[1];
    tempText = element.name;
  }
  else if(element.name =="Wine Festival"){
    image = imageUrl[2];
    tempText = element.name;
  }
  else {
    image = imageUrl[3];
    tempText = element.name;
  }

  const tickets = element.ticketCategories
    .map((category) => `<option>${category.description}</option>`)
    
  

  if(element.ticketCategories[0].description != null){
    const content = `
    <div class="card-container">
      <img src="${image}" alt="${element.name}" class="event-img>
      <div class="card-content">
          <ul class="noList">
            <li class="event-name">${element.name}</li>
            <li>${element.description}</li>
            <li>${element.venue.location}</li>
            <li>${element.venue.capacity}</li>
            <li>${element.startDate}</li>
            <li>${element.endDate}</li>
            <select>
              <option name="description-input">${tickets}</option>
            </select>
            <input type = "number" name="number" class = "number-input">
            <input type ="text" id="name" class="name-input>
            <label for="name">Name</label>
            <button id="add-to-cart">AddToCart</button>
          </ul>
      </div>
    </div>
    `;
  newCard.innerHTML = content;
}
  console.log("Create new card", newCard);

  const addToCartButton = document.getElementById("add-to-cart");
  console.log(addToCartButton)
  addToCartButton.addEventListener("click", () => { handleAddToCart()});

  return newCard;
}

const handleAddToCart = () =>{
  console.log("Loading...")

  var customerName = document.querySelector('.name-input').value
  var numberOfTickets = document.querySelector('.number-input').value
  var ticketType = document.querySelector('.description-input').value
  console.log("Post beginning" , numberOfTickets, ticketType)
  if(numberOfTickets)
  fetch('http://localhost:7042/api/Order/OrderPost', {

    method:Post,
    headers:{
      'Content-type':'application/json',
      'Acces-Control-Request-Headers': 'content-type'
    },
    body: JSON.stringify({

      ticketType: ticketType,
      customerName: customerName,
      numberOfTickets: +numberOfTickets
    }),
  })
  .then((response) =>{
    return response.json.then((data) =>{
      if(!response.ok){
        throw Error(data.message);
      }
      return data;
    });
  })
  .then((data) =>{
    addOrder(data);
    console.log("Done")
    // input.value=0
    // addToCartButton.disabled=true; //trebuie implementata
    //resetam valorile
  })
  .finally(() =>{});
}

export const addOrder = (data) =>{
  const purchasedTicket = JSON.parse(localStorage.getItem('purchasedTicket')) || [];
  purchasedTicket.push(data);
  localStorage.setItem('purchasedTicket', JSON.stringify(purchasedTicket));
}

renderEventTemplate();