<h1 align="center" style="border-bottom: none;"><img src="public/favicon.svg" width="24" style="vertical-align: middle; margin-right: 8px;" /> Transmission Next UI</h1>
<h3 align="center"> A third-party modern web-based frontend for Transmission, offering a sleek and responsive UI for managing your torrents with ease, built using shadcn/ui and Vite. </h3>

## Tech Stack

- **Framework**: [React 19](https://react.dev/) + [Vite 7](https://vite.dev/)
- **Styling**: [Tailwind CSS 4.0](https://tailwindcss.com/)
- **Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Routing**: [React Router 7](https://reactrouter.com/)

---

English | [简体中文](README.md)

## Preview

[**Live Demo**](https://transmission-next-ui-demo.pages.dev)

| Light Mode | Dark Mode |
| :---: | :---: |
| ![dashboard_light_en.png](pic/dashboard_light_en.png) | ![dashboard_dark_en.png](pic/dashboard_dark_en.png) |

| Torrent Details | Settings |
| :---: | :---: |
| ![torrent_details_en.png](pic/torrent_details_en.png) | ![settings_en.png](pic/settings_en.png) |

## Features

- Modern UI Design
- Responsive Layout, Perfect for All Devices
- Powered by Vite and Tailwind CSS 4.0
- [x] Torrent Management and Information Viewing
- [x] Configuration Settings
- [x] Drag-and-Drop/Paste to Add Torrents
- [x] Dark Mode Support
- [x] Tracker Filter
- [x] Torrent Label Support
- [x] Batch Replace Trackers

⚠️**Notice**: This is an early version of the project. It has not been fully tested yet. Please verify its functionality before using it in production.

## Quick Start

You can deploy Transmission Next UI in three different ways:

### 1. Easy Install

> Requires: `docker`, `docker-compose`, and `curl`

> [!TIP]
> It's recommended to create a dedicated directory for your files first:
> ```bash
> mkdir -p ~/transmission && cd ~/transmission
> ```

To install web UI or upgrade to the latest version, run the following command:

```bash
curl -fsSL https://raw.githubusercontent.com/hisproc/transmission-next-ui/main/download.sh | bash
```

This will download the latest release and create a `docker-compose.yml` file in your current directory.

You can now modify the `docker-compose.yml` file to set your own **Transmission username**, **password**, and **timezone**:

```yaml
environment:
  - USER=your-username
  - PASS=your-password
  - TZ=Asia/Shanghai
```

Then use the following commands to start or stop the service:

```bash
docker-compose up -d   # start in background
docker-compose down    # stop and remove the container
```

By default, the container runs using `network_mode: host` for better connectivity, which is ideal for Linux environments. If you are on **macOS**, `host` mode is not supported — you will need to manually switch to **port mapping** (e.g., `9091:9091`) in the `docker-compose.yml` file. You can adjust this behavior in the `docker-compose.yml` according to your network setup.

### 2. Manual Install

1. Go to the [Releases](https://github.com/hisproc/transmission-next-ui/releases) page
2. Download the latest or stable release (e.g. `transmission-next-ui-v1.0.0.zip`)
3. Extract it and copy the contents to your transmission web directory (e.g. transmission/web/src)


### 3. Build from Source

```bash
git clone git@github.com:hisproc/transmission-next-ui.git
cd transmission-next-ui
pnpm install
pnpm build
```

Then, copy the contents of the `dist/` folder to your transmission web directory.

## License

This project is licensed under the [MIT License](LICENSE).
