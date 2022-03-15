// On page load or when changing themes, best to add inline in `head` to avoid FOUC
function updateTheme()
{
    if (localStorage.theme === "dark" || (!("theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
        document.documentElement.classList.add("dark");
    } else {
        document.documentElement.classList.remove("dark");
    }
}

updateTheme();

const themeSelectLight = document.getElementById("theme-select-light");
const themeSelectDark = document.getElementById("theme-select-dark");

themeSelectLight.onclick = function()
{
    localStorage.theme = "light";
    updateTheme();
}

themeSelectDark.onclick = function()
{
    localStorage.theme = "dark";
    updateTheme();
}

// TODO: figure where to put a button to do this
// localStorage.removeItem("theme");

// From: https://www.aleksandrhovhannisyan.com/blog/eleventy-image-lazy-loading/

const lazyLoad = (targets, onIntersection) => {
    const observer = new IntersectionObserver((entries, self) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                onIntersection(entry.target);
                self.unobserve(entry.target);
            }
        });
    });
    targets.forEach((target) => observer.observe(target));
};

const lazyPictures = document.querySelectorAll(".lazy-picture");

lazyLoad(lazyPictures, (pictureElement) => {
    const img = pictureElement.querySelector("img");
    const sources = pictureElement.querySelectorAll("source");

    img.onload = () => {
        pictureElement.dataset.loaded = true;
        img.removeAttribute("data-src");
    };
    img.onerror = () => {
        pictureElement.dataset.loaded = false;
    }

    sources.forEach((source) => {
        source.sizes = source.dataset.sizes;
        source.srcset = source.dataset.srcset;
        source.removeAttribute("data-srcset");
        source.removeAttribute("data-sizes");
    });

    img.src = img.dataset.src;
});