# Conventions de code, de qualité et d'architecture

## Architecture hexagonale simplifiée
- **Controller Express** : expose les routes HTTP et transforme la requête en commande applicative. Il instancie le cas d'usage et renvoie des statuts HTTP explicites (201 en cas de création, 400 pour les erreurs métier, 500 pour les erreurs inconnues).
- **Use case** : porte les règles métier et crée les entités du domaine. Il ne connaît pas les détails d'implémentation de la persistance et travaille via des interfaces de dépôt.
- **Repository** : interface définissant les opérations de persistance. Une implémentation TypeORM est utilisée pour PostgreSQL (`CreateOrderTypeOrmRepository`).
- **Entité** : encapsule les invariants métier et les validations (ex. `Order` assure la validité des produits et du prix total). Les décorateurs TypeORM gèrent la génération des identifiants et des dates.

## Qualité et validation des données
- Les validations métier sont réalisées dans les entités (`validateProductIds`, `validateTotalPrice`) afin de centraliser les règles et éviter la duplication.
- Les messages d'erreur sont clairs et en français afin d'être renvoyés directement au client.
- Les bornes métier sont vérifiées tôt (ex. nombre de produits entre 1 et 5, prix total entre 2€ et 500€) pour éviter toute sauvegarde incohérente.

## Organisation du code
- Chaque fonctionnalité possède son dossier dédié (`module/order/createOrder`) contenant le contrôleur, le cas d'usage et les implémentations de dépôt.
- Les routes sont montées dans `src/config/app.ts` sous le préfixe `/api` pour regrouper les endpoints publics.
- Les dépendances sont injectées manuellement dans les cas d'usage (instanciation explicite dans les contrôleurs) afin de rester simples et testables.

## Gestion des erreurs
- Les exceptions métier levées par les entités ou les cas d'usage sont interceptées par les contrôleurs et renvoyées avec un code 400.
- Les exceptions non prévues sont renvoyées avec un message générique « Internal server error » et un code 500.

## Persistance
- TypeORM est configuré via `src/config/db.config.ts` avec `entitySkipConstructor` pour permettre l'hydratation des entités tout en conservant leurs constructeurs riches.
- Les colonnes calculées ou automatiques (dates de création, identifiants) sont gérées par les décorateurs TypeORM (`@PrimaryGeneratedColumn`, `@CreateDateColumn`).
