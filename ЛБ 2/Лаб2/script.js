const loadedResources = {
    css: {},
    js: {}
};


function loadCSS(href) {
    if (loadedResources.css[href]) return Promise.resolve();
    return new Promise((resolve, reject) => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        link.onload = () => {
            loadedResources.css[href] = true;
            resolve();
        };
        link.onerror = reject;
        document.head.appendChild(link);
    });
}

function loadJS(src) {
    if (loadedResources.js[src]) return Promise.resolve();
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = () => {
            loadedResources.js[src] = true;
            resolve();
        };
        script.onerror = reject;
        document.body.appendChild(script);
    });
}


async function loadPage(page) {
    cleanupResources();
    const main = document.querySelector('main');
    try {
        main.innerHTML = '<p>Загрузка...</p>';
        const response = await fetch(`components/${page}.html`);
        if (!response.ok) throw new Error(`Ошибка загрузки ${page}.html`);
        const html = await response.text();
        main.innerHTML = html;

        await Promise.allSettled([
            loadCSS(`styles/${page}.css`),
            loadJS(`scripts/${page}.js`)
        ]);

        const initFuncName = `init${page.charAt(0).toUpperCase() + page.slice(1)}`;
        if (window[initFuncName]) {
            window[initFuncName]();
        }
    } catch (error) {
        main.innerHTML = `<p style="color: red;">Не удалось загрузить страницу: ${error.message}</p>`;
    }
}


function cleanupResources() {
    document.querySelectorAll('link[rel="stylesheet"][href^="styles/"]').forEach(link => link.remove());
    document.querySelectorAll('script[src^="scripts/"]').forEach(script => script.remove());
    loadedResources.css = {};
    loadedResources.js = {};
}


function setActiveLink(activeLink) {
    document.querySelectorAll('nav a').forEach(link => link.classList.remove('active'));
    activeLink.classList.add('active');
}


document.querySelector('nav').addEventListener('click', (event) => {
    const link = event.target.closest('a');
    if (!link) return;

    event.preventDefault();
    const page = link.dataset.page;
    if (page) {
        loadPage(page);
        setActiveLink(link);
    }
});


document.addEventListener('DOMContentLoaded', () => {
    const defaultLink = document.querySelector('nav a[data-page="task1"]');
    if (defaultLink) {
        defaultLink.click();
    }
});