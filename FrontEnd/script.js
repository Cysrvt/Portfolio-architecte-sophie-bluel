const gallery = document.querySelector(".gallery");
const filters = document.querySelector(".filters");
const lienNavLogin = document.querySelector(".lien-nav-login")
const API = "http://localhost:5678/api";

let allWorks = []
let allCategories = []

const fetchWorks = async () => {
    try {
        const response = await fetch(`${API}/works`);
        validerReponse(response)
        const works = await response.json();
        allWorks = works;
        afficheGallery(allWorks)
        // pour la modale
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
        validerReponse(response)
        const categories = await response.json();
        //creation des option pour le select de la modale
        createOptionSelect(categories)
        //ajout du "tous" pour les filtres
        categories.unshift({
            id: "0",
            name: 'Tous',
        });
        allCategories = categories;
        createFilters(allCategories)
        clickFilterBtn()
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
const styleBtnActive = (btn) => {
    const allButtons = document.querySelectorAll(".btn-filter")
    allButtons.forEach(button => {
        button.classList.remove("active-filter")
    })
    btn.classList.add("active-filter")
}

// Ecoute des boutons Filters
const clickFilterBtn = () => {
    const filterBtns = document.querySelectorAll(".btn-filter")
    filterBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
            styleBtnActive(btn)
            gallery.innerHTML = ""
            if (btn.id === "0") {
                afficheGallery(allWorks)
            } else {
                const listFilterWorks = allWorks.filter(work => work.categoryId === Number(btn.id))
                afficheGallery(listFilterWorks)
            }
        })
    })
}


/////////////////// Affichage Mode Edition //////////////////


//Affiche ou Désaffiche les balises concernées par le mode édition
const afficherEditMode = () => {
    const editMode = document.querySelectorAll(".edit-mode")

    editMode.forEach((element) => {
        element.classList.toggle("open")
    })
}

// Recuperation du Token dans le LocalStorage
const recupToken = () => {
    const token = JSON.parse(localStorage.getItem("token"))
    return token
}

// Regarde si y a un token, si oui, ca passe la page en mode edition
const ModeConnecte = () => {
    const token = recupToken()
    if (token) {
        lienNavLogin.innerText = "Logout"
        afficherEditMode()
    }
}
ModeConnecte()

// Au click sur logout/login si y a un token 
// ca l'enleve et rafraichi la page 
// sinon ca suit le lien normalement
lienNavLogin.addEventListener("click", (event) => {
    const token = recupToken()
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
    echangeAffichage(".parties-modal")
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
    afficherMessage("")
}
modalAddBtn.addEventListener("click", () => echangeAffichage(".parties-modal"))
modalReturnBtn.addEventListener("click", () => echangeAffichage(".parties-modal"))

// Creation de la gallery pour la modale 
const afficherGalleryModal = (works) => {
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

// mise a jour des galeries avec supprission ou ajout d'un work
const majGalleries = () => {
    gallery.innerHTML = "";
    galleryModal.innerHTML = "";
    fetchWorks();
}

// affiche un message dans le span en bas de la modale
const afficherMessage = (message) => {
    const spanMessage = document.getElementById("spanMessage")
    spanMessage.innerText = message
}

//fonction qui valide la reponse de l'API
const validerReponse = (response) => {
    if (!response.ok) {
        afficherMessage("Une erreur est survenue")
        throw new Error("Probleme au niveau de la réponse de l'API")
    }
}

// Suppression du projet choisi
const deleteWork = async (workId) => {
    const token = recupToken()
    try {
        const response = await fetch(`${API}/works/${workId}`, {
            method: 'DELETE',
            headers: {
                Accept: 'application/json',
                Authorization: `Bearer ${token}`,
            },
        })
        validerReponse(response)
        afficherMessage("Projet supprimé !")
        majGalleries()

    } catch (error) {
        console.error("Erreur lorsqu'on essaye de supprimer les works");
    }
}

// Ecoute de tout les boutons poubelles pour supprimer les works
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
    const selectElement = document.getElementById("category-select")
    options.forEach(option => {
        const optionElement = document.createElement("option")
        optionElement.value = option.id
        optionElement.innerText = option.name
        selectElement.appendChild(optionElement)
    })
}


////////// Formulaire de la modale //////////


////recuperation et affichage photo 
const inputPhotoWork = document.querySelector("#photo-input");
const previewPhoto = document.querySelector(".preview-photo");
const inputTitleWork = document.querySelector("#title-work")
const selectCategory = document.querySelector("#category-select")

//ecoute de l'input photo
inputPhotoWork.addEventListener("change", () => {
    const photo = inputPhotoWork.files[0];
    if (photo) {
        if (photo.size > 4 * 1024 * 1024) {
            afficherMessage("La photo dépasse 4 Mo")
            inputPhotoWork.value = ""
        } else {
            affichePreviewPhoto(photo)
        }
    }
});

const affichePreviewPhoto = (photo) => {
    echangeAffichage(".add-photo")
    previewPhoto.src = URL.createObjectURL(photo);
}

const verifierForm = () => {
    const photo = inputPhotoWork.files[0]
    const title = inputTitleWork.value
    const category = selectCategory.value
    return photo && title && category

}

const actualiserValiderBtn = () => {
    const validerBtn = document.querySelector(".form-valider-btn")
    validerBtn.disabled = !verifierForm()
}
actualiserValiderBtn()

inputPhotoWork.addEventListener("change", actualiserValiderBtn)
inputTitleWork.addEventListener("input", actualiserValiderBtn)
selectCategory.addEventListener("change", actualiserValiderBtn)

//creation du FormData
const createFormData = () => {
    const formData = new FormData()
    formData.append("title", inputTitleWork.value);
    formData.append("image", inputPhotoWork.files[0]);
    formData.append("category", selectCategory.value);
    return formData
}

//Reinitialise le Form apres envoi a l'api
const reinitialiseForm = () => {
    inputTitleWork.value = ""
    selectCategory.value = ""
    inputPhotoWork.value = ""
    previewPhoto.src = ""
    echangeAffichage(".add-photo")
    actualiserValiderBtn()
}


const form = document.querySelector(".modal-form")
form.addEventListener("submit", (event) => {
    event.preventDefault()
    if (verifierForm()) {
        fetchPostWork(createFormData())
    }
})

const fetchPostWork = async (data) => {
    const token = recupToken()
    try {
        const response = await fetch((`${API}/works`), {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: data
        })

        validerReponse(response)
        reinitialiseForm()
        afficherMessage("Projet ajouté !")
        majGalleries()

    } catch (error) {
        console.error("Erreur dans le POST du work", error)
    }
}