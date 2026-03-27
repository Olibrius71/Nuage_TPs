# tp-ci_cd

## Partie 4 — Questions

**Pourquoi `latest` n'est pas une version ?**
`latest` est un tag mobile — il pointe sur le dernier build poussé. Si on pull `latest` aujourd'hui et dans 3 semaines, on a aucune garantie d'avoir la même image. C'est pratique en dev, mais pas viable en prod.

**Différence tag vs digest ?**
Un tag (`:v1.0.0`, `:latest`) est un alias modifiable — on peut le faire pointer sur une autre image. Un digest (`sha256:abc123...`) est l'empreinte cryptographique du contenu de l'image, immuable. Pour de la vraie traçabilité, c'est le digest qui compte.

**Pourquoi séparer staging/prod ?**
Pour ne pas pousser directement en prod sans valider dans un environnement proche. Si un bug passe les tests mais casse au runtime, staging l'attrape avant que ça touche les utilisateurs.

**Pourquoi une version `vX.Y.Z` ne doit jamais être reconstruite ?**
Parce qu'une même version doit toujours correspondre au même artefact. Si on rebuilde `v1.0.0`, l'image change mais le tag reste identique — ce qui casse la reproductibilité et la confiance dans le versioning.

**Avantages d'une PR gate ?**
- On merge que du code qui passe les tests
- Ça force la relecture
- `master` reste toujours dans un état déployable
- On isole les features en cours des autres

**Qu'est-ce qui garantit la traçabilité ici ?**
Le tag `<sha>` du commit GitHub sur chaque image Docker. On peut partir d'une image en prod, retrouver le SHA, et remonter exactement au commit qui l'a produite — et donc au code, aux tests qui ont tourné, et à la PR d'origine.


## Partie 5 — Release Process

### Intégration continue 

Chaque push sur `master` déclenche le workflow `ci-main` :

- Il lance les tests avec Vitest
- Si les tests passent : il build l'image Docker et pousse deux tags sur Docker Hub :
  - `latest` — pointe toujours sur le dernier build de master
  - `<git-sha>` — référence immuable liée exactement au commit

Si les tests échouent, le build ne se lance pas — `master` reste toujours dans un état déployable.

### Créer une release 

1. S'assurer que `master` est dans l'état voulu (CI verte, tout mergé)
2. Créer et pousser un tag Git :
   ```bash
   git tag v1.2.3
   git push origin v1.2.3
   ```
3. Le workflow `release` se déclenche automatiquement et pousse `notes-app:v1.2.3` sur Docker Hub

Pas de build manuel — le push du tag suffit.

### Règles de versioning

On suit le [Semantic Versioning](https://semver.org/) :

- `vMAJEUR.MINEUR.PATCH`
- **MAJEUR** : changement cassant
- **MINEUR** : nouvelle feature, rétrocompatible
- **PATCH** : correction de bug

Un tag de version n'est jamais reconstruit. Une fois `v1.2.3` poussé, l'image est figée. Si un fix est nécessaire, on crée un nouveau tag (`v1.2.4`).

### Traçabilité

Chaque image poussée depuis la CI porte un tag `<git-sha>`. Ça permet de :

- Retrouver exactement quel commit a produit une image qui tourne en prod
- Croiser avec la PR et les tests qui ont validé ce code
- Reproduire le même build à n'importe quel moment

On n'utilise jamais `latest` en prod — on épingle toujours sur un tag `vX.Y.Z` ou `<sha>`.