# Déploiement de la Web UI (prototype v0.2)

Sur la VM Ubuntu RTX :

```bash
cd ~/omen-rgb
git fetch origin && git switch feat/web-ui && git pull --ff-only
npm install
npm test
sudo env HOST=0.0.0.0 PORT=3080 node src/server.js
```

Interface : http://IP_LAN_RTX:3080 ou http://IP_ZEROTIER_RTX:3080.

Le service écoute sur toutes les interfaces : protéger le port 3080 par le pare-feu si d'autres réseaux sont présents. L'interface n'a pas encore d'authentification : tout client capable de joindre le port peut piloter les LED.

Le fichier data/state.json conserve les réglages et le verrou OFF. Il est exclu de Git. Les ressources CSS/icônes de la maquette sont chargées depuis des CDN ; une connexion Internet du navigateur est nécessaire pour leur style.

**Limites du prototype :** pas encore de service systemd, pas de règle udev, pas de test physique OFF. La CLI directe `omen-rgb set` contourne le verrou applicatif : ne pas l'utiliser en parallèle du service ; son intégration au gestionnaire d'état reste à faire. L'état affiché comme « appliqué » signifie écriture HID réussie, sans retour matériel.
