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
        Swal.fire({
            title: "Error!",
            text: "An error occured.",
            icon: "error",
            confirmButtonText: "Try Again"
        });
        return null;
    }
}

//GETTING NUMBER OF ALL THE CUSTOMERS
const totalclients = document.getElementById('customer-list-all-customers');
fetch(`${aappii}/users/get/count`, {
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
.catch(err => Swal.fire({
    title: "Error!",
    text: "An error occured.",
    icon: "error",
    confirmButtonText: "Try Again"
}))

//GETTING THE TOTAL ORDERS MADE
const totalorders = document.getElementById('customer-list-orders');
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
})
.catch(err => console.error("Error fetching Orders: ", err))

//GETTING TOTAL SALES
const totasales = document.getElementById('customer-list-invoice');
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

//A LIST OF ALL CUSTOMERS
const customerlist = document.getElementById('customoer-list-holder');
fetch(`${aappii}/users`, {
    method: 'GET',
    headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    }
})
.then(res => res.json())
.then(data => {
    customerlist.innerHTML = ""
    data.forEach(user => {
        const customer = document.createElement('tr');
        customer.innerHTML = `
        <td>
            <div class="form-check">
                    <input type="checkbox" class="form-check-input" id="customCheck2">
                    <label class="form-check-label" for="customCheck2">&nbsp;</label>
            </div>
        </td>
        <td>${user.name}</td>
        <td><a href="javascript: void(0);" class="text-body">${user.email}</a> </td>
        <td>${user.phone}</td>
        <td> <span class="badge bg-success-subtle text-success py-1 px-2">${user.role}</span> </td>
        <td>ksh ${user.totalSpent}</td>
        <td>${user.plotnumber}</td>
        <td>${user.street}</td>
        <td>
            <div class="d-flex gap-2">
                    <a href="#!" class="btn btn-soft-primary btn-sm update-status" data-id="${user._id}"><iconify-icon icon="solar:pen-2-broken" class="align-middle fs-18"></iconify-icon></a>
                    <a href="#!" class="btn btn-soft-danger btn-sm"><iconify-icon icon="solar:trash-bin-minimalistic-2-broken" onclick="deleteUser('${user._id}', '${user.name}')" class="align-middle fs-18"></iconify-icon></a>
            </div>
        </td>
        `;
        customerlist.appendChild(customer);
    })
})
.catch(err => console.error("Error fetching categories: ", err))

//DELETING A USER
async function deleteUser(userId, userName) {
    if (!confirm(`Are you sure you want to delete ${userName}?`)) {
        return; 
    }
    try {
        const response = await fetch(`${aappii}/users/${userId}`, { 
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (response.ok) {
            Swal.fire({
                title: "Success!",
                text: data.message,
                icon: "success",
                confirmButtonText: "OK"
            });
            location.reload(); 
        } else {
            Swal.fire({
                title: "Error!",
                text: data.message,
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
}

//role status
document.getElementById("customoer-list-holder").addEventListener("click", function (event) {
    if (event.target.closest(".update-status")) {
        event.preventDefault();
        const userId = event.target.closest(".update-status").getAttribute("data-id");

        const modal = document.getElementById("roleStatusModal");
        const closeModal = document.querySelector(".close");
        const statusSelect = document.getElementById("roleStatus");
        const updateButton = document.getElementById("updateRoleStatus");

        modal.style.display = "block";
        closeModal.addEventListener("click", () => {
            modal.style.display = "none";
        });
        updateButton.addEventListener("click", async () => {
            if (!userId) {
                Swal.fire({
                    title: "Warning!",
                    text: "User not found",
                    icon: "warning",
                    confirmButtonText: "OK"
                });
                return;
            };
            const selectedStatus = statusSelect.value;
            try {
                const response = await fetch(`${aappii}/users/role/${userId}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ role: selectedStatus }),
                });
                if (response.ok) {
                    Swal.fire({
                        title: "Success!",
                        text: "Order  status updated",
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
                console.error("Error updating order status:", error);
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