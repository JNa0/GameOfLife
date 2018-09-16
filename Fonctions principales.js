
	/*		Think about it ! Console...

					.table(array or object)
					.assert(boolean)
					.count()	Increments a number and returns it from 1 to Infinity !
					.time(name) Begins a timer, use .timeEnd(name) to stop it and get result.


		- sauvergader différentes parties
		- charger une partie avec un bouton
		- alléger la sauvegarde
			- si valeurs == valeur par défaut alors retirer cette valeur de l'objet enregistré
			- puis au chargement faire jonction entre objet chargé et objet param par défaut

		optimisation nécessaire ! quadtree

		meilleure sauvegarde
			- grands plans déformés
			- sauvegarder séparément les données et conserver typage ?

		intégrer une multiplicité des systèmes de règles possibles ? L'automate de ...

		rajouter:
			- 3D
			- formes !différentes
			- monde infini

*/


calculerTailleCellule = function () {
	// Calcul de la taille maximale des cellules tel que l'on puisse les représenter toutes
	// En occupant soit toute la largeur soit toute la hauteur de la page
	let largeurCellule = innerWidth / objetParamètres.largeur,
		hauteurCellule = innerHeight / objetParamètres.hauteur
	tailleCellule = Math.floor((largeurCellule < hauteurCellule ? largeurCellule : hauteurCellule) * 100) / 100
}

dessinerCellule = function (positionX, positionY, côté, pleine) {
	// Dessine un carré soit plein soit vide dépendemment de l'état de la cellule
	pleine ? plan2Dimension.fillRect(positionX, positionY, côté, côté) : plan2Dimension.strokeRect(positionX, positionY, côté, côté)
}

dessinerJeu = function () {
	// Vide entièrement le canevas
	plan2Dimension.clearRect(0, 0, innerWidth, innerHeight)
	// Change les valeurs de départ et de fin pour éluder les cases non affichées
	let départx = Math.floor(objetParamètres.décalage[0] / (tailleCellule * objetParamètres.grossissement)),
		départY = Math.floor(objetParamètres.décalage[1] / (tailleCellule * objetParamètres.grossissement))
	// Les remet à zéro si le décalage est négatif
	if (départx < 0) {
		départx = 0
	}
	if (départY < 0) {
		départY = 0
	}
	let finx = Math.ceil((objetParamètres.décalage[0] +  innerWidth) / (tailleCellule * objetParamètres.grossissement)),
		finY = Math.ceil((objetParamètres.décalage[1] + innerHeight) / (tailleCellule * objetParamètres.grossissement))
	// Les remet à zéro si le décalage est négatif
	if (finx >  objetParamètres.largeur) {
		finx = objetParamètres.largeur
	}
	if (finY > objetParamètres.hauteur) {
		finY = objetParamètres.hauteur
	}
	// Pour chaque colonne
	for (var i = départx; i < finx; i++) {
		// Pour chaque ligne
		for (var j = départY; j < finY; j++) {
			// Dessine chacune cellules
			dessinerCellule(tailleCellule * objetParamètres.grossissement * i - objetParamètres.décalage[0], tailleCellule * objetParamètres.grossissement * j - objetParamètres.décalage[1], tailleCellule * objetParamètres.grossissement, objetParamètres.plan[i][j])
		}
	}
}

Étape = function () {
	// Crée un nouvel univers vide
	var _univers = []
	// Remplit cet univers de tableaux copiés du précédent univers
	for (let i = 0; i < objetParamètres.largeur; i++) {
		_univers[i] = objetParamètres.plan[i].slice()
	}
	// Pour chaque colonne
	for (var i = 0; i < objetParamètres.largeur; i++) {
		// Pour chaque ligne
		let cetteLigne = objetParamètres.plan[i],
			ligneSuivante = objetParamètres.plan[(i + 1) > (objetParamètres.largeur - 1) ? 0 : (i + 1)],
			lignePrécédente = objetParamètres.plan[(i - 1) < 0 ? (objetParamètres.largeur - 1) : (i - 1)]
		if (cetteLigne.includes(1) || lignePrécédente.includes(1) || ligneSuivante.includes(1)) {
			for (let j = 0; j < objetParamètres.hauteur; j++) {
				let celluleActuelle = objetParamètres.plan[i][j],
					iInférieur = (i - 1) < 0 ? (objetParamètres.largeur  - 1) : (i - 1),
					jInférieur = (j - 1) < 0 ? (objetParamètres.hauteur - 1) : (j - 1),
					iSupérieur = (i + 1) > (objetParamètres.largeur - 1)  ? 0 : (i + 1),
					jSupérieur = (j + 1) > (objetParamètres.hauteur - 1) ? 0 : (j + 1),
					nombreCellulesAvoisinantes = [
						objetParamètres.plan[iInférieur][jInférieur],
						objetParamètres.plan[iInférieur][j],
						objetParamètres.plan[iInférieur][jSupérieur],
						objetParamètres.plan[i][jInférieur],
						objetParamètres.plan[i][jSupérieur],
						objetParamètres.plan[iSupérieur][jInférieur],
						objetParamètres.plan[iSupérieur][j],
						objetParamètres.plan[iSupérieur][jSupérieur]
					].reduce((a, b) => a + (b ? 1 : 0), 0)
				// Si la cellule est vivante et que le nombre de cellules voisines vivantes doit entraîner sa mort selon les règles alors elle meurt
				if (celluleActuelle && objetParamètres.règles.meurtSi.includes(nombreCellulesAvoisinantes)) {
					_univers[i][j] = 0
					plan2Dimension.clearRect(tailleCellule * objetParamètres.grossissement * i - objetParamètres.décalage[0], tailleCellule * objetParamètres.grossissement * j - objetParamètres.décalage[1], tailleCellule * objetParamètres.grossissement, tailleCellule * objetParamètres.grossissement)
					dessinerCellule(tailleCellule * objetParamètres.grossissement * i - objetParamètres.décalage[0], tailleCellule * objetParamètres.grossissement * j - objetParamètres.décalage[1], tailleCellule * objetParamètres.grossissement, false)
				}
				// Sinon si elle est morte mais qu'elle doit naître, elle naît
				else if (!celluleActuelle && objetParamètres.règles.naîtSi.includes(nombreCellulesAvoisinantes)) {
					_univers[i][j] = 1
					plan2Dimension.clearRect(tailleCellule * objetParamètres.grossissement * i - objetParamètres.décalage[0], tailleCellule * objetParamètres.grossissement * j - objetParamètres.décalage[1], tailleCellule * objetParamètres.grossissement, tailleCellule * objetParamètres.grossissement)
					dessinerCellule(tailleCellule * objetParamètres.grossissement * i - objetParamètres.décalage[0], tailleCellule * objetParamètres.grossissement * j - objetParamètres.décalage[1], tailleCellule * objetParamètres.grossissement, true)
				}
				// On efface à chaque fois la zone précédente et on redessine la cellule selon son nouvel état pour optimiser la vitesse de calcul (appel à fonction trop lent)
			}
		}
	}
	// On remplace l'univers précédent par le suivant
	objetParamètres.plan = _univers
	// On actualise les valeurs : on incrémente le nombre de générations et on recalcule la population
	objetParamètres.générations++
	indicateurGénérations.innerText = "Gen. " + objetParamètres.générations
	cellulesVivantes()
	Sauvegarder()
}

actualiserJeu = function () {
	// Tant que la variable enCours est à false
	if (enCours) {
		// Exécute une nouvelle étape
		Étape()
		// Et rappelle la fonction dans 1000 / objetParamètres.générationsParSeconde millisecondes
		// générationsParSeconde étant égal au nombre de générations par seconde
		setTimeout(function () {
			actualiserJeu()
		}, 1000 / objetParamètres.générationsParSeconde)
	}
}

lecturePause = function () {
	// Change la valeur de enCours et du bouton
	enCours = !enCours
	HTMLlecturePause.innerText = enCours ? "Pause" : "Jouer" // "⏸" : "⯈"
	enCours && actualiserJeu()
}

Fréquence = function (input) {
	// Change la valeur du nombre de générations affichées par seconde
	objetParamètres.générationsParSeconde = input.value
	// Il ne peut pas être inférieur à 1 ni supérieur à 50
	if (input.value > 50) {
		input.value = 50
	}
	else if (input.value < 1) {
		input.value = 1
	}
	Sauvegarder()
}

Grossissement = function (booléen) {
	// Multiplie ou divise le grossisement par 2 selon le booléen reçu en argument
	objetParamètres.grossissement *= booléen ? 2 : .5
	// Le grossisement ne peut pas être inférieur à 1
	if (objetParamètres.grossissement < 1) { objetParamètres.grossissement = 1 }
	else {
		// Sinon si l'utilisateur augmente le grossissement
		if (booléen) {
			objetParamètres.décalage[0] = Math.round((objetParamètres.décalage[0] * 2 + innerWidth  / 2) * 100) / 100
			objetParamètres.décalage[1] = Math.round((objetParamètres.décalage[1] * 2 + innerHeight / 2) * 100) / 100
		}
		// Sinon si l'utilisateur diminue le grossissement
		else {
			objetParamètres.décalage[0] = Math.round((objetParamètres.décalage[0] / 2 - innerWidth  / 4) * 100) / 100
			objetParamètres.décalage[1] = Math.round((objetParamètres.décalage[1] / 2 - innerHeight / 4) * 100) / 100
		}
		dessinerJeu()
		Sauvegarder()
	}
}

Focus = function () {
	// Réinitialise le décalage pour centrer la plan et le grossissement
	objetParamètres.décalage = [- Math.round((innerWidth - tailleCellule * objetParamètres.largeur) * 100/ 2) / 100, - Math.round((innerHeight - tailleCellule * objetParamètres.hauteur) * 100/ 2) / 100]
	objetParamètres.grossissement = 1
	Sauvegarder()
	dessinerJeu()
}

cellulesVivantes = function () {
	// Recalcule la population par réduction des valeurs de le plan
	objetParamètres.population = objetParamètres.plan.reduce((a, x) =>
		a + x.reduce((a, y) =>
			a + (y ? 1 : 0)
		, 0)
	, 0)
	indicateurPopulation.innerText = "Pop. " + objetParamètres.population
}

Sauvegarder = function (booléen) {
	// Si la sauvegarde est automatique ou que l'utilisateur confirme avec le bouton prévu à cet effet
	if (objetParamètres.sauvegardeAutomatique || booléen) {
		// Crée un objet de copie
		let copieobjetParamètres = {}
		// Pour chaque élément dans objetParamètres on le copie (ou pointe pour les tableaux ou objets)
		for (let clé in objetParamètres) {
			// Sauf s'il s'agit de le plan
			if (clé !== "plan") {
				copieobjetParamètres[clé] = objetParamètres[clé]
			}
		}
		// On crée un nouveau plan dont les valeurs compressées
		copieobjetParamètres.plan = []
		// Pour chaque colonne de le plan
		for (let i = 0, colonnes = objetParamètres.plan.length; i < colonnes; i++) {
			// Convertit en base 36 la concaténation des valeurs booléennes
			// 1 ou 0 de chaque cellule et l'ajoute à le plan
			copieobjetParamètres.plan[i] = parseInt(objetParamètres.plan[i].join(""), 2).toString("36")
		}
		// On stocke cet objet qui a pour particulatiré de contenir un plan compressée
		localStorage.setItem("JeuDeLaVie", JSON.stringify(copieobjetParamètres))
	}
}
