const gallery = document.querySelector(".gallery");
const filters = document.querySelector(".filters");
const lienNavLogin = document.querySelector(".lien-nav-login")
const API = "http://localhost:5678/api";

let allWorks = []
let allCategories = []

const fetchWorks = async () => {
    try {
        const response = await fetch(`${API}/works`);
        const works = await response.json();
        allWorks = works;
        console.log("la liste de works est ", allWorks);
        afficheGallery(allWorks)

        afficherGalleryModal(allWorks)
        clickDeleteBtn()
    } catch (error) {
        console.error("Erreur dans la récupération de works", error);
    };
}
fetchWorks();

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
        //creation des option pour le select de la modale
        createOptionSelect(categories)
        //ajout du "tous" pour les filtres
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
    if (event.target.id === 0) {
        afficheGallery(allWorks)
    } else {
        let listFilterWorks = allWorks.filter(work => work.categoryId === Number(event.target.id))
        afficheGallery(listFilterWorks)
    }
})

/////////////////// Affichage Mode Edition //////////////////


//Affiche ou Désaffiche les balises concernées par le mode édition
const afficherEditMode = () => {
    const editMode = document.querySelectorAll(".edit-mode")

    editMode.forEach((element) => {
        element.classList.toggle("open")
    })
}

// Regarde si y a un token, si oui, ca passe la page en mode edition
const ModeConnecte = () => {
    const token = localStorage.getItem("token")
    const userId = localStorage.getItem("userId")
    if (token) {
        console.log("Utilisateur connecté")

        console.log("ceci est mon token : ", token)
        lienNavLogin.innerText = "Logout"
        afficherEditMode()
    }
    if (userId) {
        console.log("ceci est mon userId", userId)
    }
}

ModeConnecte()

// Au click sur logout/login si y a un token 
// ca l'enleve et rafraichi la page 
// sinon ca suit le lien normalement
lienNavLogin.addEventListener("click", (event) => {
    const token = localStorage.getItem("token")
    if (token) {
        event.preventDefault()
        localStorage.removeItem("token")
        window.location.reload()
    }
})



/////////////////////// MODALE ////////////////////////////////

const modal = document.querySelector(".modal")
const modifierElement = document.querySelector(".modifier")
const modalCloseBtn = document.querySelector(".modal-close-btn")
const galleryModal = document.querySelector(".modal-gallery")
const modalAddBtn = document.querySelector(".modal-add-btn")
const modalReturnBtn = document.querySelector(".modal-return-btn")


// Pour ouvrir la modale //
const ouvrirModal = () => {
    modal.classList.add("open")
}
modifierElement.addEventListener("click", ouvrirModal)

// Pour fermer la modale //

const fermerModal = () => {
    modal.classList.remove("open")
}
// a la croix  
modalCloseBtn.addEventListener("click", fermerModal)
// au click de l'overlay
modal.addEventListener("click", (event) => {
    if (event.target === modal) {
        fermerModal()
    }
})

// Pour mettre en place les echanges apercu suivant les parties ouvertes
const echangeAffichage = (classChange) => {
    const allChanges = document.querySelectorAll(classChange)
    allChanges.forEach((element) => {
        element.classList.toggle("open")
    })
}
modalAddBtn.addEventListener("click", () => echangeAffichage(".parties-modal"))
modalReturnBtn.addEventListener("click", () => echangeAffichage(".parties-modal"))




// Creation de la gallery pour la modale 
const afficherGalleryModal = (works) => {
    console.log("ma liste allworks est ", works)
    works.forEach(work => {
        const figure = document.createElement("figure");
        const img = document.createElement("img");
        img.src = work.imageUrl;
        img.alt = `Une image du projet : ${work.title}`;
        figure.appendChild(img);

        const deleteBtn = document.createElement("div");
        deleteBtn.classList = "delete-btn"
        deleteBtn.setAttribute('workid', work.id)
        deleteBtn.innerHTML = '<i class="fa-xs fa-solid fa-trash-can"></i>'
        figure.appendChild(deleteBtn);
        galleryModal.appendChild(figure);
    });

}

const deleteWork = async (workId) => {
    let token = JSON.parse(window.localStorage.getItem("token"))

    console.log("mon token", token)
    try {
        const response = await fetch(`${API}/works/${workId}`, {
            method: 'DELETE',
            headers: {
                Accept: 'application/json',
                Authorization: `Bearer ${token}`,
            },
        })
        if (!response.ok) {
            throw new Error(`Erreur http: ${response.status}`);
        }
        alert('Element supprimé');
        gallery.innerHTML = "";
        galleryModal.innerHTML = "";
        fetchWorks();

    } catch (error) {
        console.error("Erreur lorsqu'on essaye de supprimer les works");
    }
}



const clickDeleteBtn = () => {
    const allDeleteBtns = document.querySelectorAll(".delete-btn")
    allDeleteBtns.forEach(element => {
        element.addEventListener("click", () => {
            deleteWork(element.getAttribute("workid"))
        }
        )
    }
    )
}


/// creation option pour choix de catégorie au form modale

const createOptionSelect = (options) => {
    const selectElement = document.getElementById("categorie-select")
    options.forEach(option => {
        const optionElement = document.createElement("option")
        optionElement.value = option.name
        optionElement.innerText = option.name
        selectElement.appendChild(optionElement)
    })
}



////////// Formulaire de la modale //////////




////recuperation et affichage photo 
const inputPhoto = document.querySelector("#photo-input");
const previewPhoto = document.querySelector(".preview-photo");

inputPhoto.addEventListener("change", () => {
    const photo = inputPhoto.files[0];

    if (photo) {
        echangeAffichage(".add-photo")
        previewPhoto.src = URL.createObjectURL(photo);

    }
});