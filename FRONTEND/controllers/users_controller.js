function register(){
    event.preventDefault();
    console.log("Se llamo a la funcion del register")
    let data = new FormData(event.target);

    fetch('/users', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(Object.fromEntries(data.entries()))
    })
    .then(response => {
        if (!response.ok) alert(response.statusText);
        return response.json();
    })
    .then(user => {
        sessionStorage.setItem('user', JSON.stringify(user));
        window.location.href = local_url + 'home.html';
    })
    .catch(err => {
        console.error('Error en register:', err);
    });
}

const registerForm = document.getElementById("registerForm");
if (registerForm) registerForm.addEventListener("submit", register);