# Mon QG

Tableau de bord personnel (iPhone + ordinateur) branché sur la base Notion « Planning par date ».

## Ce qu'il y a dedans

- `public/` : l'appli (écrans, couleurs, glisser-déposer, icônes).
- `api/` : le petit serveur qui parle à Notion avec la clé secrète.
  - `items.js` : lire toutes les fiches, en créer une.
  - `item.js` : modifier une fiche (titre, type, date, domaine, terminé, état, projet).
  - `login.js` : mot de passe d'accès.
- `vercel.json` : réglages d'hébergement.

## Règles

- Notion reste la base de données. L'appli lit, crée et modifie des fiches. Elle ne supprime jamais rien.
- « Terminer » ou « Archiver » coche la case **Archivé** dans Notion.
- Le type **Idée** (idées non business) est ajouté automatiquement à la liste Notion la première fois qu'on l'utilise.
- Les colonnes Notion utilisées : Élément, Type, Domaine, Date, Archivé, État projet, Projet parent, Éléments liés. Ne pas les renommer.

## Réglages à mettre sur Vercel (Environment Variables)

| Nom | Valeur |
| --- | --- |
| `NOTION_TOKEN` | la clé secrète de la connexion Notion « Mon QG » |
| `APP_PASSWORD` | le mot de passe choisi pour ouvrir l'appli |
| `NOTION_DATA_SOURCE_ID` | facultatif ; par défaut `53bab60e-ece1-4f9e-b5fd-c5f0b4957d0f` |

## Prochaine étape prévue

Branchement de l'agenda Outlook (Microsoft 365) : lecture et écriture des rendez-vous.
