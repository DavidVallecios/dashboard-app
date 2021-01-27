import { API_HOST } from "../utils/utils";

export function getAllOrders() {
  const url = `${API_HOST}/orders`;

  return fetch(url)
    .then((response) => {
      return response.json();
    })
    .then((result) => {
      return result;
    });
}

export function getOrderDetail(idOrder) {
  const url = `${API_HOST}/orders-details/order/${idOrder}`;

  return fetch(url)
    .then((response) => {
      return response.json();
    })
    .then((result) => {
      return result;
    });
}

export function getOrderById(idOrder){
  const url = `${API_HOST}/orders/${idOrder}`;

  return fetch(url)
    .then((response) => {
      return response.json();
    })
    .then((result) => {
      return result.order[0];
    });
}
