import './style.css'
import javascriptLogo from './javascript.svg'
import viteLogo from '/vite.svg'
import { setupCounter } from './counter.js'


function renderEventTemplate(){
  const mainContentDiv = document.querySelector('.main-content-component');
  mainContentDiv.innerHTML = getEventsTemplate();
  displayCards();
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
              <option name="description">${tickets}</option>
            </select>
            <input type = "number" name="number">
            <label for="name">Name</label>
            <input type ="text" id="name" class="name-input>
            <button class="add-to-cart">AddToCart</button>
          </ul>
      </div>
    </div>
    `;
  newCard.innerHTML = content;
}
  console.log("Create new card", newCard);

  const addToCartButton = newCard.querySelector(".add-to-cart");
  addToCartButton.addEventListener("click", () => handleAddToCartClick(customerName, numberOfTickets, ticketType));

  return newCard;
}

function handleAddToCartClick(inputCustomerName, inputNumberOfTickets, inputTicketType){
  console.log("Loading...")

  var customerName = document.querySelector("name-input")
  var numberOfTickets = document.querySelector("number")
  var ticketType = document.querySelector("description")
  console.log("Post beginning" , numberOfTickets, ticketType)

  fetch('http://localhost:7042/api/Order/OrderPost', {

    method:Post,
    headers:{
      'Content-type':'application/json',
      'Acces-Control-Request-Headers': 'content-type'
    },
    body: JSON.stringify({

      ticketType: + ticketType,
      customerName: +customerName,
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
    addOrder(data); //trebuie implementata
    //resetam valorile
  })
  .finally(() =>{});
}

renderEventTemplate();