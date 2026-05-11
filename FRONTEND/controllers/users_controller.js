const USERS_IMG_URL = ENV.TMDB_IMG_URL; //USERS CONTROLLER
let selectedProfilePhoto = 1;
let selectedBannerPhoto = 1;

async function register(){
    event.preventDefault();
    let data = new FormData(event.target);

    try{
        const response = await fetch('/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(Object.fromEntries(data.entries()))
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            alert(errorData.msg || response.statusText);
            return;
        }
        
        const resData = await response.json(); 
        
        if (resData.token && resData.user) {
          
            sessionStorage.setItem('user', JSON.stringify(resData.user));
            sessionStorage.setItem('token', resData.token);
            
           
            window.location.href = ENV.BACKEND_URL + 'home.html';
        } else {
            alert("Cuenta creada con éxito. Por favor inicia sesión.");
            toggleForms();
        }

    } catch(err){
        console.error('Error en register:', err);
    }
}

const registerForm = document.getElementById("registerForm");
if (registerForm) registerForm.addEventListener("submit", register);

function populateModal(){
    document.getElementById('name_field').value = JSON.parse(sessionStorage.user).name;
    document.getElementById('email_field').value = JSON.parse(sessionStorage.user).email;
    //document.getElementById('password_field').value = JSON.parse(sessionStorage.user).password;
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

    if (!bodyData.password || bodyData.password.trim() === "") {
        delete bodyData.password;
    }

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
        initProfile(); 

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

        const navAvatar = document.getElementById("navAvatar");
        if (navAvatar && result.user.profile_photo) { 
            navAvatar.src = `../assets/profiles/${result.user.profile_photo}.jpg`;
        }
        
        alert("¡Apariencia actualizada!");
        
        const modal = bootstrap.Modal.getInstance(document.getElementById('modalUpdatePhotos'));
        modal.hide();
        
        initProfile();

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
    let route = '/users/' + user._id;

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

async function friendRecom(type){
    const token = sessionStorage.getItem('token'); 
    let user = JSON.parse(sessionStorage.user);
    let route = '/users/'+ type +'/' + user._id +"?page=1&limit=7";

    try {
        const response = await fetch(route, {
            method: 'GET',
            headers: {
                'Authorization': token
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            alert(errorData.msg || "Error al obterner usuarios");
            return;
        }
        const json = await response.json();
        return json.data;

    } catch (err) {
        console.error('Error en getUsers:', err);
        alert("Ocurrió un error de red");
    }
}

async function populeteFriends() {
    console.log("Populating friends and recommendations...");
    let user = JSON.parse(sessionStorage.user);
    let recom = await friendRecom(1);

    for(const r of recom){
        friendPerfil(r,true,false,"container-suggestions");
    }

    let friends = await friendRecom(2);

    for(const f of friends){
        friendPerfil(f,false,false,"container-friends");
    }

    let request = await friendRecom(3);

    for(const r of request){
        friendPerfil(r,false,true,"container-requests");
    }

}

async function getPerfil(userId){
    const targetUrl = `profile.html?userId=${userId}`;
    
    if (!window.location.pathname.includes('profile.html')) {
        window.location.href = targetUrl;
        return;
    }

    const params = new URLSearchParams(window.location.search);
    if (params.get('userId') !== userId) {
        window.location.href = targetUrl;
        return;
    }

    let data = await getOtherUser(userId);
    if (!data) return;

    const currentUser = JSON.parse(sessionStorage.user);
    if (userId !== currentUser._id && userId !== currentUser.id) {
        if(document.querySelector(".gear")) document.querySelector(".gear").style.display = "none";
    }

    let user = data.user;
    let favorites = data.favorites;
    let recentReviews = data.recentReviews;

    let box_friends = document.getElementById('friends-box-vis');
    box_friends.style.display = 'none';

    let avatar = document.getElementById('avatar');
    avatar.src = `assets/profiles/${user.profile_photo || 1}.jpg`;

    let banner = document.getElementById('banner');
    const bannerId = user.banner_photo || 1;
    banner.style.backgroundImage = `url('assets/banners/${bannerId}.jpg')`;

    let username = document.getElementById('username');
    username.innerText = user.nick_name || user.name;
    let emailText = document.getElementById('emailText');
    emailText.innerText = user.email;
    let kind_profile = document.getElementById('kind-profile');
    let userText = document.getElementById('userText');
    userText.innerText = user.name;

    etiquetaUsuario(userId);

    const container = document.querySelector(".pestaña:nth-child(3)");
    const oldGrid = container.querySelector(".recommendations");
    if (oldGrid) oldGrid.remove();
    const grid = document.createElement("div");
    grid.className = "recommendations";
    container.appendChild(grid);

    if (recentReviews.length === 0) {
        grid.innerHTML = "<p style='color:gray;'>Sin actividad reciente.</p>";
        return;
    }
    console.log("review:", recentReviews[0]);
    recentReviews.slice(0, 4).forEach(review => {
        if (!review.moviePoster) return;
        const box = document.createElement("div");
        box.className = "movieBox";
        box.innerHTML = `
            <a href="review.html?id=${review.movieId}">
                <img class="poster" src="${USERS_IMG_URL}${review.moviePoster}" alt="${review.movieTitle}">
            </a>
        `;
        
        grid.appendChild(box);
       
    });

    const container2 = document.getElementById("reviews");
    container2.innerHTML = "";
    if (recentReviews.length === 0) {
        container2.innerHTML = "<p style='color:gray;'>Sin reseñas aún.</p>";
        return;
    }
    recentReviews.slice(0, 3).forEach(review => {
        const estrellas = "★".repeat(review.rating) + "☆".repeat(5 - review.rating);
        container2.innerHTML += `
            <div class="review" data-rating="${review.rating}">
                <div class="review-content">
                    <h5 class="review-name">${review.movieTitle}</h5>
                    <div class="stars">${estrellas} <span style="color:white;"> ${review.rating}.0 </span></div>
                    <p>${review.reviewText}</p>
                </div>
            </div>
        `;
    });

    const container3 = document.querySelector(".recommendations");
    container3.innerHTML = "";
    if (favorites.length === 0) {
        container3.innerHTML = "<p style='color:gray;'>Sin favoritos aún.</p>";
        return;
    }
    favorites.slice(0, 4).forEach(peli => {
        const box = document.createElement("div");
        box.className = "movieBox";
        box.innerHTML = `
            <a href="review.html?id=${peli.tmdbId}">
                <img class="poster" src="${USERS_IMG_URL}${peli.poster_path}" alt="${peli.titulo}">
            </a>
        `;
        container3.appendChild(box);
    });

    await cargarListasPerfil(userId);


    if(user.public){
        kind_profile.innerText = "Publico";
        let lock1 = document.getElementById('lock-open');
        let lock2 = document.getElementById('lock-block');
        lock1.style.display = 'inline';
        lock2.style.display = 'none';
        let solicitud = document.getElementById('solicitudes');
        solicitud.style.display = 'none';
    } else {
        kind_profile.innerText = "Privado";   
        let lock1 = document.getElementById('lock-block');
        let lock2 = document.getElementById('lock-open');
        lock1.style.display = 'inline';
        lock2.style.display = 'none';
        let solicitud = document.getElementById('solicitudes');
        solicitud.style.display = 'inline';
    }
    

}

window.addEventListener('load', () => {
    const params = new URLSearchParams(window.location.search);
    const userIdParam = params.get('userId');

    if (userIdParam) {
        getPerfil(userIdParam);
    } 
    else if (window.location.pathname.includes('profile.html')) {
        initProfile(); 
    }
});

async function guardarNickname() {
    const token = sessionStorage.getItem('token');
    const user = JSON.parse(sessionStorage.user);
    const nick_name = document.getElementById('nick_name_field').value;

    try {
        const response = await fetch(`/users/${user.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token
            },
            body: JSON.stringify({ nick_name })
        });

        const result = await response.json();
        if (!response.ok) {
            alert(result.msg || "Error al actualizar");
            return;
        }

        sessionStorage.setItem('user', JSON.stringify(result.user));
        document.getElementById('username').innerText = nick_name;

    } catch (err) {
        console.error('Error:', err);
    }
}

function friendPerfil(user,recom,reque,id){
    let box = document.getElementById(id);
    let a = document.createElement('a');
    a.classList.add("friend-card");
    let img = document.createElement('img');
    img.classList.add('friend-avatar');
    img.alt = user.name;
    img.src =  `assets/profiles/${user.profile_photo || 1}.jpg`;
    img.addEventListener('click', () => {
        getPerfil(user._id);
    })
    a.append(img);
    let p1 = document.createElement('p');
    p1.classList.add("friend-name");
    p1.innerText = user.name;
    a.append(p1);

    if(recom){
        let btn = document.createElement('button');
        btn.classList.add('boton-review');
        btn.innerText = 'Agregar';
        btn.addEventListener('click', () => {
            handleAddFriend(user._id);
        })
        a.append(btn);
    } else if (reque){
        let btn1 = document.createElement('button');
        btn1.classList.add('boton-review');
        btn1.innerText = 'Aceptar';
        btn1.addEventListener('click', () => {
            processRequest(user._id, 'accept');
        })
        a.append(btn1);
        let btn2 = document.createElement('button');
        btn2.classList.add('boton-review');
        btn2.innerText = 'Eliminar';
        btn2.addEventListener('click', () => {
            processRequest(user._id, 'reject');
        })
        a.append(btn2);
    }

    box.append(a);
}


async function getOtherUser(userId) {
    console.log("Consultando ID:", userId);
    try {
        const token = sessionStorage.getItem("token");

        const response = await fetch(`http://localhost:3000/users/other/${userId}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": token
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.msg || "Error al obtener usuario");
        }
        return data;

    } catch (error) {
        console.error("Error:", error.message);
        return null;
    }
}

async function handleAddFriend(UserId) {
    const token = sessionStorage.getItem('token'); 

    try {
        const response = await fetch(`/users/add-friend/${UserId}`, {
            method: 'POST',
            headers: {
                'Authorization': token, 
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (response.ok) {
            alert(data.msg); 
        } else {
            console.error(data.msg);
            alert("Error: " + data.msg);
        }
    } catch (error) {
        console.error("Error en la petición:", error);
    }
}

async function processRequest(requestId, actionType) {
    const token = sessionStorage.getItem("token");

    try {
        const response = await fetch(`http://localhost:3000/users/friend-request/${requestId}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": token
            },
            body: JSON.stringify({ action: actionType })
        });

        const data = await response.json();

        if (response.ok) {
            alert(data.msg);
            location.reload(); 
        } else {
            console.error(data.msg);
        }
    } catch (error) {
        console.error("Error en la petición:", error);
    }
}

async function etiquetaUsuario(userId) {
    const token = sessionStorage.getItem("token");

    const respuesta = await fetch('/reviews/mis-resenas', {
        headers: { 'Authorization': token }
    });
    console.log("Respuesta de mis reseñas:", respuesta);

    if (!respuesta.ok) {
        console.error("Error al cargar reseñas para el calendario");
        return;
    }
    
    const reseñasBackend = await respuesta.json();
    let num_etiquetas = reseñasBackend.length;
    console.log("Número de reseñas para etiquetas:", num_etiquetas);
    let badge = document.getElementById('user_badge');

    if (num_etiquetas >= 50) {
        badge.innerText = "Cinefilo Legendario";
        badge.className = "badge bg-danger";
    } else if (num_etiquetas >= 30) {
        badge.innerText = "Cinefilo Experto";
        badge.className = "badge bg-warning text-dark";
    } else if (num_etiquetas >= 10) {
        badge.innerText = "Cinefilo Intermedio";
        badge.className = "badge bg-info text-dark";
    } else if (num_etiquetas >= 5) {
        badge.innerText = "Cinefilo Novato";
        badge.className = "badge bg-secondary";
    } else {
        badge.innerText = "Cinefilo en Pañales";
        badge.className = "badge bg-light text-dark";
    }
}

async function initProfile() {
    console.log("Initializing profile...");
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
    let userText = document.getElementById('userText');
    userText.innerText = user.name;

    let num_friends = document.getElementById("number_friends");
    num_friends.innerText = "(" + user.friends.length + ")";

    populeteFriends();
    etiquetaUsuario(user._id);

    if(user.public){
        kind_profile.innerText = "Publico";
        let lock1 = document.getElementById('lock-open');
        let lock2 = document.getElementById('lock-block');
        lock1.style.display = 'inline';
        lock2.style.display = 'none';
        let solicitud = document.getElementById('solicitudes');
        solicitud.style.display = 'none';
    } else {
        kind_profile.innerText = "Privado";   
        let lock1 = document.getElementById('lock-block');
        let lock2 = document.getElementById('lock-open');
        lock1.style.display = 'inline';
        lock2.style.display = 'none';
        let solicitud = document.getElementById('solicitudes');
        solicitud.style.display = 'inline';
    }

}