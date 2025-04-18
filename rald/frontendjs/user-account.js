const aappii = "/api/raldfurniture";

document.getElementById("user-account-create").addEventListener("click",async(e)=>{
    e.preventDefault();
    const userData = {
        name : document.getElementById("user-name").value.trim(),
        phone : document.getElementById("user-phone").value.trim(),
        email : document.getElementById("user-email").value.trim(),
        password : document.getElementById("user-password").value.trim(),
        housenumber : document.getElementById("user-house").value.trim(),
        plotnumber : document.getElementById("user-plot").value.trim(),
        street : document.getElementById("user-street").value.trim(),
        landmark : document.getElementById("user-landmark").value.trim(),
        county : document.getElementById("user-county").value.trim(),
        country : document.getElementById("user-country").value.trim()
    }
    for (const key in userData) {
        if (!userData[key]) {
            Swal.fire({
                title: "Information",
                text: `Please fill in all fields. Missing: ${key}`,
                icon: "info",
                confirmButtonText: "Got it!"
            });
            return;
        }
    }
    try {
        const response = await fetch(`${aappii}/users/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(userData),
        });
        const result = await response.json();
        if (response.ok) {
            Swal.fire({
                title: "Success!",
                text: "Account created successfully!",
                icon: "success",
                confirmButtonText: "OK"
            });
            localStorage.setItem("rfurniturelogged", true);
            location.reload();
        } else {
            Swal.fire({
                title: "Error!",
                text: result.message,
                icon: "error",
                confirmButtonText: "Try Again"
            });            
        }
    } catch (error) {
        console.error(error.message)
    }
})


document.getElementById("user-account-login").addEventListener("click",async(e)=>{
    e.preventDefault();
    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-passwd").value.trim();
    if (!email || !password) {
        Swal.fire({
            title: "Missing Fields!",
            text: "Please fill in both email and password fields.",
            icon: "warning",
            confirmButtonText: "OK"
        });
        return;
    }
    await logUserIn(email, password);
})
async function logUserIn(email, password) {
    try {
        const response = await fetch(`${aappii}/users/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
        });
        const result = await response.json();
        if (response.ok) {
            Swal.fire({
                title: "Success",
                text: "Login successful: ",
                icon: "success",
                confirmButtonText: "OK"
            });
            localStorage.setItem("token", result.token);
            redirectUserBasedOnRole(result.token);
        } else {
            Swal.fire({
                title: "Login Failed",
                text: "Login failed: " + result.message,
                icon: "error",
                confirmButtonText: "OK"
            });            
        }
    } catch (error) {
        console.error(error.message)
    }
}

function redirectUserBasedOnRole(token) {
    try {
        const decodedToken = JSON.parse(atob(token.split(".")[1]));
        const userRole = decodedToken.role;
        if (userRole === "admin") {
            window.location.href = "rald/index.html";
        } else if (userRole === "delivery") {
            window.location.href = "delivery/orders-list.html";
        } else if (userRole === "customer") {
            window.location.href = "index.html";
        }
    } catch (error) {
        console.error(error.message)
        localStorage.removeItem("token");
    }
}

document.addEventListener('DOMContentLoaded', () => {
        if (localStorage.getItem("rfurniturelogged")) {
            document.getElementById("first-signup-form").style.display = "none";
        }
        else{
            document.getElementById("login-account").style.display = "none";
            document.getElementById("first-signup-form").style.display = "block";
        }
    }
)


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

//reset paasword
document.querySelector(".user-set-password").addEventListener("click", async (e) => {
    e.preventDefault();
    const email = document.getElementById("login-email").value.trim();
    const result = await Swal.fire({
        title: "Enter your new password",
        input: "password",
        inputPlaceholder: "New password",
        showCancelButton: true,
        confirmButtonText: "Submit",
        cancelButtonText: "Cancel",
        inputValidator: (value) => {
            if (!value) {
                return "Please enter a password";
            }
        }
    });
    if (!result.isConfirmed || !result.value) {
        return Swal.fire({
            title: "Information",
            text: "You stopped the reset.",
            icon: "info",
            confirmButtonText: "Got it!"
        });
    }
    const newPassword = result.value;
    if (!email) {
        return Swal.fire({
            title: "Information",
            text: "Email is required",
            icon: "info",
            confirmButtonText: "Got it!"
        });
    }
    try {
        const userResponse = await fetch(`${aappii}/users/email/${email}`);
        const user = await userResponse.json();
        if (!user || !user._id) {
            throw new Error("User not found");
        }
        const userId = user._id;
        const updateResponse = await fetch(`${aappii}/users/${userId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ password: newPassword }),
        });
        const updateData = await updateResponse.json();
        if (!updateResponse.ok) throw new Error("Password reset failed");
        Swal.fire({
            title: "Information",
            text: "Success! You can log in now.",
            icon: "info",
            confirmButtonText: "Ok!"
        });
    } catch (error) {
        console.error(error.message);
        Swal.fire({
            title: "Error",
            text: error.message || "Something went wrong!",
            icon: "error",
            confirmButtonText: "Try Again"
        });
    }
});


