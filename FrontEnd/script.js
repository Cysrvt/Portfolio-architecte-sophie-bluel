

const reponse = await fetch("http://localhost:5678/api/works")
const works = await reponse.json()



const gallery = document.querySelector(".gallery")
// Creer la gallery dynamique

function afficheGallery(works) {
    works.forEach(work => {
        const img = document.createElement("img")
        img.src = work.imageUrl
        img.alt = `Une image du projet : ${work.title}`
        const figcaption = document.createElement("figcaption")
        figcaption.innerText = work.title
        const figure = document.createElement("figure")

        figure.appendChild(img)
        figure.appendChild(figcaption)
        gallery.appendChild(figure)



    });
}

afficheGallery(works)


// Creer les filtres dynamiquement

let categories = [{ id: "#", name: "Tous" }]

// Creer la liste des filtres
works.forEach(work => {
    const category = work.category;

    const exist = categories.some(
        element => element.id === category.id
    );
    if (!exist) {
        categories.push(category);
    }
})
const filters = document.querySelector(".filters")
categories.forEach(cat => {
    const button = document.createElement("button")
    button.id = cat.id
    button.innerText = cat.name
    if (cat.id === "#") {
        button.classList = "btn-filters select-filter"
    } else {

        button.classList = "btn-filters"
    }
    filters.appendChild(button)

    // Creation du filtrage
    button.addEventListener("click", event => {

        if (event.target.id === "#") {
            gallery.innerHTML = ""
            afficheGallery(works)
        } else {
            let listFilter = works.filter(work => work.categoryId === Number(event.target.id))
            console.log(works)
            console.log(event.target.id, typeof event.target.id)
            console.log(listFilter)
            gallery.innerHTML = ""
            afficheGallery(listFilter)

        }
        document.querySelector(".select-filter").classList.toggle("select-filter")
        button.classList.toggle("select-filter")
    })

})

