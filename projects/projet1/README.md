# Projet 1 Voting

### Retour de Cyril sur le projet 1 à fixer
garder les hash des description est interessant mais un peu couteux pour aucun gain. Ligne 39 affectation non necessaire. Bonne gestion du batch voter. Ligne 82 le new est l'ancien +1. Dans le cas d'un vote non strict, on peut revenir en arrière ce qui amène, si on rajoute une propal, a un soucis sur l'id du vote blanc, petit problème de logique ici. Attention aux visibilités. maxVote ligne 155 non necessaire et surtout ne pas affecter.
