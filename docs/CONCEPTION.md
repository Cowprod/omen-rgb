# Conception — omen-rgb

## Objectif
Piloter les trois zones RGB du HP OMEN 40L PC005 depuis une interface Web locale, puis permettre un monitoring ultérieur sans modifier le verrou d'extinction.

## Périmètre Web V1
- Serveur Node.js local : HTTP + WebSocket, interface responsive Bootstrap 5 / Bootswatch Quartz, Font Awesome, jQuery.
- Zones indépendantes : logo (1), intérieur (2), ventilateurs avant (3).
- Couleur hexadécimale et luminosité 0–100 par zone ; commande globale ; switch général ON/OFF.
- Réglages modifiables même en OFF : ils sont mémorisés sans rallumer les LED.
- Diffusion WebSocket à tous les clients lors de chaque modification, y compris celles issues du futur monitoring.
- Snapshot complet à la connexion et après reconnexion WebSocket.
- État persistant dans un JSON local non versionné, écrit atomiquement.
- État souhaité, dernier état appliqué et disponibilité du contrôleur affichés sans prétendre à une lecture matérielle effective.

## Invariants
1. OFF est prioritaire sur toute source de changement ; aucune mise à jour monitoring ou client ne peut remettre ON implicitement.
2. Toutes les commandes HID passent par un unique gestionnaire d'éclairage ; les écritures sont sérialisées.
3. Après démarrage du service, l'état persistant est réappliqué. Un reboot physique peut présenter un bref éclairage blanc avant lancement du service.
4. Les erreurs HID sont exposées, sans présenter un état souhaité comme un état matériel garanti.
5. Le serveur HTTP/WebSocket écoute sur 0.0.0.0 pour être accessible sur le LAN et via ZeroTier. L'accès est limité aux réseaux de confiance par configuration pare-feu ; une authentification applicative éventuelle reste à arbitrer.

## Parcours principal
Connexion -> snapshot WS -> changement UI -> validation serveur -> persistance JSON -> application HID si autorisée -> diffusion à tous les clients. En OFF, la modification est conservée et diffusée mais aucune couleur non noire n'est appliquée.

## Hors périmètre Web V1
Monitoring CPU/GPU/Ollama, exposition Internet, multi-machines, authentification complexe, base SQL.
