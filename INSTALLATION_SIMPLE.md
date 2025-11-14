# Guide d'installation simplifié - NegotiAI Coach

Guide pour démarrer **sans Docker** et avec un minimum de configuration.

## 🎯 Configuration requise

- **Python 3.11+** (compatible Python 3.13)
- **Node.js 18+** (optionnel, seulement pour l'interface web)
- **Google Chrome** ou **Firefox** (pour l'extension)

## 🚀 Installation en 5 minutes

### Méthode A : Setup Automatique (Recommandé)

```bash
# 1. Clonez le repo
git clone [votre-repo]
cd negociation_ai

# 2. Exécutez le script de setup
./scripts/quick_setup.sh

# Le script va :
# - Vérifier Python 3.11+
# - Créer un environnement virtuel
# - Installer toutes les dépendances
# - Créer le fichier .env
```

### Méthode B : Setup Manuel

#### Étape 1 : Installation Python

```bash
# Vérifiez votre version Python
python --version  # Doit afficher 3.11 ou supérieur
```

#### Étape 2 : Clonez le repo

```bash
git clone [votre-repo]
cd negociation_ai
```

#### Étape 3 : Créez l'environnement virtuel

```bash
# Créer l'environnement virtuel
python -m venv venv

# Activer l'environnement virtuel
# Sur Linux/Mac :
source venv/bin/activate

# Sur Windows :
venv\Scripts\activate
```

Vous devriez voir `(venv)` au début de votre prompt.

#### Étape 4 : Installez les dépendances

```bash
# Mise à jour de pip
pip install --upgrade pip

# Installation des dépendances
pip install -r requirements.txt
```

#### Étape 5 : Configuration des clés API

```bash
# Copiez le fichier d'exemple
cp .env.example .env

# Éditez .env et ajoutez vos clés
nano .env  # ou votre éditeur préféré
```

**Clés minimales requises**:
```bash
ELEVENLABS_API_KEY=votre_clé_elevenlabs
MISTRAL_API_KEY=votre_clé_mistral
```

**Clés optionnelles** (l'app fonctionne sans):
```bash
QDRANT_API_KEY=  # Laissez vide pour Qdrant local
GOOGLE_CLOUD_KEY=  # Backup STT (optionnel)
```

### Étape 6 : Démarrez le backend

```bash
# Option A: Script simple (recommandé - gère le venv automatiquement)
python start_simple.py

# Option B: Manuel (dans le venv activé)
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

**Note** : Le script `start_simple.py` :
- Détecte si vous êtes dans un venv
- Crée un venv automatiquement si besoin
- Installe les dépendances
- Redémarre dans le venv

✅ Le backend démarre sur http://localhost:8000

### Étape 7 : Installez l'extension navigateur

#### Chrome / Edge :

1. Ouvrez `chrome://extensions/`
2. Activez **Mode développeur**
3. **Charger l'extension non empaquetée**
4. Sélectionnez le dossier `browser-extension/`

#### Firefox :

1. Ouvrez `about:debugging#/runtime/this-firefox`
2. **Charger un module complémentaire temporaire**
3. Sélectionnez `browser-extension/manifest.json`

✅ L'extension est installée !

## 🎬 Première utilisation

### 1. Vérifiez que le backend tourne

Ouvrez http://localhost:8000/api/health

Vous devriez voir :
```json
{
  "status": "healthy",
  "services": {
    "api": "online",
    "websocket": true
  }
}
```

### 2. Rejoignez un appel vidéo

- **Google Meet**: https://meet.google.com/...
- **Zoom**: https://*.zoom.us/...
- **Teams**: https://teams.microsoft.com/...

### 3. L'overlay apparaît automatiquement

En bas à droite, vous voyez :

```
┌─────────────────────┐
│ 🎯 NegotiAI Coach  │
│ ● Disconnected      │
│ [Connect]           │
└─────────────────────┘
```

### 4. Cliquez sur "Connect"

L'extension se connecte au backend et commence à afficher les suggestions !

## 🔧 Dépannage

### Environnement virtuel

**Problème** : "Module not found" même après installation

```bash
# Vérifiez que vous êtes dans le venv
which python  # Devrait pointer vers venv/bin/python

# Si pas dans venv, activez-le
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows

# Réinstallez les dépendances
pip install --upgrade -r requirements.txt
```

**Problème** : Erreur lors de la création du venv

```bash
# Sur Ubuntu/Debian
sudo apt-get install python3-venv

# Sur Fedora/RHEL
sudo dnf install python3-venv

# Puis recréez
python -m venv venv
```

### Python : "Module not found"

```bash
# TOUJOURS dans le venv activé !
pip install --upgrade -r requirements.txt
```

### Port 8000 déjà utilisé

```bash
# Trouvez quel processus utilise le port
lsof -i :8000  # Mac/Linux
netstat -ano | findstr :8000  # Windows

# Ou changez le port dans .env
echo "PORT=8001" >> .env
python start_simple.py
```

### Extension : "Backend not connected"

1. Vérifiez que le backend tourne : http://localhost:8000
2. Rechargez la page de l'appel vidéo
3. Regardez la console (F12) pour les erreurs

### Erreur "elevenlabs" ou "mistral"

Si vous n'avez pas les clés API, l'app fonctionne quand même en **mode dégradé** :
- ✅ Backend démarre
- ✅ WebSocket fonctionne
- ⚠️  Transcription en mode mock
- ⚠️  Suggestions génériques

**C'est normal pour tester !**

## 💡 Mode test sans API keys

Pour tester sans clés API :

```bash
# Démarrez avec le mode mock
python start_simple.py
```

Le backend utilisera des données de démonstration.

## 📊 Vérification complète

### Backend :

```bash
curl http://localhost:8000/api/health
```

Devrait retourner `{"status": "healthy"}`

### Extension :

1. Allez sur Google Meet
2. Vérifiez que l'overlay apparaît
3. Cliquez sur "Connect"
4. Vérifiez le statut : `● Connected`

### Test WebSocket :

```bash
# Ouvrez la console navigateur (F12)
# Tapez :
ws = new WebSocket('ws://localhost:8000/ws/live/test_session')
ws.onopen = () => console.log('✅ Connected!')
ws.onmessage = (e) => console.log('Message:', e.data)
```

## 🎨 Personnalisation

### Changer le port du backend

```bash
# Dans .env
PORT=8001

# Puis dans browser-extension/scripts/content.js
const CONFIG = {
  apiUrl: 'http://localhost:8001',
  wsUrl: 'ws://localhost:8001/ws/live'
};
```

### Désactiver certains services

Dans `backend/main.py`, ligne 52-71, commentez ce que vous n'utilisez pas :

```python
# Commentez pour désactiver le vector store
# try:
#     vector_store = VectorStore()
#     ...
```

## 📈 Mode production

Pour déployer en production :

1. **Utilisez Docker** (plus simple)
```bash
docker-compose up -d
```

2. **Ou configurez manuellement**
```bash
# Définissez DEBUG=False dans .env
DEBUG=False

# Utilisez gunicorn
gunicorn backend.main:app -w 4 -k uvicorn.workers.UvicornWorker
```

## 🔐 Sécurité

### En développement

- CORS ouvert (`*`) - OK pour tester
- Pas de HTTPS - OK pour localhost
- Logs verbeux - OK pour debug

### En production

Modifiez `backend/main.py` :

```python
# Ligne 39 : Restreindre CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://votre-domaine.com"],  # Changez ici
    ...
)
```

## 📝 Checklist avant de commencer

- [ ] Python 3.11+ installé
- [ ] Environnement virtuel créé (`venv/`)
- [ ] Environnement virtuel activé (`(venv)` dans le prompt)
- [ ] Dependencies installées dans le venv
- [ ] Fichier `.env` créé avec les clés API
- [ ] Backend démarre sans erreur
- [ ] Extension navigateur installée
- [ ] Accès à un appel vidéo de test

## 🆘 Besoin d'aide ?

### Erreurs communes

**"ModuleNotFoundError: No module named 'fastapi'"**
```bash
pip install fastapi uvicorn
```

**"Address already in use"**
```bash
# Changez le port
export PORT=8001
python start_simple.py
```

**Extension ne se connecte pas**
- Backend lancé ?
- Port correct (8000) ?
- Pas de pare-feu bloquant ?

### Logs utiles

```bash
# Backend logs (dans le terminal où vous avez lancé start_simple.py)
# Cherchez les lignes commençant par :
# ✅ = OK
# ⚠️ = Warning (non bloquant)
# ❌ = Erreur

# Extension logs
# F12 > Console dans l'onglet de l'appel
```

## 🎯 Prochaines étapes

Une fois que tout fonctionne :

1. **Testez l'interface web** (optionnel)
```bash
cd frontend
npm install
npm start
# Ouvrir http://localhost:3000
```

2. **Chargez la base de connaissances**
```bash
python backend/knowledge/loader.py
```

3. **Lancez le scénario de démo**
```bash
python demo/run_scenario.py
```

4. **Lisez la doc complète**
- [README.md](README.md) - Vue d'ensemble
- [ARCHITECTURE.md](ARCHITECTURE.md) - Détails techniques
- [browser-extension/README.md](browser-extension/README.md) - Extension

## ✅ Installation réussie !

Si vous voyez :
- ✅ Backend : `http://localhost:8000/api/health` retourne "healthy"
- ✅ Extension : Overlay visible sur Google Meet
- ✅ Connexion : Statut "Connected" dans l'overlay

**Félicitations ! Vous êtes prêt à utiliser NegotiAI Coach** 🎉

Rejoignez un appel et laissez l'IA vous assister !
