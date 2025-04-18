const aappii = "/api/raldfurniture";
const token = localStorage.getItem("token");

window.onload = function() {
    //checkUserRole();
    fetchCategories();
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

let allcategories = [];
function fetchCategories() {
    fetch(`${aappii}/categories`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json' 
        }
    })
    .then(res => res.json())
    .then(data => {
        allcategories = data;
        tableCategories(data);
    })
    .catch(err => Swal.fire({
        title: "Error!",
        text: err.message,
        icon: "error",
        confirmButtonText: "Try Again"
    })
    )
}

//show categories
function tableCategories(categories){
    const tablebodydetails = document.getElementById('table-categories-details');
    tablebodydetails.innerHTML = "";
    if(categories.length === 0) {
        tablebodydetails.innerHTML = "No categories at the moment"
    }
    categories.forEach(category=>{
        const tablerow = document.createElement('tr');
        tablerow.innerHTML = `
            <td>
                <div class="form-check">
                    <input type="checkbox" class="form-check-input" id="customCheck2">
                    <label class="form-check-label" for="customCheck2"></label>
                </div>
            </td>
            <td>
                <div class="d-flex align-items-center gap-2">
                    <div class="rounded bg-light avatar-md d-flex align-items-center justify-content-center" style="overflow: hidden;">
                        <img src="${category.image}" alt="${category.name}" style="width: 100%;">
                    </div>
                    <p class="text-dark fw-medium fs-15 mb-0" style="text-transform: capitalize;">${category.name}</p>
                </div>
            </td>
            <td>Admin</td>
            <td>${category._id}</td>
            <td>${category.productCount}</td>
            <td>
                <div class="d-flex gap-2">
                    <!--<a href="#!" class="btn btn-light btn-sm"><iconify-icon icon="solar:eye-broken" class="align-middle fs-18"></iconify-icon></a>-->
                    <a href="#!" class="btn btn-soft-primary btn-sm edit-name" data-id="${category._id}" data-name="${category.name}"><iconify-icon icon="solar:pen-2-broken" class="align-middle fs-18"></iconify-icon></a>
                    <a href="#!" class="btn btn-soft-danger btn-sm delete-caetegory-list-html" data-id="${category._id}" data-name="${category.name}"><iconify-icon icon="solar:trash-bin-minimalistic-2-broken" class="align-middle fs-18"></iconify-icon></a>
                </div>
            </td>
        `;
        tablebodydetails.appendChild(tablerow);
    })
}

//delete category
document.addEventListener("DOMContentLoaded", function () {
    document.body.addEventListener("click", function (event) {
        if (event.target.closest(".delete-caetegory-list-html")) {
            const button = event.target.closest(".delete-caetegory-list-html");
            const categoryId = button.getAttribute("data-id");
            const categoryName = button.getAttribute("data-name");
            Swal.fire({
                title: `${categoryName} will be deleted with its products.`,
                text: "Want to proceed?",
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Yes, delete it!",
                cancelButtonText: "No, cancel",
            }).then((result) => {
                if (result.isConfirmed) {
                    deleteCategory(categoryId); 
                }
            });            
        }
    });

    function deleteCategory(categoryId) {
        fetch(`${aappii}/categories/${categoryId}`, {
            method: "DELETE",
            headers: {
                'Authorization': `Bearer ${token}`, 
                'Content-Type': 'application/json' 
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                Swal.fire({
                    title: "Success!",
                    text: "Category deleted",
                    icon: "success",
                    confirmButtonText: "OK"
                });                
                location.reload();
            } else {
                Swal.fire({
                    title: "Failed!",
                    text: error.message,
                    icon: "error",
                    confirmButtonText: "OK"
                });
            }
        })
        .catch(error => Swal.fire({
            title: "Error!",
            text: "An error occured.",
            icon: "error",
            confirmButtonText: "Try Again"
        })
        );
    }
});

//EDITING THE NAME OF A CATEGORY
document.addEventListener("DOMContentLoaded", function () {
    document.body.addEventListener("click", function (event) {
        if (event.target.closest(".edit-name")) {
            const button = event.target.closest(".edit-name");
            const categoryId = button.getAttribute("data-id");
            const currentName = button.getAttribute("data-name");

            Swal.fire({
                title: "Enter new category name",
                input: "text",
                inputPlaceholder: "Type the new category name here",
                inputValue: currentName,
                showCancelButton: true,
                confirmButtonText: "Submit",
                cancelButtonText: "Cancel",
                inputValidator: (value) => {
                    if (!value) {
                        return "Please enter a category name";
                    }
                }
            }).then((result) => {
                if (result.isConfirmed) {
                    const cleanedName = String(result.value).trim();
                    if (cleanedName && cleanedName !== currentName) {
                        updateCategoryName(categoryId, cleanedName);
                    }
                }
            });
        }
    });

    function updateCategoryName(categoryId, newName) {
        fetch(`${aappii}/categories/${categoryId}`, {
            method: "PUT",
            headers: {
                'Authorization': `Bearer ${token}`, 
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify({ name: newName })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                window.location.reload()
            }
        })
        .catch(error => Swal.fire({
            title: "Error!",
            text: error.message,
            icon: "error",
            confirmButtonText: "Try Again"
        }));
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