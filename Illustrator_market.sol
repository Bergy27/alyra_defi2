pragma solidity ^0.6.6;
pragma experimental ABIEncoderV2;

contract Illustrator_market {
    
    enum Etat {OUVERTE, ENCOURS, FERME}

    struct Demande {
        uint remuneration; //wei
        uint delai; //secondes
        string description;
        Etat etat;
        uint reputation_min;
        address[] candidats;
        address proprietaire;
        address illustrateur;
        bytes32 travail;
        uint numero;
    }
    
    event Nouvelle_demande(uint remuneration, uint delai, string description, Etat etat, uint reputation_min, address[] candidats, address proprietaire, uint numero);
    event Nouvelle_inscription(address utilisateur);
    event Nouvelle_postulation(address utilisateur, uint index, address proprietaire);
    event Banni(address utilisateur);
    event Nouvelle_livraison(address illustrateur, uint index, bytes32 travail, address proprietaire);
    event Nouvelle_offre_acceptee(address illustrateur, uint index_demande, address proprietaire);
    
    mapping (address => bool) inscrit;
    mapping (address => string) nom;
    mapping (address => bool) banni;
    mapping (address => uint) reputation;
    mapping (address => bool) admin;
    Demande[] demandes;
    
    uint constant frais = 2;

    
    constructor() public {
        admin[msg.sender] = true;
    }
    
    function inscription(string calldata nom_utilisateur) external {
        require(!inscrit[msg.sender], "Vous êtes déjà inscrit.");
        require(!banni[msg.sender], "Vous avez été banni.");
        
        inscrit[msg.sender] = true;
        reputation[msg.sender] = 1;
        nom[msg.sender] = nom_utilisateur;
        emit Nouvelle_inscription(msg.sender);
    }
    
    function bannir(address utilisateur) public {
        require(inscrit[utilisateur], "L'utilisateur n'est pas inscrit.");
        require(!admin[utilisateur], "On ne peut pas bannir un administrateur.");
        require(admin[msg.sender], "Vous devez être administrateur pour bannir un utilisateur.");
        
        banni[utilisateur] = true;
        inscrit[utilisateur] = false;
        reputation[utilisateur] = 0;
        emit Banni(utilisateur);
    }
    
    function dejaPostule(uint index) public view returns(bool) {
        bool aPostule = false;
        for (uint i=0;i<demandes[index].candidats.length;i++) {
            if (msg.sender==demandes[index].candidats[i]) {
                aPostule = true;
            }   
        }
        return aPostule;
    }
    
    function dejaPostuleSpecifique(address utilisateur, uint index) public view returns(bool) {
        bool aPostule = false;
        for (uint i=0;i<demandes[index].candidats.length;i++) {
            if (utilisateur==demandes[index].candidats[i]) {
                aPostule = true;
            }   
        }
        return aPostule;
    }
    
    function ajouterDemande(uint _remuneration, uint _delai, string memory _description, uint _reputation_min) public payable {
        require(inscrit[msg.sender], "Vous devez être inscrit.");
        require(msg.value>=_remuneration*(100+frais)/100 wei,"Vous devez déposer l'argent correspondant à la rémunération, ainsi que 20% en plus de frais pour la plateforme.");
        
        Demande memory demande = Demande({
            remuneration : _remuneration,
            delai : _delai,
            description : _description,
            etat : Etat.OUVERTE,
            reputation_min : _reputation_min,
            candidats : new address[](0),
            proprietaire : msg.sender,
            illustrateur : address(0x0),
            travail : 0,
            numero : demandes.length
        });
        emit Nouvelle_demande(_remuneration, _delai, _description, Etat.OUVERTE, _reputation_min, new address[](0), address(msg.sender), demandes.length);
        demandes.push(demande);
    }
    
    function estInscrit() public view returns (bool) {
        return inscrit[msg.sender];
    }
    
    function estBanni() public view returns (bool) {
        return banni[msg.sender];
    }
    
    function estAdmin() public view returns (bool) {
        return admin[msg.sender];
    }
    
    function getName() public view returns (string memory) {
        require(inscrit[msg.sender], "Vous devez être inscrit.");
        
        return nom[msg.sender];
    }
    
    function getSpecificName(address utilisateur) public view returns (string memory) {
        return nom[utilisateur];
    }
    
    function getReputation() public view returns (uint) {
        require(inscrit[msg.sender], "Vous devez être inscrit.");
        
        return reputation[msg.sender];
    }
    
    function listerDemandes() public view returns (Demande[] memory) {
        return demandes;
    }
    
    function produireHash(string memory url) pure public returns(bytes32){
        return keccak256(bytes(url));
    }
    
    function postuler(uint index_demande) public {
        require(inscrit[msg.sender], "Vous devez être inscrit.");
        require(reputation[msg.sender]>=demandes[index_demande].reputation_min, "Vous n'avez pas assez de réputation.");
        demandes[index_demande].candidats.push(msg.sender);
        emit Nouvelle_postulation(msg.sender, index_demande, demandes[index_demande].proprietaire);
    }
    
    function accepterOffre(uint index_demande, address illustrateur) public {
        require(inscrit[msg.sender], "Vous devez être inscrit.");
        require(demandes[index_demande].proprietaire==msg.sender, "Vous n'êtes pas le propriétaire de cette demande.");
        require(dejaPostuleSpecifique(illustrateur, index_demande), "L'illustrateur n'a pas postulé pour cette demande.");
        
        demandes[index_demande].etat = Etat.ENCOURS;
        demandes[index_demande].illustrateur = illustrateur;
        emit Nouvelle_offre_acceptee(illustrateur, index_demande, demandes[index_demande].proprietaire);
    }

    
    function livraison(bytes32 travail, uint index_demande) public {
        require(inscrit[msg.sender], "Vous devez être inscrit.");
        require(demandes[index_demande].illustrateur==msg.sender, "Vous n'avez pas été assigné à cette demande");
        
        demandes[index_demande].travail = travail;
        reputation[msg.sender]++;
        (msg.sender).transfer(demandes[index_demande].remuneration);
        demandes[index_demande].etat = Etat.FERME;
        emit Nouvelle_livraison(msg.sender, index_demande, travail, demandes[index_demande].proprietaire);
    }
}