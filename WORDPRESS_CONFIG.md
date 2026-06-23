# Configuration WordPress requise

## Wordfence — Débloquer GraphQL

Dans WP Admin → Wordfence → All Options → Firewall Options → Advanced Firewall Options

Ajouter dans "Whitelisted URLs" :
```
/graphql
```

OU dans Wordfence → Firewall → Allowlist :
- Type : URL
- URL : /graphql

## Résultat attendu
Sans cette config, Wordfence bloque toutes les requêtes POST vers /graphql
venant d'IPs non reconnues, ce qui vide le site en local et sur le VPS.
