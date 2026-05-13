<p align="center">
  <a href="https://opencode.ai">
    <picture>
      <source srcset="packages/console/app/src/asset/logo-ornate-dark.svg" media="(prefers-color-scheme: dark)">
      <source srcset="packages/console/app/src/asset/logo-ornate-light.svg" media="(prefers-color-scheme: light)">
      <img src="packages/console/app/src/asset/logo-ornate-light.svg" alt="Sally Code logo">
    </picture>
  </a>
</p>
<p align="center">Sally Code, our own open source AI coding agent fork.</p>
<p align="center">
  <a href="https://opencode.ai/discord"><img alt="Discord" src="https://img.shields.io/discord/1391832426048651334?style=flat-square&label=discord" /></a>
  <a href="https://www.npmjs.com/package/sally-code-ai"><img alt="npm" src="https://img.shields.io/npm/v/sally-code-ai?style=flat-square" /></a>
  <a href="https://github.com/paradox974333/opencode/actions/workflows/release-sally-code-cli.yml"><img alt="Build status" src="https://img.shields.io/github/actions/workflow/status/paradox974333/opencode/release-sally-code-cli.yml?style=flat-square&branch=dev" /></a>
</p>

<p align="center">
  <a href="README.md">English</a> |
  <a href="README.zh.md">简体中文</a> |
  <a href="README.zht.md">繁體中文</a> |
  <a href="README.ko.md">한국어</a> |
  <a href="README.de.md">Deutsch</a> |
  <a href="README.es.md">Español</a> |
  <a href="README.fr.md">Français</a> |
  <a href="README.it.md">Italiano</a> |
  <a href="README.da.md">Dansk</a> |
  <a href="README.ja.md">日本語</a> |
  <a href="README.pl.md">Polski</a> |
  <a href="README.ru.md">Русский</a> |
  <a href="README.bs.md">Bosanski</a> |
  <a href="README.ar.md">العربية</a> |
  <a href="README.no.md">Norsk</a> |
  <a href="README.br.md">Português (Brasil)</a> |
  <a href="README.th.md">ไทย</a> |
  <a href="README.tr.md">Türkçe</a> |
  <a href="README.uk.md">Українська</a> |
  <a href="README.bn.md">বাংলা</a> |
  <a href="README.gr.md">Ελληνικά</a> |
  <a href="README.vi.md">Tiếng Việt</a>
</p>

[![Sally Code Terminal UI](packages/web/src/assets/lander/screenshot.png)](https://opencode.ai)

---

### Installation

```bash
# macOS, Linux, WSL, and Git Bash
curl -fsSL https://github.com/paradox974333/opencode/releases/latest/download/install | bash

# Windows PowerShell
irm https://raw.githubusercontent.com/paradox974333/opencode/20ad02c929c336497337e581271f26842a94919b/install.ps1 | iex

# Package managers
npm i -g sally-code-ai@latest      # or bun/pnpm/yarn
```

> [!TIP]
> Remove versions older than 0.1.x before installing.

#### Publishing a Release

The installer downloads binaries from GitHub Releases. To make it live for other PCs:

1. Push this repo to GitHub.
2. Open **Actions** -> **release-sally-code-cli**.
3. Run the workflow with a version like `1.14.49`.

The workflow uploads the installer scripts and platform archives. macOS and Linux install from the release asset, while Windows PowerShell reads the installer from the repo as plain text and then downloads the latest release binary:

```bash
curl -fsSL https://github.com/paradox974333/opencode/releases/latest/download/install | bash
irm https://raw.githubusercontent.com/paradox974333/opencode/20ad02c929c336497337e581271f26842a94919b/install.ps1 | iex
```

### Desktop App (BETA)

Sally Code is also available as a desktop application. Download directly from the [releases page](https://github.com/anomalyco/opencode/releases) or [opencode.ai/download](https://opencode.ai/download).

| Platform              | Download                           |
| --------------------- | ---------------------------------- |
| macOS (Apple Silicon) | `opencode-desktop-mac-arm64.dmg`   |
| macOS (Intel)         | `opencode-desktop-mac-x64.dmg`     |
| Windows               | `opencode-desktop-windows-x64.exe` |
| Linux                 | `.deb`, `.rpm`, or `.AppImage`     |

```bash
# macOS (Homebrew)
brew install --cask opencode-desktop
# Windows (Scoop)
scoop bucket add extras; scoop install extras/opencode-desktop
```

#### Installation Directory

The install script respects the following priority order for the installation path:

1. `$SALLY_CODE_INSTALL_DIR` - Custom installation directory
2. `$XDG_BIN_DIR` - XDG Base Directory Specification compliant path
3. `$HOME/bin` - Standard user binary directory (if it exists or can be created)
4. `$HOME/.sally-code/bin` - Default fallback

```bash
# Examples
SALLY_CODE_INSTALL_DIR=/usr/local/bin curl -fsSL https://github.com/paradox974333/opencode/releases/latest/download/install | bash
XDG_BIN_DIR=$HOME/.local/bin curl -fsSL https://github.com/paradox974333/opencode/releases/latest/download/install | bash
```

### Agents

Sally Code includes two built-in agents you can switch between with the `Tab` key.

- **build** - Default, full-access agent for development work
- **plan** - Read-only agent for analysis and code exploration
  - Denies file edits by default
  - Asks permission before running bash commands
  - Ideal for exploring unfamiliar codebases or planning changes

Also included is a **general** subagent for complex searches and multistep tasks.
This is used internally and can be invoked using `@general` in messages.

Learn more about [agents](https://opencode.ai/docs/agents).

### Documentation

For more info on how to configure Sally Code, [**head over to our docs**](https://opencode.ai/docs).

### Contributing

If you're interested in contributing to Sally Code, please read our [contributing docs](./CONTRIBUTING.md) before submitting a pull request.

### Building on Sally Code

If you are working on a project that's related to Sally Code and is using "opencode" as part of its name, for example "opencode-dashboard" or "opencode-mobile", please add a note to your README to clarify that it is not built by the Sally Code team and is not affiliated with us in any way.

### FAQ

#### How is this different from Claude Code?

It's very similar to Claude Code in terms of capability. Here are the key differences:

- 100% open source
- Not coupled to any provider. Although we recommend the models we provide through [Sally Code Zen](https://opencode.ai/zen), Sally Code can be used with Claude, OpenAI, Google, or even local models. As models evolve, the gaps between them will close and pricing will drop, so being provider-agnostic is important.
- Built-in opt-in LSP support
- A focus on TUI. Sally Code is built by neovim users and the creators of [terminal.shop](https://terminal.shop); we are going to push the limits of what's possible in the terminal.
- A client/server architecture. This, for example, can allow Sally Code to run on your computer while you drive it remotely from a mobile app, meaning that the TUI frontend is just one of the possible clients.

---

**Join our community** [Discord](https://discord.gg/opencode) | [X.com](https://x.com/opencode)
