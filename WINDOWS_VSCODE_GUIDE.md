# NegotiAI Coach - Guide Windows 11 + Python 3.13.1 + VS Code

Guide complet pour installer et utiliser NegotiAI Coach sur Windows 11 avec Python 3.13.1 et Visual Studio Code.

## 🎯 Prérequis

### 1. Python 3.13.1

**Installation** :
1. Téléchargez Python 3.13.1 depuis [python.org](https://www.python.org/downloads/)
2. **Important** : Cochez ✅ "Add Python to PATH" pendant l'installation
3. Vérifiez l'installation :
```powershell
python --version
# Devrait afficher : Python 3.13.1
```

**Troubleshooting** :
- Si `python` n'est pas reconnu, ajoutez-le au PATH :
  - Paramètres Windows → Système → À propos → Paramètres système avancés
  - Variables d'environnement → Path → Modifier
  - Ajouter : `C:\Users\VotreNom\AppData\Local\Programs\Python\Python313`

### 2. Visual Studio Code

**Installation** :
1. Téléchargez [VS Code](https://code.visualstudio.com/)
2. Installez avec les options par défaut

**Extensions essentielles** (s'installent automatiquement) :
- Python (Microsoft)
- Pylance
- Python Debugger
- Black Formatter

### 3. Node.js (Optionnel - pour l'interface web)

Téléchargez depuis [nodejs.org](https://nodejs.org/) (version LTS)

### 4. Git for Windows

Téléchargez depuis [git-scm.com](https://git-scm.com/download/win)

## 🚀 Installation Rapide

### Option A : Setup PowerShell (Recommandé)

```powershell
# 1. Clonez le projet
git clone [votre-repo]
cd negociation_ai

# 2. Autorisez l'exécution de scripts (si nécessaire)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# 3. Lancez le setup
.\scripts\setup_windows.ps1
```

**Le script fait tout automatiquement !**

### Option B : Setup Batch (Alternative)

```cmd
REM Si PowerShell ne fonctionne pas
.\scripts\setup_windows.bat
```

### Option C : Depuis VS Code

1. Ouvrez le projet dans VS Code
2. Ouvrez le Terminal (`` Ctrl+` ``)
3. Exécutez :
```powershell
.\scripts\setup_windows.ps1
```

## 📂 Ouvrir le Projet dans VS Code

### Méthode 1 : Depuis l'Explorateur

1. Démarrer → Visual Studio Code
2. File → Open Folder
3. Sélectionnez le dossier `negociation_ai`
4. VS Code va détecter automatiquement :
   - Le venv Python
   - Les fichiers de configuration
   - Les extensions recommandées

### Méthode 2 : Depuis le Terminal

```powershell
cd C:\chemin\vers\negociation_ai
code .
```

### Première Ouverture

VS Code va proposer :
1. **Installer les extensions recommandées** → Cliquez "Installer"
2. **Sélectionner l'interpréteur Python** → Choisissez `.\venv\Scripts\python.exe`

## 🎮 Utilisation dans VS Code

### 1. Configuration Automatique

Tout est déjà configuré dans `.vscode/` :
- ✅ Interpréteur Python (venv)
- ✅ Debugging configurations
- ✅ Tasks (tâches automatiques)
- ✅ Extensions recommandées
- ✅ Paramètres optimisés

### 2. Démarrer le Backend

#### Option A : Mode Debug (Recommandé)

1. Appuyez sur **F5**
2. Choisissez "Python: Backend FastAPI"
3. Le backend démarre avec debugging activé

OU

1. Panneau latéral → Run and Debug (Ctrl+Shift+D)
2. Sélectionnez "Python: Backend FastAPI"
3. Cliquez sur le bouton ▶️ vert

#### Option B : Via Tasks

1. Terminal → Run Task (Ctrl+Shift+B)
2. Choisissez "Backend: Start Server"

#### Option C : Terminal Intégré

```powershell
# Dans le terminal VS Code (Ctrl+`)
python start_simple.py
```

### 3. Points d'Arrêt (Breakpoints)

1. Cliquez dans la marge gauche d'une ligne de code
2. Un point rouge apparaît
3. Lancez en mode Debug (F5)
4. Le code s'arrête à ce point

Exemple dans `backend/main.py` :
```python
@app.get("/api/health")
async def health_check():
    # Mettez un breakpoint ici
    return {
        "status": "healthy",
        # ...
    }
```

### 4. Démarrer le Frontend

```powershell
# Terminal 1 : Backend
python start_simple.py

# Terminal 2 : Frontend (nouveau terminal avec Ctrl+Shift+`)
cd frontend
npm start
```

### 5. Variables d'Environnement

VS Code charge automatiquement `.env` :
```bash
ELEVENLABS_API_KEY=votre_clé
MISTRAL_API_KEY=votre_clé
```

Accès dans le code :
```python
from backend.config import settings
print(settings.elevenlabs_api_key)  # Chargé depuis .env
```

## 🔧 Configuration VS Code Avancée

### Workspace Settings (`.vscode/settings.json`)

Déjà configuré avec :
```json
{
  "python.defaultInterpreterPath": "${workspaceFolder}/venv/Scripts/python.exe",
  "python.terminal.activateEnvironment": true,
  "python.formatting.provider": "black",
  "editor.formatOnSave": true
}
```

### Tasks Disponibles (Ctrl+Shift+B)

| Task | Description |
|------|-------------|
| `Backend: Start Server` | Lance le backend |
| `Frontend: Start Dev Server` | Lance le frontend |
| `Knowledge: Load Database` | Charge la base de connaissances |
| `Demo: Run Scenario` | Lance le scénario de démo |
| `Test: Run All Tests` | Exécute les tests |
| `Format: Black` | Formate le code Python |
| `Lint: Check Code` | Vérifie la qualité du code |

### Debug Configurations Disponibles (F5)

| Configuration | Description |
|---------------|-------------|
| `Python: Backend FastAPI` | Backend avec reload |
| `Python: Simple Startup` | Lance start_simple.py |
| `Python: Demo Scenario` | Lance la démo |
| `Python: Current File` | Debug du fichier actuel |

## 🐛 Debugging

### Workflow de Debug

1. **Ouvrir le fichier** que vous voulez debugger
2. **Placer des breakpoints** (clic dans la marge)
3. **F5** pour démarrer
4. **F10** : Step over (ligne suivante)
5. **F11** : Step into (entrer dans la fonction)
6. **F5** : Continue jusqu'au prochain breakpoint

### Variables Watch

1. Pendant le debug, panneau "Variables" à gauche
2. Ajoutez des expressions à surveiller :
   - Clic droit → Add to Watch
   - Ou dans le panneau "Watch"

### Debug Console

```python
# Pendant un breakpoint, tapez dans Debug Console :
>>> session_id
'test_session_123'
>>> len(sessions)
3
```

## 📁 Structure du Projet dans VS Code

```
negociation_ai/
├── .vscode/                    # ← Configuration VS Code
│   ├── launch.json            # Configurations debug
│   ├── settings.json          # Paramètres workspace
│   ├── tasks.json             # Tâches automatiques
│   └── extensions.json        # Extensions recommandées
├── venv/                       # Environnement virtuel
├── backend/                    # Code Python
│   ├── main.py               # Point d'entrée FastAPI
│   ├── ai/                   # Moteur IA
│   ├── audio/                # Traitement audio
│   └── knowledge/            # Base de connaissances
├── frontend/                   # Code React
├── browser-extension/          # Extension navigateur
├── .env                       # Variables d'environnement
└── start_simple.py           # Startup script
```

## 🔍 Fonctionnalités VS Code Utiles

### 1. IntelliSense (Autocomplétion)

- Tapez `Ctrl+Space` pour afficher les suggestions
- Fonctionne avec :
  - Imports Python
  - Fonctions et méthodes
  - Variables d'environnement
  - Chemins de fichiers

### 2. Go to Definition

- `F12` : Aller à la définition
- `Alt+F12` : Peek definition (fenêtre popup)
- `Ctrl+Click` : Aller à la définition

### 3. Find All References

- `Shift+F12` : Trouver toutes les utilisations
- Utile pour voir où une fonction est appelée

### 4. Refactoring

- `F2` : Renommer une variable/fonction partout
- Clic droit → "Refactor..."

### 5. Terminal Intégré

- `` Ctrl+` `` : Ouvrir/fermer le terminal
- `Ctrl+Shift+` ` : Nouveau terminal
- Supporte PowerShell, CMD, Git Bash

### 6. Source Control (Git)

- `Ctrl+Shift+G` : Panneau Git
- Commit : Icône ✓ en haut
- Push : ... → Push

### 7. Problems Panel

- `Ctrl+Shift+M` : Voir les erreurs/warnings
- Auto-détecte :
  - Erreurs de syntaxe Python
  - Warnings flake8
  - Erreurs TypeScript/ESLint

### 8. Format Document

- `Shift+Alt+F` : Formater avec Black
- Ou configuré sur Save automatiquement

## ⚙️ Commandes VS Code Utiles

| Raccourci | Action |
|-----------|--------|
| `Ctrl+P` | Quick Open (fichiers) |
| `Ctrl+Shift+P` | Command Palette |
| `Ctrl+B` | Toggle Sidebar |
| `` Ctrl+` `` | Toggle Terminal |
| `Ctrl+K Ctrl+S` | Keyboard Shortcuts |
| `Ctrl+,` | Settings |
| `F5` | Start Debugging |
| `Ctrl+Shift+B` | Run Build Task |
| `Ctrl+K V` | Preview Markdown |

## 🎯 Workflow Quotidien

### Démarrage Rapide

1. **Ouvrir VS Code**
   ```powershell
   cd C:\...\negociation_ai
   code .
   ```

2. **Vérifier le venv**
   - Barre du bas : devrait afficher `('venv': venv)`
   - Si non : Ctrl+Shift+P → "Python: Select Interpreter" → venv

3. **Lancer le backend**
   - `F5` → "Python: Backend FastAPI"
   - OU `Ctrl+Shift+B` → "Backend: Start Server"

4. **Installer l'extension navigateur**
   - Chrome → chrome://extensions/
   - Charger : `C:\...\negociation_ai\browser-extension`

5. **Tester**
   - Ouvrir http://localhost:8000/docs
   - Rejoindre un appel Google Meet
   - Extension s'active automatiquement

### Debug une Erreur

1. **Voir l'erreur** dans le terminal ou Problems panel
2. **Ouvrir le fichier** concerné
3. **Placer un breakpoint** avant la ligne qui pose problème
4. **F5** pour relancer en debug
5. **Inspecter les variables** quand le breakpoint est atteint
6. **Corriger et sauvegarder**
7. FastAPI reload automatiquement

### Modifier le Code

1. **Éditer** le fichier Python
2. **Sauvegarder** (Ctrl+S)
3. **Black** formate automatiquement
4. **Flake8** vérifie la qualité
5. **FastAPI reload** automatiquement le serveur

## 🔐 Configuration .env dans VS Code

Le fichier `.env` est chargé automatiquement :

```bash
# .env
ELEVENLABS_API_KEY=sk_...
MISTRAL_API_KEY=...
DEBUG=True
PORT=8000
```

**IntelliSense pour .env** :
- Extension "DotENV" installée automatiquement
- Coloration syntaxique
- Autocomplétion

## 🚨 Troubleshooting VS Code

### Python Interpreter Not Found

```
Ctrl+Shift+P → Python: Select Interpreter → .\venv\Scripts\python.exe
```

### Terminal ne reconnaît pas Python

```powershell
# Vérifiez que le venv est activé
# Vous devriez voir (venv) au début du prompt

# Sinon :
.\venv\Scripts\Activate.ps1
```

### Extensions ne s'installent pas

```
Ctrl+Shift+P → Extensions: Show Recommended Extensions → Install All
```

### Port 8000 déjà utilisé

```powershell
# Trouvez le processus
netstat -ano | findstr :8000

# Tuez-le (remplacez PID)
taskkill /PID <PID> /F

# Ou changez le port dans .env
echo "PORT=8001" >> .env
```

### Black ne formate pas

```
Ctrl+Shift+P → Format Document With... → Black
```

### Git ne fonctionne pas

```powershell
# Vérifiez Git
git --version

# Si non trouvé, installez Git for Windows
# Puis redémarrez VS Code
```

## 📦 Extensions Recommandées

### Essentielles (Auto-installées)

- **Python** - Support Python complet
- **Pylance** - IntelliSense avancé
- **Python Debugger** - Debugging
- **Black Formatter** - Formatage de code

### Recommandées

- **GitLens** - Git amélioré
- **Error Lens** - Erreurs inline
- **Better Comments** - Commentaires colorés
- **Path Intellisense** - Autocomplétion chemins
- **REST Client** - Tester les APIs

### Installation

```
Ctrl+Shift+X → Rechercher l'extension → Install
```

## 🎓 Astuces Productivité

### 1. Multi-Cursor

- `Alt+Click` : Ajouter un curseur
- `Ctrl+Alt+↓/↑` : Curseur ligne suivante/précédente
- `Ctrl+D` : Sélectionner prochaine occurrence

### 2. Snippets Python

Tapez puis `Tab` :
- `def` → Fonction complète
- `class` → Classe complète
- `for` → Boucle for
- `if` → Condition if

### 3. Zen Mode

- `Ctrl+K Z` : Mode concentration (plein écran)
- `Esc Esc` : Sortir

### 4. Side by Side

- `Ctrl+\` : Split editor
- Glisser-déposer un fichier à côté

### 5. Terminal Split

- Terminal → Split Terminal
- Utile pour backend + frontend en même temps

## 📊 Monitoring dans VS Code

### 1. Python Extension

- Panneau "Python" en bas :
  - Interpréteur actif
  - Tests découverts
  - Linter status

### 2. Output Panel

```
View → Output → Python / Pylance
```
Voir les logs des extensions

### 3. Debug Console

```
View → Debug Console
```
Console interactive pendant le debug

## 🚀 Déploiement depuis VS Code

### Docker Build

```powershell
# Terminal VS Code
docker-compose build
docker-compose up
```

### Git Push

```
Ctrl+Shift+G → Message → Commit → ... → Push
```

## ✅ Checklist Installation

- [ ] Python 3.13.1 installé et dans PATH
- [ ] VS Code installé
- [ ] Git installé
- [ ] Projet cloné
- [ ] `.\scripts\setup_windows.ps1` exécuté
- [ ] Venv créé et activé
- [ ] Dépendances installées
- [ ] `.env` configuré avec API keys
- [ ] Extensions VS Code installées
- [ ] Backend démarre (F5)
- [ ] http://localhost:8000/docs accessible
- [ ] Extension navigateur installée

## 🎉 Vous êtes prêt !

Workflow complet :
1. **Ouvrir** VS Code → `code .`
2. **Lancer** backend → `F5`
3. **Développer** avec IntelliSense et debugging
4. **Commit** les changements → `Ctrl+Shift+G`
5. **Négocier** avec l'IA sur Google Meet !

**Bon développement !** 🚀

---

**Support** : Consultez [INSTALLATION_SIMPLE.md](INSTALLATION_SIMPLE.md) ou [VENV_GUIDE.md](VENV_GUIDE.md) pour plus de détails.
