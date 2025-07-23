# Lições Aprendidas — ALL GREEN BABY

## Migração Expo/React Native: "main has not been registered"

**Resumo:**
Durante a migração estrutural do projeto (removendo expo-router, reorganizando domínios, e limpando arquivos antigos), enfrentamos o clássico erro:

> Invariant Violation: "main" has not been registered. This can happen if: ...

### Causas Identificadas:
- Arquivos antigos (app/, expo-router) ainda presentes e sendo processados pelo Metro.
- Imports quebrados ou vestígios de expo-router em componentes compartilhados.
- Campo "main" no package.json pode confundir o bundler.
- Necessidade de garantir um entrypoint universal (App.js) exportando App.tsx.

### Solução Definitiva:
1. **Remover/renomear a pasta `app/`** para não ser processada pelo Metro.
2. **Limpar todos os imports de expo-router** dos componentes e telas migradas.
3. **Remover o campo `main` do package.json** (Expo detecta automaticamente App.js/ts).
4. **Criar um arquivo `App.js`** na raiz:
   ```js
   export { default } from './App.tsx';
   ```
5. **Limpar cache do Metro** (`expo start -c`).
6. **Verificar se o entrypoint está correto no app.json** (não precisa de entryPoint).

### Resultado:
- O erro de registro sumiu.
- Projeto agora 100% React Navigation, sem expo-router.
- Estrutura de domínios moderna, pronta para crescer.
- ALL GREEN BABY!

---

**Aprendizado:**
> Sempre que mexer profundamente na estrutura de um app Expo/React Native, garanta que:
> - Não existam arquivos de entrada antigos.
> - O entrypoint está limpo e universal.
> - Todos os imports estão atualizados.

---

*Data: 23/07/2025*
*Equipe: Dev + Cascade*
