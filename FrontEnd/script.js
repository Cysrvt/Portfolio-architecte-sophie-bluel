const gallery = document.querySelector(".gallery");
const filters = document.querySelector(".filters");
const liNavLogin = document.querySelector(".li-nav-login")
const API = "http://localhost:5678/api";

let allWorks = []
let allCategories = []

//recuperation des projets
const fetchWorks = async () => {
    try {
        const response = await fetch(`${API}/works`);
        validerResponse(response)
        const works = await response.json();
        allWorks = works;
        afficheGallery(allWorks)
        // pour la modale
        afficheGalleryModal(allWorks)
        clickDeleteBtn()
    } catch (error) {
        console.error("Erreur dans la récupération de works", error);
    };
}
fetchWorks();

// Cree la gallery dynamique
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
        validerResponse(response)
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
const styleFiltersBtn = (btn) => {
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
            styleFiltersBtn(btn)
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
const styleEditMode = () => {
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
const modeConnecte = () => {
    const token = recupToken()
    if (token) {
        liNavLogin.innerText = "Logout"
        styleEditMode()
    }
}
modeConnecte()

// Au click sur logout/login si y a un token 
// ca l'enleve et rafraichi la page 
// sinon ca suit le lien normalement
liNavLogin.addEventListener("click", (event) => {
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
    changeClassOpen("js-gallery-modal", "js-form-modal")
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

//ecoute du bouton ajouter une photo
modalAddBtn.addEventListener("click", () => {
    changeClassOpen("js-form-modal", "js-gallery-modal")
    afficheMessageModal("")
})
//ecoute du bouton retour a la galerie de la modale
modalReturnBtn.addEventListener("click", () => {
    changeClassOpen("js-gallery-modal", "js-form-modal")
    reinitialiseForm()
    afficheMessageModal("")
})

// Creation de la gallery pour la modale 
const afficheGalleryModal = (works) => {
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
const afficheMessageModal = (message) => {
    const spanMessage = document.getElementById("spanMessage")
    spanMessage.innerText = message
}

//fonction qui valide la reponse de l'API
const validerResponse = (response) => {
    if (!response.ok) {
        afficheMessageModal("Une erreur est survenue")
        throw new Error("Probleme au niveau de la réponse de l'API")
    }
}

// Suppression du projet choisi
const fetchDeleteWork = async (workId) => {
    const token = recupToken()
    try {
        const response = await fetch(`${API}/works/${workId}`, {
            method: 'DELETE',
            headers: {
                Accept: 'application/json',
                Authorization: `Bearer ${token}`,
            },
        })
        validerResponse(response)
        afficheMessageModal("Projet supprimé !")
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
            fetchDeleteWork(element.getAttribute("workid"))
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
const previewPhoto = document.querySelector(".photo-ajoutee");
const inputTitleWork = document.querySelector("#title-work")
const selectCategory = document.querySelector("#category-select")
const btnDeletePhoto = document.querySelector(".btn-delete-photo")


// ajoute ou enleve la class "open" aux elements
const changeClassOpen = (addClass, removeClass) => {
    const allElementsAddClass = document.querySelectorAll(`.${addClass}`)
    const allElementsRemoveClass = document.querySelectorAll(`.${removeClass}`)
    allElementsAddClass.forEach(element => {
        element.classList.add("open")
    })
    allElementsRemoveClass.forEach(element => {
        element.classList.remove("open")
    })
}
//ecoute de l'input photo
inputPhotoWork.addEventListener("change", () => {
    const photo = inputPhotoWork.files[0];
    if (photo) {
        if (photo.size > 4 * 1024 * 1024) {
            afficheMessageModal("La photo dépasse 4 Mo")
            inputPhotoWork.value = ""
        } else {
            affichePreviewPhoto(photo)
        }
    }
});
//affiche la photo chargée dans le input
const affichePreviewPhoto = (photo) => {
    changeClassOpen("js-preview-photo", "js-add-photo")
    previewPhoto.src = URL.createObjectURL(photo);

}

//enleve la photo du preview et de l'input
btnDeletePhoto.addEventListener("click", () => {
    changeClassOpen("js-add-photo", "js-preview-photo")
    inputPhotoWork.value = ""
    previewPhoto.src = ""

})

//verifie que les trois champs soit remplit
const verifierForm = () => {
    const photo = inputPhotoWork.files[0]
    const title = inputTitleWork.value.trim()
    const category = selectCategory.value
    return photo && title && category
}

//actualise le bouton valider. tant que verifierForm est False, disabled est True
const actualiserValiderBtn = () => {
    const validerBtn = document.querySelector(".form-valider-btn")
    validerBtn.disabled = !verifierForm()
}
actualiserValiderBtn()

//demande d'actualisation du bouton valider a chaque changement dans le form
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
    changeClassOpen("js-add-photo", "js-preview-photo")
    actualiserValiderBtn()
}

//ecoute du submit du form qui lance la fetchPostWork
const form = document.querySelector(".modal-form")
form.addEventListener("submit", (event) => {
    event.preventDefault()
    if (verifierForm()) {
        fetchPostWork(createFormData())
    }
})

//Demande a l'API d'ajouter un projet. Si le projet est bien ajouter, 
//reinitialisation du form et gallery actualisée
const fetchPostWork = async (data) => {
    const token = recupToken()
    try {
        const response = await fetch((`${API}/works`), {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: data
        })
        validerResponse(response)
        reinitialiseForm()
        afficheMessageModal("Projet ajouté !")
        majGalleries()

    } catch (error) {
        console.error("Erreur dans le POST du work", error)
    }
}


