# 🔧 Guide de Dépannage (Troubleshooting)

## Problèmes Courants et Solutions

### ❌ Erreur : "Cannot use import statement outside a module"

**Symptôme :**
```
SyntaxError: Cannot use import statement outside a module
```

**Cause :**
L'ancien `ts-node` ne supportait pas bien les modules ES.

**✅ Solution :**
Nous utilisons maintenant `tsx` à la place de `ts-node`.

```bash
# Réinstaller les dépendances si nécessaire
npm install

# Lancer le serveur relay
npm run relay
```

---

### ❌ Erreur : "Connection error" dans l'interface

**Symptôme :**
Le bouton "Connect" affiche "Connection error"

**Causes possibles :**
1. Le serveur relay n'est pas démarré
2. Le port 8080 est déjà utilisé
3. La clé API est invalide

**✅ Solutions :**

**1. Vérifier que le serveur relay tourne :**
```bash
npm run relay
```

Vous devriez voir :
```
✓ WebSocket relay server running on http://localhost:8080
```

**2. Si le port 8080 est occupé :**

Modifier `server/realtime.ts` ligne 6 :
```typescript
const PORT = 8081; // Changer de port
```

**3. Vérifier votre clé API :**
- Format correct : `sk-proj-...` ou `sk-...`
- Vérifier sur https://platform.openai.com/api-keys
- Créer une nouvelle clé si nécessaire

---

### ❌ Erreur : "Microphone access denied"

**Symptôme :**
Le navigateur bloque l'accès au microphone

**✅ Solution :**

**Chrome/Edge :**
1. Cliquez sur l'icône 🔒 dans la barre d'adresse
2. Autorisez le microphone
3. Rechargez la page (F5)

**Firefox :**
1. Cliquez sur l'icône 🛡️ dans la barre d'adresse
2. Autorisez le microphone
3. Rechargez la page

**Safari :**
1. Safari > Préférences > Sites Web > Microphone
2. Autorisez localhost
3. Rechargez la page

---

### ❌ Erreur : "Port 3000 already in use"

**Symptôme :**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Causes :**
- Une autre application Next.js tourne déjà
- Le port 3000 est utilisé par un autre programme

**✅ Solutions :**

**Option 1 : Utiliser un autre port**
```bash
PORT=3001 npm run dev
```

**Option 2 : Trouver et arrêter le processus**

**Windows (PowerShell) :**
```powershell
# Trouver le processus
netstat -ano | findstr :3000

# Arrêter le processus (remplacer PID par le numéro)
taskkill /PID <PID> /F
```

**Mac/Linux :**
```bash
# Trouver et arrêter le processus
lsof -ti:3000 | xargs kill -9
```

---

### ❌ Le diagramme n'apparaît pas

**Symptômes possibles :**
- Rien ne se passe après avoir parlé
- L'écran reste vide
- Erreur dans la console

**✅ Diagnostic étape par étape :**

**1. Tester avec un diagramme d'exemple :**
```
Cliquer sur "Add Test Diagram"
```
Si ça fonctionne → Problème avec l'API ou le WebSocket
Si ça ne fonctionne pas → Problème avec Tldraw

**2. Ouvrir la console du navigateur :**
```
F12 ou Ctrl+Shift+I (Windows/Linux)
Cmd+Option+I (Mac)
```

Regardez les erreurs rouges.

**3. Vérifier la connexion WebSocket :**
```
Dans la console → Onglet "Network" → Filtre "WS"
Vérifier qu'il y a une connexion établie
```

**4. Vérifier votre clé API :**
```javascript
// Dans la console du navigateur, tapez :
localStorage.getItem('openai_api_key')

// Si null, reconfigurer la clé
```

---

### ❌ Erreur : "npm: command not found"

**Symptôme :**
Quand vous tapez `npm`, vous obtenez "command not found"

**Cause :**
Node.js n'est pas installé ou pas dans le PATH

**✅ Solution :**

**1. Télécharger et installer Node.js :**
https://nodejs.org/ (version LTS recommandée)

**2. Vérifier l'installation :**
```bash
# Fermer et rouvrir le terminal
node --version   # Devrait afficher v18.x.x ou plus
npm --version    # Devrait afficher 9.x.x ou plus
```

**3. Si toujours pas trouvé (Windows) :**
- Rechercher "Variables d'environnement"
- Ajouter au PATH : `C:\Program Files\nodejs\`
- Redémarrer le terminal

---

### ❌ Le serveur relay se ferme immédiatement

**Symptôme :**
Le serveur démarre puis s'arrête tout de suite

**Causes possibles :**
1. Port déjà utilisé
2. Erreur dans le code
3. Dépendances manquantes

**✅ Solutions :**

**1. Vérifier les dépendances :**
```bash
npm install
```

**2. Lancer avec les erreurs visibles :**
```bash
npm run relay
```

Lire attentivement le message d'erreur.

**3. Vérifier les ports disponibles :**
```bash
# Windows
netstat -an | findstr :8080

# Mac/Linux
lsof -i :8080
```

---

### ❌ Erreur : "Failed to compile"

**Symptôme :**
Le build ou le dev server ne démarre pas

**✅ Solution :**

**1. Nettoyer le cache :**
```bash
# Supprimer les dossiers de cache
rm -rf .next
rm -rf node_modules
rm package-lock.json

# Réinstaller
npm install
```

**2. Vérifier TypeScript :**
```bash
npm run build
```

Corriger les erreurs TypeScript affichées.

---

### ❌ "API Error: Insufficient quota"

**Symptôme :**
Message d'erreur indiquant un quota insuffisant

**Cause :**
Votre compte OpenAI n'a plus de crédits

**✅ Solution :**
1. Aller sur https://platform.openai.com/account/billing
2. Ajouter des crédits à votre compte
3. Vérifier votre plan d'abonnement

---

### ❌ L'audio ne fonctionne pas / Pas de son

**Symptôme :**
Le microphone ne capte rien ou l'IA ne répond pas

**✅ Diagnostic :**

**1. Tester votre microphone :**
- Windows : Paramètres → Son → Entrée
- Mac : Préférences Système → Son → Entrée

**2. Vérifier dans le navigateur :**
```
chrome://settings/content/microphone
```

**3. Regarder la console :**
Ouvrir F12 et vérifier les erreurs de type :
```
getUserMedia error
AudioContext error
```

**4. Forcer HTTPS en local (si nécessaire) :**
Certains navigateurs exigent HTTPS pour le microphone.

---

## 🆘 Obtenir de l'Aide

Si vous rencontrez un problème non listé :

1. **Ouvrir la console du navigateur** (F12)
2. **Copier le message d'erreur complet**
3. **Vérifier les logs du serveur relay**
4. **Chercher l'erreur sur Google/Stack Overflow**

### Informations utiles à fournir :

- Version de Node.js : `node --version`
- Système d'exploitation : Windows/Mac/Linux
- Message d'erreur complet
- Ce que vous faisiez quand l'erreur s'est produite

---

## ✅ Checklist de Démarrage Rapide

Avant de demander de l'aide, vérifiez :

- [ ] Node.js installé (v18+)
- [ ] `npm install` exécuté avec succès
- [ ] Les deux serveurs tournent (`npm run dev:all`)
- [ ] Clé API OpenAI valide configurée
- [ ] Microphone autorisé dans le navigateur
- [ ] Aucune erreur dans la console (F12)
- [ ] Ports 3000 et 8080 disponibles

---

## 🔍 Commandes de Diagnostic

```bash
# Vérifier les versions
node --version
npm --version

# Vérifier les dépendances
npm list --depth=0

# Nettoyer et réinstaller
rm -rf node_modules package-lock.json
npm install

# Tester le build
npm run build

# Vérifier les ports utilisés (Windows)
netstat -ano | findstr ":3000\|:8080"

# Vérifier les ports utilisés (Mac/Linux)
lsof -i :3000
lsof -i :8080
```

---

**Dernière mise à jour :** 2024-12-05
