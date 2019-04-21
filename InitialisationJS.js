
/*

À faire :

	- performances++ => quadtree ?
		- /r aux sauvegardes :
			- alléger la sauvegarde
				- enregistrer les cases occupées => permettra de faire des mondes infinis
				- puis au chargement faire jonction entre objet chargé et objet param par défaut
			- meilleure sauvegarde
				- grands plans déformés => comment faire ?
				- sauvegarder séparément les données et conserver typage ?

	- multiplicité des systèmes de règles possibles ? L'automate de ...
	- gestion de fichiers : sauvegarde et chargement
	- meilleure gestion des touches :
		- maintenir clic gauche : multiple activation / dés--
		- raccourcis claviers ?

	- modes :
		- infini
		- autres formes
		- 3D

*/

document.addEventListener("DOMContentLoaded", function () {
	// HTMLÉléments
	canevas = document.getElementById("canevas")
	fenêtre = document.getElementById("options")
	plusParamètres = document.querySelector("details")
	indicateurPopulation = document.getElementById("indicateurPopulation")
	indicateurGénérations = document.getElementById("indicateurGénérations")

	boutonLecturePause = document.getElementById("lecturePause")
	boutonSauvegardeAutomatique = document.getElementById("sauvegardeAutomatique")

	entréeLargeur = document.getElementById("largeur")
	entréeHauteur = document.getElementById("hauteur")
	entréeGénérationsParSeconde = document.getElementById("générationsParSeconde")

	entréeCouleurFond = document.getElementById("couleurFond")
	entréeCouleurCellule = document.getElementById("couleurCellule")
	entréeCouleurBordure = document.getElementById("couleurBordure")

	naîtSi = Array.from(document.getElementsByClassName("naîtSi"))
	meurtSi = Array.from(document.getElementsByClassName("meurtSi"))

	couleurFond.addEventListener("change", function () { couleur(this.value, 2) })
	couleurCellule.addEventListener("change", function () { couleur(this.value, 0) })
	couleurBordure.addEventListener("change", function () { couleur(this.value, 1) })

	document.getElementById("aléatoire").addEventListener("click", aléatoire)
	document.getElementById("étape").addEventListener("click", () => (!enCours && étape()) )
	document.getElementById("sauvegarder").addEventListener("click", () => sauvegarder(true) )
	document.getElementById("réinitialiser").addEventListener("click", réinitialiser)
	document.getElementById("redimensionner").addEventListener("click", redimensionner)
	document.getElementById("sauvegardeAutomatique").addEventListener("click", activerSauvegardeAutomatique)

	générationsParSeconde.addEventListener("change", changerFréquence)
	boutonLecturePause.addEventListener("click", lecturePause);

	// Ajoute un écouteur de changement sur chaque input de changement de règle
	// Pour sauvegarder et mettre en effet ce changement
	[...naîtSi, ...meurtSi].forEach((boutonEntrée) => boutonEntrée.addEventListener("change", changerRègles))

	// Variables initiales : contexte du canevas et deux variables d'état
	plan2Dimension = canevas.getContext("2d")
	enCours = false // Le jeu est en pause
	enDéplacement = false // L'utilisateur ne déplace pas le plan

	// Dimensionne le canevas pour prendre toute la page
	canevas.width = innerWidth
	canevas.height = innerHeight

	// Charge une sauvegarde depuis l'espace de stockage local
	let sauvegardeobjetParamètres = localStorage.getItem("JeuDeLaVie")
	// Si la sauvegarde existe
	if (sauvegardeobjetParamètres) {
		// On la décompile
		objetParamètres = JSON.parse(sauvegardeobjetParamètres)

		// On décompresse le plan, pour chaque colonne
		for (let i = 0, length = objetParamètres.plan.length; i < length; i++) {
			// On convertit de la base 36 au binaire la valeur enregistrée
			let séquenceBinaire = (parseInt(objetParamètres.plan[i], 36)).toString(2)
			// Si le nombre binaire est trop court
			if (séquenceBinaire.length < objetParamètres.hauteur)
				// On ajoute autant de 0 que nécessaire
				for (let i = séquenceBinaire.length; i < objetParamètres.hauteur; i++)
					séquenceBinaire = "0" + séquenceBinaire

			// On crée un tableau des bits ainsi récupérés
			objetParamètres.plan[i] = séquenceBinaire.split("")
			objetParamètres.plan[i] = objetParamètres.plan[i].map((x) => x - 0)
		}

		// Ajoute des colonnes s'il en manque
		for (let i = objetParamètres.plan.length; i < objetParamètres.largeur; i++) {
			objetParamètres.plan.push([])
			for (let j = 0; j < objetParamètres.hauteur; j++)
				objetParamètres.plan[i].push(0)
		}
	}
	else {
		// objetParamètresètres par défaut
		objetParamètres = {
			règles: {
				meurtSi: [0, 1, 4, 5, 6, 7, 8],
				naîtSi: [3]
			},
			couleurs: ["#33cc88", "#338877", "#004455"],
			fenêtreFlottanteDéroulée: false,
			sauvegardeAutomatique: true,
			générationsParSeconde: 8,
			décalage: [0, 0],
			position: [0, 0],
			grossissement: 1,
			générations: 0,
			population: 0,
			hauteur: 32,
			largeur: 32,
			plan: []
			//mode: 0,   // Monde fini (0), infini (1)
			//cotes: 4,   // Schéma : carré
		}

		// Création de la plan
		for (let i = 0; i < objetParamètres.largeur; i++) {
			objetParamètres.plan.push([])
			for (let j = 0; j < objetParamètres.hauteur; j++)
				objetParamètres.plan[i].push(0)
		}
	}

	// Actualise la couleur de remplissage et de bordure des cellules
	document.documentElement.style.backgroundColor = objetParamètres.couleurs[2]
	plan2Dimension.strokeStyle = objetParamètres.couleurs[1]
	plan2Dimension.fillStyle = objetParamètres.couleurs[0]

	calculerTailleCellule()

	// Dessine le plan implicitement en faisant appel à focus pour qu'elle soit centrée
	dessinerJeu()

	// Initialise les valeurs des HTMLElements
	indicateurPopulation.innerText = "Pop. " + objetParamètres.population
	indicateurGénérations.innerText = "Gen. " + objetParamètres.générations
	fenêtre.style.left = objetParamètres.position[0] + "px"
	fenêtre.style.top = objetParamètres.position[1] + "px"
	entréeGénérationsParSeconde.value = objetParamètres.générationsParSeconde
	entréeLargeur.value = objetParamètres.largeur
	entréeHauteur.value = objetParamètres.hauteur
	entréeCouleurCellule.value = objetParamètres.couleurs[0]
	entréeCouleurBordure.value = objetParamètres.couleurs[1]
	entréeCouleurFond.value = objetParamètres.couleurs[2]
	objetParamètres.fenêtreFlottanteDéroulée && plusParamètres.setAttribute("open", "")
	boutonSauvegardeAutomatique.innerText = objetParamètres.sauvegardeAutomatique ? "Désactiver sauvegarde automatique" : "Activer sauvegarde automatique"
	boutonSauvegardeAutomatique.setAttribute("actif", objetParamètres.sauvegardeAutomatique ? "true" : "false")
	// Replace la fenêtre d'options si elle sort du document
	replacerFenêtreOptions(objetParamètres.position[0], objetParamètres.position[1], fenêtre.getBoundingClientRect(), document.body.getBoundingClientRect())
	naîtSi.forEach(function (input, i) {
		// Astuce Javascript : la fonction ne sera exécutée que si la condition précédente est vraie
		// + 1 car il n'y a pas d'input n°0
		objetParamètres.règles.naîtSi.includes(i + 1) && input.setAttribute("checked", "")
	})
	meurtSi.forEach(function (input, i) {
		objetParamètres.règles.meurtSi.includes(i) && input.setAttribute("checked", "")
	})

	// En cas de redimension de la page
	window.addEventListener("resize", function () {
		// Redimensionne le canevas et recalcule la taille maximale des cellules puis redessine
		canevas.width = innerWidth
		canevas.height = innerHeight

		calculerTailleCellule()
		
		plan2Dimension.strokeStyle = objetParamètres.couleurs[1]
		plan2Dimension.fillStyle = objetParamètres.couleurs[0]

		// Replace la fenêtre d'options si elle sort du cadre
		replacerFenêtreOptions(objetParamètres.position[0], objetParamètres.position[1], fenêtre.getBoundingClientRect(), document.body.getBoundingClientRect())

		sauvegarder()
		dessinerJeu()
	})

	// Changer l’état d'une cellule en cliquant sur le canevas
	canevas.addEventListener("click", function (événement) {
		if (événement.which === 1) {
			// Calcul de i et j coordonnées du point
			let i = Math.floor((événement.clientX + objetParamètres.décalage[0]) / (tailleCellule * objetParamètres.grossissement)),
				j = Math.floor((événement.clientY + objetParamètres.décalage[1]) / (tailleCellule * objetParamètres.grossissement))
			// On utilise une bloc try pour gérer l'erreur potentielle si
			// plan[i] n'existe pas (négatif ou supérieur à objetParamètres.width)
			try {
				// De même on teste l'existence de la case en ordonnée (plan[i][j])
				if (objetParamètres.plan[i][j] !== undefined) {
					// On change l'état de la cellule
					objetParamètres.plan[i][j] = 1 - objetParamètres.plan[i][j]
					// On actualise le nombre d'habitants
					objetParamètres.population += objetParamètres.plan[i][j] == 1 ? 1 : -1
					indicateurPopulation.innerText = "Pop. " + objetParamètres.population
					// On efface l'espace de la cellule et on la redessine
					plan2Dimension.clearRect(tailleCellule * objetParamètres.grossissement * i - objetParamètres.décalage[0], tailleCellule * objetParamètres.grossissement * j - objetParamètres.décalage[1], tailleCellule * objetParamètres.grossissement, tailleCellule * objetParamètres.grossissement)
					dessinerCellule(tailleCellule * objetParamètres.grossissement * i - objetParamètres.décalage[0], tailleCellule * objetParamètres.grossissement * j - objetParamètres.décalage[1], tailleCellule * objetParamètres.grossissement, objetParamètres.plan[i][j])
					sauvegarder()
				}
			// Si une erreur est capturée : i est hors de [0 ; objetParamètres.width] ; dans ce cas on ne fait rien
			} catch (e) {}
		}
	})

	// Nécessairement window, aucune idée de pour quoi
	window.addEventListener("click", function (événement) {
		if (événement.which === 2)
			centrer()
	})

	document.documentElement.addEventListener("wheel", function (événement) {
		if (événement.deltaY < 0)
			grossissement(true)

		else if (événement.deltaY > 0)
			grossissement(false)
	})

	fenêtre.querySelector("summary").addEventListener("click", function (événement) {
		// Met un timeout pour laisser au document le temps de mettre l'attribut open
		// Et changer la taille de la fenêtre (sinon on obtient la taille avant clic)
		let _this_ = this
		setTimeout (function () {
			objetParamètres.fenêtreFlottanteDéroulée = _this_.parentElement.hasAttribute("open")
			replacerFenêtreOptions(objetParamètres.position[0], objetParamètres.position[1], fenêtre.getBoundingClientRect(), document.body.getBoundingClientRect())
			sauvegarder()
		}, 1)
	})
})
