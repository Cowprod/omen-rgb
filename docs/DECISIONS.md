# Décisions

- D-001 — PRODUIT — VALIDÉE : trois zones indépendantes (logo, intérieur, ventilateurs avant).
- D-002 — TECHNIQUE — VALIDÉE : Node.js et HID USB HP TracerLED 103c:84fd ; protocole statique qualifié sur PC005.
- D-003 — PRODUIT — VALIDÉE : OFF général persistant, prioritaire sur le monitoring ; seul un ON explicite le lève.
- D-004 — PRODUIT — VALIDÉE : réglages modifiables en OFF, mémorisés sans allumage.
- D-005 — TECHNIQUE — VALIDÉE : persistance locale JSON, sans base SQL.
- D-006 — PRODUIT — VALIDÉE : plusieurs interfaces synchronisées en temps réel par WebSockets ; reconnexion avec état complet.
- D-007 — UX — VALIDÉE : Bootstrap 5, Bootswatch Quartz, Font Awesome, jQuery et conventions Cowprod FRONTEND.md.
- D-008 — TECHNIQUE — À QUALIFIER : OFF matériel via couleur noire 000000 ; vérifier physiquement le comportement et l'absence d'effet inter-zone.
- D-009 — PRODUIT/TECHNIQUE — VALIDÉE : écoute sur 0.0.0.0 pour accès LAN et ZeroTier. Sécurisation réseau et éventuelle authentification applicative à préciser.
