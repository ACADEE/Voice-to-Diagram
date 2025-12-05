# 📦 Guide d'Installation - Voice-to-Diagram

## 🚀 Installation Rapide

### Prérequis

- Node.js 18+ (vérifier avec `node --version`)
- npm (vérifier avec `npm --version`)
- Clé API OpenAI avec accès Realtime API

### Installation

```bash
# 1. Cloner le projet
git clone <URL_DU_DEPOT>
cd Voice-to-Diagram

# 2. Installer les dépendances
npm install

# 3. Lancer l'application
npm run dev:all
```

**C'est tout !** ✨

---

## ⚠️ Problème "ERESOLVE" lors de npm install

### Symptôme

```
npm ERR! code ERESOLVE
npm ERR! Could not resolve dependency:
npm ERR! peer react@"^18" from @tldraw/tldraw@2.4.6
npm ERR! Conflicting peer dependency: react@18.3.1
```

### Cause

Tldraw 2.4.6 demande React 18, mais ce projet utilise React 19 (requis par Next.js 15).

### ✅ Solution Automatique (Recommandée)

Le fichier `.npmrc` est déjà configuré pour gérer ce conflit :

```bash
# Supprimez node_modules si l'erreur persiste
rm -rf node_modules package-lock.json

# Réinstallez
npm install
```

Le fichier `.npmrc` contient :
```
legacy-peer-deps=true
```

Cela permet à npm d'ignorer les conflits de peer dependencies.

### ✅ Solution Manuelle (Si nécessaire)

Si `.npmrc` est manquant ou l'erreur persiste :

```bash
npm install --legacy-peer-deps
```

---

## 🔍 Pourquoi ça Fonctionne ?

### React 19 vs React 18

- **Next.js 15** requiert **React 19**
- **Tldraw 2.4** demande **React 18**
- **MAIS** : Tldraw fonctionne parfaitement avec React 19

### Compatibilité Vérifiée

✅ Tldraw 2.4.6 + React 19 = **Compatible**
✅ Next.js 15 + React 19 = **Compatible**
✅ Build sans erreurs = **Testé et validé**

Les avertissements sont **normaux** et **sans danger**.

---

## 📋 Dépannage Installation

### Erreur : "npm: command not found"

**Cause :** Node.js n'est pas installé

**Solution :**
1. Téléchargez Node.js : https://nodejs.org/
2. Installez la version LTS
3. Redémarrez votre terminal
4. Vérifiez : `node --version`

### Erreur : "EACCES: permission denied"

**Cause :** Problème de permissions

**Solution (Linux/Mac) :**
```bash
sudo chown -R $(whoami) ~/.npm
```

**Solution (Windows) :**
Lancez PowerShell en tant qu'administrateur

### Erreur : "Network timeout"

**Cause :** Problème réseau ou proxy

**Solutions :**
```bash
# Augmenter le timeout
npm config set timeout 60000

# Utiliser un miroir (si en Chine par exemple)
npm config set registry https://registry.npmmirror.com
```

### Erreur : Ancienne version de npm

**Solution :**
```bash
# Mettre à jour npm
npm install -g npm@latest

# Vérifier
npm --version  # Devrait être 9.0.0 ou plus
```

---

## 🎯 Vérification Post-Installation

### 1. Vérifier les Dépendances

```bash
npm list --depth=0
```

Vous devriez voir :
```
voice-to-diagram@0.1.0
├── @tldraw/tldraw@2.4.6
├── next@15.1.x
├── react@19.x.x
├── react-dom@19.x.x
└── ...
```

### 2. Tester le Build

```bash
npm run build
```

✅ Devrait afficher : `✓ Compiled successfully`

### 3. Lancer les Serveurs

```bash
npm run dev:all
```

✅ Devrait afficher :
```
✓ Ready on http://localhost:3000
✓ WebSocket relay server running on http://localhost:8080
```

---

## 🔧 Configuration Avancée

### .npmrc (Configuration npm)

Le fichier `.npmrc` à la racine du projet contient :

```ini
# Permettre Tldraw 2.4 avec React 19
legacy-peer-deps=true
```

**Options supplémentaires possibles :**

```ini
# Augmenter le timeout pour connexions lentes
timeout=60000

# Utiliser un registre miroir
registry=https://registry.npmjs.org/

# Ignorer les certificats SSL (déconseillé)
# strict-ssl=false
```

### package.json - Scripts Disponibles

```json
{
  "dev": "next dev",              // Frontend uniquement
  "relay": "tsx server/realtime.ts", // Serveur relay uniquement
  "dev:all": "concurrently ...",  // Les deux en même temps
  "build": "next build",          // Compiler pour production
  "start": "next start",          // Lancer en production
  "lint": "next lint"             // Vérifier le code
}
```

---

## 📦 Dépendances Principales

### Production (dependencies)

| Package | Version | Usage |
|---------|---------|-------|
| next | 15.1.0 | Framework React |
| react | 19.0.0 | Bibliothèque UI |
| react-dom | 19.0.0 | DOM React |
| @tldraw/tldraw | 2.4.0 | Canvas de dessin |
| dagre | 0.8.5 | Layout automatique |
| ws | 8.18.0 | WebSocket serveur |

### Développement (devDependencies)

| Package | Version | Usage |
|---------|---------|-------|
| typescript | 5.6.0 | Typage statique |
| tsx | 4.21.0 | Exécution TypeScript |
| tailwindcss | 3.4.0 | Framework CSS |
| eslint | 9.0.0 | Linter JavaScript |
| concurrently | 8.2.2 | Lancer plusieurs commandes |

---

## 🌐 Ports Utilisés

- **3000** : Frontend Next.js
- **8080** : Serveur WebSocket relay

### Changer les Ports

**Frontend :**
```bash
PORT=3001 npm run dev
```

**Relay :**
Modifier `server/realtime.ts` ligne 6 :
```typescript
const PORT = 8081; // Votre port
```

---

## 🔄 Mise à Jour des Dépendances

### Vérifier les Mises à Jour

```bash
npm outdated
```

### Mettre à Jour

```bash
# Mises à jour mineures (sécurisé)
npm update

# Mises à jour majeures (attention)
npm install <package>@latest
```

### Mettre à Jour le Projet

```bash
git pull
npm install
```

---

## 🐳 Installation avec Docker (Optionnel)

Si vous préférez utiliser Docker :

```dockerfile
# Dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .

EXPOSE 3000 8080

CMD ["npm", "run", "dev:all"]
```

```bash
# Construire
docker build -t voice-to-diagram .

# Lancer
docker run -p 3000:3000 -p 8080:8080 voice-to-diagram
```

---

## 📝 Checklist d'Installation Complète

- [ ] Node.js 18+ installé
- [ ] Git installé
- [ ] Projet cloné
- [ ] `npm install` réussi (avec ou sans --legacy-peer-deps)
- [ ] `.npmrc` présent à la racine
- [ ] `npm run build` fonctionne
- [ ] `npm run dev:all` démarre les deux serveurs
- [ ] http://localhost:3000 accessible
- [ ] http://localhost:8080 répond
- [ ] Clé OpenAI prête

---

## 🆘 Aide

### Problèmes Courants

1. **"Cannot find module"**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **"Port already in use"**
   ```bash
   # Trouver le processus (Windows)
   netstat -ano | findstr :3000
   taskkill /PID <PID> /F

   # Trouver le processus (Mac/Linux)
   lsof -ti:3000 | xargs kill -9
   ```

3. **"ENOSPC: System limit"** (Linux)
   ```bash
   echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
   sudo sysctl -p
   ```

### Réinstallation Complète

```bash
# Tout supprimer
rm -rf node_modules package-lock.json .next

# Réinstaller
npm install

# Tester
npm run build
npm run dev:all
```

---

## 💡 Conseils

### Performance

- Utilisez Node.js 20 pour de meilleures performances
- Fermez les autres applications consommatrices de mémoire
- Utilisez un SSD pour l'installation plus rapide

### Développement

- Installez l'extension VSCode "ESLint"
- Installez l'extension VSCode "Tailwind CSS IntelliSense"
- Utilisez `npm run lint` avant de committer

### Production

Pour déployer en production :

```bash
npm run build
npm start
```

Ou utilisez Vercel/Netlify pour le déploiement automatique.

---

**🎉 Installation Terminée !**

Passez à **QUICKSTART.md** pour commencer à utiliser l'application.
