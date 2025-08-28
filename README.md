### ScanVisionApp – Detecção e Análise Facial no Mobile (Expo)

Aplicativo mobile construído com Expo/React Native para capturar ou selecionar imagens e enviá‑las a uma API de visão computacional que realiza análise facial (idade estimada, gênero e emoções predominantes). O fluxo é simples: o usuário tira uma foto ou escolhe da galeria, o app envia a imagem para a API e exibe os resultados de forma amigável.

- **API do projeto**: [`VisionScanAPI` (GitHub)](https://github.com/PedroJanneo/VisionScanAPI.git)

### Funcionalidades

- **Captura de imagem pela câmera** (frontal) usando `expo-camera`.
- **Seleção de imagem da galeria** via `expo-image-picker`.
- **Envio multipart/form-data** para o endpoint `/analyze` da API.
- **Exibição dos resultados**: idade estimada, distribuição de gênero e emoção predominante.
- **Tratamento de erros** e feedback de carregamento durante a análise.

### Arquitetura em alto nível

- **App (este repositório)**: Expo/React Native. Arquivo principal em `app/app.js`.
- **Backend**: Flask/Python (repositório acima), expõe `POST /analyze` para processar a imagem e retornar JSON com as inferências.

### Pré‑requisitos

- Node.js LTS e npm instalados
- Expo CLI (recomendado via `npx`)
- Dispositivo físico ou emulador Android/iOS configurado
- Backend em execução acessível pela rede (local ou remoto)

### Instalação e execução (App)

1. Instale as dependências:

   ```bash
   npm install
   ```

2. Inicie o app:

   ```bash
   npx expo start
   ```

   No terminal/web, escolha abrir no **Expo Go**, **emulador Android** ou **simulador iOS**.

### Configuração do backend (URL da API)

O app usa a constante `BACKEND_URL` em `app/app.js` para definir o endpoint do backend:

```js
const BACKEND_URL = Platform.select({
  web: 'http://localhost:5000/analyze',
  default: 'http://SEU_IP_LOCAL:5000/analyze'
});
```

- **Web**: utiliza `http://localhost:5000/analyze`.
- **Mobile (dispositivo/emulador)**: defina o IP da máquina que roda a API (ex.: `http://192.168.0.10:5000/analyze`).
- Garanta que o dispositivo e o servidor estejam na **mesma rede** e que a porta esteja acessível.

### Como usar

1. Abra o app e escolha entre:
   - **Abrir Câmera** para tirar uma foto; ou
   - **Galeria** para selecionar uma imagem.
2. Toque em **Analisar Face** para enviar a imagem à API.
3. Visualize os resultados na seção “Resultados da Análise”.

### Permissões

- Câmera: solicitada ao abrir a funcionalidade de captura.
- Galeria/Arquivos: solicitada ao selecionar imagens.

### Estrutura relevante

- `app/index.tsx`: exporta o app principal.
- `app/--app.js`: wrapper simples para o componente principal.
- `app/app.js`: UI/UX principal, integração com câmera/galeria e chamada à API.

### Tecnologias

- React Native + Expo
- `expo-camera`, `expo-image-picker`
- `axios` para requisições HTTP

### Troubleshooting

- “Permissão negada”: verifique permissões da câmera/galeria nas configurações do dispositivo.
- “Timeout” ou erro de rede: confirme `BACKEND_URL`, IP correto e se a API está rodando e acessível.
- Em web, câmera pode ser limitada; prefira **Galeria** ou rode no dispositivo.

### API VisionScanAPI

- Repositório: [`VisionScanAPI` (GitHub)](https://github.com/PedroJanneo/VisionScanAPI.git)
- Endpoint esperado pelo app: `POST /analyze` recebendo `multipart/form-data` com campo `image` e retornando JSON com chaves como `age` (`idade`), `gender` (`genero`) (objeto com scores) e `emotion` (`emoção`) (objeto com scores).

---

Se precisar de ajuda para configurar o backend ou publicar o app, abra uma issue.
