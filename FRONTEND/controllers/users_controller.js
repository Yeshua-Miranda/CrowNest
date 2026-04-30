async function register(){
    event.preventDefault();
    console.log("Se llamo a la funcion register del frontend")
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
            alert(user.statusText + "aqui ando");
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