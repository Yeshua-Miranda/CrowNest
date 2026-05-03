async function register(){
    event.preventDefault();
    let data = new FormData(event.target);

    try{
        const user = await fetch('/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(Object.fromEntries(data.entries()))
        })
        if (!user.ok) {
            alert(user.statusText);
            return;
        }
        sessionStorage.setItem('user', JSON.stringify(user));
        window.location.href = ENV.BACKEND_URL + 'home.html';
    } catch(err){
        console.error('Error en register:', err);
    }
}

const registerForm = document.getElementById("registerForm");
if (registerForm) registerForm.addEventListener("submit", register);

async function updateUser() {
    
}

async function deleteUser() { 
    event.preventDefault();
    const token = sessionStorage.getItem('token'); 
    let user = JSON.parse(sessionStorage.user);
    let route = '/users/' + user.id;

    try {
        const response = await fetch(route, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': sessionStorage.token
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            alert(errorData.msg || "Error al eliminar cuenta");
            return;
        }

        sessionStorage.clear();
        alert("Cuenta eliminada con éxito");
        window.location.href = ENV.BACKEND_URL;

    } catch (err) {
        console.error('Error en deleteUser:', err);
        alert("Ocurrió un error de red");
    }
}

async function initProfile() {
    console.log("Estas en perfil");
    let user = JSON.parse(sessionStorage.user);
    let username = document.getElementById('username');
    username.innerText = user.name;
    let emailText = document.getElementById('emailText');
    emailText.innerText = user.email;
}