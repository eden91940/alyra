# Projet 3 - Dapp Voting ALYRA

🗳️ Dapp de vote utilisant le smart contract Voting.sol 🗳️

## Démarrage

Les instructions suivantes vous permettront d'installer le projet :

- Afin de cloner le projet, entrez la ligne de commande suivante :
  ```git clone https://github.com/eden91940/alyra```
- Afin d'installer les dépendances react, dans le dossier **projet3/client** du projet, effectuez la commande :
  ```npm install```
- Pour lancer le déploiement de la Dapps, modifiez le fichier truffle-config.js avec le network approprié
- Pour déployer hors ganache, pensez à renseigner dans un fichier .env les variables environnement suivantes :
  ```MNEMONIC```
  ```INFURA_ID```
- Lancez ensuite la migration avec la commande :
  ```truffle migrate --network 'votre network'```
- Récupérer l'adresse du contrat déployé et modifier la ligne addressOrName dans [useVotingContract](client/src/contexts/useVotingContract.jsx)
- Effectuez ensuite la commande suivante dans le dossier client :
  ```npm run start```
- Rendez-vous sur votre http://localhost:3000/ pour interagir avec votre contrat

## Guide d'utilisation

Vous trouverez une vidéo de présentation du projet sur l'URL suivant [Vidéo de démo](https://www.loom.com/share/d9291f53d59a4092b1186269514a03c0)

Vous trouverez aussi une vidéo courte complémentaire pour montrer la feature des resultats complet avec le fix du dernier bug sur l'URL
suivant [Vidéo bonus](https://www.loom.com/share/573115b82fcc4f7c8f1f9d1f89bc3d8f)

Il existe une exemple deployé sur Ropsten ici :
```0x2dDFae451d7a1058F227B007541Bb310e43e3d57```

Vous avez la version 0.1.0 en ligne pour le contrat ci-dessus via le site [Github Pages](https://eden91940.github.io/alyra/)
lancé avec la cmd `npm run deploy`

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

### Langage : Solidity, JS

### Framework : Truffle unbox React

### Libs web3 : ethers.js et wagmi

### Network : Ganache, Ropsten etc
