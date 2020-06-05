//évènement si nouveau banni
nouveauBanni();
async function nouveauBanni() {
	if (typeof dapp === "undefined") { await createMetaMaskDapp(); }
  	let r = await dapp.contract.on("Banni", (address) => {

  		//Si l'utilisateur courrant est banni, on met à jour son interface
  		if (!dapp.address.localeCompare(address.toLowerCase())) {
  			estBanni();
  		}
    });
}

//évènement si nouvelle demande
nouvelleDemande();
async function nouvelleDemande() {
	if (typeof dapp === "undefined") { await createMetaMaskDapp(); }
		let r = await dapp.contract.on("Nouvelle_demande", (remuneration, delai, description, etat, reputation_min, candidats, proprietaire, index) => {

		//On ajoute la demande sur toutes les interfaces 
		ajouterDemandeInterface(description, reputation_min, remuneration, delai, etat, candidats, PAS_D_ILLUSTRATEUR, proprietaire, PAS_DE_TRAVAIL, index);

		//On remet à zéro si l'utilisateur courant est le proprietaire
		if (!dapp.address.localeCompare(proprietaire.toLowerCase())) {
			remettreAZeroDemande();
		}
	});
}

//évènement si nouvelle inscription
nouvelleInscription();
async function nouvelleInscription() {
	if (typeof dapp === "undefined") {await createMetaMaskDapp();}
	let r = await dapp.contract.on("Nouvelle_inscription", (address) => {
		if (!dapp.address.localeCompare(address.toLowerCase())) {
			estInscrit();
			lister_demandes();
		}
	})
}

//évènement si nouvelle validation
nouvelleValidation();
async function nouvelleValidation() {
	if (typeof dapp === "undefined") {await createMetaMaskDapp();}
	let r = await dapp.contract.on("Nouvelle_offre_acceptee", (address, indexDemande, proprietaire) => {


		dapp.contract.getSpecificName(address).then(function(nom){

			//On ajouter le nom de l'illustrateur à la ligne correspondante
			document.getElementById("illustrateur_"+indexDemande).innerHTML = nom;

			//On active le bouton de livraison
			if (!dapp.address.localeCompare(address.toLowerCase())) {
				document.getElementById("livrer_"+indexDemande).disabled = false;
			}

			//mise à jour de l'état à "en cours"
			document.getElementById("etat_"+indexDemande).innerHTML = ETATS[1];
		})
	})
}


//évènement si nouveau travail
nouveauTravail();
async function nouveauTravail() {
	if (typeof dapp === "undefined") {await createMetaMaskDapp();}
	let r = await dapp.contract.on("Nouvelle_livraison", (address, indexDemande, travail, proprietaire) => {

		//On enlève la possibilité d'ajouter un nouveau travail
		let element = document.getElementById("travail_"+indexDemande);
		let element2 = document.getElementById("livrer_"+indexDemande);
		let parent = element.parentNode;
		element.parentNode.removeChild(element);
		element2.parentNode.removeChild(element2);

		//On ajoute l'information comme quoi le travail est rendu
		let node = document.createElement("span");
		parent.appendChild(document.createTextNode("Travail rendu"));

		 //On met l'état à "Fermée"
		document.getElementById("etat_"+indexDemande).innerHTML = ETATS[2];

		//Si l'utilisateur courant est celui qui a rendu le travail, on met à jour sonr message de bienvenue avec sa nouvelle réputation
		if (!dapp.address.localeCompare(address.toLowerCase())) {
			dapp.contract.getReputation().then(function(reputation) {
				document.getElementById("status").innerHTML = "Bravo <strong>"+name+"</strong>, vous êtes inscrit et vous avez une réputation de <strong>"+reputation+"</strong>.";
			});
		}
	})
}

//évènement si nouvelle postulation
nouvellePostulation();
async function nouvellePostulation() {
	if (typeof dapp === "undefined") {await createMetaMaskDapp();}

	//On ajoute le nom du nouveau postulant à la liste des candidats
	let r = await dapp.contract.on("Nouvelle_postulation", (address, index, proprietaire) => {
		let select = document.getElementById("candidats_"+index);
		let option = document.createElement("option");
		dapp.contract.getSpecificName(address).then(function(nom){
			option.text = nom;
			option.id = address;
			select.add(option);
		});
		if (!dapp.address.localeCompare(proprietaire.toLowerCase())) {
			document.getElementById("accepter_"+index).disabled=false;
		}
	})
}