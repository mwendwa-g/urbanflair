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
        Swal.fire({
            title: "Error!",
            text: "Failed to decode token.",
            icon: "error",
            confirmButtonText: "Try Again"
        });
        
        return null;
    }
}


document.addEventListener("DOMContentLoaded", async function () {
    const parentCategorySelect = document.getElementById("parent-category");
    try {
        const response = await fetch(`${aappii}/categories/parents`);
        const categories = await response.json();
        if (categories.length === 0) {
            parentCategorySelect.innerHTML = `<option value="">No categories found</option>`;
            return;
        }
        let optionsHTML = `<option value="">Select Parent Category</option>`;
        for (const category of categories) {
            optionsHTML += `<option value="${category._id}">${category.name}</option>`;
        }
        parentCategorySelect.innerHTML = optionsHTML; 
    } catch (error) {
        //console.error("Error fetching categories:", error);
        parentCategorySelect.innerHTML = `<option value="">Error loading categories</option>`;
    }
});

const createCategory = document.getElementById('create-category')
createCategory.addEventListener("click", async function (e){
    e.preventDefault();
    const image = document.getElementById("category-image");
    const name = document.getElementById("category-name").value;
    const icon = document.getElementById("category-icon").value;
    const parentCategory = document.getElementById('parent-category');
    if(!name || !icon || image.files.length === 0){
        Swal.fire({
            title: "Missing!",
            text: "Please fill in name, icon and image.",
            icon: "warning",
            confirmButtonText: "OK"
        });
        return;
    }
    const formData = new FormData();
    formData.append("image", image.files[0]);
    formData.append("name", name);
    formData.append("icon", icon);
    formData.append("parentCategory", parentCategory.value);
    try {
        const response = await fetch(`${aappii}/categories`, {
            method: "POST",
            body: formData,
        });

        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.message || "Error creating category");
        }

        Swal.fire({
            title: "Success!",
            text: "Category created",
            icon: "success",
            confirmButtonText: "OK"
        }).then((result) => {
            if (result.isConfirmed) {
                window.location.reload();
            }
        });

    } catch (error) {
        console.log(error)
        Swal.fire({
            title: "Error!",
            text: "An error occurred.",
            icon: "error",
            confirmButtonText: "Try Again"
        });
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