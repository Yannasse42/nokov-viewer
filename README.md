 # 🦵 Nokov Viewer

**Logiciel d’analyse de marche 3D — compatible markerless Nokov**

🎯 *Nokov Viewer* permet de visualiser, analyser et comparer des données cinématiques issues de systèmes de motion capture Nokov (HTR + TRC).

Il s’appuie sur les modèles biomécaniques standard **CGM** et **Helen Hayes** et propose :

- ✔ Courbes cinématiques multi-plans (sagittal / frontal / transverse)
- ✔ Paramètres spatio-temporels (PST)
- ✔ Bande normative (±1 SD) affichée automatiquement si un *static* est détecté
- ✔ Analyse bilatérale & comparaison multi-essais
- ✔ UI moderne et responsive (Electron)
- ✔ Export et sauvegarde des analyses

---

## 🧑‍💻 Fonctionnalités principales

| Catégorie | Détails |
|---------|---------|
| Cinématique 3D | Hanche / Genou / Cheville — Flex/Ext · Add/Abd · Rot int/ext |
| PST avancés | Cadence, vitesse, temps d’appui/oscillation, longueur pas/foulée |
| Comparaison | Δ automatiques et visualisation intuitive |
| Multilingue | 🇫🇷 FR – 🇬🇧 EN – 🇨🇳 ZH |
| Lecture directe | `.HTR` + `.TRC` |
| Affichage dynamique | Graphes synchronisés des deux côtés |

---

## 📂 Formats supportés

| Type | Extension | Description |
|------|-----------|-------------|
| Motion Capture | `.TRC` | Positions marqueurs |
| Angles articulaires | `.HTR` | Rotation / Translation par segment |

📌 *Détection automatique du modèle biomécanique (CGM / Helen Hayes).*

---

## 🏗 Installation

Télécharger la dernière version Windows ici :  
👉 **Releases GitHub** *(sera complété lors de la 1ère release)*

Puis lancer :  
**Nokov-Viewer-Setup-v1.1.0.exe**

---

## ▶️ Mode développement

```sh
npm install
npm start
