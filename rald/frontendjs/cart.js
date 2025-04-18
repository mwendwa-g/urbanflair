const aappii = "/api/raldfurniture"
const token = localStorage.getItem("token");
let cart = JSON.parse(localStorage.getItem("cart")) || [];

window.onload = () =>{
    getProducts()
    cartTotal()
}


function getProducts(){
    if (cart.length === 0) {
        //console.error("Cart is empty. Not sending request.");
    } else {
        fetch(`${aappii}/products/cart/items`, { 
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ cart })
        })
        .then(res => res.json())
        .then(products => {
            renderCart(products);
        })
        .catch(err => console.error(err));
    }
}

function renderCart(products) {
    const cartContainer = document.querySelector('.cart-items-container');
    cartContainer.innerHTML = ""
    products.forEach(item => {
        const cartItem = cart.find(cartItem => cartItem.product_id === item._id);
        const quantity = cartItem ? cartItem.quantity : 1;
        cartContainer.innerHTML += `
        <tr class="cart-item" data-id="${item._id}" data-price="${item.price}">
            <td class="product-thumbnail"><a href="product-details.html"><img
                    src="${item.image}" alt="${item.name}"></a></td>
            <td class="product-name"><a href="#!">${item.name}</a></td>
            <td class="product-price"><span class="amount">ksh ${item.price}</span></td>
            <td class="product-quantity text-center">
                <div class="product-quantity mt-10 mb-10">
                <div class="product-quantity-form">
                    <form action="#">
                        <button class="cart-minus" type="button"><i class="far fa-minus"></i></button>
                        <input class="cart-input" type="text" value="${quantity}">
                        <button class="cart-plus" type="button"><i class="far fa-plus"></i></button>
                    </form>
                </div>
                </div>
            </td>
            <td class="product-subtotal"><span class="amount">ksh ${item.price * quantity}</span></td>
            <td class="product-remove"><a href="#!"><i class="fa fa-times"></i></a></td>
        </tr>
        `;
    })
    addCartEventListeners();
}

function addCartEventListeners() {
    document.querySelectorAll(".cart-item").forEach(item => {
        const productId = item.getAttribute("data-id");
        const pricePerUnit = parseFloat(item.getAttribute("data-price")); 
        const quantityElement = item.querySelector(".cart-input");
        const priceElement = item.querySelector(".product-subtotal");
        const minusButton = item.querySelector(".cart-minus");
        const plusButton = item.querySelector(".cart-plus");
        const removeButton = item.querySelector(".product-remove a");

        const cartItem = cart.find(cartItem => cartItem.product_id === productId);
        let quantity = cartItem ? cartItem.quantity : 1;

        quantityElement.addEventListener("input", function () {
            let quantity = parseInt(this.value, 10); 
            if (isNaN(quantity) || quantity < 1) {
                this.quantity = 1;
            }
            priceElement.textContent =  `ksh ${(pricePerUnit * quantity).toFixed(0)}`;
            updateCartQuantity(productId, quantity)
            cartTotal()
        });

        minusButton.addEventListener("click", () => {
            if (quantity > 1) {
                quantity--;
                quantityElement.value = quantity;
                priceElement.textContent =  `ksh ${(pricePerUnit * quantity).toFixed(0)}`;
                updateCartQuantity(productId, quantity);
                cartTotal()
            }
        });

        plusButton.addEventListener("click", () => {
            quantity++;
            quantityElement.value = quantity;
            priceElement.textContent = `ksh ${(pricePerUnit * quantity).toFixed(0)}`;
            updateCartQuantity(productId, quantity);
            cartTotal()
        });

        removeButton.addEventListener("click", (e)=>{
            e.preventDefault()
            removeCartItem(productId);
        })
    });
}

function updateCartQuantity(productId, quantity) {
    const item = cart.find(item => item.product_id === productId);
    if (item) {
        item.quantity = parseInt(quantity, 10); 
        localStorage.setItem("cart", JSON.stringify(cart));
    } else {
        console.warn(`Product not found in cart.`);
    }
}

function removeCartItem(productId) {
    cart = cart.filter(item => item.product_id !== productId);
    localStorage.setItem("cart", JSON.stringify(cart));
    location.reload()
}

function cartTotal() {
    const cart = JSON.parse(localStorage.getItem("cart")) || []; 
    let total = 0;
    cart.forEach(item => {
        total += item.price * item.quantity;
    });
    document.querySelector(".cart-cart-totals").textContent = `ksh ${total.toFixed(2)}`;
    //return total;
}


const checkout = document.querySelector(".cart-proceed-checkout");
checkout.addEventListener("click",(e)=>{
    e.preventDefault()
    handleCheckout()
});
async function handleCheckout () {
    if (!token) {
        Swal.fire({
            title: "Information",
            text: "You must be logged in!",
            icon: "info",
            confirmButtonText: "Got it!"
        });
        
        return;
    }
    const userId = getUserIdFromToken(token);
    if (!userId) {
        Swal.fire({
            title: "Information",
            text: 'Invalid session. Please log in again.',
            icon: "info",
            confirmButtonText: "Got it!"
        });
        return;
    }
    const cartItems = JSON.parse(localStorage.getItem('cart')) || [];
    if (cartItems.length === 0) {
        Swal.fire({
            title: "Information",
            text: "Your cart is empty",
            icon: "info",
            confirmButtonText: "Got it!"
        });
        
        return;
    }
    const productDetails = await Promise.all(cartItems.map(async (item) => {
        const response = await fetch(`${aappii}/products/${item.product_id}`);
        if (!response.ok) throw new Error(`Error fetching product: ${item.product_id}`);
        const product = await response.json();
        return {
            ...item,
            price: Number(product.price) || 0
        };
    }));
    const totalPrice = productDetails.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const result = await Swal.fire({
        title: `Confirm Order`,
        text: `Your total is Ksh ${totalPrice.toFixed(0)}. Do you want to proceed?`,
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Yes",
        cancelButtonText: "Cancel",
        confirmButtonColor: "#28a745",
        cancelButtonColor: "#d33"
    });
    if (!result.isConfirmed) return;

    const orderData = {
        user: userId,
        orderItems: cartItems.map(item => ({
            product: item.product_id, 
            quantity: item.quantity
        }))
    };

    try {
        const response = await fetch(`${aappii}/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify(orderData)
        });

        if (!response.ok) throw new Error('Failed to place order. Try again or contact support.');
        const order = await response.json();
        await Swal.fire({
            title: "Information",
            text: "Your order is placed",
            icon: "info",
            confirmButtonText: "Ok"
        });
        
        localStorage.removeItem('cart');
        window.location.reload();
    } catch (error) {
        Swal.fire({
            title: "Error!",
            text: error.message,
            icon: "error",
            confirmButtonText: "Try Again"
        });
        
    }
};

const getUserIdFromToken = (token) => {
    if (!token) return null;
    try {
        const payload = JSON.parse(atob(token.split('.')[1])); 
        return payload.userId; 
    } catch (error) {
        console.error('Invalid token:', error);
        return null;
    }
};


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