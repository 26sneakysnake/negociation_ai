# 🎯 NegotiAI Coach - Guide de Démo

Ce guide explique comment tester l'extension NegotiAI Coach **sans avoir besoin d'un vrai appel vidéo**.

## 🚀 Démarrage Rapide

### 1. Démarrer le Backend

```powershell
# Dans un terminal PowerShell
cd C:\Users\seifo\OneDrive\Desktop\vocal\negociation_ai
.\venv\Scripts\activate
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```

**Laissez ce terminal ouvert** - le backend doit rester actif.

### 2. Générer les Icônes de l'Extension

```powershell
# Dans un nouveau terminal
cd C:\Users\seifo\OneDrive\Desktop\vocal\negociation_ai
python create_extension_icons.py
```

### 3. Charger l'Extension dans Chrome

1. Ouvrez Chrome et allez sur : `chrome://extensions/`
2. Activez **"Mode développeur"** (toggle en haut à droite)
3. Cliquez **"Charger l'extension non empaquetée"**
4. Sélectionnez : `C:\Users\seifo\OneDrive\Desktop\vocal\negociation_ai\browser-extension`
5. ✅ L'extension est installée !

### 4. Lancer la Page de Démo

```powershell
# Dans un nouveau terminal
cd C:\Users\seifo\OneDrive\Desktop\vocal\negociation_ai
python demo/serve_demo.py
```

Cela va :
- Démarrer un serveur HTTP sur http://localhost:8080
- Ouvrir automatiquement la page de démo dans votre navigateur
- L'extension s'activera automatiquement et affichera l'overlay NegotiAI

## 🎮 Utilisation de la Démo

### Interface de la Page

La page de démo simule un appel vidéo et vous permet de tester différents scénarios de négociation :

1. **Cliquez sur "Démarrer la simulation"**
2. **Sélectionnez un scénario** parmi :
   - 🎯 **Anchoring Agressif** : Offre initiale très basse
   - ⏰ **Urgence Artificielle** : Pression temporelle
   - 🎭 **Good Cop / Bad Cop** : Alternance menace/concession
   - 🔧 **Nibble Technique** : Demandes supplémentaires après accord
   - 🤐 **Silence Tactique** : Utilisation du silence

3. **Observez l'overlay NegotiAI** qui devrait :
   - Apparaître automatiquement sur la page
   - Afficher des suggestions en temps réel
   - Détecter les patterns de manipulation
   - Proposer des contre-stratégies

### Ce que Vous Devriez Voir

**L'overlay NegotiAI** apparaît avec :
- 🎯 **Icône et titre** : "NegotiAI Coach"
- 📊 **Score de manipulation** : Détection en temps réel
- 💡 **Suggestions tactiques** : Basées sur les patterns détectés
- 📝 **Transcription live** : Ce qui est dit dans la négociation
- ⚡ **Mode Auto-Pilot** : Disponible pour certains patterns

## 🐛 Dépannage

### L'overlay n'apparaît pas

1. **Vérifiez que l'extension est chargée** :
   - Allez sur `chrome://extensions/`
   - "NegotiAI Coach - Live Assistant" doit être actif
   - Vérifiez qu'il n'y a pas d'erreurs

2. **Rechargez l'extension** :
   - Sur `chrome://extensions/`, cliquez sur l'icône de rechargement (↻) de l'extension

3. **Rechargez la page de démo** :
   - Appuyez sur `F5` ou `Ctrl+R`

4. **Vérifiez la console** :
   - Appuyez sur `F12` pour ouvrir les DevTools
   - Allez dans l'onglet "Console"
   - Vous devriez voir : `🎯 NegotiAI extension loaded`

### Le backend ne répond pas

1. **Vérifiez qu'il est lancé** :
   - Ouvrez http://localhost:8000/docs dans votre navigateur
   - Vous devriez voir la documentation de l'API

2. **Vérifiez les logs du backend** :
   - Dans le terminal où tourne uvicorn
   - Cherchez des erreurs

### L'extension ne se charge pas

1. **Erreur d'icônes manquantes** :
   ```powershell
   python create_extension_icons.py
   ```

2. **Erreur de manifest** :
   - Supprimez l'extension de Chrome
   - Rechargez-la via "Charger l'extension non empaquetée"

## 📊 Tests Recommandés

### Test 1 : Détection d'Anchoring

1. Démarrez la simulation
2. Cliquez sur "Anchoring Agressif"
3. **Attendu** : L'overlay détecte une "offre d'ancrage basse" et suggère de recadrer

### Test 2 : Urgence Artificielle

1. Démarrez la simulation
2. Cliquez sur "Urgence Artificielle"
3. **Attendu** : L'overlay détecte la pression temporelle et suggère de ralentir

### Test 3 : Good Cop / Bad Cop

1. Démarrez la simulation
2. Cliquez sur "Good Cop / Bad Cop"
3. **Attendu** : L'overlay identifie la tactique et propose une stratégie de défense

## 🔧 Architecture de Test

```
┌─────────────────┐
│  Page Démo      │  <- Simule un appel vidéo
│  (Port 8080)    │
└────────┬────────┘
         │
         │ (Extension injectée)
         ↓
┌─────────────────┐
│  Extension      │  <- Overlay NegotiAI
│  (Content.js)   │
└────────┬────────┘
         │
         │ (WebSocket)
         ↓
┌─────────────────┐
│  Backend API    │  <- Analyse et suggestions
│  (Port 8000)    │
└─────────────────┘
```

## 🎨 Personnalisation

### Ajouter un Nouveau Scénario

Éditez `demo/demo_call.html` et ajoutez dans l'objet `scenarios` :

```javascript
nouveauScenario: [
    { speaker: 'other', text: "Message de l'interlocuteur" },
    { speaker: 'user', text: "Votre réponse" },
    // ...
]
```

Puis ajoutez un bouton dans le HTML :

```html
<button class="scenario-btn" data-scenario="nouveauScenario">
    <div class="title">🎯 Titre du Scénario</div>
    <div class="desc">Description courte</div>
</button>
```

## 📞 Test avec un Vrai Appel (Optionnel)

Si vous voulez tester avec un vrai appel :

1. **Google Meet** :
   - Créez une réunion sur https://meet.google.com
   - Rejoignez-la (même seul)
   - L'extension s'activera automatiquement

2. **Zoom** :
   - Lancez une réunion Zoom
   - L'extension s'activera sur `*.zoom.us`

3. **Teams** :
   - Lancez un appel Teams
   - L'extension s'activera sur `teams.microsoft.com`

## 🎉 Résultat Attendu

Une fois tout configuré correctement, vous devriez voir :

1. ✅ Page de démo avec simulation d'appel
2. ✅ Overlay NegotiAI flottant sur la page
3. ✅ Suggestions qui apparaissent en temps réel quand vous cliquez sur les scénarios
4. ✅ Détection des patterns de manipulation
5. ✅ Propositions de contre-stratégies

**Profitez de votre démo NegotiAI Coach ! 🚀**

---

**Conseil** : Testez tous les scénarios pour voir comment l'IA détecte et répond à différentes tactiques de négociation !
