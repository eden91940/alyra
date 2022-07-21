# Projet 3 - Dapp Voting ALYRA

🗳️ Créer une Dapp de vote utilisant le smart contract Voting.sol 🗳️

## Démarrage

Les instructions suivantes vous permettrons d'installer le projet :

- Afin de cloner le projet, entrez la ligne de commande suivante :
  ```git clone https://github.com/```
- Afin d'installer les dépendances de test et de solidity, dans le dossier racine du projet, effectuez la commande :
  ```npm install ```
- Afin d'installer les dépendances react, dans le dossier client du projet, effectuez la commande :
  ```npm install```
- Pour lancer le déploiement de la Dapps, modifiez le fichier truffle-config.js avec le network approprié
- Pour déployer hors ganache, pensez à renseigner dans un fichier .env les variables environnement suivante :
  ```MNEMONIC```
  ```INFURA_ID```
- Lancez ensuite la migration avec la commande :
  ```truffle migrate --network 'votre network'```
- Effectuez ensuite la commande suivante dans le dossier client :
  ```npm run start```
- Rendez-vous sur votre http://localhost:3000/ pour interagir avec votre contrat

## Guide d'utilisation

Vous trouverez une vidéo de présentation du projet sur l'URL suivant : [Vidéo de démo](https://www.youtube.com/watch?v=)

Il existe une exemple deployé sur Ropsten ici :
```0x```

Vous avez une version Heroku en ligne [ici](https://voting-dapps-v1.herokuapp.com/)

### Specs

La Dapp Voting ALYRA doit permettre :

- l’enregistrement d’une liste blanche d'électeurs.
- à l'administrateur de commencer la session d'enregistrement de la proposition.
- aux électeurs inscrits d’enregistrer leurs propositions.
- à l'administrateur de mettre fin à la session d'enregistrement des propositions.
- à l'administrateur de commencer la session de vote.
- aux électeurs inscrits de voter pour leurs propositions préférées.
- à l'administrateur de mettre fin à la session de vote.
- à l'administrateur de comptabiliser les votes.
- à tout le monde de consulter le résultat.

### Intellij IDEA 🖥️

### Langage : Solidy, JS

### Framework : Truffle unbox React

### Libs web3  : ethers.js et wagmi

### Network : Ganache, Ropsten
