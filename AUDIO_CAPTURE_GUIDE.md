# 🎤 Guide d'Utilisation - Capture Audio Réelle

## ✅ Fonctionnalité Implémentée

L'extension NegotiAI Coach peut maintenant **capturer et transcrire l'audio en temps réel depuis votre microphone** pendant un appel Google Meet.

### ⚠️ Limitation Importante

Pour des raisons de sécurité et de restrictions techniques de Chrome Manifest V3, l'extension capture actuellement **votre microphone** (ce que vous dites) plutôt que l'audio complet de l'onglet Google Meet (qui inclurait votre interlocuteur).

**Cela signifie** : La transcription fonctionne pour vos propres paroles pendant la négociation. Les suggestions IA analysent ce que vous dites pour vous guider.

## 🔧 Technologies Utilisées

1. **getUserMedia API** : Capture l'audio depuis le microphone de l'utilisateur
2. **Offscreen Document (Manifest V3)** : Permet l'accès aux Web APIs dans une extension
3. **Web Speech API** : Transcription vocale automatique en français
4. **WebSocket** : Envoi des transcriptions au backend pour analyse IA

### Architecture Technique

```
Microphone de l'utilisateur
    ↓
getUserMedia API (dans offscreen.js)
    ↓
Web Speech API (SpeechRecognition en français)
    ↓
Transcription en temps réel
    ↓
Offscreen Document → Background Service Worker
    ↓
Content Script (WebSocket)
    ↓
Backend FastAPI → AI Engine
    ↓
Suggestions affichées dans l'overlay
```

**Pourquoi un Offscreen Document ?**

Les service workers (background.js en Manifest V3) n'ont **pas accès** aux Web APIs comme `SpeechRecognition`, `getUserMedia` ou l'objet `window`. L'offscreen document est une page HTML invisible qui tourne en arrière-plan et a accès à toutes les Web APIs nécessaires pour la capture audio et la transcription.

## 🚀 Comment Utiliser

### 1. Rechargez l'Extension

Après avoir mis à jour le code :

1. Allez sur `chrome://extensions/`
2. Trouvez **"NegotiAI Coach - Live Assistant"**
3. Cliquez sur l'icône de rechargement **↻**

### 2. Lancez le Backend

```powershell
cd C:\Users\seifo\OneDrive\Desktop\vocal\negociation_ai
.\venv\Scripts\activate
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```

### 3. Rejoignez un Appel Google Meet

1. Ouvrez https://meet.google.com
2. Créez ou rejoignez une réunion
3. **Important** : Activez votre microphone (même si vous ne parlez pas)

### 4. Activez NegotiAI Coach

L'overlay devrait apparaître automatiquement sur la page Google Meet.

Si ce n'est pas le cas :
- Cliquez sur l'icône de l'extension dans Chrome
- Ou rechargez la page Google Meet

### 5. Connectez-vous au Backend

1. Dans l'overlay, cliquez sur **"Connect"**
2. Attendez que le statut passe à **"Connected" (vert)**

### 6. Démarrez la Capture Audio

1. Cliquez sur **"🎤 Start Audio"**
2. Chrome va demander la permission de capturer l'audio de l'onglet
3. **Acceptez** la permission
4. Le bouton devient **"🎤 Stop Audio"** (rouge)

### 7. Observez la Transcription

- **Parlez** ou demandez à quelqu'un de parler dans l'appel
- La transcription apparaît dans la section **"Live Transcript"**
- Les suggestions IA apparaissent dans la section **"Suggestions"**

## 🎯 Ce qui Se Passe en Arrière-Plan

```
Votre Microphone
       ↓
getUserMedia (offscreen.js)
       ↓
Web Speech API (transcription FR)
       ↓
Offscreen → Background (background.js)
       ↓
Content Script (content.js)
       ↓
WebSocket → Backend (main.py)
       ↓
AI Engine (analyse + suggestions)
       ↓
Overlay (affichage)
```

## 📝 Détection du Locuteur

**Important** : Actuellement, l'extension capture **uniquement votre microphone**.
- Toutes les transcriptions sont marquées comme "user" (vous)
- L'analyse IA se base sur vos paroles pour générer des suggestions

**Pour une utilisation optimale** : Résumez verbalement ce que dit votre interlocuteur pour que l'IA comprenne le contexte. Par exemple : "Il propose 10,000 euros" ou "Elle dit que c'est son offre finale".

### Améliorations Futures Possibles

Pour capturer l'audio complet de Google Meet (y compris l'interlocuteur) :
- Développer une extension native (hors navigateur) avec accès système
- Attendre que Chrome étende les permissions de tabCapture en Manifest V3
- Utiliser une application de bureau complémentaire pour la capture audio
- Bouton manuel pour marquer qui parle dans la conversation

## ⚠️ Limitations

### 1. Permissions Chrome

Chrome demande la permission de capturer l'audio de l'onglet. **Vous devez accepter**.

### 2. Langue

L'API Speech Recognition est configurée en **français (fr-FR)**.

Pour changer la langue, modifiez dans `background.js` :
```javascript
recognition.lang = 'fr-FR'; // Changez ici (ex: 'en-US', 'es-ES')
```

### 3. Précision de Transcription

La précision dépend :
- De la qualité du microphone
- Du bruit de fond
- De l'accent
- De la connexion internet

### 4. Latence

Il peut y avoir un léger délai (1-3 secondes) entre :
- Ce qui est dit
- L'affichage de la transcription
- La suggestion IA

## 🐛 Dépannage

### L'audio n'est pas capturé

**Vérifiez** :
1. Vous avez cliqué sur "🎤 Start Audio"
2. Vous avez **accepté** la permission Chrome
3. L'appel Google Meet a du **son actif**
4. Votre microphone est **activé** dans Google Meet

**Console Chrome** (F12 → Console) :
```
✅ Audio stream captured
✅ Speech recognition started
📝 Transcript: [le texte capturé]
```

### Erreur "Failed to capture tab audio"

Cela peut arriver si :
- Aucun audio n'est actif dans l'onglet
- Les permissions sont refusées
- Chrome n'arrive pas à accéder à l'audio

**Solution** :
1. Rechargez l'extension
2. Rechargez la page Google Meet
3. Assurez-vous que l'audio joue dans Meet

### Pas de transcription affichée

**Vérifiez la console** :
- `F12` → Onglet Console
- Cherchez des erreurs de type "Speech recognition error"

**Causes possibles** :
- Pas de son détecté
- Microphone coupé
- API Speech Recognition bloquée

### WebSocket déconnecté

Si le backend se déconnecte :
1. Vérifiez que le backend tourne (`http://localhost:8000`)
2. Regardez les logs du backend dans le terminal
3. Cliquez sur "Disconnect" puis "Connect" dans l'overlay

## 📊 Test Rapide

Pour tester rapidement :

1. **Lancez le backend**
2. **Rejoignez Google Meet** (même seul)
3. **Activez votre micro**
4. **Connect** dans l'overlay
5. **🎤 Start Audio**
6. **Parlez** : "Bonjour, ceci est un test"
7. **Observez** la transcription apparaître

## 🎮 Différence avec le Mode Simulation

| Feature | Mode Simulation | Capture Audio Réelle |
|---------|----------------|---------------------|
| Bouton | "Start Sim" | "🎤 Start Audio" |
| Source | Phrases pré-définies | Audio Google Meet en direct |
| Détection | Simulée | Web Speech API |
| Locuteur | Défini manuellement | Heuristique d'alternance |
| Timing | 5 secondes entre phrases | Temps réel |

## 🎯 Prochaines Étapes

1. **Testez** avec un vrai appel
2. **Observez** la qualité de transcription
3. **Ajustez** si nécessaire :
   - Langue
   - Détection de locuteur
   - Seuil de confiance

## 📞 Support

Si vous rencontrez des problèmes :
1. Vérifiez la console Chrome (F12)
2. Vérifiez les logs du backend
3. Rechargez l'extension
4. Redémarrez le backend

**Bonne négociation ! 🚀**
