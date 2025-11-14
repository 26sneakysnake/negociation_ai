# NegotiAI Coach - Browser Extension

Extension navigateur pour afficher les suggestions AI directement sur vos appels vidéo (Google Meet, Zoom, Microsoft Teams).

## ✨ Fonctionnalités

- **Overlay sur appels vidéo** : Suggestions AI superposées sur Google Meet, Zoom, Teams
- **Temps réel** : Connexion WebSocket avec le backend
- **Draggable** : Déplacez l'overlay où vous voulez
- **Minimize/Maximize** : Contrôlez la visibilité
- **Notifications** : Alertes pour suggestions critiques
- **Transcription live** : Voir la conversation en temps réel

## 🚀 Installation

### Chrome / Edge

1. Ouvrez Chrome/Edge
2. Allez à `chrome://extensions/`
3. Activez **Mode développeur** (en haut à droite)
4. Cliquez **Charger l'extension non empaquetée**
5. Sélectionnez le dossier `browser-extension/`

### Firefox

1. Ouvrez Firefox
2. Allez à `about:debugging#/runtime/this-firefox`
3. Cliquez **Charger un module complémentaire temporaire**
4. Sélectionnez le fichier `browser-extension/manifest.json`

## 📱 Utilisation

### 1. Démarrez le backend

```bash
# Option simple (recommandée)
python start_simple.py

# Ou avec Docker
docker-compose up
```

### 2. Rejoignez un appel vidéo

- Google Meet: https://meet.google.com/...
- Zoom: https://*.zoom.us/...
- Microsoft Teams: https://teams.microsoft.com/...

### 3. L'extension s'active automatiquement

L'overlay apparaît automatiquement en bas à droite :

```
┌─────────────────────────────┐
│ 🎯 NegotiAI Coach          │
│ [⬆️] [✕]                    │
├─────────────────────────────┤
│ ● Connected                 │
│ [Disconnect]                │
│                             │
│ 💡 Latest Suggestion:       │
│ "Ask about their timeline"  │
│                             │
│ 📝 Live Transcript          │
│ Counterparty: "We need..."  │
└─────────────────────────────┘
```

### 4. Connectez-vous

1. Cliquez **Connect** dans l'overlay
2. L'extension crée une session automatiquement
3. Les suggestions apparaissent en temps réel

## ⚙️ Configuration

### Backend URL

Par défaut : `http://localhost:8000`

Pour changer, éditez `browser-extension/scripts/content.js` :

```javascript
const CONFIG = {
  apiUrl: 'http://votre-serveur:8000',
  wsUrl: 'ws://votre-serveur:8000/ws/live'
};
```

### Sites supportés

Pour ajouter d'autres sites, modifiez `manifest.json` :

```json
{
  "content_scripts": [{
    "matches": [
      "https://meet.google.com/*",
      "https://*.zoom.us/*",
      "https://teams.microsoft.com/*",
      "https://votre-site.com/*"  // Ajoutez ici
    ]
  }]
}
```

## 🎨 Personnalisation

### Taille de l'overlay

Editez `styles/overlay.css` :

```css
.negotiai-overlay {
  width: 400px;  /* Changez ici */
  max-height: 80vh;
}
```

### Position par défaut

```css
.negotiai-overlay {
  right: 20px;  /* Distance du bord droit */
  bottom: 20px; /* Distance du bas */
}
```

## 🔧 Debugging

### Console du navigateur

```javascript
// Dans la console de la page
negotiai.status()         // État de la connexion
negotiai.reconnect()      // Forcer la reconnexion
negotiai.clearSuggestions() // Effacer l'historique
```

### Logs

Les logs apparaissent dans :
- **Console de la page** (F12 > Console)
- **Extension background** (chrome://extensions > Détails > Inspecter les vues)

### Problèmes courants

**L'overlay n'apparaît pas**
- Vérifiez que l'extension est activée
- Rechargez la page de l'appel
- Vérifiez la console pour les erreurs

**Connexion échoue**
- Le backend est-il démarré ? (`http://localhost:8000/api/health`)
- CORS activé sur le backend ?
- Pare-feu bloque le port 8000 ?

**Pas de suggestions**
- Connecté au WebSocket ?
- Audio capturé ?
- Vérifiez les logs backend

## 📊 Features détaillées

### Auto-Pilot

L'overlay affiche un badge **🤖 Auto-Pilot Available** quand une suggestion peut être exécutée automatiquement.

### Suggestions prioritaires

- **🔴 Critical** : Bordure rouge, notification sonore
- **🟠 High** : Bordure orange
- **🔵 Medium** : Bordure bleue
- **⚪ Low** : Bordure grise

### Transcript live

Le transcript s'affiche en temps réel avec :
- **Émojis** pour identifier les speakers
- **Émotions** détectées
- **Horodatage** de chaque message

## 🛡️ Permissions

L'extension demande :

- `activeTab` : Accès à l'onglet actif
- `storage` : Sauvegarder session ID
- Accès aux domaines de visioconférence

## 🔒 Sécurité & Confidentialité

- **Aucune donnée n'est sauvegardée** par l'extension
- Tout passe par votre backend local
- Session ID stocké localement uniquement
- Aucune connexion à des serveurs tiers

## 📝 Développement

### Structure

```
browser-extension/
├── manifest.json           # Configuration extension
├── scripts/
│   ├── content.js         # Injection dans pages
│   ├── background.js      # Service worker
│   └── popup.js           # Popup extension
├── styles/
│   └── overlay.css        # Styles de l'overlay
├── popup.html             # UI du popup
└── icons/                 # Icônes (à créer)
```

### Tester les modifications

1. Faites vos changements
2. Allez à `chrome://extensions/`
3. Cliquez ⟳ sur l'extension
4. Rechargez la page de l'appel

### Build pour production

```bash
# Créer un ZIP
cd browser-extension
zip -r negotiai-extension.zip . -x "*.git*" -x "README.md"
```

## 🎯 Roadmap

- [ ] Support audio bidirectionnel
- [ ] Hotkeys pour actions rapides
- [ ] Thèmes sombre/clair
- [ ] Export des transcripts
- [ ] Intégration calendrier
- [ ] Multi-langues
- [ ] Statistiques de négociation

## 💡 Tips

### Raccourcis clavier

(À implémenter)
- `Ctrl+Shift+N` : Toggle overlay
- `Ctrl+Shift+C` : Connecter/Déconnecter
- `Ctrl+Shift+M` : Minimize/Maximize

### Meilleure expérience

- Utilisez un **écran large** pour avoir l'espace
- **Positionnez l'overlay** à côté de la vidéo
- **Headphones** pour éviter l'écho
- **Connexion stable** pour le WebSocket

## 🆘 Support

Pour les problèmes :
1. Vérifiez les logs backend
2. Console navigateur (F12)
3. GitHub Issues

## 📄 Licence

Développé pour Hackathon Pioneers AI Lab @StationF
