const aappii = "/api/raldfurniture"
const token = localStorage.getItem("token")

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

//GETTING ALL ORDERS
const ordersbody = document.getElementById('orders-list-body')
fetch(`${aappii}/orders`,{
    method: 'GET',
    headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
    }
})
.then(res => res.json())
.then(data => {
    ordersbody.innerHTML = ""
    orders = data
    orders.forEach(order=>{
        let orderItemsHtml = "";
        order.orderItems.forEach(item => {
            orderItemsHtml += `
                <p><strong>${item.product.name}</strong> - ${item.quantity}pcs @ ksh${item.product.price}</p>
            `;
        });
        const ordertr  = document.createElement('tr')
        ordertr.innerHTML = `
        <td>${new Date(order.dateOrdered).toLocaleDateString()} <br>
        ${new Date(order.dateOrdered).toLocaleTimeString()}</td>
        <td>
            <a href="#!" class="link-primary fw-medium">${order.user.name}</a>
        </td>
        <td>${order.user.county}</td>
        <td>${order.user.street}</td>
        <td>${order.user.plotnumber}</td>
        <td>${order.user.housenumber}</td>
        <td>${order.user.phone}</td>
        <td>${order.totalPrice}</td>
        <td>
            ${orderItemsHtml}
        </td>
        <td> <span class="badge border border-secondary text-secondary  px-2 py-1 fs-13">${order.status}</span></td>
        <td> <span class="badge bg-light text-dark  px-2 py-1 fs-13">${order.payment}</span></td>
        <td>
            <div class="d-flex gap-2">
                <a href="" class="btn btn-light btn-sm update-status" data-id="${order._id}"><iconify-icon icon="solar:settings-bold"></iconify-icon></a>
                <a href="" class="btn btn-soft-primary btn-sm update-payment" data-id="${order._id}"><iconify-icon icon="solar:wallet-bold"></iconify-icon></a>
                <a href="" class="btn btn-soft-danger btn-sm"><iconify-icon icon="solar:trash-bin-minimalistic-2-broken" class="align-middle fs-18"></iconify-icon></a>
            </div>
        </td>
        `;
        ordersbody.appendChild(ordertr)
    })
})
.catch(err => console.error("Error fetching Orders: ", err))

document.getElementById("orders-list-body").addEventListener("click", function (event) {
    if (event.target.closest(".update-status")) {
        event.preventDefault();
        const orderId = event.target.closest(".update-status").getAttribute("data-id");

        const modal = document.getElementById("orderStatusModal");
        const closeModal = document.querySelector(".close");
        const statusSelect = document.getElementById("orderStatus");
        const updateButton = document.getElementById("updateOrderStatus");

        modal.style.display = "block";
        closeModal.addEventListener("click", () => {
            modal.style.display = "none";
        });
        updateButton.addEventListener("click", async () => {
            if (!orderId) return;
            const selectedStatus = statusSelect.value;
            try {
                const response = await fetch(`${aappii}/orders/${orderId}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ status: selectedStatus }),
                });
                if (response.ok) {
                    Swal.fire({
                        title: "Success!",
                        text: "Status updated",
                        icon: "success",
                        confirmButtonText: "OK"
                    });
                    modal.style.display = "none";
                    location.reload();
                } else {
                    Swal.fire({
                        title: "Error!",
                        text: "Failed to update status",
                        icon: "error",
                        confirmButtonText: "OK"
                    });
                }
            } catch (error) {
                Swal.fire({
                    title: "Error!",
                    text: "An error occured!",
                    icon: "error",
                    confirmButtonText: "OK"
                });
            }
        });
    }
});

document.getElementById("orders-list-body").addEventListener("click", function (event) {
    if (event.target.closest(".update-payment")) {
        event.preventDefault();
        const orderId = event.target.closest(".update-payment").getAttribute("data-id");

        const modal = document.getElementById("paymentStatusModal");
        const closeModal = document.querySelector(".closee");
        const statusSelect = document.getElementById("paymentStatus");
        const updateButton = document.getElementById("updatePaymentStatus");

        modal.style.display = "block";
        closeModal.addEventListener("click", () => {
            modal.style.display = "none";
        });

        updateButton.addEventListener("click", async () => {
            if (!orderId) return;
            const selectedStatus = statusSelect.value;
            try {
                const response = await fetch(`${aappii}/orders/payment/${orderId}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ payment: selectedStatus }),
                });
                if (response.ok) {
                    Swal.fire({
                        title: "Success!",
                        text: "Status updated successfully",
                        icon: "success",
                        confirmButtonText: "OK"
                    });
                    modal.style.display = "none";
                    location.reload();
                } else {
                    Swal.fire({
                        title: "Error!",
                        text: "Failed to update status",
                        icon: "error",
                        confirmButtonText: "OK"
                    });
                }
            } catch (error) {
                Swal.fire({
                    title: "Error!",
                    text: "An error occured",
                    icon: "error",
                    confirmButtonText: "OK"
                });
            }
        });
    }
});

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