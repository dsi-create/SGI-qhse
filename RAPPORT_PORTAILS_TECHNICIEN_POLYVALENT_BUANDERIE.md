# 📊 RAPPORT SUR LES PORTAILS TECHNICIEN POLYVALENT ET BUANDERIE

**Date de génération :** $(date)  
**Application :** Système de Gestion Intégré (SGI) - Portails QHSE

---

## 📋 TABLE DES MATIÈRES

1. [Portail Technicien Polyvalent](#1-portail-technicien-polyvalent)
2. [Portail Buanderie](#2-portail-buanderie)
3. [Comparaison et Synthèse](#3-comparaison-et-synthèse)
4. [Recommandations](#4-recommandations)

---

## 1. PORTAIL TECHNICIEN POLYVALENT

### 1.1 Vue d'ensemble

Le **Portail Technicien Polyvalent** est conçu pour les techniciens polyvalents (hommes à tout faire) qui gèrent les tâches de maintenance polyvalente et les interventions techniques dans l'établissement.

**Fichier source :** `src/components/portals/TechnicienPolyvalentPortal.tsx`

**Rôle associé :** `technicien_polyvalent`

**Description :** Homme à tout faire - Maintenance polyvalente

### 1.2 Design et Interface

#### En-tête personnalisé
- **Gradient de couleurs :** Cyan-600 → Blue-600 → Teal-600
- **Icône :** Wrench (Clé)
- **Informations affichées :**
  - Nom complet de l'utilisateur (civilité, prénom, nom)
  - Date et heure actuelles (format français)
  - Description du rôle : "Homme à tout faire - Maintenance polyvalente"

#### Actions disponibles dans l'en-tête
- **Export Excel :** Via `PortalExcelActions` (type: `technicien_polyvalent`)
- **Export PDF :** Génération de rapport PDF avec les données suivantes :
  - Informations utilisateur
  - Tâches de maintenance
  - Incidents

### 1.3 Statistiques en temps réel

Le portail affiche 4 cartes de statistiques cliquables :

| Carte | Métrique | Icône | Couleur | Navigation |
|-------|----------|-------|---------|------------|
| **Maintenances en Attente** | Nombre de maintenances planifiées ou en cours | Clock | Jaune | `maintenanceHistory` |
| **Incidents en Cours** | Incidents avec statut : nouveau, en cours, en attente | AlertCircle | Rouge | `qhseTickets` |
| **Total Incidents** | Nombre total d'incidents | ListChecks | Bleu | `qhseTickets` |
| **Mes Tâches** | Tâches assignées (affichage "-" actuellement) | ClipboardList | Violet | `myTasks` |

### 1.4 Accès rapides

Le portail propose 4 cartes d'accès rapide :

#### 1. Planning des Tâches
- **Navigation :** `planningTasks`
- **Fonctionnalités :**
  - Créer des tâches planifiées
  - Organiser le planning
  - Suivre les échéances
- **Icône :** CalendarPlus (Indigo)

#### 2. Historique de Maintenance
- **Navigation :** `maintenanceHistory`
- **Fonctionnalités :**
  - Voir les maintenances planifiées
  - Suivre les interventions
  - Consulter l'historique
- **Icône :** History (Cyan)

#### 3. Mes Tickets Assignés
- **Navigation :** `qhseTickets`
- **Fonctionnalités :**
  - Voir uniquement les tickets assignés au technicien
  - Consulter les détails
  - Suivre les priorités
- **Icône :** Ticket (Cyan)
- **Note importante :** Le technicien polyvalent ne voit QUE les tickets qui lui sont assignés (filtrage automatique)

#### 4. Mes Tâches
- **Navigation :** `myTasks`
- **Fonctionnalités :**
  - Voir les tâches à faire
  - Mettre à jour le statut
  - Suivre les échéances
- **Icône :** ClipboardList (Violet)

### 1.5 Sections dynamiques

#### Maintenances à Venir
- Affiche les 5 prochaines maintenances planifiées
- Filtre : Date >= aujourd'hui, statut != terminée/annulée
- Tri : Par date de planification (croissant)
- Affichage :
  - Description de la maintenance
  - Date planifiée (format dd/MM/yyyy)
  - Type de maintenance
  - Bouton "Voir" pour accéder aux détails

#### Incidents en Cours
- Affiche les 5 incidents les plus récents
- Filtre : Statut = nouveau, en cours, ou en attente
- Tri : Par date de création (décroissant)
- Affichage :
  - Type d'incident (format lisible)
  - Lieu
  - Date et heure de création
  - Bouton "Voir" pour accéder aux détails

### 1.6 Informations importantes

Section informative affichant :
- **Rôle :** Technicien Polyvalent - Homme à tout faire, gestion des tâches et maintenances planifiées
- **Planning :** Possibilité d'établir et gérer son propre planning de tâches
- **Incidents :** Consultation uniquement des tickets QHSE assignés (pas de déclaration d'incidents)
- **Maintenances :** Consultation de l'historique et suivi des interventions planifiées
- **Tâches :** Consultation, mise à jour du statut et organisation du planning

### 1.7 Permissions et accès

#### Permissions accordées (d'après `src/lib/data.ts`)
```typescript
technicien_polyvalent: [
  { id: 'portalTechnicienPolyvalent', name: 'Portail Technicien Polyvalent', icon: 'Wrench' },
  ...findPerms(['maintenanceHistory', 'myTasks', 'planningTasks', 'personalInfo', 'qhseTickets'])
]
```

#### Accès spécifiques
- **Tickets QHSE :** Filtrage automatique pour afficher uniquement les tickets assignés au technicien
- **Tâches planifiées :** Accès aux tâches assignées ou créées par le technicien
- **Création de tâches :** Le technicien polyvalent peut créer des tâches planifiées (d'après `TaskPlanning.tsx`)

### 1.8 Données traitées

#### Props reçues
- `user: User` - Informations de l'utilisateur connecté
- `maintenanceTasks: MaintenanceTask[]` - Liste des tâches de maintenance
- `incidents: Incident[]` - Liste des incidents
- `notifications: Notification[]` - Notifications de l'utilisateur
- `onNavigate: (tabId: string) => void` - Fonction de navigation

#### Calculs effectués
- **Maintenances en attente :** Filtrage par statut (planifiée, en_cours)
- **Incidents en cours :** Filtrage par statut (nouveau, cours, attente)
- **Maintenances à venir :** Filtrage par date et statut, tri par date
- **Incidents récents :** Filtrage par statut, tri par date de création

### 1.9 Fonctionnalités d'export

#### Export PDF
- Génération via `generatePortalReportPDF('technicien_polyvalent', {...})`
- Données exportées :
  - Informations utilisateur
  - Tâches de maintenance
  - Incidents

#### Export Excel
- Via composant `PortalExcelActions`
- Type : `technicien_polyvalent`
- Données exportées :
  - Informations utilisateur
  - Tâches de maintenance
  - Incidents

---

## 2. PORTAIL BUANDERIE

### 2.1 Vue d'ensemble

Le **Portail Buanderie** est conçu pour les buandières qui gèrent le suivi et la traçabilité du linge dans l'établissement. Le portail est supervisé par le Service QHSE.

**Fichier source :** `src/components/portals/BuanderiePortal.tsx`

**Rôle associé :** `buandiere`

**Superviseur :** Service QHSE

### 2.2 Design et Interface

#### En-tête personnalisé
- **Gradient de couleurs :** Cyan-600 → Blue-600 → Teal-600
- **Icône :** Shirt (Chemise)
- **Informations affichées :**
  - Nom complet de l'utilisateur (civilité, prénom, nom)
  - Date et heure actuelles (format français)
  - Information : "Superviseur : Service QHSE"

#### Actions disponibles dans l'en-tête
- **Export Excel :** Via `PortalExcelActions` (type: `buanderie`)
- **Export PDF :** Génération de rapport PDF avec les données suivantes :
  - Informations utilisateur

### 2.3 Statistiques en temps réel

Le portail affiche 4 cartes de statistiques (valeurs actuellement affichées comme "-") :

| Carte | Métrique | Icône | Couleur | Navigation |
|-------|----------|-------|---------|------------|
| **Suivis Actifs** | Nombre de suivis actifs | Shirt | Cyan | `qhseLaundry` |
| **En Réception** | Linge en réception | Package | Bleu | `qhseLaundry` |
| **En Lavage** | Linge en lavage | Droplet | Teal | `qhseLaundry` |
| **En Distribution** | Linge en distribution | Truck | Vert | `qhseLaundry` |

**Note :** Les statistiques ne sont pas encore calculées dynamiquement. Toutes les cartes redirigent vers le module de suivi du linge.

### 2.4 Accès rapides

Le portail propose 4 cartes d'accès rapide :

#### 1. Suivi et Traçabilité du Linge
- **Navigation :** `qhseLaundry`
- **Fonctionnalités :**
  - Enregistrer la réception du linge sale
  - Suivre le lavage et la désinfection
  - Gérer le séchage et le repassage
  - Enregistrer la distribution du linge propre
  - Traçabilité complète du processus
- **Icône :** Shirt (Cyan)
- **Module principal :** `LaundryTrackingList.tsx`

#### 2. Mes Informations
- **Navigation :** `personalInfo`
- **Fonctionnalités :**
  - Consulter le profil
  - Modifier le mot de passe
  - Voir les notifications
- **Icône :** User (Bleu)

#### 3. Incident de Sécurité
- **Navigation :** `reportSecurityIncident`
- **Fonctionnalités :**
  - Déclarer un incident de sécurité
  - Ajouter les détails et photos
  - Suivi par le service sécurité
- **Icône :** Shield (Indigo)

#### 4. Déclarer équipement HS
- **Navigation :** `reportBiomedicalIncident`
- **Fonctionnalités :**
  - Renseigner l'équipement concerné
  - Ajouter le lieu et la priorité
  - Suivi assuré par le biomédical
- **Icône :** Stethoscope (Teal)

### 2.5 Module de Suivi du Linge

Le module principal du portail buanderie est le **Suivi et Traçabilité du Linge** (`LaundryTrackingList.tsx`).

#### Fonctionnalités principales

##### 1. Gestion des suivis (CRUD)
- **Création :** Formulaire complet en 4 étapes (onglets)
- **Modification :** Édition des suivis existants (uniquement pour la buandière)
- **Suppression :** Suppression avec confirmation
- **Consultation :** Vue détaillée en lecture seule

##### 2. Permissions
- **Buandière :** Accès complet (création, modification, suppression)
- **Autres rôles (ex: QHSE) :** Accès en lecture seule uniquement
- Vérification via `canManageLaundry(role)` dans `src/lib/permissions.ts`

##### 3. Formulaire de suivi (4 étapes)

**Étape 1 : Réception**
- Service émetteur *
- Période concernée
- Date d'établissement *
- Date de réception *
- Service d'origine *
- Type de linge * (draps, coussins, blouses, gants, masques, autoclave, autre)
- Poids (kg)
- Quantité
- État du linge

**Étape 2 : Lavage**
- Date de lavage
- Machine utilisée
- Cycle / Température
- Produit lessiviel utilisé
- Durée du cycle (minutes)
- Agent de lavage
- Contrôle visuel (checkbox)
- Observations

**Étape 3 : Séchage**
- Date de séchage
- Type de séchage (sèche-linge, naturel, autre)
- Température (°C)
- Durée (minutes)
- Repassage effectué par
- Contrôle qualité (checkbox)

**Étape 4 : Distribution**
- Date de livraison
- Service destinataire
- Type / Quantité livrée
- Quantité livrée
- État du linge livré
- Heure de livraison
- Agent livreur
- Réceptionnaire (Nom)
- Statut * (en_reception, en_lavage, en_sechage, en_pliage, en_stockage, en_distribution, termine, non_conforme)

##### 4. Statuts disponibles
| Statut | Label | Couleur |
|--------|-------|---------|
| `en_reception` | En réception | Bleu |
| `en_lavage` | En lavage | Cyan |
| `en_sechage` | En séchage | Jaune |
| `en_pliage` | En pliage | Teal |
| `en_stockage` | En stockage | Gris |
| `en_distribution` | En distribution | Vert |
| `termine` | Terminé | Vert |
| `non_conforme` | Non conforme | Rouge |

##### 5. Tableau de suivi
- Colonnes affichées :
  - Date Réception
  - Service Origine
  - Type Linge
  - Poids/Qté
  - Statut (badge coloré)
  - Actions (Voir détails, Modifier, Supprimer)

##### 6. Recherche et filtrage
- Recherche par : service, type de linge, statut
- Filtrage en temps réel via `useFilterAndSearch`

##### 7. Vue détaillée
- Dialog modal avec 4 onglets (Réception, Lavage, Séchage, Distribution)
- Affichage en lecture seule de toutes les informations
- Formatage des dates (dd/MM/yyyy)
- Affichage des contrôles (✅ Conforme / ❌ Non conforme)

### 2.6 Informations importantes

Section informative affichant :
- **Superviseur :** Le Service QHSE peut consulter et valider les enregistrements
- **Traçabilité :** Tous les enregistrements sont tracés et consultables par le superviseur QHSE
- **Non-conformités :** Possibilité d'enregistrer les non-conformités pour un suivi correctif

### 2.7 Permissions et accès

#### Permissions accordées (d'après `src/lib/data.ts`)
```typescript
buandiere: [
  { id: 'portalBuanderie', name: 'Portail Buanderie', icon: 'Shirt' },
  ...findPerms(['qhseLaundry', 'personalInfo', 'reportIncident', 'reportSecurityIncident', 'reportBiomedicalIncident'])
]
```

#### Permissions spécifiques
- **Gestion du linge :** Seule la buandière peut créer/modifier/supprimer les suivis
- **Consultation :** Le superviseur QHSE a un accès en lecture seule
- **Déclaration d'incidents :** La buandière peut déclarer des incidents (sécurité, entretien, biomédical)

### 2.8 Données traitées

#### Props reçues
- `user: User` - Informations de l'utilisateur connecté
- `notifications: Notification[]` - Notifications de l'utilisateur
- `onNavigate: (tabId: string) => void` - Fonction de navigation

#### API utilisée
- `apiClient.getLaundryTracking()` - Récupération des suivis
- `apiClient.createLaundryTracking(formData)` - Création d'un suivi
- `apiClient.updateLaundryTracking(id, formData)` - Mise à jour d'un suivi
- `apiClient.deleteLaundryTracking(id)` - Suppression d'un suivi

### 2.9 Fonctionnalités d'export

#### Export PDF
- Génération via `generatePortalReportPDF('buanderie', {...})`
- Données exportées :
  - Informations utilisateur

#### Export Excel
- Via composant `PortalExcelActions`
- Type : `buanderie`
- Données exportées :
  - Informations utilisateur

---

## 3. COMPARAISON ET SYNTHÈSE

### 3.1 Points communs

| Aspect | Technicien Polyvalent | Buanderie |
|--------|----------------------|-----------|
| **Design** | Gradient cyan/blue/teal | Gradient cyan/blue/teal |
| **Export PDF** | ✅ Disponible | ✅ Disponible |
| **Export Excel** | ✅ Disponible | ✅ Disponible |
| **Informations utilisateur** | ✅ Affichées | ✅ Affichées |
| **Date/heure** | ✅ Format français | ✅ Format français |
| **Section informative** | ✅ Présente | ✅ Présente |
| **Accès rapides** | ✅ 4 cartes | ✅ 4 cartes |
| **Statistiques** | ✅ 4 cartes (calculées) | ✅ 4 cartes (à calculer) |

### 3.2 Différences principales

| Aspect | Technicien Polyvalent | Buanderie |
|--------|----------------------|-----------|
| **Rôle principal** | Maintenance polyvalente | Gestion du linge |
| **Module principal** | Planning des tâches | Suivi du linge |
| **Données principales** | MaintenanceTasks, Incidents | LaundryTracking |
| **Filtrage automatique** | Tickets assignés uniquement | Aucun filtrage |
| **Création de tâches** | ✅ Peut créer des tâches planifiées | ❌ Ne peut pas créer de tâches |
| **Déclaration d'incidents** | ❌ Ne peut pas déclarer | ✅ Peut déclarer (sécurité, biomédical) |
| **Statistiques** | Calculées dynamiquement | À implémenter |
| **Sections dynamiques** | Maintenances à venir, Incidents récents | Aucune |

### 3.3 Complexité des modules

| Module | Complexité | Raison |
|--------|------------|--------|
| **Technicien Polyvalent** | Moyenne | Gestion de plusieurs types de données (maintenances, incidents, tâches) |
| **Buanderie** | Élevée | Module de suivi du linge très complet avec 4 étapes, nombreux champs, traçabilité |

### 3.4 Intégration dans l'application

#### Technicien Polyvalent
- Intégré dans `DashboardPage.tsx`
- Filtrage automatique des tickets QHSE
- Accès au planning des tâches avec permissions de création
- Navigation vers : maintenanceHistory, myTasks, planningTasks, qhseTickets

#### Buanderie
- Intégré dans `DashboardPage.tsx`
- Module de suivi du linge intégré dans les modules QHSE
- Navigation vers : qhseLaundry, personalInfo, reportSecurityIncident, reportBiomedicalIncident

---

## 4. RECOMMANDATIONS

### 4.1 Portail Technicien Polyvalent

#### Améliorations suggérées
1. **Calcul des "Mes Tâches"**
   - Actuellement affiché comme "-"
   - Implémenter le calcul depuis `plannedTasks` filtrés par `assigned_to === user.id`

2. **Amélioration des statistiques**
   - Ajouter un compteur pour les tâches planifiées créées par le technicien
   - Ajouter un graphique d'évolution des maintenances

3. **Notifications**
   - Afficher les notifications non lues dans le portail
   - Alertes pour les maintenances urgentes

4. **Filtrage avancé**
   - Permettre de filtrer les maintenances par type
   - Permettre de filtrer les incidents par priorité

### 4.2 Portail Buanderie

#### Améliorations suggérées
1. **Calcul des statistiques**
   - Implémenter le calcul dynamique des statistiques :
     - Suivis actifs (total)
     - En réception (statut = en_reception)
     - En lavage (statut = en_lavage)
     - En distribution (statut = en_distribution)

2. **Graphiques et visualisations**
   - Graphique d'évolution du volume de linge traité
   - Graphique par type de linge
   - Graphique par service d'origine

3. **Alertes et notifications**
   - Alertes pour les non-conformités
   - Notifications pour les livraisons en retard
   - Rappels pour les contrôles qualité

4. **Amélioration du formulaire**
   - Validation des champs obligatoires
   - Suggestions automatiques pour les services
   - Historique des machines utilisées

5. **Rapports avancés**
   - Rapport de traçabilité complet
   - Rapport de performance (temps de traitement)
   - Rapport de conformité

### 4.3 Améliorations communes

1. **Performance**
   - Mise en cache des données pour améliorer les temps de chargement
   - Pagination pour les grandes listes

2. **Accessibilité**
   - Améliorer le contraste des couleurs
   - Ajouter des labels ARIA
   - Support clavier complet

3. **Responsive design**
   - Optimisation pour tablettes
   - Amélioration de l'affichage mobile

4. **Documentation**
   - Guide d'utilisation pour chaque portail
   - Vidéos tutoriels
   - FAQ

---

## 5. CONCLUSION

Les deux portails sont bien intégrés dans l'application et offrent des fonctionnalités adaptées à leurs rôles respectifs. Le **Portail Technicien Polyvalent** se concentre sur la gestion des maintenances et des interventions, tandis que le **Portail Buanderie** se concentre sur la traçabilité complète du linge.

### Points forts
- ✅ Design cohérent et moderne
- ✅ Navigation intuitive
- ✅ Fonctionnalités d'export (PDF, Excel)
- ✅ Permissions bien gérées
- ✅ Module de suivi du linge très complet

### Points à améliorer
- ⚠️ Calcul des statistiques pour le portail buanderie
- ⚠️ Affichage des "Mes Tâches" pour le technicien polyvalent
- ⚠️ Ajout de graphiques et visualisations
- ⚠️ Amélioration de la gestion des notifications

---

**Fin du rapport**


