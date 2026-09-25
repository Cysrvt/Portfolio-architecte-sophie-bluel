const gallery = document.querySelector(".gallery");
const filters = document.querySelector(".filters");
const API = "http://localhost:5678/api";

let allWorks = []
let allCategories = []

const fetchData = async () => {
    try {
        const response = await fetch(`${API}/works`);
        const works = await response.json();
        allWorks = works;
        console.log("la liste de works est ", allWorks);
        afficheGallery(allWorks)
    } catch (error) {
        console.error("Erreur dans la récupération de works", error);
    };
}
fetchData();

// Creer la gallery dynamique

const afficheGallery = (works) => {
    works.forEach(work => {
        const figure = document.createElement("figure");

        const img = document.createElement("img");
        img.src = work.imageUrl;
        img.alt = `Une image du projet : ${work.title}`;
        figure.appendChild(img);

        const figcaption = document.createElement("figcaption");
        figcaption.innerText = work.title;
        figure.appendChild(figcaption);

        gallery.appendChild(figure);
    });
}

///////////////// Creation les filtres dynamiques //////////////////////

// Recuperation des catégories
const fetchCategories = async () => {
    try {
        const response = await fetch(`${API}/categories`);
        const categories = await response.json();
        categories.unshift({
            id: 0,
            name: 'Tous',
        });
        allCategories = categories;
        createFilters(allCategories)
    }
    catch (error) {
        console.error("Probleme de récupération des categories", error)
    }
}
fetchCategories()

// Creation de la liste des Filtres
const createFilters = (listCategories) => {
    listCategories.forEach(cat => {
        const button = document.createElement("button")
        button.id = cat.id
        button.innerText = cat.name
        if (cat.id === "0") {
            button.classList = "btn-filter active-filter"
        } else {
            button.classList = "btn-filter"
        }
        filters.appendChild(button)
    }
    )
}
// Changement du Style des boutons quand le filtre change a l'ecoute des boutons
const styleBtnActive = (button) => {
    const allButtons = document.querySelectorAll(".btn-filter")
    allButtons.forEach(button => {
        button.classList.remove("active-filter")
    })
    button.classList.add("active-filter")
}

// Ecoute des boutons Filters
filters.addEventListener("click", event => {
    styleBtnActive(event.target)
    gallery.innerHTML = ""
    if (event.target.id === "0") {
        afficheGallery(allWorks)
    } else {
        let listFilterWorks = allWorks.filter(work => work.categoryId === Number(event.target.id))
        afficheGallery(listFilterWorks)
    }
})

