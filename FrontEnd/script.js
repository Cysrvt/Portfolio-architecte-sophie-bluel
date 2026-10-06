const gallery = document.querySelector(".gallery");
const filters = document.querySelector(".filters");
const navLogin = document.querySelector(".nav-login");
const API = "http://localhost:5678/api";

let allWorks = [];
let allCategories = [];

//recuperation des projets
const fetchGetWorks = async () => {
    try {
        const response = await fetch(`${API}/works`);
        validerResponse(response);
        const works = await response.json();
        allWorks = works;
        gallery.innerHTML = "";
        galleryModal.innerHTML = "";
        afficherGallery(allWorks);
        afficherGalleryModal(allWorks);
        ecouterDeleteBtn();
    } catch (error) {
        console.error("Erreur dans la récupération de works", error);
    }
};
fetchGetWorks();

// Cree la gallery dynamique
const afficherGallery = (works) => {
    works.forEach(work => {
        const figure = document.createElement("figure");
        figure.id = `figure${work.id}`;
        const img = document.createElement("img");
        img.src = work.imageUrl;
        img.alt = `Une image du projet : ${work.title}`;
        figure.appendChild(img);
        const figcaption = document.createElement("figcaption");
        figcaption.innerText = work.title;
        figure.appendChild(figcaption);
        gallery.appendChild(figure);
    });
};

///////////////// Creation les filtres dynamiques //////////////////////

// Recuperation des catégories
const fetchGetCategories = async () => {
    try {
        const response = await fetch(`${API}/categories`);
        validerResponse(response);
        const categories = await response.json();
        createOptionSelect(categories);
        categories.unshift({
            id: "0",
            name: 'Tous',
        });
        allCategories = categories;
        createFilters(allCategories);
        ecouterFiltres();
    }
    catch (error) {
        console.error("Probleme de récupération des categories", error);
    }
};
fetchGetCategories();

// Creation de la liste des Filtres
const createFilters = (listCategories) => {
    listCategories.forEach(cat => {
        const button = document.createElement("button");
        button.setAttribute("data-id", cat.id);
        button.innerText = cat.name;
        if (cat.id === "0") {
            button.classList = "btn-filter js-active-filter";
        } else {
            button.classList = "btn-filter";
        }
        filters.appendChild(button);
    });
};

// Changement du Style des boutons quand le filtre change a l'ecoute des boutons
const activerFiltre = (btn) => {
    const allButtons = document.querySelectorAll(".filters .btn-filter");
    allButtons.forEach(button => {
        button.classList.remove("js-active-filter");
    });
    btn.classList.add("js-active-filter");
};

// Ecoute des boutons Filters
const ecouterFiltres = () => {
    const filterBtns = document.querySelectorAll(".btn-filter");
    filterBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
            activerFiltre(btn);
            gallery.innerHTML = "";
            if (btn.getAttribute("data-id") === "0") {
                afficherGallery(allWorks);
            } else {
                const listFilterWorks = allWorks.filter(work => work.categoryId === Number(btn.getAttribute("data-id")));
                afficherGallery(listFilterWorks);
            }
        });
    });
};


/////////////////// Affichage Mode Edition //////////////////


//Affiche ou enlève les balises concernées par le mode édition
const editMode = () => {
    const editMode = document.querySelectorAll(".js-edit-mode");
    const visitMode = document.querySelectorAll(".js-visit-mode");
    editMode.forEach((element) => {
        element.classList.add("open");
    });
    visitMode.forEach((element) => {
        element.classList.remove("open");
    });
};

// Recuperation du Token dans le LocalStorage
const recupToken = () => {
    return localStorage.getItem("token");
};

// Regarde si y a un token, si oui, ca passe la page en mode edition
const initialiserModeEdition = () => {
    const token = recupToken();
    if (token) {
        navLogin.innerText = "Logout";
        editMode();
    }
};
initialiserModeEdition();

// Au click sur logout/login si y a un token 
// ca l'enleve et rafraichi la page 
// sinon ca suit le lien normalement
navLogin.addEventListener("click", (event) => {
    const token = recupToken();
    if (token) {
        event.preventDefault();
        localStorage.removeItem("token");
        window.location.reload();
    }
});


/////////////////////// MODALE ////////////////////////////////

const modal = document.querySelector(".js-modal");
const projectsEditElement = document.querySelector(".projects-edit");
const boutonFermerModale = document.querySelector(".modal-nav-close");
const galleryModal = document.querySelector(".modal-gallery");
const boutonAjouterPhoto = document.querySelector(".modal-add-btn");
const boutonRetourModal = document.querySelector(".modal-nav-return");
const modalContainer = document.querySelector(".modal-container");


// Pour ouvrir la modale //
const ouvrirModal = () => {
    modal.classList.add("open");
};
projectsEditElement.addEventListener("click", ouvrirModal);

// Pour fermer la modale //
const fermerModal = () => {
    changeClassOpen("js-gallery-modal", "js-form-modal");
    reinitialiserForm();
    modal.classList.remove("open");
};
// a la croix  
boutonFermerModale.addEventListener("click", fermerModal);
// au click de l'overlay
modal.addEventListener("click", (event) => {
    if (event.target === modal) {
        fermerModal();
    }
});

//ecoute du bouton ajouter une photo
boutonAjouterPhoto.addEventListener("click", () => {
    changeClassOpen("js-form-modal", "js-gallery-modal");
});
//ecoute du bouton retour a la galerie de la modale
boutonRetourModal.addEventListener("click", () => {
    changeClassOpen("js-gallery-modal", "js-form-modal");
    reinitialiserForm();
});

// Creation de la gallery pour la modale 
const afficherGalleryModal = (works) => {
    works.forEach(work => {
        const figure = document.createElement("figure");
        figure.id = `figureModal${work.id}`;
        const img = document.createElement("img");
        img.src = work.imageUrl;
        img.alt = `Une image du projet : ${work.title}`;
        figure.appendChild(img);
        const trashBtn = document.createElement("button");
        trashBtn.classList = "trash-btn";
        trashBtn.setAttribute('work-id', work.id);
        trashBtn.innerHTML = '<i class="fa-xs fa-solid fa-trash-can"></i>';
        figure.appendChild(trashBtn);
        galleryModal.appendChild(figure);
    });
};

//fonction qui valide la reponse de l'API
const validerResponse = (response) => {
    if (!response.ok) {
        alert("Une erreur est survenue");
        throw new Error("Probleme au niveau de la réponse de l'API");
    }
};

// Suppression du projet choisi
const fetchDeleteWork = async (workId) => {
    const work = allWorks.find((item) => item.id === Number(workId));
    const title = work ? work.title : "";
    const confirmation = confirm(
        `Voulez-vous vraiment supprimer ce projet ${title}?`,
    );
    if (!confirmation) {
        return;
    }
    const token = recupToken();
    try {
        const response = await fetch(`${API}/works/${workId}`, {
            method: 'DELETE',
            headers: {
                Accept: 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });
        validerResponse(response);
        await fetchGetWorks();
        fermerModal();
    } catch (error) {
        console.error("Erreur lorsqu'on essaye de supprimer les works");
    }
};

// Ecoute de tout les boutons poubelles pour supprimer les works
const ecouterDeleteBtn = () => {
    const allDeleteBtns = document.querySelectorAll(".trash-btn");
    allDeleteBtns.forEach(element => {
        element.addEventListener("click", () => {
            fetchDeleteWork(element.getAttribute("work-id"));
        });
    });
};

// ajoute ou enleve la class "open" aux elements
const changeClassOpen = (addClass, removeClass) => {
    const allElementsAddClass = document.querySelectorAll(`.${addClass}`);
    const allElementsRemoveClass = document.querySelectorAll(`.${removeClass}`);
    allElementsAddClass.forEach(element => {
        element.classList.add("open");
    });
    allElementsRemoveClass.forEach(element => {
        element.classList.remove("open");
    });
};


////////// Formulaire de la modale //////////


////recuperation et affichage photo 
const inputPhotoWork = document.querySelector("#photo-input");
const photoPreview = document.querySelector(".photo-preview");
const inputTitleWork = document.querySelector("#title-work");
const selectCategory = document.querySelector("#category-select");
const deletePhotoBtn = document.querySelector(".delete-photo-btn");



//affiche message erreur pour la taille de l'image
const afficheErreurTaille = (message) => {
    let spanErrorSize = document.querySelector(".span-error-size");
    spanErrorSize.innerText = message;
};

/// creation option pour choix de catégorie au form modale
const createOptionSelect = (options) => {
    const selectElement = document.getElementById("category-select");
    options.forEach(option => {
        const optionElement = document.createElement("option");
        optionElement.value = option.id;
        optionElement.innerText = option.name;
        selectElement.appendChild(optionElement);
    })
};

//ecoute de l'input photo
inputPhotoWork.addEventListener("change", () => {
    const photo = inputPhotoWork.files[0];
    if (photo) {
        if (photo.size > 4 * 1024 * 1024) {
            afficheErreurTaille("La photo dépasse 4 Mo");
            inputPhotoWork.value = "";
        } else {
            afficheErreurTaille("");
            affichephotoPreview(photo);
        }
    }
});
//affiche la photo chargée dans le input
const affichephotoPreview = (photo) => {
    changeClassOpen("js-preview-container", "js-add-photo");
    photoPreview.src = URL.createObjectURL(photo);
};

//enleve la photo du preview et de l'input
deletePhotoBtn.addEventListener("click", () => {
    changeClassOpen("js-add-photo", "js-preview-container");
    inputPhotoWork.value = "";
    photoPreview.src = "";
    actualiserValiderBtn();
});

//verifie que les trois champs soit remplit
const verifierForm = () => {
    const photo = inputPhotoWork.files[0];
    const title = inputTitleWork.value.trim();
    const category = selectCategory.value;
    return photo && title && category;
};

//actualise le bouton valider. tant que verifierForm est False, disabled est True
const actualiserValiderBtn = () => {
    const validerBtn = document.querySelector(".form-submit-btn");
    validerBtn.disabled = !verifierForm();
};
actualiserValiderBtn();

//demande d'actualisation du bouton valider et le span message a chaque changement dans le form
inputPhotoWork.addEventListener("change", actualiserValiderBtn);
inputTitleWork.addEventListener("input", actualiserValiderBtn);
selectCategory.addEventListener("change", actualiserValiderBtn);

//creation du FormData
const createFormData = () => {
    const formData = new FormData();
    formData.append("title", inputTitleWork.value);
    formData.append("image", inputPhotoWork.files[0]);
    formData.append("category", selectCategory.value);
    return formData;
};

//Reinitialise le Form apres envoi a l'api
const reinitialiserForm = () => {
    inputTitleWork.value = "";
    selectCategory.value = "";
    inputPhotoWork.value = "";
    photoPreview.src = "";
    changeClassOpen("js-add-photo", "js-preview-container");
    actualiserValiderBtn();
};

//ecoute du submit du form qui lance la fetchPostWork
const form = document.querySelector(".modal-form")
form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (verifierForm()) {
        const formData = createFormData();
        fetchPostWork(formData);
    }
});

//Demande a l'API d'ajouter un projet. Si le projet est bien ajouter, 
//reinitialisation du form et gallery actualisée
const fetchPostWork = async (data) => {
    const title = data.get("title");
    const confirmation = confirm(
        `Voulez-vous vraiment ajouter ce projet ${title}?`,
    );
    if (!confirmation) {
        return;
    }
    const token = recupToken();
    try {
        const response = await fetch((`${API}/works`), {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: data
        });
        validerResponse(response);
        await fetchGetWorks();
        reinitialiserForm();
        fermerModal();
    } catch (error) {
        console.error("Erreur dans le POST du work", error);
    }
};


