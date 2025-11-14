# Guide Environnement Virtuel - NegotiAI Coach

Ce guide explique pourquoi et comment utiliser un environnement virtuel Python pour NegotiAI Coach.

## 🤔 Pourquoi un environnement virtuel ?

### Avantages

1. **Isolation des dépendances**
   - Pas de conflit avec d'autres projets Python
   - Chaque projet a ses propres versions de packages

2. **Reproductibilité**
   - Même environnement sur tous les ordinateurs
   - Facilite le déploiement

3. **Propreté du système**
   - N'installe rien dans Python système
   - Facile à supprimer (juste un dossier)

4. **Compatibilité**
   - Garantit Python 3.11-3.13
   - Versions exactes des dépendances

### Sans environnement virtuel

❌ Risques :
- Conflits de versions entre projets
- Installation globale pollue le système
- Difficile de reproduire l'environnement
- Problèmes de permissions possibles

## 🚀 Setup Rapide

### Option 1 : Script automatique

```bash
# Tout en un !
./scripts/quick_setup.sh

# Ou
python start_simple.py  # Crée et active le venv automatiquement
```

### Option 2 : Manuel

```bash
# 1. Créer le venv
python -m venv venv

# 2. Activer
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows

# 3. Installer dépendances
pip install -r requirements.txt
```

## 📂 Structure

```
negociation_ai/
├── venv/                    # Environnement virtuel (gitignored)
│   ├── bin/                # Exécutables (Linux/Mac)
│   ├── Scripts/            # Exécutables (Windows)
│   ├── lib/                # Packages Python
│   └── pyvenv.cfg          # Config venv
├── requirements.txt        # Dépendances
└── start_simple.py         # Gestion auto du venv
```

## 🔧 Commandes Essentielles

### Activer le venv

```bash
# Linux / macOS
source venv/bin/activate

# Windows (cmd)
venv\Scripts\activate.bat

# Windows (PowerShell)
venv\Scripts\Activate.ps1

# Vérifier l'activation
which python  # Devrait pointer vers venv/bin/python
```

### Désactiver le venv

```bash
deactivate
```

### Installer un package

```bash
# TOUJOURS dans le venv activé !
pip install nom_package

# Sauvegarder dans requirements.txt
pip freeze > requirements.txt
```

### Mettre à jour les packages

```bash
# Mettre à jour pip
pip install --upgrade pip

# Mettre à jour tous les packages
pip install --upgrade -r requirements.txt
```

### Recréer le venv

```bash
# Supprimer l'ancien
rm -rf venv

# Recréer
python -m venv venv

# Activer
source venv/bin/activate

# Réinstaller
pip install -r requirements.txt
```

## 🎯 Utilisation Quotidienne

### Workflow typique

```bash
# 1. Naviguer dans le projet
cd negociation_ai

# 2. Activer le venv
source venv/bin/activate

# 3. Travailler sur le projet
python start_simple.py
# ou
uvicorn backend.main:app --reload

# 4. Quand vous avez fini
deactivate
```

### Avec start_simple.py

```bash
# Pas besoin d'activer manuellement !
python start_simple.py

# Le script :
# - Détecte si venv existe
# - Le crée si nécessaire
# - Installe les dépendances
# - Redémarre dedans automatiquement
```

## 🐛 Troubleshooting

### "python: command not found" dans venv

```bash
# Le venv est peut-être corrompu
rm -rf venv
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### "Permission denied" sur Linux/Mac

```bash
# Rendre les scripts exécutables
chmod +x venv/bin/*

# Ou utiliser python directement
python -m uvicorn backend.main:app --reload
```

### "cannot import name 'X'" après activation

```bash
# Réinstaller les dépendances
pip install --upgrade --force-reinstall -r requirements.txt
```

### Le venv ne s'active pas sur Windows PowerShell

```bash
# Autoriser l'exécution de scripts
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Puis activer
venv\Scripts\Activate.ps1
```

### Packages installés mais "ModuleNotFoundError"

```bash
# Vérifier que vous êtes dans le bon venv
which python      # Linux/Mac
where python      # Windows

# Devrait pointer vers votre venv/
# Sinon, réactivez le venv
```

## 🔍 Vérifications

### Vérifier l'activation

```bash
# Méthode 1 : Regarder le prompt
(venv) user@computer:~/negociation_ai$  # ✓ Activé

# Méthode 2 : Vérifier le chemin Python
which python
# ✓ Devrait afficher : /chemin/vers/negociation_ai/venv/bin/python

# Méthode 3 : Vérifier dans Python
python -c "import sys; print(sys.prefix)"
# ✓ Devrait afficher : /chemin/vers/negociation_ai/venv
```

### Lister les packages installés

```bash
pip list

# Ou avec versions
pip freeze
```

### Vérifier la version Python du venv

```bash
python --version
# Devrait être 3.11+ si créé avec Python 3.11+
```

## 📚 Bonnes Pratiques

### ✅ À FAIRE

- Toujours activer le venv avant de travailler
- Installer les packages avec `pip install` (pas `pip3`)
- Mettre à jour `requirements.txt` après ajout de package
- Ajouter `venv/` dans `.gitignore`
- Documenter la version Python requise

### ❌ À ÉVITER

- Installer des packages sans activer le venv
- Copier le dossier `venv/` (il est lié au chemin)
- Modifier manuellement les fichiers dans `venv/`
- Commiter le dossier `venv/` dans git
- Mélanger pip et pip3 / python et python3

## 🚢 Déploiement

### Développement

```bash
# Créer venv
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Production (Docker)

```dockerfile
# Dans Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Installer dépendances
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copier code
COPY . .

# Pas besoin de venv dans Docker !
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0"]
```

### Production (Serveur)

```bash
# Utiliser venv même en production
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Avec gunicorn
pip install gunicorn
gunicorn backend.main:app -w 4 -k uvicorn.workers.UvicornWorker
```

## 💡 Astuces

### Auto-activation avec direnv

```bash
# Installer direnv
# Ubuntu: sudo apt install direnv
# Mac: brew install direnv

# Créer .envrc
echo "source venv/bin/activate" > .envrc

# Autoriser
direnv allow

# Maintenant le venv s'active automatiquement
# quand vous entrez dans le dossier !
```

### Alias utiles

```bash
# Ajouter dans ~/.bashrc ou ~/.zshrc

alias venv-activate="source venv/bin/activate"
alias venv-create="python -m venv venv"
alias venv-install="pip install -r requirements.txt"
alias venv-freeze="pip freeze > requirements.txt"
```

### PyCharm / VS Code

Ces IDE détectent automatiquement le venv et l'utilisent.

**PyCharm** :
- File > Settings > Project > Python Interpreter
- Sélectionner `venv/bin/python`

**VS Code** :
- Cmd/Ctrl + Shift + P
- "Python: Select Interpreter"
- Choisir `./venv/bin/python`

## 📖 Ressources

- [Documentation officielle venv](https://docs.python.org/3/library/venv.html)
- [Guide pip](https://pip.pypa.io/en/stable/user_guide/)
- [Python Packaging Guide](https://packaging.python.org/)

## ❓ FAQ

**Q : Dois-je commiter venv/ dans git ?**
A : Non ! Toujours gitignorer. Les autres recréent avec `requirements.txt`.

**Q : Puis-je avoir plusieurs venv ?**
A : Oui, mais un par projet suffit généralement.

**Q : Différence entre venv et virtualenv ?**
A : `venv` est intégré à Python 3.3+. Utilisez `venv`.

**Q : Comment partager mon environnement ?**
A : Partagez `requirements.txt`, pas le venv.

**Q : Le venv ralentit Python ?**
A : Non, c'est juste un dossier avec des liens symboliques.

**Q : Puis-je déplacer le venv ?**
A : Non, il est lié au chemin. Recréez-le après déplacement.

---

✅ **Vous êtes maintenant expert en environnements virtuels Python !**

Pour NegotiAI Coach :
```bash
./scripts/quick_setup.sh  # Et c'est tout !
```
