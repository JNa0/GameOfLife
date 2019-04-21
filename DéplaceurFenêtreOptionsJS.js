
replacerFenêtreOptions = function (positionX, positionY, àProposFenêtreOptions, àProposDocument) {
	// Replace la fenêtre d'options si elle sort du cadre
	if (positionX + àProposFenêtreOptions.width  + 6 >  àProposDocument.width) {
		positionX = àProposDocument.width  - àProposFenêtreOptions.width  - 6
	}
	if (positionY + àProposFenêtreOptions.height + 6 > àProposDocument.height) {
		positionY = àProposDocument.height - àProposFenêtreOptions.height - 6
	}
	// Priorité à ce qu'elle ne sorte pas par la gauche si ça doit arriver
	if (positionX < 0) { positionX = 0 }
	if (positionY < 0) { positionY = 0 }
	// On actualise les valeurs des propriétés CSS
	fenêtre.style.left = positionX + "px"
	fenêtre.style.top = positionY + "px"
}

// Fonction exécutée à chaque mouvement de la souris lors du déplacement de la fenêtre d'options
déplacementFenêtre = function (événement) {
	// On calcule la position du coin haut-gauche de la fenêtre d'options
	positionFenêtre.X = événement.clientX - débutDéplacement.X,
	positionFenêtre.Y = événement.clientY - débutDéplacement.Y
	// On transfert le travail à une autre fonction
	replacerFenêtreOptions(positionFenêtre.X, positionFenêtre.Y, débutDéplacement.àProposFenêtreOptions, débutDéplacement.àProposDocument)
}

// Lorsque la page est chargée
document.addEventListener("DOMContentLoaded", function () {
	// On prépare un objet qui contient la position de la fenêtre d'options
	positionFenêtre = {
		X: objetParamètres.position[0],
		Y: objetParamètres.position[1]
	}

	// On ajoute un écouteur de clic (pression uniquement) sur l'élément de déplacement
	document.getElementById("déplacement").addEventListener("mousedown", function (événement) {
		// Si c'est un clic gauche
		if (événement.which == 1) {
			// On crée l'objet qui contient la position de la souris au commencement du déplacement
			// Ainsi que les dimensions du document et de la fenêtre d'options
			let àProposFenêtreOptions = fenêtre.getBoundingClientRect()
			débutDéplacement = {
				X: événement.clientX - àProposFenêtreOptions.left,
				Y: événement.clientY - àProposFenêtreOptions.top,
				àProposDocument: document.body.getBoundingClientRect(),
				àProposFenêtreOptions
				// Attribution implicite ES6
			}
			// On ajoute un écouteur de déplacement
			window.addEventListener("mousemove", déplacementFenêtre)
		}
	})

	// On ajoute un écouteur de lever de clic de la souris
	// Sur la fenêtre car l'utilisateur peut déplacer sa souris hors de l'élément de déplacement
	window.addEventListener("mouseup", function (événement) {
		// Si le clic était utilisé pour déplacer la fenêtre d'options, l'objet débutDéplacement existe
		// S'il n'existe pas, window.property return undefined alors que juste property jette une erreur
		// On teste si l'objet existe ainsi pour éviter les sauvegardes inutiles et les erreurs
		if (window.débutDéplacement) {
			// On retire l'écouteur de déplacement de la souris
			window.removeEventListener("mousemove", déplacementFenêtre)
			// On actualise la valeur de objetParamètres.position
			let àProposFenêtreOptions = fenêtre.getBoundingClientRect()
			objetParamètres.position = [àProposFenêtreOptions.left - 3, àProposFenêtreOptions.top - 3]
			// On supprime l'objet débutDéplacement puis on sauvegarde (pour la nouvelle position)
			delete débutDéplacement
			sauvegarder()
		}
	})
})
