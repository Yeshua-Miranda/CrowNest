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
        toggleForms();
    } catch(err){
        console.error('Error en register:', err);
    }
}

const registerForm = document.getElementById("registerForm");
if (registerForm) registerForm.addEventListener("submit", register);

function populateModal(){
    document.getElementById('name_field').value = JSON.parse(sessionStorage.user).name;
    document.getElementById('email_field').value = JSON.parse(sessionStorage.user).email;
    document.getElementById('password_field').value = JSON.parse(sessionStorage.user).password;
    document.getElementById('privacity').checked = JSON.parse(sessionStorage.user).public;
}


window.addEventListener('load', () => {
    const modalEdit = document.getElementById('modalUpdateUser');
    if (modalEdit) modalEdit.addEventListener('show.bs.modal', populateModal);
});

async function updateUser(event) {
    event.preventDefault();
    
    const token = sessionStorage.getItem('token'); 
    let user = JSON.parse(sessionStorage.user);
    let route = '/users/' + user.id;

    const form = document.getElementById('formEdit');
    const formData = new FormData(form);
    const bodyData = Object.fromEntries(formData.entries());

    bodyData.public = document.getElementById('privacity').checked;

    try {
        const response = await fetch(route, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token
            },
            body: JSON.stringify(bodyData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            alert(errorData.msg || "Error al editar cuenta");
            return;
        }

        const result = await response.json();
        sessionStorage.setItem('user', JSON.stringify(result.user));
        alert("Perfil actualizado con éxito");
        init(); 

    } catch (err) {
        console.error('Error en updateUser:', err);
        alert("Ocurrió un error de red");
    }
}

window.addEventListener('load', () => {
    const formEdit = document.getElementById("formEdit");
    if (formEdit) {
        formEdit.addEventListener("submit", updateUser);
    }
});

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
    let kind_profile = document.getElementById('kind-profile');
    if(user.public){
        kind_profile.innerText = "Publico";
        let lock1 = document.getElementById('lock-open');
        let lock2 = document.getElementById('lock-block');
        lock1.style.display = 'inline';
        lock2.style.display = 'none';
    } else {
        kind_profile.innerText = "Privado";   
        let lock1 = document.getElementById('lock-block');
        let lock2 = document.getElementById('lock-open');
        lock1.style.display = 'inline';
        lock2.style.display = 'none';
    }
}