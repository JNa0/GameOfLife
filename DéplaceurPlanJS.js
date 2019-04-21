
// Actualise la position de la souris dans l'objet positionSouris
actualiserPositionSouris = function (événement) {
	positionSouris = {
		positionX: événement.clientX,
		positionY: événement.clientY
	}
}

// Lorsque la page est chargée
document.addEventListener("DOMContentLoaded", function () {
	canevas.addEventListener("contextmenu", function (événement) {
		événement.preventDefault()
		événement.stopPropagation()
		return false
	}, false)

	// On ajoute un écouteur de clic (pression) de la souris sur le canevas
	canevas.addEventListener("mousedown", function (événement) {
		// Si c'est un clic gauche et que l'utilisateur n'était pas en train de déplacer le plan
		if (événement.which === 3 && !enDéplacement) {
			enDéplacement = true
			// On appelle actualiserPositionSouris une fois pour mettre à jour la position de la souris en cas de simple clic
			actualiserPositionSouris(événement)
			// Puis on ajoute un écouteur de mouvement de la souris pour mettre à jour la position de la souris
			window.addEventListener("mousemove", actualiserPositionSouris)
			// On décale le plan à intervalle régulier
			intervalleDéplacement = setInterval(function () {
				// On calcule le centre et la direction en X et en Y par rapport au centre
				let centre = [innerWidth / 2, innerHeight / 2],
					directionX = positionSouris.positionX - centre[0],
					directionY = positionSouris.positionY - centre[1]
				// On limite les valeurs de déplacement
				if (directionX > centre[0]) {
					directionX = centre[0]
				}
				else if (directionX < -centre[0]) {
					directionX = -centre[0]
				}
				if (directionY > centre[1]) {
					directionY = centre[1]
				}
				else if (directionY < -centre[1]) {
					directionY = -centre[1]
				}
				// On met à jour les valeurs de décalage, avec un formule trouvée à tâtons
				objetParamètres.décalage[0] = Math.round((objetParamètres.décalage[0] + (directionX / 12) % 100) * 100) / 100
				objetParamètres.décalage[1] = Math.round((objetParamètres.décalage[1] + (directionY / 12) % 100) * 100) / 100
				// On redessine
				dessinerJeu()
			// 12.5 actualisations par seconde
			}, 80)
		}
	})

	// On ajoute un écouteur de lever de clic de la souris
	window.addEventListener("mouseup", function (événement) {
		// Si c'est un clic gauche et que l'utilisateur était en train de déplacer le plan
		if (événement.which == 3 && enDéplacement) {
			// On retire l'écouteur de déplacement de la souris
			window.removeEventListener("mousemove", actualiserPositionSouris)
			// S'il existe on interrompt l'intervalle d'appel à actualizeDecalage et on le supprime
			if (intervalleDéplacement !== undefined) {
				clearInterval(intervalleDéplacement)
				delete intervalleDéplacement
			}
			enDéplacement = false
			delete positionSouris
			sauvegarder()
		}
	})
})
