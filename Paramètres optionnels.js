
étatEntrée = function (entrée) { return entrée.checked }

valeurEntrée = function (entrée) { return entrée.getAttribute("valeurNumérique") - 0 }

// Retourne l’ensemble des nombres dont l’entrée est active
obtenirValeursEntrées = function (tableauHTMLEntrées) { return tableauHTMLEntrées.filter(étatEntrée).map(valeurEntrée) }

changerRègles = function () {
	// Met à jour les tableaux de règles
	objetParamètres.règles.naîtSi = obtenirValeursEntrées(naîtSi)
	objetParamètres.règles.meurtSi = obtenirValeursEntrées(meurtSi)
	sauvegarder()
}

redimensionner = function () {
	// Met le jeu en pause
	enCours && lecturePause()
	let largeur = entréeLargeur.value - 0,
		hauteur = entréeHauteur.value - 0
	// Si les contenus des inputs sont supérieurs à 0
	if (largeur > 0 && hauteur > 0) {
		// Change les valeurs et réinitialise le plan
		objetParamètres.largeur = largeur
		objetParamètres.hauteur = hauteur
		objetParamètres.plan = []
		for (let i = 0; i < objetParamètres.largeur; i++) {
			objetParamètres.plan.push([])
			for (let j = 0; j < objetParamètres.hauteur; j++) {
				objetParamètres.plan[i].push(0)
			}
		}
		// Réinitialise les valeurs
		objetParamètres.générations = 0
		indicateurGénérations.innerText = "Gen. 0"
		objetParamètres.population = 0
		indicateurPopulation.innerText = "Pop. 0"
		calculerTailleCellule()
		dessinerJeu()
		sauvegarder()
	}
}

couleur = function (couleur, index) {
	// Change la valeur couleur dans l’objet et dans le contexte bi-dimensionnel du canevas
	objetParamètres.couleurs[index] = couleur
	switch (index) {
		case 0:
			plan2Dimension.fillStyle = couleur
		break
		case 1:
			plan2Dimension.strokeStyle = couleur
		break
		case 2:
			canevas.style.backgroundColor = couleur
		break
	}
	dessinerJeu()
	sauvegarder()
}

activerSauvegardeAutomatique = function () {
	// Trouve l’état enregistré dans un attribut sur le bouton
	let état = boutonSauvegardeAutomatique.getAttribute("actif") == "true"
	// Change son contenu textuel en conséquence puis inverse son état
	boutonSauvegardeAutomatique.innerText = état ? "Activer sauvegarde automatique" : "Désactiver sauvegarde automatique"
	boutonSauvegardeAutomatique.setAttribute("actif", état ? "false" : "true")
	objetParamètres.sauvegardeAutomatique = !état
	// Force la sauvegarde
	sauvegarder(true)
}

aléatoire = function () {
	// Si le jeu est en cours, met le jeu en pause
	enCours && lecturePause()
	// Pour chaque colonne
	for (let i = 0; i < objetParamètres.largeur; i++)
		// Pour chaque ligne
		for (let j = 0; j < objetParamètres.hauteur; j++)
			// Attribue une valeur aléatoire à chaque cellule
			objetParamètres.plan[i][j] = Math.round(Math.random()) ? 1 : 0

	dessinerJeu()
	// Réinitialise le nombre de générations et recalcule le nombre de cellules vivantes
	objetParamètres.générations = 0
	indicateurGénérations.innerText = "Gen. " + objetParamètres.générations
	cellulesVivantes()
}

réinitialiser = function () {
	// Interrompt le jeu et supprime la sauvegarde puis recharge la page
	enCours = false
	localStorage.removeItem("JeuDeLaVie")
	location.reload()
}
