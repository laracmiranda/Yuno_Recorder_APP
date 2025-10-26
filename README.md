# <img width="30" height="30" alt="Posts linkedin (1)" src="https://github.com/user-attachments/assets/4e1d726c-201f-4e0e-94f6-61e59b422be9" /> Yuno Recorder

<p align="left"> 

![Node.js](https://img.shields.io/badge/Node.js-22+-a855f7.svg)
![HTML](https://img.shields.io/badge/HTML-5-a855f7.svg)
![CSS](https://img.shields.io/badge/Estilo-CSS-a855f7.svg)
![Javascript](https://img.shields.io/badge/Javascript-ES6+-a855f7.svg)
![Electron Forge](https://img.shields.io/badge/Electron-38.3-a855f7.svg)

Aplicativo de gravador de tela desenvolvido com **Electron Forge**, que permite capturar vídeos da tela do seu computador com áudio e microfone, de forma simples e intuitiva!

## 📸 Demonstração rápida

![yuno-recorder ‐ Feito com o Clipchamp](https://github.com/user-attachments/assets/8edab8e8-f0ea-4acf-8c57-48120d0c679f)

---

## 📲 Funcionalidades

- Captura de tela com qualidade nativa
- Escolha da janela ou monitor a ser gravado
- Gravação em vídeo `.webm`
- Opção de gravar com microfone
- Interface minimalista e intuitiva
- Salvamento automático do arquivo gravado
- Compatível com Windows, macOS e Linux

---

## ⚒️ Tecnologias utilizadas

* **Electron Forge** — empacotamento e distribuição simplificada
* **JavaScript (ES6+)** — lógica principal do app
* **MediaDevices API** — captura de tela e áudio do sistema
* **HTML + CSS** — interface leve e responsiva
* **Node.js** — integração com o sistema de arquivos

---

## 📂 Estrutura do projeto

```
yuno-recorder/
├── src/
│   ├── index.js          # Processo principal (main)
│   ├── render.js         # Lógica da interface (renderer)
│   ├── index.html        # Layout principal
│   └── index.css         # Estilos da interface
├── package.json
├── forge.config.js
└── README.md
```

---

## 📦 Instalação e execução

1️. Clonar o repositório

```bash
git clone https://github.com/seu-usuario/screen-recorder.git
cd screen-recorder
```

2. Instalar dependências

```bash
npm install
```

3. Executar em modo de desenvolvimento

```bash
npm start
```

4. Gerar build do aplicativo

```bash
npm run make
```

O executável será gerado na pasta `out/`.

---

## 💡 Como funciona

1. O app usa a **API `desktopCapturer`** do Electron para listar as fontes de vídeo disponíveis (telas e janelas).
2. Após selecionar uma fonte, a **MediaDevices API** (`navigator.mediaDevices.getDisplayMedia`) é usada para capturar o vídeo.
3. O stream é gravado usando a **MediaRecorder API**.
4. O vídeo é salvo localmente através do módulo `fs` do Node.js.

---

## 🧰 Como usar?

1. Abra o aplicativo
2. Clique em **“Selecionar tela”**
3. Escolha o monitor ou janela desejada
4. Pressione **“Gravar”**
5. Clique em **“Parar gravação”** para salvar o arquivo

---

## 🐞 Possíveis erros

| Erro                                             | Causa provável                                 | Solução                                                            |
| ------------------------------------------------ | ---------------------------------------------- | ------------------------------------------------------------------ |
| `TypeError: Failed to execute 'getDisplayMedia'` | Restrições incompatíveis ou falta de permissão | Verifique se o navegador/ambiente Electron permite captura de tela |
| Áudio não é gravado                              | Microfone não incluído na captura              | Ajuste as permissões ou revise o `constraints` da `MediaRecorder`  |

---

## 📄 Licença

Este projeto está sob a licença **MIT** — sinta-se livre para usar, modificar e compartilhar.
