async function login(){
    event.preventDefault();
    let data = new FormData(event.target);
    try{
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(Object.fromEntries(data.entries()))
        })
        if (!response.ok) {
            alert(response.statusText);
            return;
        }
        let user = response.user;
        sessionStorage.setItem('user', JSON.stringify(user));
        window.location.href = ENV.BACKEND_URL + 'home.html';
    } catch(err){
        console.error('Error en register:', err);
    }
}

const loginForm = document.getElementById("loginForm");
if (loginForm) loginForm.addEventListener("submit", login);