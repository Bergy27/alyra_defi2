const CONTRACT_ADDRESS = "0x7D842CFF62cCd8976E8c768fBB639534A488D57A"
const CONTRACT_ABI = [{"inputs":[{"internalType":"uint256","name":"index_demande","type":"uint256"},{"internalType":"address","name":"illustrateur","type":"address"}],"name":"accepterOffre","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_remuneration","type":"uint256"},{"internalType":"uint256","name":"_delai","type":"uint256"},{"internalType":"string","name":"_description","type":"string"},{"internalType":"uint256","name":"_reputation_min","type":"uint256"}],"name":"ajouterDemande","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"address","name":"utilisateur","type":"address"}],"name":"bannir","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"utilisateur","type":"address"}],"name":"Banni","type":"event"},{"inputs":[{"internalType":"string","name":"nom_utilisateur","type":"string"}],"name":"inscription","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes32","name":"travail","type":"bytes32"},{"internalType":"uint256","name":"index_demande","type":"uint256"}],"name":"livraison","outputs":[],"stateMutability":"nonpayable","type":"function"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"remuneration","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"delai","type":"uint256"},{"indexed":false,"internalType":"string","name":"description","type":"string"},{"indexed":false,"internalType":"enum Illustrator_market.Etat","name":"etat","type":"uint8"},{"indexed":false,"internalType":"uint256","name":"reputation_min","type":"uint256"},{"indexed":false,"internalType":"address[]","name":"candidats","type":"address[]"},{"indexed":false,"internalType":"address","name":"proprietaire","type":"address"},{"indexed":false,"internalType":"uint256","name":"numero","type":"uint256"}],"name":"Nouvelle_demande","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"utilisateur","type":"address"}],"name":"Nouvelle_inscription","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"illustrateur","type":"address"},{"indexed":false,"internalType":"uint256","name":"index","type":"uint256"},{"indexed":false,"internalType":"bytes32","name":"travail","type":"bytes32"},{"indexed":false,"internalType":"address","name":"proprietaire","type":"address"}],"name":"Nouvelle_livraison","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"illustrateur","type":"address"},{"indexed":false,"internalType":"uint256","name":"index_demande","type":"uint256"},{"indexed":false,"internalType":"address","name":"proprietaire","type":"address"}],"name":"Nouvelle_offre_acceptee","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"utilisateur","type":"address"},{"indexed":false,"internalType":"uint256","name":"index","type":"uint256"},{"indexed":false,"internalType":"address","name":"proprietaire","type":"address"}],"name":"Nouvelle_postulation","type":"event"},{"inputs":[{"internalType":"uint256","name":"index_demande","type":"uint256"}],"name":"postuler","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"index","type":"uint256"}],"name":"dejaPostule","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"utilisateur","type":"address"},{"internalType":"uint256","name":"index","type":"uint256"}],"name":"dejaPostuleSpecifique","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"estAdmin","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"estBanni","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"estInscrit","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getName","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getReputation","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"utilisateur","type":"address"}],"name":"getSpecificName","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"listerDemandes","outputs":[{"components":[{"internalType":"uint256","name":"remuneration","type":"uint256"},{"internalType":"uint256","name":"delai","type":"uint256"},{"internalType":"string","name":"description","type":"string"},{"internalType":"enum Illustrator_market.Etat","name":"etat","type":"uint8"},{"internalType":"uint256","name":"reputation_min","type":"uint256"},{"internalType":"address[]","name":"candidats","type":"address[]"},{"internalType":"address","name":"proprietaire","type":"address"},{"internalType":"address","name":"illustrateur","type":"address"},{"internalType":"bytes32","name":"travail","type":"bytes32"},{"internalType":"uint256","name":"numero","type":"uint256"}],"internalType":"struct Illustrator_market.Demande[]","name":"","type":"tuple[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"url","type":"string"}],"name":"produireHash","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"pure","type":"function"}];

const ETATS = ["Ouverte", "En cours", "Fermée"];

let dapp;

async function createMetaMaskDapp() {
 	try {
		let addresses = await ethereum.enable();
		let provider = new ethers.providers.Web3Provider(web3.currentProvider);
		let contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider.getSigner(0));
		let address = addresses[0].toLowerCase();
		dapp = { address, provider, contract };
		console.log("Dapp is connected.");
 	} catch (err) {
   	// Gestion des erreurs
    	console.error(err);
 	}
}


async function init() {

	//Check si l'utilisateur est inscrit
	let inscrit = await estInscrit();

	if (inscrit) {
		//Liste les demandes
		await lister_demandes();
	}

	//Check si l'utilisateur est admin
	await estAdmin();

	//Check si l'utilisateur est banni
	await estBanni();
}