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

//GETTING ALL PRODUCTS
async function fetchProducts() {
    const res = await fetch(`${aappii}/products`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}` 
        }
    });
    const data = await res.json();
    allproducts = data;
    productlistsearching(allproducts) 
    renderProducts(data);
    attacheventlisteners()
}
fetchProducts();
function renderProducts(products) {
    const productlisttable = document.getElementById("product-list-table");
    productlisttable.innerHTML = "";
    if(products.length === 0) {
        productlisttable.innerHTML = "No products found";
    }
    products.forEach(product => {
        const prodrow  = document.createElement('tr');
        prodrow.innerHTML = `
        <td>
                <div class="form-check ms-1">
                    <input type="checkbox" class="form-check-input" id="customCheck2">
                    <label class="form-check-label" for="customCheck2">&nbsp;</label>
                </div>
        </td>
        <td>
                <div class="d-flex align-items-center gap-2">
                    <div class="rounded bg-light avatar-md d-flex align-items-center justify-content-center" style="overflow: hidden;">
                        <img src="${product.image}" alt="${product.name}" class="img-fluid"/>
                    </div>
                    <div>
                        <a href="#!" class="text-dark fw-medium fs-15" style="text-transform: capitalize;">${product.name}</a>
                        <p class="text-muted mb-0 mt-1 fs-13"><span>Sizes : </span>${product.sizes}</p>
                    </div>
                </div>

        </td>
        <td>${product.price}</td>
        <td>
                <p class="mb-1 text-muted"><span class="text-dark fw-medium">${product.stock}</span> Left</p>
        </td>
        <td style="text-transform: capitalize;">${product.brand}</td>
        <td> <span class="badge p-1 bg-light text-dark fs-12 me-1"><i class="bx bxs-star align-text-top fs-14 text-warning me-1"></i>${product.rating}</span>${product.reviews} Reviews</td>
        <td>
            <div class="form-check form-switch">
                <input class="form-check-input featured-toggle" type="checkbox" role="switch" data-id="${product._id}" ${product.featured === true ? "checked" : ""}>
            </div>
        </td>
        <td>
                <div class="d-flex gap-2">
                    <a href="#!" class="btn btn-light btn-sm edit-sizes" data-id="${product._id}"><iconify-icon icon="mdi:plus-box-outline" class="align-middle fs-18" id="add-size-icon"></iconify-icon></a>
                    <a href="#!" class="btn btn-soft-primary btn-sm product-list-price" data-id="${product._id}" curprice="${product.price}"><iconify-icon icon="mdi:cash-sync" class="align-middle fs-18"></iconify-icon></a>
                    <a href="#!" class="btn btn-soft-danger btn-sm product-list-delete" data-id="${product._id}" data-name="${product.name}" ><iconify-icon icon="solar:trash-bin-minimalistic-2-broken" class="align-middle fs-18"></iconify-icon></a>
                </div>
        </td>
        <td>
            <div class="form-check form-switch">
                <input class="form-check-input product-status" type="checkbox" role="switch" data-id="${product._id}" ${product.status === "active" ? "checked" : ""}>
            </div>
        </td>
        `;
        productlisttable.appendChild(prodrow);
    })
}

function productlistsearching(allproducts){
    document.getElementById('product-list-search').addEventListener('input', function () {
    const searchQuery = this.value.toLowerCase();
    const products = allproducts.filter(product => 
        product.name.toLowerCase().includes(searchQuery)
    );
    renderProducts(products);
    });
}

//DELETING A PRODUCT
function attacheventlisteners(){
    const productdeletes = document.querySelectorAll('.product-list-delete');
    productdeletes.forEach(button => {
        button.addEventListener('click', async function () {
            const productId = this.getAttribute('data-id');
            const productName = this.getAttribute('data-name');

            const result = await Swal.fire({
                title: `Delete ${productName}?`,
                text: "This action cannot be undone!",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#d33",
                cancelButtonColor: "#3085d6",
                confirmButtonText: "Yes, delete it!"
            });

            if (!result.isConfirmed) return;
            
            try {
                const res = await fetch(`${aappii}/products/${productId}`, {
                    method: 'DELETE',
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}` 
                    }
                });

                const data = await res.json();

                if (res.ok) {
                    Swal.fire({
                        title: "Success!",
                        text: "Product deleted successfully.",
                        icon: "success",
                        confirmButtonText: "OK"
                    });
                    
                    fetchProducts(); 
                } else {
                    Swal.fire({
                        title: "Error!",
                        text: data.message,
                        icon: "error",
                        confirmButtonText: "Try Again"
                    });
                    
                }
            } catch (error) {
                Swal.fire({
                    title: "Error!",
                    text: "An error occured while creating the product.",
                    icon: "error",
                    confirmButtonText: "Try Again"
                });
                
            }
        });
    });

    const pricechanges = document.querySelectorAll('.product-list-price');
    pricechanges.forEach(button=>{
        button.addEventListener('click',async function (){
            const currentPrice = this.getAttribute('curprice')
            const productId = this.getAttribute('data-id')
            const result = await Swal.fire({
                title: "Enter the new price",
                input: "number",
                inputPlaceholder: "Type the new price here",
                inputValue: currentPrice,
                showCancelButton: true,
                confirmButtonText: "Submit",
                cancelButtonText: "Cancel",
                inputValidator: (value) => {
                    if (!value || isNaN(value) || value <= 0) {
                        return "Please enter a valid price";
                    }
                }
            });
        
            if (!result.isConfirmed) return;
        
            const newPrice = result.value;
        
            try {
                const res = await fetch(`${aappii}/products/${productId}`, {
                    method: 'PUT',
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({ price: newPrice })
                });
        
                const data = await res.json();
        
                if (res.ok) {
                    Swal.fire({
                        title: "Success!",
                        text: "Price updated successfully.",
                        icon: "success",
                        confirmButtonText: "OK"
                    });
        
                    fetchProducts();
                } else {
                    Swal.fire({
                        title: "Error!",
                        text: data.message,
                        icon: "error",
                        confirmButtonText: "Try Again"
                    });
                }
            } catch (error) {
                Swal.fire({
                    title: "Error!",
                    text: "An error occurred while updating.",
                    icon: "error",
                    confirmButtonText: "Try Again"
                });
            }
        })
    })

    const sizeedits = document.querySelectorAll('.edit-sizes');
    sizeedits.forEach(button => {
        button.addEventListener('click', async function (event) {
            event.preventDefault();
            const productId = this.getAttribute('data-id');
            try {
                const result = await Swal.fire({
                    title: "Enter 'add' to add a size or 'remove' to remove a size",
                    input: "text",
                    inputPlaceholder: "Type 'add' or 'remove' here",
                    showCancelButton: true,
                    confirmButtonText: "Submit",
                    cancelButtonText: "Cancel",
                    inputValidator: (value) => {
                        if (!value || (value !== "add" && value !== "remove")) {
                            return "Please enter either 'add' or 'remove'";  // Validate if input is not 'add' or 'remove'
                        }
                    }
                });
        
                if (result.isConfirmed) {
                    const action = result.value;
        
                    if (!action || (action !== "add" && action !== "remove")) {
                        Swal.fire({
                            title: "Information",
                            text: "Invalid action. Please enter 'add' or 'remove'.",
                            icon: "info",
                            confirmButtonText: "Got it!"
                        });
                        return;
                    }
        
                    let size = await Swal.fire({
                        title: `Enter the size to ${action}:`,
                        input: "text",
                        inputPlaceholder: "Type the size here",
                        showCancelButton: true,
                        confirmButtonText: "Submit",
                        cancelButtonText: "Cancel",
                    });
        
                    if (!size.value) {
                        Swal.fire({
                            title: "Information",
                            text: "Size cannot be empty",
                            icon: "info",
                            confirmButtonText: "Got it!"
                        });
                        return;
                    }
        
                    const res = await fetch(`${aappii}/products/${productId}`, {
                        method: 'PUT',
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${token}`
                        },
                        body: JSON.stringify({ action, size: size.value })
                    });
        
                    const data = await res.json();
        
                    if (res.ok) {
                        Swal.fire({
                            title: "Success!",
                            text: `Size ${action === "add" ? "added" : "removed"} successfully!`,
                            icon: "success",
                            confirmButtonText: "OK"
                        });
        
                        fetchProducts();
                    } else {
                        Swal.fire({
                            title: "Error!",
                            text: data.message,
                            icon: "error",
                            confirmButtonText: "Try Again"
                        });
                    }
                }
            } catch (error) {
                console.error("Error updating sizes:", error);
                Swal.fire({
                    title: "Error!",
                    text: "An error occurred.",
                    icon: "error",
                    confirmButtonText: "Try Again"
                });
            }
        })
    });

    document.querySelectorAll('.product-status').forEach(switchElement => {
        switchElement.addEventListener('change', async function () {
            const productId = this.getAttribute('data-id');
            const newStatus = this.checked ? "active" : "inactive"; // Toggle status
    
            try {
                const res = await fetch(`${aappii}/products/${productId}`, {
                    method: 'PUT',
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({ status: newStatus }) // ✅ Send updated status
                });
    
                const data = await res.json();
    
                if (res.ok) {
                    Swal.fire({
                        title: "Success!",
                        text: `Product status updated to: ${newStatus}`,
                        icon: "success",
                        confirmButtonText: "OK"
                    });
                    
                } else {
                    Swal.fire({
                        title: "Error!",
                        text: `Error: ${data.message}`,
                        icon: "error",
                        confirmButtonText: "Try Again"
                    });                    
                }
            } catch (error) {
                Swal.fire({
                    title: "Error!",
                    text: error.message,
                    icon: "error",
                    confirmButtonText: "Try Again"
                });
                
            }
        });
    });  
    
    document.querySelectorAll('.featured-toggle').forEach(switchElement => {
        switchElement.addEventListener('change', async function () {
            const productId = this.getAttribute('data-id');
            const newStatus = this.checked ? true : false;
    
            try {
                const res = await fetch(`${aappii}/products/${productId}`, {
                    method: 'PUT',
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({ featured: newStatus })
                });
    
                const data = await res.json();
    
                if (res.ok) {
                    Swal.fire({
                        title: "Success!",
                        text: `Product's featured status updated to: ${newStatus ? "Featured": "Not featured"}`,
                        icon: "success",
                        confirmButtonText: "OK"
                    });
                    
                } else {
                    Swal.fire({
                        title: "Error!",
                        text: data.message,
                        icon: "error",
                        confirmButtonText: "Try Again"
                    });
                    
                }
            } catch (error) {
                Swal.fire({
                    title: "Error!",
                    text: error.message,
                    icon: "error",
                    confirmButtonText: "Try Again"
                });                
            }
        });
    });
}

//kjk
document.addEventListener("click", function (event) {
    if (event.target.matches("iconify-icon")) {
        const productId = event.target.getAttribute("data-id"); // Get the ID from data-id attribute
        
        if (productId) {
            navigator.clipboard.writeText(productId)
                .then(() => {
                    Swal.fire({
                        title: "Information",
                        text: "Product Identified",
                        icon: "info",
                        confirmButtonText: "Ok"
                    });
                    
                })
                .catch(err => {
                    Swal.fire({
                        title: "Error!",
                        text: "Failed to copy Id.",
                        icon: "error",
                        confirmButtonText: "Try Again"
                    });
                });
        }
    }
})


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