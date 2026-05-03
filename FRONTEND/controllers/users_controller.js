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

async function initProfile() {
    console.log("Estas en perfil");
    let user = JSON.parse(sessionStorage.user);
    let username = document.getElementById('username');
    username.innerText = user.name;
    let emailText = document.getElementById('emailText');
    emailText.innerText = user.email;
}