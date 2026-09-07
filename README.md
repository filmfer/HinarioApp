# Hinário IASD - macOS App

Aplicação desktop para macOS (Apple Silicon M1/M2/M3/M4) que permite reproduzir vídeos de hinos da Igreja Adventista do Sétimo Dia em ecrã completo.

## Funcionalidades

- **Pesquisa de Hinos**: Pesquise hinos por número ou nome
- **Reprodução em Ecrã Completo**: Reproduza vídeos em qualquer monitor conectado
- **Interface Minimalista**: Design escuro e limpo, ideal para uso em cultos
- **Navegação por Teclado**: Use as setas ↑↓ para navegar e Enter para reproduzir
- **Auto-close**: O player fecha automaticamente quando o vídeo termina
- **Seleção de Pasta**: Escolha a pasta onde estão os vídeos MP4 (configuração guardada)

## Requisitos

- macOS 11 (Big Sur) ou superior
- Mac com processador Apple Silicon (M1, M2, M3, M4)
- Vídeos em formato MP4

## Instalação

1. Descarregue o ficheiro `.dmg` ou `.zip` da [página de releases](https://github.com/filmfer/meditacao_iasdah/releases)
2. Abra o ficheiro `.dmg` e arraste a aplicação para a pasta `Applications`
3. Na primeira execução, clique com o botão direito → "Abrir" (necessário para aplicações não assinadas com Developer ID)

## Permissões macOS

A aplicação pode necessitar das seguintes permissões em **System Settings > Privacy & Security**:

- **Removable Volumes**: Se os vídeos estiverem num disco externo
- **Full Disk Access**: Se os vídeos estiverem em pastas protegidas

## Desenvolvimento

### Pré-requisitos

- Node.js 18+
- npm

### Setup

```bash
# Clonar o repositório
git clone https://github.com/filmfer/meditacao_iasdah.git
cd HinarioApp

# Instalar dependências
npm install

# Executar em modo desenvolvimento
npm start
```

### Compilação

```bash
# Compilar para macOS ARM64 (Apple Silicon)
npm run make -- --arch=arm64
```

Os ficheiros compilados ficam disponíveis na pasta `out/make/`.

## Estrutura do Projeto

```
HinarioApp/
├── index.js          # Processo principal Electron
├── index.html        # Interface principal
├── renderer.js       # Lógica do renderer
├── player.html       # Player de vídeo fullscreen
├── preload.js        # Preload script (contextBridge)
├── style.css         # Estilos da interface
├── forge.config.js   # Configuração Electron Forge
├── entitlements.mac.plist  # Entitlements macOS
└── extend.plist      # Info.plist extendida
```

## Tecnologias

- **Electron 41**: Framework para aplicações desktop
- **Electron Forge**: Packaging e distribuição
- **Node.js**: Runtime JavaScript
- **HTML/CSS/Vanilla JS**: Interface do utilizador

## Auto-build

Este repositório inclui um workflow de GitHub Actions que compila automaticamente a aplicação para macOS ARM64 em cada push para a branch `main` ou quando é criada uma tag `v*`.

## Licença

ISC
