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
            const errorData = await response.json(); 
            alert(errorData.msg || "Error en el login");
            return;
        }
        
        const resData = await response.json(); 
        sessionStorage.setItem('user', JSON.stringify(resData.user));
        sessionStorage.setItem('token', resData.token);
        window.location.href = ENV.BACKEND_URL + 'home.html';
    } catch(err){
        console.error('Error en register:', err);
    }
}

const loginForm = document.getElementById("loginForm");
if (loginForm) loginForm.addEventListener("submit", login);

function logout(){
    sessionStorage.clear();
    window.location.href = ENV.BACKEND_URL;
}

async function init() {
    const currentUrl = window.location.href;
    if(currentUrl === ENV.BACKEND_URL + 'profile.html'){
        await initProfile();
    }
}

window.addEventListener('load', () => {
    init();
});