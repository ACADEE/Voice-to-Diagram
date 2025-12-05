# 🎤 Guide de Débogage - Problème d'Enregistrement Audio

## 🐛 Problème : Déconnexion lors du "Start Recording"

Si la connexion OpenAI se coupe quand vous cliquez sur "Start Recording", suivez ce guide.

---

## 🔍 Diagnostic Étape par Étape

### Étape 1 : Vérifier les Logs du Navigateur

1. **Ouvrir la console** : Appuyez sur `F12`
2. **Onglet Console**
3. **Cliquer sur "Start Recording"**
4. **Observer les messages**

#### Messages à chercher :

```javascript
// ✅ Normal
"Requesting microphone access..."
"Microphone access granted"
"Recording started successfully"

// ❌ Erreur
"WebSocket closed: code=1006, reason=..."
"Error processing audio: ..."
```

### Étape 2 : Vérifier les Logs du Serveur Relay

Dans le terminal où tourne `npm run relay`, vous devriez voir :

```bash
# ✅ Normal
Client connected
Connected to OpenAI Realtime API
Session configured with generate_diagram tool

# ❌ Problème
OpenAI disconnected: code=1008 reason=...
Policy violation - possible API key issue
```

---

## 🔧 Solutions par Code d'Erreur

### Code 1006 - Abnormal Closure

**Cause :** Connexion perdue de manière anormale

**Solutions :**

1. **Vérifier votre connexion internet**
   ```bash
   # Test de connectivité
   ping openai.com
   ```

2. **Vérifier les limites de quota OpenAI**
   - Allez sur : https://platform.openai.com/usage
   - Vérifiez que vous avez des crédits disponibles
   - Vérifiez les limites de taux (rate limits)

3. **Redémarrer le serveur relay**
   ```bash
   # Terminal relay
   Ctrl+C
   npm run relay
   ```

### Code 1008 - Policy Violation

**Cause :** Violation de politique (souvent clé API invalide)

**Solutions :**

1. **Vérifier votre clé API**
   - Format correct : `sk-proj-...` ou `sk-...`
   - Clé non expirée
   - Clé avec accès à l'API Realtime

2. **Régénérer une nouvelle clé**
   - https://platform.openai.com/api-keys
   - Créer une nouvelle clé
   - La configurer dans l'application

3. **Vérifier les permissions de la clé**
   - La clé doit avoir accès à "Realtime API"
   - Vérifier les restrictions d'IP si activées

### Code 1000 - Normal Closure

**Cause :** Fermeture normale (probablement un timeout)

**Solutions :**

1. **Vérifier le timeout du serveur**
2. **Parler plus rapidement après avoir cliqué "Start Recording"**
3. **Vérifier que votre microphone fonctionne**

---

## 🎯 Vérifications Spécifiques

### 1. Tester le Microphone

**Windows :**
```
Paramètres → Système → Son → Entrée
Testez votre microphone
```

**Mac :**
```
Préférences Système → Son → Entrée
Vérifiez le niveau d'entrée
```

**Navigateur :**
```javascript
// Dans la console (F12), exécutez :
navigator.mediaDevices.getUserMedia({ audio: true })
  .then(stream => console.log("✅ Microphone OK", stream))
  .catch(err => console.error("❌ Erreur:", err));
```

### 2. Vérifier les Permissions du Navigateur

**Chrome/Edge :**
1. Cliquez sur l'icône 🔒 dans la barre d'adresse
2. Vérifiez que "Microphone" est "Autorisé"
3. Si bloqué, changez en "Autoriser"
4. Rechargez la page (F5)

**Firefox :**
1. Cliquez sur l'icône 🛡️
2. Permissions → Microphone
3. Autoriser

### 3. Vérifier la Configuration Audio

Dans la console du navigateur, vérifiez :

```javascript
// Vérifier les contraintes audio
navigator.mediaDevices.getSupportedConstraints()

// Devrait inclure :
// - channelCount: true
// - sampleRate: true
// - echoCancellation: true
// - noiseSuppression: true
```

---

## 🔬 Tests de Diagnostic

### Test 1 : Connexion sans Audio

1. Cliquez sur "Connect"
2. **N'APPUYEZ PAS** sur "Start Recording"
3. Attendez 30 secondes
4. **Résultat attendu :** Connexion reste verte

**Si ça se déconnecte :**
→ Problème de connexion WebSocket ou API key

**Si ça reste connecté :**
→ Le problème vient bien de l'audio

### Test 2 : Vérifier le Format Audio

Ajoutez ce code dans la console pour vérifier l'audio envoyé :

```javascript
// Intercepter les messages WebSocket
const originalSend = WebSocket.prototype.send;
WebSocket.prototype.send = function(data) {
  try {
    const msg = JSON.parse(data);
    if (msg.type === "input_audio_buffer.append") {
      console.log("📤 Audio sent, size:", msg.audio.length);
    }
  } catch(e) {}
  return originalSend.call(this, data);
};
```

**Résultat attendu :**
```
📤 Audio sent, size: 5464
📤 Audio sent, size: 5464
📤 Audio sent, size: 5464
```

Si vous ne voyez pas ces messages → L'audio n'est pas envoyé

### Test 3 : Créer un Enregistrement de Test

```javascript
// Dans la console
navigator.mediaDevices.getUserMedia({
  audio: {
    channelCount: 1,
    sampleRate: 24000,
    echoCancellation: true,
    noiseSuppression: true,
  }
})
.then(stream => {
  console.log("✅ Stream créé:", stream.getAudioTracks()[0].getSettings());
  stream.getTracks().forEach(t => t.stop());
})
.catch(err => console.error("❌ Erreur:", err));
```

**Vérifiez :**
- `sampleRate: 24000` (ou proche)
- `channelCount: 1`

---

## 🛠️ Solutions Avancées

### Solution 1 : Vider le Cache du Navigateur

```
Chrome/Edge:
Ctrl+Shift+Delete → Cocher "Images et fichiers en cache" → Effacer

Firefox:
Ctrl+Shift+Delete → Cocher "Cache" → Effacer maintenant
```

### Solution 2 : Utiliser un Autre Navigateur

Testez avec :
- Chrome (recommandé)
- Edge
- Firefox

Safari peut avoir des problèmes avec Web Audio API.

### Solution 3 : Désactiver les Extensions

Certaines extensions peuvent bloquer :
- Bloqueurs de publicité
- Extensions de confidentialité
- Extensions de sécurité

**Test en mode Incognito/Privé :**
```
Chrome: Ctrl+Shift+N
Firefox: Ctrl+Shift+P
Edge: Ctrl+Shift+N
```

### Solution 4 : Vérifier le Pare-feu/Antivirus

Le WebSocket peut être bloqué par :
- Pare-feu Windows
- Antivirus (Avast, Norton, etc.)
- VPN

**Test :**
1. Désactivez temporairement le pare-feu
2. Testez l'enregistrement
3. Si ça marche, ajoutez une exception pour localhost:8080

---

## 📊 Informations de Débogage à Fournir

Si le problème persiste, collectez ces informations :

### Navigateur

```javascript
// Dans la console
console.log({
  userAgent: navigator.userAgent,
  language: navigator.language,
  onLine: navigator.onLine,
  mediaDevices: !!navigator.mediaDevices
});
```

### Serveur Relay

Copiez la sortie complète du terminal où tourne `npm run relay`, incluant :
- Le message de connexion
- Les erreurs éventuelles
- Le code de déconnexion

### Console Navigateur

Copiez tous les messages en rouge (erreurs) après avoir cliqué sur "Start Recording".

---

## ✅ Checklist de Vérification

Avant de demander de l'aide :

- [ ] Microphone fonctionne dans d'autres applications
- [ ] Permissions microphone autorisées dans le navigateur
- [ ] Connexion internet stable
- [ ] Clé API OpenAI valide et avec crédits
- [ ] Serveur relay (`npm run relay`) tourne sans erreurs
- [ ] Console navigateur (F12) ouverte pour voir les erreurs
- [ ] Test avec cache vidé
- [ ] Test en mode Incognito
- [ ] Test avec un autre navigateur

---

## 🎯 Cas Spécifiques

### "Microphone access denied"

**Solution :**
```
1. Vérifier les permissions du navigateur
2. Vérifier les permissions système (Windows/Mac)
3. Débrancher/rebrancher le microphone
4. Redémarrer le navigateur
```

### "WebSocket not connected"

**Solution :**
```
1. Cliquer d'abord sur "Connect"
2. Attendre que le statut devienne vert
3. ENSUITE cliquer sur "Start Recording"
```

### Déconnexion après 2-3 secondes d'enregistrement

**Cause probable :** Quota OpenAI dépassé ou rate limit

**Solution :**
```
1. Vérifier https://platform.openai.com/usage
2. Vérifier les limites de taux
3. Attendre quelques minutes
4. Réessayer
```

---

## 🔄 Procédure de Réinitialisation Complète

Si rien ne fonctionne, réinitialisez tout :

```bash
# 1. Arrêter tous les serveurs (Ctrl+C)

# 2. Nettoyer le projet
rm -rf node_modules .next package-lock.json

# 3. Réinstaller
npm install

# 4. Vider le cache du navigateur
# (Ctrl+Shift+Delete)

# 5. Supprimer la clé API stockée
# Dans la console navigateur (F12) :
localStorage.removeItem('openai_api_key')

# 6. Redémarrer
npm run dev:all

# 7. Reconfigurer la clé API

# 8. Tester
```

---

## 📞 Support

Si après toutes ces étapes le problème persiste :

1. **Collectez les logs** (navigateur + serveur)
2. **Notez le code d'erreur exact**
3. **Vérifiez votre compte OpenAI** (crédits, limites)
4. **Testez avec une nouvelle clé API**

---

## 💡 Astuces

### Réduire les Problèmes Audio

- Utilisez un casque avec micro de qualité
- Évitez les environnements bruyants
- Parlez clairement et pas trop vite
- Attendez 1-2 secondes après "Start Recording" avant de parler

### Optimiser la Connexion

- Fermez les autres applications utilisant le micro
- Désactivez temporairement le VPN
- Utilisez une connexion filaire (Ethernet) si possible

---

**Dernière mise à jour :** 2024-12-05

**Améliorations apportées :**
- Meilleure gestion des erreurs WebSocket
- Logs détaillés pour diagnostic
- Prévention des chevauchements de traitement audio
- Taille de buffer optimisée (2048)
