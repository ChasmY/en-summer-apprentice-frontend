import './style.css'
import javascriptLogo from './javascript.svg'
import viteLogo from '/vite.svg'
import { setupCounter } from './counter.js'
import { getAllEvents} from './main'
import { getEventById } from './main'
import { library, icon } from '@fortawesome/fontawesome-svg-core'
import { globalTicketSelector } from './main'




const modifyButton = `<button id="modifyButton"><i class="fa-solid fa-pencil"></i></button>`
const deleteButton = `<button id="deleteButton"><i class="fa-solid fa-x"></i></button>`

async function renderOrderTemplate(){
    await new Promise(resolve => setTimeout(resolve, 3000)); // Wait for the loader to be visible
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


let orderHeader = `
<h3 class="page-title">Purchased tickets</h3>
<div class="order-header">
  <span>Id</span>
  <span>Name</span>
  <span>Ticket Category</span>
  <span>Number of Tickets</span>
  <span>Total Price</span>
  <span>Event</span>
  <span>Ordered At</span>
</div>`



  async function displayOrders() {
    const container = document.querySelector('.order-container');
    container.innerHTML += orderHeader
    
    
    try {
      const orders = await getAllOrders();
      
      orders.forEach(element => {
        const tempOrder = createOrderElement(element);
        container.appendChild(tempOrder);
      });
    } catch (error) {
      console.error('Error fetching and displaying orders:', error);
    }
  }


function createOrderElement(element){
    const newCard = document.createElement('div');
    newCard.classList.add('order-card') 
    newCard.setAttribute("data-order-id", element.orderId)

    console.log(newCard)
    let secondCategory = ""
    if(element.ticketCategory.description == "Standard"){
        secondCategory = "Vip"
    }
    else{
        secondCategory = "Standard"
    }
    
    const ticketSet = `
        <select id="ticketSelector" name="ticketSelector" disabled>
        <option value="${element.ticketCategory.description}">${element.ticketCategory.description}</option>
        <option value="${secondCategory}">${secondCategory}</option>"
        </select>
    `
const content = `
  <div class="orderContainer bg-red-500 p-7 m-7">
    <div class="order-data">
      <span>${element.orderId}</span>
      <span>${element.customer.name}</span>
      ${ticketSet}
      <span class="number-input" disabled>${element.numberOfTickets}</span>
      <span class="total-price">${element.totalPrice}</span>
      <span>${element.eventName}</span>
      <span class="order-date">${element.orderedAt}</span>
    </div>
    <div class="action-buttons">
        <button id="cancelButton" class="hidden"><i class="fa-solid fa-x"></i></button>
        <button id="saveButton" class="hidden"><i class="fa-solid fa-floppy-disk"></i></button>
      </div>  
  </div>
`;
    newCard.innerHTML = content + `
      ${modifyButton}
      ${deleteButton}
    `;

    const modifyButtonElement = newCard.querySelector('#modifyButton');
    modifyButtonElement.addEventListener('click', () => handleModifyButtonClick(newCard, element));

    const cancelButtonElement = newCard.querySelector('#cancelButton');
    cancelButtonElement.addEventListener('click', () => handleCancelButtonClick(newCard, element));

    const saveButtonElement = newCard.querySelector('#saveButton');
    saveButtonElement.addEventListener('click', () => handleSaveButtonClick(newCard, element));

    const deleteButtonElement = newCard.querySelector('#deleteButton');
    deleteButtonElement.addEventListener('click', () => handleDeleteOrder(element, newCard));

    

    return newCard;
}



function modifyOrder(data){
  const modifiedOrder = JSON.parse(localStorage.getItem('modifiedOrder')) || [];
  modifiedOrder.push(data);
  localStorage.setItem('modifiedOrder', JSON.stringify(modifiedOrder));
}


function handleModifyButtonClick(cardElement, order) {
  const cancelButton = cardElement.querySelector('#cancelButton');
  const saveButton = cardElement.querySelector('#saveButton');
  
  cancelButton.classList.remove('hidden');
  saveButton.classList.remove('hidden');

  const modifyButton = cardElement.querySelector('#modifyButton');
  const deleteButton = cardElement.querySelector('#deleteButton');
  modifyButton.classList.add('hidden');
  deleteButton.classList.add('hidden');


  const ticketSelector = cardElement.querySelector('#ticketSelector');
  const numberInput = cardElement.querySelector('.number-input')
  numberInput.removeAttribute('disabled')
  ticketSelector.removeAttribute('disabled');
}


async function handleCancelButtonClick(cardElement, order) {
  const cancelButton = cardElement.querySelector('#cancelButton');
  const saveButton = cardElement.querySelector('#saveButton');
  
  cancelButton.classList.add('hidden');
  saveButton.classList.add('hidden');

  const modifyButton = cardElement.querySelector('#modifyButton');
  const deleteButton = cardElement.querySelector('#deleteButton');
  modifyButton.classList.remove('hidden');
  deleteButton.classList.remove('hidden');
  
  const ticketSelector = cardElement.querySelector('#ticketSelector');
  const numberInput = cardElement.querySelector(".number-input");

  numberInput.setAttribute('disabled', 'disabled')
  ticketSelector.setAttribute('disabled', 'disabled');

  const newTicketCategory = cardElement.querySelector("#ticketSelector").value
  console.log(newTicketCategory)
  
  const dataEvent = await getEventById(order.eventId)
  const dataTicket = dataEvent.ticketCategories.find(ticket => ticket.description === newTicketCategory);
  console.log(dataTicket)


  let totalPrice = order.numberOfTickets * dataTicket.price;
  console.log(totalPrice)
  cardElement.querySelector(".number-input").value = data.numberOfTickets  
  cardElement.querySelector(".total-price").textContent  = `Pret total: ${totalPrice}`;
  console.log("Done")
}



async function handleSaveButtonClick(cardElement, order) {
  const cancelButton = cardElement.querySelector('#cancelButton');
  const saveButton = cardElement.querySelector('#saveButton');
  
  cancelButton.classList.add('hidden');
  saveButton.classList.add('hidden');

  const modifyButton = cardElement.querySelector('#modifyButton');
  const deleteButton = cardElement.querySelector('#deleteButton');
  modifyButton.classList.remove('hidden');
  deleteButton.classList.remove('hidden');
  
  console.log("Loading..")
  
  const newTicketCategory = cardElement.querySelector("#ticketSelector").value
  
  const dataEvent = await getEventById(order.eventId)
  const dataTicket = dataEvent.ticketCategories.find(ticket => ticket.description === newTicketCategory);


  const orderId = order.orderId
  
  const ticketCategoryId = dataTicket.ticketCategoryId
  const numberOfTickets  = parseInt(document.querySelector(".number-input").value)

  if(numberOfTickets != order.numberOfTickets){
    fetch('http://localhost:7042/api/Order/OrderPatch',
    {
      method: "PATCH",
      headers:{
        'Content-type':'application/json',
        'Acces-Control-Request-Headers': 'content-type'
      },
      body: JSON.stringify({
        orderId: +orderId,
        ticketCategoryId :+ticketCategoryId,
        numberOfTickets: +numberOfTickets
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
      modifyOrder(data);
      
      cardElement.querySelector(".number-input").value = data.numberOfTickets  
      cardElement.querySelector(".total-price").textContent  = `Pret total: ${data.totalPrice}`;
      console.log("Done")
      displayOrders()
    })
    .finally(() =>{});
  }
  else {
    console.log("Unavailable to modify")
  }
}

async function handleDeleteOrder(order, cardELement) {

  const orderId = order.orderId

  fetch(`http://localhost:7042/api/Order/Delete?id=${orderId}`,
    {
      method: "DELETE",
      headers:{
        'Content-type':'application/json',
        'Acces-Control-Request-Headers': 'content-type'
      }
    })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Failed to delete order: ${response.statusText}`);
      }
      return response;
    })
    .then(() => {
      cardELement.remove();
      console.log("Order deleted successfully");
    })
    .catch((error) => {
      console.error(error);
    });

}

renderOrderTemplate();