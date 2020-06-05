async function inscription() {
	//On affiche un message de chargement en attendant que la transaction soit validée dans la Blockchain
	document.getElementById("attente_inscription").innerHTML = "Votre inscription est en cours de traitement...";
	document.getElementById("submit_inscription").disabled = true;

	if (typeof dapp === "undefined") { await createMetaMaskDapp(); }
	const tx = await dapp.contract.inscription(document.getElementById("name").value);

	//On attend que la transaction soit validée et on retire le message, en même temps un évènement va déclencher une nouvelle inscription (event.js)
	await tx.wait();
	document.getElementById("attente_inscription").innerHTML = "";
}

async function bannir() {
	//On affiche un message de chargement en attendant que la transaction soit validée dans la Blockchain
	document.getElementById("attente_banni").innerHTML = "Votre demande de bannissement est en cours de traitement...";
	document.getElementById("submit_bannir").disabled = true;

	if (typeof dapp === "undefined") { await createMetaMaskDapp(); }
	let tx = await dapp.contract.bannir(document.getElementById("add_banni").value);

	//On attend que la transaction soit validée et on retire le message, en même temps un évènement va déclencher un nouveau bannissement (event.js)
	await tx.wait();
	document.getElementById("attente_banni").innerHTML = "";
	document.getElementById("submit_bannir").disabled = false;
}

async function estInscrit() {
	if (typeof dapp === "undefined") { await createMetaMaskDapp(); }
	let inscrit = await dapp.contract.estInscrit();

	if (inscrit) {
		let name = await dapp.contract.getName();
		let reputation = await dapp.contract.getReputation();

		//On affiche son nom et sa réputation
		document.getElementById("status").innerHTML = "Bravo <strong>"+name+"</strong>, vous êtes inscrit et vous avez une réputation de <strong>"+reputation+"</strong>.";

		//On enlève la possibilité de s'inscrire
		document.getElementById("inscription").style.display = "none";

		//On affiche la possibilité d'ajouter une demande
		document.getElementById("nouvelle").style.display = "block";
	}
	return inscrit;
}

async function estAdmin() {
	if (typeof dapp === "undefined") { await createMetaMaskDapp(); }
	let admin = await dapp.contract.estAdmin();
	if (admin) {
		//On affiche la possibilité de bannir une adresse
		document.getElementById("bannir").style.display = "block";
	}
}

async function estBanni() {
	if (typeof dapp === "undefined") { await createMetaMaskDapp(); }
	let banni = await dapp.contract.estBanni();
	if (banni) {
		//On affiche un message de banissement
		document.getElementById("status").innerHTML = "Vous avez été banni !";

		//On enlève la possibilité de s'inscrire
		document.getElementById("inscription").style.display = "none";

		//On enlève la possibilité d'ajouter une demande
		document.getElementById("demandes").style.display = "none";
	}
}