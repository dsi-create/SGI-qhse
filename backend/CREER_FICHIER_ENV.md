# 📝 Guide pour créer le fichier .env

## Étape 1 : Créer le fichier .env

Créez un fichier nommé `.env` dans le dossier `backend/` avec le contenu suivant :

```env
# Configuration de la base de données MySQL (WAMP)
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=hospital_management
DB_PORT=3306

# Configuration JWT
JWT_SECRET=votre-cle-secrete-changez-cela-en-production-123456789

# Configuration du serveur
PORT=3001
NODE_ENV=development
```

## Étape 2 : Ajuster la configuration selon votre WAMP

### Si votre MySQL WAMP a un mot de passe :
Modifiez la ligne `DB_PASSWORD=` avec votre mot de passe :
```env
DB_PASSWORD=votre_mot_de_passe
```

### Si votre MySQL WAMP utilise un autre port :
Modifiez la ligne `DB_PORT=3306` si nécessaire (généralement 3306 pour WAMP).

## Étape 3 : Créer la base de données

1. Ouvrez **phpMyAdmin** : http://localhost/phpmyadmin
2. Cliquez sur l'onglet **SQL**
3. Copiez-collez le contenu du fichier `database/schema.sql`
4. Cliquez sur **Exécuter**

Cela créera :
- La base de données `hospital_management`
- Toutes les tables nécessaires
- L'utilisateur Super Admin par défaut

## Étape 4 : Vérifier la connexion

Redémarrez le serveur backend :
```bash
cd backend
npm start
```

Vous devriez voir :
```
✅ Serveur API démarré sur le port 3001
📊 Base de données: hospital_management sur localhost:3306
✅ Connexion MySQL réussie! X utilisateur(s) trouvé(s)
```

## 🔧 Dépannage

### Erreur "Access denied"
- Vérifiez que `DB_USER` et `DB_PASSWORD` sont corrects
- Par défaut, WAMP utilise `root` sans mot de passe

### Erreur "Unknown database"
- Vérifiez que vous avez exécuté `database/schema.sql` dans phpMyAdmin
- Vérifiez que `DB_NAME=hospital_management` dans le fichier .env

### Erreur "Can't connect to MySQL"
- Vérifiez que WAMP est démarré (icône verte)
- Vérifiez que MySQL est démarré dans WAMP
- Vérifiez le port dans WAMP (généralement 3306)


