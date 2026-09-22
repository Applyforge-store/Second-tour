# Second Tour

Application multi-garages de rappels d'entretien. Chaque garage possède un espace séparé pour gérer ses clients, leurs consentements, les prochaines échéances et l'historique des e-mails.

## Fonctionnalités livrées

- compte administrateur Second Tour ;
- création et suspension des espaces garages ;
- connexion sécurisée avec mot de passe haché et session HTTP-only ;
- isolation systématique des données par garage ;
- ajout, modification, archivage et import CSV des clients ;
- consentement e-mail obligatoire avant tout rappel ;
- modèles de message personnalisables ;
- génération automatique des rappels selon l'échéance ;
- envoi Gmail réel et conservation des réussites/erreurs ;
- tâche quotidienne Vercel ;
- journal des actions importantes ;
- pages publiques, confidentialité et conditions à finaliser juridiquement.

## 1. Préparer Neon

Créez le projet `second-tour` dans la région Europe (Frankfurt), puis copiez la chaîne `postgresql://...` dans `DATABASE_URL`. Ne transmettez jamais cette valeur par messagerie.

## 2. Préparer les variables

Copiez `.env.example` vers `.env.local`, puis renseignez toutes les valeurs. Pour les deux secrets, utilisez deux résultats différents de :

```bash
openssl rand -base64 48
```

Le premier mot de passe administrateur doit contenir au moins 12 caractères.

## 3. Initialiser et tester

```bash
npm install
npm run db:migrate
npm test
npm run build
npm run dev
```

Ouvrez `http://localhost:3000/login` avec `ADMIN_EMAIL` et `ADMIN_PASSWORD`.

## 4. Configurer Gmail

Activez la validation en deux étapes du compte Gmail d'envoi, créez un mot de passe d'application et placez-le dans `GMAIL_APP_PASSWORD`. Le mot de passe habituel du compte ne doit jamais être utilisé. Faites un essai avec votre propre adresse avant d'ajouter un garage.

Pour un volume plus élevé, remplacez Gmail par un service transactionnel avec domaine authentifié (SPF, DKIM et DMARC).

## 5. Déployer sur Vercel

1. Placez ce dossier dans un dépôt GitHub privé.
2. Importez le dépôt dans Vercel.
3. Ajoutez les variables de `.env.example` dans les réglages Vercel, sans les enregistrer dans Git.
4. Lancez une fois `npm run db:migrate` avec les variables de production.
5. Déployez et remplacez `APP_URL` par l'URL réelle.
6. Vérifiez que la tâche `/api/cron/reminders` apparaît dans les Cron Jobs.

## Utilisation

1. L'administratrice crée un garage et un mot de passe initial.
2. Le garage se connecte et personnalise son rappel.
3. Il ajoute ou importe uniquement les clients dont il peut prouver le consentement.
4. La tâche quotidienne crée et envoie les rappels dus.
5. Les erreurs restent visibles et peuvent être renvoyées manuellement.

## Avant la première vente

- enregistrer légalement l'activité et finaliser l'identité commerciale ;
- remplacer `contact@second-tour.be` sur la page publique par l'adresse réelle ;
- compléter les pages de confidentialité et conditions ;
- conclure un accord de sous-traitance des données avec chaque garage ;
- définir la durée de conservation et une procédure de suppression/export ;
- effectuer un test complet avec des données fictives et votre propre adresse e-mail.

Le logiciel ne prétend jamais avoir envoyé un message : un rappel passe à `SENT` uniquement après acceptation par le serveur Gmail. Toute erreur est conservée avec son message.
