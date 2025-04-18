const aappii = "/api/raldfurniture";
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


document.addEventListener('DOMContentLoaded', () => {
    fetchCategories()
    /*document.getElementById("add-size-btn").addEventListener("click", function(event) {
        event.preventDefault();
        const sizesDiv = document.getElementById("sizes-div");
        const sizeInput = document.createElement("input");
        sizeInput.type = "text";
        sizeInput.style.width = "50px";
        sizeInput.className = "form-control product-size";
        sizesDiv.appendChild(sizeInput);
    });*/
});

function fetchCategories() {
    fetch(`${aappii}/categories`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    })
    .then(res => res.json())
    .then(data => {
        fillCategories(data);
    })
    .catch(err => console.error("Error fetching categories: ", err));
}

function fillCategories(data) {
    const selectElement = document.getElementById("product-categories");
    if (!selectElement) {
        console.error("Category dropdown not found!");
        return;
    }
    selectElement.innerHTML = '';
    const placeholderOption = document.createElement("option");
    placeholderOption.value = "";
    placeholderOption.textContent = "Select a Category";
    placeholderOption.disabled = true;
    placeholderOption.selected = true;
    selectElement.appendChild(placeholderOption);
    if (!Array.isArray(data) || data.length === 0) {
        console.warn("No categories available.");
        return;
    }
    data.forEach(category => {
        const option = document.createElement("option");
        option.value = category._id;
        option.textContent = category.name;
        selectElement.appendChild(option);
    });
}

//PRODUCT CREATION 
async function submitProduct() {
    const formData = new FormData();
    let missingFields = [];

    const image = document.getElementById("main-product-image").files[0];
    const gallery = document.getElementById("product-gallery-images").files;
    for (let i = 0; i < gallery.length; i++) {
        formData.append("gallery", gallery[i]);
    }
    const description = document.getElementById("product-description").value;
    const name = document.getElementById("product-name").value;
    const price = document.getElementById("current-price").value;
    const originalprice = document.getElementById("original-price").value;
    //const color = document.getElementById("product-color").value;
    const stock = document.getElementById("product-stock").value;
    const featured = document.getElementById("featured-status").checked ? "true" : "false";
    const category = document.getElementById("product-categories").value;
    const brand = document.getElementById("product-brand").value;
    const reviews = document.getElementById("product-reviews").value;

    const sizes = document.querySelectorAll(".product-size")
    sizes.forEach(size => {
        if (size.value === "") {
            missingFields.push("Size");
        } else {
            formData.append("sizes[]", size.value);  // Append non-empty size values
        }
    });

    if (!image) missingFields.push("Image");
    if (!name) missingFields.push("Name");
    if (!price) missingFields.push("Price");
    if (!category) missingFields.push("Category");

    if (missingFields.length > 0) {
        Swal.fire({
            title: "Missing Fields",
            text: `Please fill in the following required fields: ${missingFields.join(", ")}`,
            icon: "warning",
            confirmButtonText: "OK"
        })
        
        return;
    }

    formData.append("image", image);
    formData.append("name", name);
    formData.append("description", description);
    formData.append("originalprice", originalprice);
    formData.append("price", price);
    //formData.append("color", color);
    formData.append("stock", stock);
    formData.append("featured", featured);
    formData.append("category", category);
    if(brand){
        formData.append("brand", brand);
    }
    //formData.append("sizes", JSON.stringify(selectedsizes));
    formData.append("reviews", reviews);

    const progressContainer = document.getElementById("progress-container");
    const progressBar = document.getElementById("progress-bar");
    const progressText = document.getElementById("progress-text");

    try {
        const response = await fetch(`${aappii}/products`, {
            method: "POST",
            headers: {
                'Authorization': `Bearer ${token}`, 
            },
            body: formData, 
        });
        const result = await response.json();
        if (response.ok) {
            progressBar.style.width = "100%";
            Swal.fire({
                title: "Success!",
                text: "Product created successfully.",
                icon: "success",
                confirmButtonText: "OK"
            }).then((result) => {
                if (result.isConfirmed) {
                    window.location.reload();
                }
            });
        } else {
            Swal.fire({
                title: "Failed!",
                text: result.message,
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
}


document.getElementById('product-create-add').addEventListener('click',(e)=>{
    e.preventDefault();
    submitProduct()
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