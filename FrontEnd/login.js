const API = "http://localhost:5678/api";
const form = document.querySelector(".form-login")
console.log("mon bouton est ", form)

form.addEventListener("submit", (event) => {
    try {
        event.preventDefault();
        afficherMessageError("");
        const email = document.getElementById("email").value
        validerEmail(email)
        const password = document.getElementById("password").value
        validerPassword(password)
        const loginUser = { email, password }
        postAPI(loginUser)

    } catch (error) {
        afficherMessageError(error.message)
    }
})

const validerEmail = (email) => {
    let regex = new RegExp("[a-z0-9._-]+@[a-z0-9._-]+\.[a-z0-9._-]+");
    if (!regex.test(email)) {
        throw new Error("Le format de l'e-mail n'est pas valide.");
    }
}
const validerPassword = (password) => {
    if (password.length === 0) {
        throw new Error("N'oubliez pas votre mot de passe.")
    }
}

const afficherMessageError = (message) => {

    let spanError = document.getElementById("spanError")
    if (!spanError) {
        spanError = document.createElement("span")
        spanError.id = "spanError"
        form.appendChild(spanError)
    }
    spanError.innerText = message
}

const validerReponse = (response) => {
    if (!response.ok) {
        afficherMessageError("Erreur dans l’identifiant ou le mot de passe")
        throw new Error("Identifiant ou mot de passe incorrect")
    }
}

const postAPI = async (loginUser) => {
    const loginUserJSON = JSON.stringify(loginUser)
    try {
        const response = await fetch(`${API}/users/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: loginUserJSON
        });

        validerReponse(response)

        const rep = await response.json()

        // il faut recuperer le Token 
        const token = rep.token
        window.localStorage.setItem("token", JSON.stringify(token))


        window.location.href = "index.html"

        // revenir sur la page d'accueil qui sera remise en page !


    } catch (error) {

        console.error("Erreur dans la recuperation", error)
    }

}




//|sophie.bluel@test.tld|S0phie|
