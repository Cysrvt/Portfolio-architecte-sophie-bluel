

const reponse = await fetch("http://localhost:5678/api/works")
const works = await reponse.json()

const gallery = document.querySelector(".gallery")
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

console.log(gallery)