# Projet 2 Ropsten 

## Tests Unitaires sous Truffle du contrat Voting.sol corrigé


### Requirements

Les tests unitaires et le Smart Contract sont compilés et exécutés avec les outils et librairies suivantes :

| Outils            | Version                 |
|-------------------|-------------------------|
| Truffle           | v5.5.18 (core: 5.5.18)  |
| Ganache           | v7.2.0                  |
| Solidity          | 0.8.14 (solc-js)        |
| solidity-coverage | 0.7.17 (plugin truffle) |
| Node              | v14.19.3                |
| Web3.js           | v1.5.3                  |


#### Libs npm à installer

- @openzeppelin/test-helpers
- chai
- chance
- mocha

### Lancement des tests

Lancer ganache puis truffle test

```sh
ganache
truffle test
```

Lancer solidity coverage pour la couverture

```sh
truffle run coverage --testfiles test/votingTest.js
```

## Rapports 

**23 tests** couvrent unitairement l'ensemble des fonctions du contrat (un contexte mocha par fonction du contrat) 
en reproduisant un cas nominal complet passant et les cas non passants de manière exhaustive.

Le test des événements du changement d'état du workFlow est couvert par l'ensemble des tests (j'aurais fait un contexte pour une fonction factorisée)

En bonus, un exemple de test dynamique avec des paramètres _**nonVoters.forEach(...)**_ est mis en place 
en miroir d'un autre qui s'appuie sur la lib **_chance_** pour générer de l'aléatoire

### Résultats

```sh
Contract: Voting
Test getVoter
Account owner = [0x44B462f87eBffe6Fe449e879d95B363444bFe288]
Accounts registered = [0x1d6efBFF46a01fB74b622A5cDf4B41Aa842AC3eb, 0xB060E82dDF4b4589794Edd1EC856d4F4CfDC82Bb]
✔ Account [0x44B462f87eBffe6Fe449e879d95B363444bFe288] should be a voter to get a voter (211ms)
✔ Account [0x5d963F06F2cf443a24d3C1E724a975Fa1fD620C6] should be a voter to get a voter
✔ Account [0x1d6efBFF46a01fB74b622A5cDf4B41Aa842AC3eb] should get a registered voter
✔ Account [0xB060E82dDF4b4589794Edd1EC856d4F4CfDC82Bb] should get a non registered voter
Test addVoter
Account owner = [0x44B462f87eBffe6Fe449e879d95B363444bFe288]
Account registered = [0x1d6efBFF46a01fB74b622A5cDf4B41Aa842AC3eb]
✔ Account [0x1d6efBFF46a01fB74b622A5cDf4B41Aa842AC3eb] should be owner
✔ Account [0x1d6efBFF46a01fB74b622A5cDf4B41Aa842AC3eb] should be not already registered
✔ Account [0xB060E82dDF4b4589794Edd1EC856d4F4CfDC82Bb] should be registered (64ms)
✔ Voters registration should be opened (65ms)
Test getOneProposal
Account owner = [0x44B462f87eBffe6Fe449e879d95B363444bFe288]
Accounts registered = [0x1d6efBFF46a01fB74b622A5cDf4B41Aa842AC3eb, 0xB060E82dDF4b4589794Edd1EC856d4F4CfDC82Bb]
Account nonVoter picked = [0x44B462f87eBffe6Fe449e879d95B363444bFe288]
✔ should be a voter to get a proposal
✔ should get a proposal already added
✔ should revert when getting a unknown proposal
Test addProposal
Account owner = [0x44B462f87eBffe6Fe449e879d95B363444bFe288]
Accounts registered = [0x1d6efBFF46a01fB74b622A5cDf4B41Aa842AC3eb, 0xB060E82dDF4b4589794Edd1EC856d4F4CfDC82Bb]
Account nonVoter picked = [0x5d963F06F2cf443a24d3C1E724a975Fa1fD620C6]
✔ should be a voter to add a proposal
Account owner = [0x44B462f87eBffe6Fe449e879d95B363444bFe288]
Accounts registered = [0x1d6efBFF46a01fB74b622A5cDf4B41Aa842AC3eb, 0xB060E82dDF4b4589794Edd1EC856d4F4CfDC82Bb]
✔ Proposals registration should be opened
Account owner = [0x44B462f87eBffe6Fe449e879d95B363444bFe288]
Accounts registered = [0x1d6efBFF46a01fB74b622A5cDf4B41Aa842AC3eb, 0xB060E82dDF4b4589794Edd1EC856d4F4CfDC82Bb]
✔ should add a complete proposal (61ms)
Account owner = [0x44B462f87eBffe6Fe449e879d95B363444bFe288]
Accounts registered = [0x1d6efBFF46a01fB74b622A5cDf4B41Aa842AC3eb, 0xB060E82dDF4b4589794Edd1EC856d4F4CfDC82Bb]
✔ should add several proposal (643ms)
Test setVote
Account owner = [0x44B462f87eBffe6Fe449e879d95B363444bFe288]
Accounts registered = [0x1d6efBFF46a01fB74b622A5cDf4B41Aa842AC3eb, 0xB060E82dDF4b4589794Edd1EC856d4F4CfDC82Bb]
Account nonVoter picked = [0x44B462f87eBffe6Fe449e879d95B363444bFe288]
✔ should be a voter
✔ Voting session should be started
✔ should vote for existing proposal (84ms)
✔ should vote be validated (76ms)
✔ should vote only one time
Test tallyVote
Account owner = [0x44B462f87eBffe6Fe449e879d95B363444bFe288]
Accounts registered = [0x1d6efBFF46a01fB74b622A5cDf4B41Aa842AC3eb, 0xB060E82dDF4b4589794Edd1EC856d4F4CfDC82Bb]
✔ should be owner to tally
✔ should voting session be ended
✔ should have a winner (112ms)

23 passing (4s)
```

### Couverture du code

Fichiers générés par le plugin solidity-coverage dans [projects/projet2/coverage/contracts](/../../tree/main/projects/projet2/coverage/contracts)

[Afficher le rapport](https://htmlpreview.github.io/?https://github.com/eden91940/alyra/blob/main/projects/projet2/coverage/contracts/index.html)

