import './style.css'
import javascriptLogo from './javascript.svg'
import viteLogo from '/vite.svg'
import { setupCounter } from './counter.js'



function renderOrderTemplate(){
    const mainContentDiv=  document.querySelector('.main-order-container');
    mainContentDiv.innerHTML = getOrderTemplate();
    displayOrders();
}

function getOrderTemplate(){
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

async function getAllOrders(){
    const response = await fetch('http://localhost:7042/api/Order/GetAllOrders', {mode: 'cors'});
    const data = await response.json();
    return data;
  }


  function displayOrders(){
    const container = document.querySelector('.order-container');

    console.log(getAllOrders());
    const orders = getAllOrders().then(orders => orders.forEach(element => {
        const tempOrder = createOrderElement(element)
        container.appendChild(tempOrder);
        }));
}

function createOrderElement(element){
    const newCard = document.createElement('div');
    newCard.classList.add('order-container')

    const content = `
    <div class = "order-container">
     <ul class="orders">
        <li>Nume: ${element.clientName}</li>
        <li>Categorie: ${element.ticketType}</li>
        <li>Numar bilete: ${element.numberOfTickets}</li>
        <li>Pret total: ${element.totalPrice}</li>
        <li>Eveniment: ${element.eventName}</li>
        <li>Comandat la:${element.orderedAt}</li>
     </ul>
    </div>
    `

    newCard.innerHTML = content;
  
    console.log("Create new card", newCard);
    return newCard;
}


renderOrderTemplate();

