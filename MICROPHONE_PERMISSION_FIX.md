# 🎤 Résolution du Problème de Permission Microphone

## ❌ Erreur Rencontrée

```
Speech recognition error: not-allowed
```

Cette erreur signifie que Chrome **n'a pas autorisé** l'extension à accéder au microphone.

---

## ✅ Solutions

### Solution 1 : Autoriser le Microphone pour l'Extension (RECOMMANDÉ)

**Étape 1 : Ouvrir les Paramètres de l'Extension**

1. Allez sur `chrome://extensions/`
2. Trouvez **"NegotiAI Coach - Live Assistant"**
3. Cliquez sur **"Détails"**

**Étape 2 : Vérifier les Permissions**

- Faites défiler vers le bas jusqu'à **"Permissions"**
- Vérifiez que l'extension a bien la permission **"Capturer l'audio et la vidéo de vos onglets"**

**Étape 3 : Autoriser l'Accès au Microphone**

Malheureusement, les extensions Chrome **ne peuvent pas demander directement** la permission microphone via popup. La permission doit être gérée au niveau du système.

---

### Solution 2 : Vérifier les Permissions Chrome Globales

**Méthode A : Via l'Icône de Verrouillage**

1. Sur la page Google Meet, cliquez sur **l'icône de cadenas** (🔒) dans la barre d'adresse
2. Cliquez sur **"Paramètres du site"**
3. Cherchez **"Microphone"**
4. Assurez-vous qu'il est sur **"Autoriser"**

**Méthode B : Via les Paramètres Chrome**

1. Allez sur `chrome://settings/content/microphone`
2. Vérifiez que **"Les sites peuvent demander à utiliser votre micro"** est **activé**
3. Cherchez `chrome-extension://` dans la liste des sites
4. Si votre extension est **bloquée**, cliquez dessus et changez à **"Autoriser"**

---

### Solution 3 : Réinitialiser les Permissions

**Option 1 : Recharger l'Extension**

1. `chrome://extensions/`
2. Trouvez **"NegotiAI Coach - Live Assistant"**
3. Cliquez sur **↻ (Recharger)**
4. Rechargez aussi la page **Google Meet**

**Option 2 : Réinstaller l'Extension**

1. Supprimez l'extension
2. Réinstallez-la depuis le dossier `browser-extension`
3. Acceptez **TOUTES** les permissions demandées

---

### Solution 4 : Vérifier le Conflit avec Google Meet

Le problème peut venir du fait que **Google Meet utilise déjà le microphone**.

**Test** :
1. Rejoignez Google Meet **SANS activer votre microphone**
2. Dans l'overlay NegotiAI :
   - Cliquez **"Connect"**
   - Cliquez **"🎤 Start Audio"**
3. Chrome devrait maintenant demander la permission

Si cela fonctionne, c'est que Google Meet bloque l'accès simultané.

---

## 🔍 Vérification Console

Pour vérifier exactement ce qui se passe :

**1. Ouvrir la Console de l'Offscreen Document**

1. Allez sur `chrome://extensions/`
2. Activez **"Mode développeur"** (en haut à droite)
3. Trouvez votre extension
4. Cliquez sur **"Inspect views: offscreen.html"**
5. Regardez les logs dans la console

**Logs attendus si ça fonctionne** :
```
Offscreen received message: {action: 'start-recognition'}
Starting speech recognition...
✅ Microphone access granted
✅ Speech recognition started
```

**Logs si erreur de permission** :
```
Speech recognition error: not-allowed
PERMISSION DENIED: The microphone permission was blocked.
SOLUTION: Go to chrome://settings/content/microphone and allow access.
```

---

## 🚀 Approche Alternative : Utiliser le Mode Simulation

Si le problème de permission persiste, vous pouvez utiliser le **mode simulation** qui fonctionne sans microphone :

1. Dans l'overlay NegotiAI
2. Cliquez **"Connect"**
3. Cliquez **"Start Sim"** au lieu de "🎤 Start Audio"

Le mode simulation génère des phrases de négociation automatiquement et les analyse avec l'IA. C'est parfait pour tester le système !

---

## 📋 Checklist de Débogage

Avant de demander de l'aide, vérifiez :

- [ ] L'extension est bien installée et active
- [ ] Le backend tourne sur `http://localhost:8000`
- [ ] Chrome a la permission microphone globale activée
- [ ] Google Meet n'utilise PAS le microphone en même temps
- [ ] L'extension a été rechargée après modification
- [ ] La page Google Meet a été rechargée
- [ ] La console de l'offscreen document ne montre pas d'erreurs
- [ ] Le mode simulation fonctionne (test de base)

---

## 💡 Pourquoi C'est Compliqué ?

**Chrome Manifest V3** impose des **restrictions de sécurité strictes** :

1. Les **offscreen documents** ne peuvent pas demander de permissions utilisateur via popup
2. Les **service workers** n'ont pas accès aux Web APIs
3. Les **extensions** ne peuvent pas capturer l'audio d'un onglet ET du microphone simultanément

C'est pourquoi la solution actuelle utilise **uniquement le microphone de l'utilisateur** et non l'audio complet de Google Meet.

---

## 🎯 Solution Ultime (Si Rien ne Fonctionne)

**Utiliser une Application de Bureau**

Pour capturer vraiment l'audio de Google Meet (y compris l'interlocuteur), il faudrait :
- Une application native Windows/Mac/Linux
- Accès système aux périphériques audio
- Pas de restrictions de sécurité du navigateur

Mais pour un hackathon, le **mode simulation** fonctionne parfaitement pour démontrer les capacités de l'IA ! 🚀
