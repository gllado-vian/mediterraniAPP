# Què sopem

PWA local-first per decidir què sopar en segons, amb rotació setmanal de
categories d'inspiració mediterrània. Sense backend ni login: les dades viuen al
dispositiu (IndexedDB).

- Especificació: [docs/ESPECIFICACIO.md](docs/ESPECIFICACIO.md)
- Context de producte (Impeccable): [PRODUCT.md](PRODUCT.md)

## Desenvolupament

```bash
npm install
npm run dev        # servidor local
npm test           # tests (Vitest)
npm run build      # typecheck + build PWA
```

Plugins de Claude Code del projecte (`.claude/settings.json`): **Superpowers**
(TDD) i **Impeccable** (disseny).
