let selectedProfilePhoto = 1;
let selectedBannerPhoto = 1;

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

function selectPhoto(type, id) {
    if (type === 'profile') {
        selectedProfilePhoto = id;
        document.querySelectorAll('#profile-options img').forEach(img => img.classList.remove('border-primary', 'border-4'));
        document.getElementById(`p-opt-${id}`).classList.add('border-primary', 'border-4');
    } else {
        selectedBannerPhoto = id;
        document.querySelectorAll('#banner-options img').forEach(img => img.classList.remove('border-primary', 'border-4'));
        document.getElementById(`b-opt-${id}`).classList.add('border-primary', 'border-4');
    }
}

async function updateUserPhotos() {
    const token = sessionStorage.getItem('token');
    const user = JSON.parse(sessionStorage.user);
    const route = `/users/${user.id}`; 

    const bodyData = {
        profile_photo: selectedProfilePhoto,
        banner_photo: selectedBannerPhoto
    };

    try {
        const response = await fetch(route, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token 
            },
            body: JSON.stringify(bodyData)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.msg || "Error al actualizar fotos");
        }

        sessionStorage.setItem('user', JSON.stringify(result.user));
        
        alert("¡Apariencia actualizada!");
        
        const modal = bootstrap.Modal.getInstance(document.getElementById('modalUpdatePhotos'));
        modal.hide();
        
        if (typeof init === 'function') init(); 

    } catch (err) {
        console.error('Error:', err);
        alert(err.message);
    }
}

window.addEventListener('load', () => {
    const modal = document.getElementById('modalUpdatePhotos');
    if(modal){
        modal.addEventListener('show.bs.modal', () => {
        const user = JSON.parse(sessionStorage.user);
            selectPhoto('profile', user.profile_photo || 1);
            selectPhoto('banner', user.banner_photo || 1);
        });
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
    let user = JSON.parse(sessionStorage.user);
    let avatar = document.getElementById('avatar');
    const photoId = user.profile_photo || 1;
    avatar.src = `assets/profiles/${photoId}.jpg`;

    let banner = document.getElementById('banner');
    const bannerId = user.banner_photo || 1;
    banner.style.backgroundImage = `url('assets/banners/${bannerId}.jpg')`;

    let username = document.getElementById('username');
    username.innerText = user.nick_name?user.nick_name:user.name;
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