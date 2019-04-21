
// Actualise la position de la souris dans l'objet mousePos
mouseRepeat = function (evt) {
	mousePos = {
		X: evt.clientX,
		Y: evt.clientY
	}
}

// Lorsque la page est chargée
document.addEventListener("DOMContentLoaded", function () {
	
	let moveBloc = document.getElementById("bloc")

	// On ajoute un écouteur de clic (pression) de la souris sur le pavé de déplacement
	moveBloc.addEventListener("mousedown", function (evt) {
		// Si c'est un clic gauche et que l'utilisateur n'était pas en train de déplacer la map
		if (evt.which === 1 && !enDéplacement) {
			enDéplacement = true
			// On appelle mouseRepeat une fois pour mettre à jour la position de la souris en cas de simple clic
			mouseRepeat(evt)
			// Puis on ajoute un écouteur de mouvement de la souris pour mettre à jour la position de la souris
			window.addEventListener("mousemove", mouseRepeat)
			// On récupère la position du pavé de déplacement
			let moveBlocAbout = moveBloc.getBoundingClientRect()
			// On décale la map à intervalle régulier
			moveInterval = setInterval(function () {
				// On calcule la direction en X et en Y par rapport au centre du pavé de déplacement
				let dirX = mousePos.X - moveBlocAbout.left - 153,
					dirY = mousePos.Y - moveBlocAbout.top  - 153
				// On limite les valeurs de déplacement entre -153 et 153
				if (dirX > 153) {
					dirX = 153
				}
				else if (dirX < -153) {
					dirX = -153
				}
				if (dirY > 153) {
					dirY = 153
				}
				else if (dirY < -153) {
					dirY = -153
				}
				// On met à jour les valeurs de décalage, avec un formule trouvée à tâtons
				param.decalage[0] += Math.round(dirX * 100 / 4) / 100
				param.decalage[1] += Math.round(dirY * 100 / 4) / 100
				// On redessine
				drawCells(param.map)
				// 153 : moitié de la taille du pavé de déplacement
			}, 80)
			// 12.5 actualisations par seconde
		}
	})

	// On ajoute un écouteur de lever de clic de la souris
	window.addEventListener("mouseup", function (evt) {
		// Si c'est un clic gauche et que l'utilisateur était en train de déplacer la map
		if (evt.which == 1 && enDéplacement) {
			// On retire l'écouteur de déplacement de la souris
			window.removeEventListener("mousemove", mouseRepeat)
			// S'il existe on interrompt l'intervalle d'appelle à actualizeDecalage et on le supprime
			if (moveInterval !== undefined) {
				clearInterval(moveInterval)
				delete moveInterval
			}
			enDéplacement = false
			delete mousePos
			save()
		}
	})
})
