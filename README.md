 Nokov Viewer

🎯 **Nokov Viewer** est un logiciel pour visualiser, analyser et comparer des données de marche 3D issues de systèmes de motion capture *markerless* Nokov.  
Il exploite les modèles biomécaniques standards **CGM** et **Helen Hayes**, et fournit :

✔ Courbes cinématiques multi-articulaires  
✔ Paramètres spatio-temporels (PST)  
✔ Analyse bilatérale et comparaisons inter-essais  
✔ Visualisation synchronisée des plans sagittal / frontal / transverse  
✔ Export et sauvegarde des analyses

---

## 🧑‍💻 Fonctionnalités principales

| Catégorie | Détails |
|----------|---------|
| **Cinématique 3D** | Hanche / Genou / Cheville — Flex/Ext, Add/Abd, Rot int/ext |
| **PST avancés** | Cadence, vitesse, temps d’appui/oscillation, longueur de pas/foulée |
| **Comparaison** | Différences Δ automatiques avec mise en évidence visuelle |
| **Multilingue** | 🇫🇷 Français – 🇬🇧 Anglais – 🇨🇳 Chinois |
| **Lecture directe** | Analyse des fichiers `HTR` & `TRC` |
| **UI moderne** | Interface Electron fluide et responsive |

---

## 📂 Formats supportés

| Type | Extension | Description |
|------|-----------|-------------|
| Motion capture | `.TRC` | Positions marqueurs |
| Modèle articulations | `.HTR` | Angles articulaires |

📌 Détection automatique du modèle (CGM / Helen Hayes)

---

## 🏗 Installation

Téléchargez la dernière version Windows ici :  
👉 **Releases GitHub** : *(à compléter après première release)*

Exécuter simplement :  
`Nokov-Viewer-Setup-1.0.0.exe`

---

## ▶️ Exécution en mode développement

```sh
npm install
npm start
📦 Build d’une release installable
sh
Copier le code
npm run dist
➡ Génère un installateur Windows (.exe) dans le dossier dist/

🗺 Roadmap
 Export PDF du rapport d’analyse

 Intégration des modèles biomécaniques personnalisés

 Vue 3D + relecture animée du cycle de marche

 Support macOS / Linux

👨‍💻 Technologies
Domaine	Outils
UI / App	Electron 38
Graphiques	Chart.js + zoom plugin
Python backend	Analyse biomécanique (.py inclus)

© Auteur
Yann Villard — Analyse du mouvement & développement d’applications
📧 (à ajouter si tu veux)

Licence
Ce logiciel est publié sous licence ISC — voir LICENSE.
