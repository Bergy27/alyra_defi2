const PAS_D_ILLUSTRATEUR = "0x0000000000000000000000000000000000000000";
const PAS_DE_TRAVAIL = "0x0000000000000000000000000000000000000000000000000000000000000000";

async function asyncForEach(array, callback) {
 	for (let index = 0; index < array.length; index++) {
		await callback(array[index], index, array);
	}
}

async function lister_demandes() {
	if (typeof dapp === "undefined") { await createMetaMaskDapp(); }
	let demandes = await dapp.contract.listerDemandes();

	//Ajouter chaque demande sur l'interface
	demandes.forEach(function(demande) {
		ajouterDemandeInterface(
			demande.description,
			demande.reputation_min,
			demande.remuneration,
			demande.delai,
			demande.etat,
			demande.candidats,
			demande.illustrateur,
			demande.proprietaire,
			demande.travail,
			demande.numero
		);
	})
}

async function desactivePostulation(indexDemande, reputation_min) {
	//Si l'utilisateur a déjà postulé, on désactive le boutton
	let dejaPostule = await dapp.contract.dejaPostule(indexDemande);
	if (dejaPostule) {
		return true;
	}

	let reputation = await dapp.contract.getReputation();
	//Si la réputation est insuffisante, on désactive le boutton
	if (reputation.lt(reputation_min)) {
		return true;
	}
	
	return false;
}

function desactiveLivraison(illustrateur) {
	//Si l'utilisateur n'a pas été choisi comme illustrateur
	return dapp.address.localeCompare(illustrateur.toLowerCase());
}

function desactiveEngagement(candidats, illustrateur, proprietaire) {
	//Si l'utilisateur ne possède pas la demande, on désactive
	if (dapp.address.localeCompare(proprietaire.toLowerCase())) {
		return true;
	}
	//S'il y a déjà un illustrateur validé, on désactive
	if (illustrateur.localeCompare(PAS_D_ILLUSTRATEUR)) {
		return true;
	}

	//S'il n'y pas de candidats, on désactive
	return !candidats.length;
}

async function ajouterDemandeInterface(description, reputation_min, remuneration, delai, etat, candidats, illustrateur, proprietaire, travail, indexDemande) {	
	//On ajoute une ligne à la table
	let newRow   = document.getElementsByTagName('tbody')[0].insertRow();
	let cells = [];

	//On ajouter 10 colonnes
	for (let i=0; i<10; i++) {
		cells.push(newRow.insertCell(i))
	}

	//Colonne 1 : Description
	cells[0].appendChild(document.createTextNode(description));

	//Colonne 2 : Réputation minimum
	cells[1].appendChild(document.createTextNode(reputation_min.toString()));

	//Colonne 3 : Rémunération
	cells[2].appendChild(document.createTextNode(remuneration.toString()));

	//Colonne 4 : Délai
	cells[3].appendChild(document.createTextNode(delai.toString()));

	//Colonne 5 : État
	let etatNode = document.createElement("span");
	etatNode.id = "etat_"+indexDemande;
	etatNode.textContent = ETATS[etat];
	cells[4].appendChild(etatNode);

	//Colonne 6 : Liste de candidats
	let candidatsNode = document.createElement("select");
	candidatsNode.id = "candidats_"+indexDemande;
	asyncForEach(candidats, function(addressCandidat) {
		let option = document.createElement("option");

		//On ajoute l'addresse du candidat dans l'id
		option.id = addressCandidat;

		//On récupère le nom grâce à l'addresse et on ajoute le nom dans la liste déroulante
		dapp.contract.getSpecificName(addressCandidat).then(function(nom) {
			option.text = nom;
			candidatsNode.add(option);
		});
	})
	cells[5].appendChild(candidatsNode);


	//Colonne 7 : Illustrateur retenu
	let illustrateurNode = document.createElement("span");
	illustrateurNode.id = "illustrateur_"+indexDemande;
	let illustrateur_nom = await dapp.contract.getSpecificName(illustrateur);
	illustrateurNode.textContent = illustrateur_nom;
	cells[6].appendChild(illustrateurNode);


	//Colonne 8 : Bouton postuler
	let postulerNode = document.createElement("button");
	postulerNode.id = "postulation_"+indexDemande;
	postulerNode.onclick = function() {
		postuler(indexDemande);
	}
	postulerNode.textContent = "Postuler";

	//Si l'utlisateur a déjà postulé ou a une réputation insuffisante, on désactive le boutton
	postulerNode.disabled = await desactivePostulation(indexDemande, reputation_min);
	cells[7].appendChild(postulerNode);


	//Colonne 9 : Engager le candidat sélectionné
	let validerNode = document.createElement("button");
	validerNode.id = "accepter_"+indexDemande;
	validerNode.onclick = function() {
		accepter(indexDemande);
	}
	validerNode.textContent = "Engager l'illustrateur";
	//Si la demande n'appartient pas à l'utilisateur ou que personne n'a postulé, ou qu'un illustrateur a déjà été choisi, on désactive le boutton
	validerNode.disabled = desactiveEngagement(candidats, illustrateur, proprietaire);
	cells[8].appendChild(validerNode);


	//Colonne 10 : Rendre le travail
	//Travail pas encore rendu
	if (travail==PAS_DE_TRAVAIL) {
		//Ici on peut rendre le travail
		let travailNode = document.createElement("input");
		travailNode.id = "travail_"+indexDemande;

		//Bouton pour valider le rendu
		let rendreNode = document.createElement("button");
		rendreNode.id = "livrer_"+indexDemande;
		rendreNode.onclick = function() {
			livrer(indexDemande);
		}
		rendreNode.textContent = "Livrer";
		//On désactive le boutton si l'utilisateur n'est pas l'illustrateur choisi
		rendreNode.disabled = desactiveLivraison(illustrateur);

		cells[9].appendChild(travailNode);
		cells[9].appendChild(rendreNode);
	} else {
		//Travail déjà rendu
		cells[9].appendChild(document.createTextNode("Travail rendu"))
	}
}


async function livrer(indexDemande) {
	//Si le champs est vide, on ne fait rien
	if (document.getElementById("travail_"+indexDemande).value.length!=0) {
		//On affiche un message de chargement en attendant que la transaction soit validée dans la Blockchain
		document.getElementById("postulation_en_cours").innerHTML = "Votre livraison est en cours de traitement...";
		document.getElementById("livrer_"+indexDemande).disabled = true;

		//On envoie le travail correspondant à la demande en produisant le hash.
		if (typeof dapp === "undefined") { await createMetaMaskDapp(); }
		let hash = await dapp.contract.produireHash(document.getElementById("travail_"+indexDemande).value);
		let tx = await dapp.contract.livraison(hash, indexDemande);
		
		//On attend que la transaction soit validée et on retire le message, en même temps un évènement va déclencher une nouvelle livraison (event.js-nouveauTravail)
		await tx.wait();
		document.getElementById("postulation_en_cours").innerHTML = "";
	}
}



async function postuler(index) {
	//On affiche un message de chargement en attendant que la transaction soit validée dans la Blockchain
	document.getElementById("postulation_"+index).disabled = true;
	document.getElementById("postulation_en_cours").innerHTML = "Votre postulation est en cours de traitement...";

	//on envoie la demande de postulation sur la blockchain
	if (typeof dapp === "undefined") { await createMetaMaskDapp(); }
	let tx = await dapp.contract.postuler(index);
	

	//On attend que la transaction soit validée et on retire le message, en même temps un évènement va déclencher une nouvelle postulation (event.js-nouvellePostulation)
	await tx.wait();
	
	document.getElementById("postulation_en_cours").innerHTML = "";
}


async function accepter(indexDemande) {
	//On affiche un message de chargement en attendant que la transaction soit validée dans la Blockchain
	document.getElementById("postulation_en_cours").innerHTML = "Votre validation est en cours de traitement...";
	document.getElementById("accepter_"+indexDemande).disabled = true;


	//On récupère le nom, l'index correspondant à l'option choisie et l'addresse de l'illustrateur sélectionné
	let name = document.getElementById("candidats_"+indexDemande).value;
	let index = document.getElementById("candidats_"+indexDemande).selectedIndex;
	let address = document.getElementById("candidats_"+indexDemande)[index].id;

	//On envoie sur la blockchain le nouvel illustrateur
	if (typeof dapp === "undefined") { await createMetaMaskDapp(); }
	let tx = await dapp.contract.accepterOffre(indexDemande, address);


	//On attend que la transaction soit validée et on retire le message, en même temps un évènement va déclencher une nouvelle acceptation (event.js-nouvelleValidation)
	await tx.wait();
	document.getElementById("postulation_en_cours").innerHTML = "";
}


async function ajouterDemande() {
	//On affiche un message de chargement en attendant que la transaction soit validée dans la Blockchain
	document.getElementById("attente_demande").innerHTML = "Votre demande est en cours de traitement...";
	document.getElementById("submit_demande").disabled = true;

	//On calcule le coût total de la transaction qui est égal à la rémunération + les frais (2%)
	let wei = Math.ceil(document.getElementById("remuneration").value*102/100).toString();
	if (typeof dapp === "undefined") { await createMetaMaskDapp(); }

	//On ajoute le coût de la transaction
	let overrides = {value: ethers.utils.parseEther(ethers.utils.formatEther(wei))};

	//on envoit la transaction pour créer une nouvelle demande sur la Blockchain
	let tx = await dapp.contract.ajouterDemande(
		document.getElementById("remuneration").value,
		document.getElementById("delai").value,
		document.getElementById("description").value,
		document.getElementById("reputation").value,
		overrides
	);

	//On attend que la transaction soit validée et on retire le message, en même temps un évènement va déclencher une nouvelle demande (event.js-nouvelleDemande)
	await tx.wait();
	document.getElementById("submit_demande").disabled = false;
	document.getElementById("attente_demande").innerHTML = "";
}

//Permet de remmettre les champs de la demande à "zéro" après qu'une demande ait été effectuée
function remettreAZeroDemande() {
	document.getElementById("description").value = null;
	document.getElementById("delai").value = null;
	document.getElementById("remuneration").value = null;
	document.getElementById("reputation").value = null;
}