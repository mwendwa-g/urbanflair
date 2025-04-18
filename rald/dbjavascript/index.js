const token = localStorage.getItem("token");
window.onload = function() {
    checkUserRole();
}

/*function checkUserRole() {
    if (!token) {
        window.location.href = '../index.html';
        return;
    }

    const decodedToken = decodeJwt(token);
    const userRole = decodedToken.role;
    
    if (userRole === "admin") {
        return;
    } else {
        window.location.href = '../index.html';
    }
}*/

function decodeJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error("Failed to decode token:", e);
        return null;
    }
}


const aappii = "/api/raldfurniture";

//GETTING TOTAL NUMBER OF PRODUCTS
const allproductscount = document.getElementById("all-products-lark-dash");
fetch(`${aappii}/products/get/count`,{
    method: 'GET',
    headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    }
})
.then(res => res.json())
.then(data => {
    allproductscount.textContent = data.productCount
})
.catch(err => console.error("Error fetching categories: ", err))

//GETTING TOTAL SALES
const totasales = document.getElementById('lark-total-sales');
fetch(`${aappii}/orders/get/totalsales`, {
    method: 'GET',
    headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    }
})
.then(res => res.json())
.then(data => {
    totasales.textContent = `${data.totalSales}`;
})
.catch(err => console.error("Error fetching categories: ", err))

//GETTING NUMBER OF ALL THE CUSTOMERS
const totalclients = document.getElementById('shop-customers-all');
fetch( `${aappii}/users/get/count`  , {
    method: 'GET',
    headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    }
})
.then(res => res.json())
.then(data => {
    totalclients.textContent = data.userCount;
})
.catch(err => console.error("Error fetching Users: ", err))

//GETTING THE TOTAL ORDERS MADE
const totalorders = document.getElementById('lark-total-orders');
fetch(`${aappii}/orders/get/count`, {
    method: 'GET',
    headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    }
})
.then(res => res.json())
.then(data => {
    totalorders.textContent = data.orderCount;
    document.getElementById("of-all-orders").textContent = data.orderCount;
})
.catch(err => console.error("Error fetching Orders: ", err))

//DISPLAYING FIVE ORDERS ONLY ON THE DASHBOARD
fetch(`${aappii}/orders/five`, {
    method: 'GET',
    headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    }
})
.then(res => res.json())
.then(data => {
    orders = data
    const fiveorders = document.getElementById('lark-five-orders')
    fiveorders.innerHTML = "";
    orders.forEach(order=>{
        const ordertr = document.createElement('tr')
        ordertr.innerHTML = `
        <td class="ps-3">
            <a href="order-detail.html">${order.id}</a>
        </td>
        <td>${new Date(order.dateOrdered).toLocaleDateString()}<br>
        ${new Date(order.dateOrdered).toLocaleTimeString()}</td>
        <td>
            ${order.orderItems.length}
        </td>
        <td>
            <a href="#!">${order.user.name}</a>
        </td>
        <td>${order.user.email}</td>
        <td>${order.user.phone}</td>
        <td>${order.user.housenumber}</td>
        <td>${order.user.county}</td>
        <td>
            <i class="bx bxs-circle text-success me-1"></i>${order.status}
        </td>
        `;
        fiveorders.appendChild(ordertr)
    })
})
.catch(err => console.error("Error fetching Orders: ", err))

document.querySelector(".account-log-out").addEventListener("click", (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token")
    if(!token){
        return;
    }
    else if(token){
        Swal.fire({
            title: "Are you sure?",
            text: "You will be logged out!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, log me out!"
        }).then((result) => {
            if (result.isConfirmed) {
                localStorage.removeItem("token");
                location.reload();
            }
        });
    }
});