const aappii = '/api/raldfurniture'
const token = localStorage.getItem("token")
let cart = JSON.parse(localStorage.getItem("cart")) || [];
//fill in all products

window.addEventListener('DOMContentLoaded',()=>{
    fetchAllProducts();
})

async function fetchAllProducts() {
    try {
        const response = await fetch(`${aappii}/products`);
        const products = await response.json();

        if (!products || products.length === 0) {
            displayProducts([], "No products available.");
        } else {
            displayProducts(products);
        }
    } catch (error) {
        console.error("Error fetching all products:", error);
        displayProducts([], "Failed to load products.");
    }
}

function displayProducts(products, emptyMessage = "No products found.") {
    const container = document.querySelector(".all-products-container");
    container.innerHTML = "";

    if (!products || products.length === 0) {
        container.innerHTML = `<p>${emptyMessage}</p>`;
        return;
    }

    products.forEach(product => {
        container.innerHTML += `
            <div class="col-xl-4 col-lg-6 col-md-6">
                <div class="furniture-seller__item">
                    <div class="fs-image">
                        <img src="${product.image}" alt="${product.name}">
                    </div>
                    <div class="fs-content">
                        <h5><a href="#!" class="text-capitalize">${product.name}</a></h5>
                        <span>ksh ${product.price}</span>
                        <button type="button" class="product-action-btn index-add-cart" data-id="${product.id}" data-price="${product.price}">
                            <svg width="20" height="22" viewBox="0 0 20 22" fill="none" xmlns="http://www.w3.org/2000/svg" style="width: 1.2rem; height: auto;">
                                <path d="M13.0768 10.1416C13.0768 11.9228 11.648 13.3666 9.88542 13.3666C8.1228 13.3666 6.69401 11.9228 6.69401 10.1416M1.375 5.84163H18.3958M1.375 5.84163V12.2916C1.375 19.1359 2.57494 20.3541 9.88542 20.3541C17.1959 20.3541 18.3958 19.1359 18.3958 12.2916V5.84163M1.375 5.84163L2.91454 2.73011C3.27495 2.00173 4.01165 1.54163 4.81754 1.54163H14.9533C15.7592 1.54163 16.4959 2.00173 16.8563 2.73011L18.3958 5.84163" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        `;
    });
}

document.querySelector(".products-search").addEventListener("input", async (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const response = await fetch(`${aappii}/products`);
    const products = await response.json();
    const filtered = products.filter(product =>
        product.name.trim().toLowerCase().includes(searchTerm)
    );
    displayProducts(filtered);
});

const holder = document.querySelector(".all-products-container")
holder.addEventListener("click", function (event) {
    if (event.target.classList.contains('index-add-cart')) {
        Swal.fire({
            title: "Information",
            text: "You",
            icon: "info",
            confirmButtonText: "Ok!"
        });
        if(!token){
            Swal.fire({
                title: "Information",
                text: "You must be logged in to shop",
                icon: "info",
                confirmButtonText: "Ok!"
            });
            
            event.preventDefault();
            return;
        }
        else if(token){
            const productId = event.target.getAttribute('data-id');
            const productPrice = event.target.getAttribute('data-price');
            event.preventDefault();
            addToCart(productId, productPrice);
        }
    }
})

function addToCart(productId, productPrice) {
    let positionthisproductincart = cart.findIndex(cart => cart.product_id === productId);
    if(cart.length <= 0){
        cart = [{
            product_id: productId,
            quantity: 1,
            price: productPrice
        }]
        Swal.fire({
            title: "Information",
            text: "Added to cart",
            icon: "info",
            confirmButtonText: "Ok"
        });
        
    }else if(positionthisproductincart < 0){
        cart.push({
            product_id: productId,
            quantity: 1,
            price: productPrice
        })
        Swal.fire({
            title: "Information",
            text: "Added to cart",
            icon: "info",
            confirmButtonText: "Ok"
        });
    }else{
        Swal.fire({
            title: "Information",
            text: "Already in cart",
            icon: "info",
            confirmButtonText: "Ok"
        });
    }
    localStorage.setItem("cart", JSON.stringify(cart));
}

document.querySelector(".account-log-out").addEventListener("click", () => {
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