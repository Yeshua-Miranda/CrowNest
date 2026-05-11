
function mostrarLoader(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = `
        <div style="display:flex; justify-content:center; padding: 20px;">
            <lottie-player
                src="https://assets2.lottiefiles.com/packages/lf20_p8bfn5to.json"
                background="transparent"
                speed="1"
                style="width: 120px; height: 120px;"
                loop
                autoplay
            ></lottie-player>
        </div>
    `;
}

function mostrarLoaderEl(element) {
    if (!element) return;
    element.innerHTML = `
        <div style="display:flex; justify-content:center; padding: 20px;">
            <lottie-player
                src="https://assets2.lottiefiles.com/packages/lf20_p8bfn5to.json"
                background="transparent"
                speed="1"
                style="width: 120px; height: 120px;"
                loop
                autoplay
            ></lottie-player>
        </div>
    `;
}