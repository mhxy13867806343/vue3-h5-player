# Vue3 H5 Music Player

## Project Introduction

A mobile music player application developed based on Vue3, providing functions such as music playback, MV viewing, and playlist management. The project uses the latest Vue3 technology stack, combined with the Vant UI component library, to present a beautiful and smooth user experience.

## Technology Stack

- **Frontend Framework**: Vue 3 + Composition API
- **Build Tool**: Vite
- **UI Component Library**: Vant UI 4.x
- **State Management**: Pinia
- **Router**: Vue Router 4.x
- **HTTP Requests**: Axios
- **CSS Preprocessor**: SCSS

## Features

- 🎵 **Music Playback**: Support play/pause, previous/next, playback mode switching, etc.
- 📱 **Global Player**: Support mini player and full-screen playback page
- 📋 **Playlist Management**: Recommended playlists, playlist detail browsing
- 🎬 **MV Playback**: Support for multiple resolutions (480p/720p/1080p) switching
- 💿 **Album Details**: Browse album information, song list and one-click playback function
- 👨‍🎤 **Artist Page**: Artist rankings, artist detail views
- 📜 **Playback History**: Automatically record local music and MV playback history, support batch selection, search filtering and batch operations
- 📱 **WeChat Environment Detection**: Optimize the browsing experience within WeChat, provide prompts to open in browser
- 🔍 **Search Function**: Support searching for songs, playlists, artists, etc.
- 💬 **Comment System**: View comments on songs, playlists, MVs
- 💾 **State Persistence**: Support retaining playback state, history records and other data after page refresh
- 🐋 **Cross-page Adaptive Layout**: The player adapts its layout in different pages, ensuring a good user experience

## API Interface

This project uses the open source NetEase Cloud Music API, reference documentation: [NeteaseCloudMusicApi](https://github.com/Binaryify/NeteaseCloudMusicApi)

The main API interfaces used include:

- Get recommended playlists: `/personalized`
- Get playlist details: `/playlist/detail`
- Get song URL: `/song/url/v1`
- Get song details: `/song/detail`
- Get MV details: `/mv/detail`
- Get MV playback address: `/mv/url` (supports resolution parameter r)
- Get similar MV: `/simi/mv`
- Get comments: `/comment` series interfaces
- Search interfaces: `/search` series interfaces

## Project Structure

```
├── public/             # Static resource directory
├── src/                # Source code directory
│   ├── apis/           # API interfaces
│   ├── assets/         # Resource files
│   ├── components/     # Common components
│   │   ├── MiniPlayer.vue  # Mini player component
│   │   └── PlayerPage.vue  # Full-screen playback page component
│   ├── router/         # Router configuration
│   ├── store/          # Pinia state management
│   │   └── modules/    # Modularized stores
│   ├── styles/         # Global styles
│   ├── utils/          # Utility functions
│   ├── views/          # Page components
│   │   ├── home/       # Home page
│   │   ├── playlist/   # Playlist related pages
│   │   ├── mv/         # MV related pages
│   │   ├── artist/     # Artist related pages
│   │   └── search/     # Search related pages
│   ├── App.vue         # Root component
│   └── main.js         # Entry file
├── index.html          # HTML entry file
└── vite.config.js      # Vite configuration file
```

## Running the Project

### Requirements

- Node.js: v16.0.0 or higher
- pnpm: v7.0.0 or higher
- Vue: v3.3.x
- Vite: v4.x

### Installation and Running

This project uses pnpm as the package management tool, please install pnpm first:

```bash
# Install pnpm globally
npm install -g pnpm

# Check version
pnpm -v
```

Then execute the following commands to run the project:

```bash
# Install dependencies
pnpm install

# Run in development mode
pnpm dev

# Build production version
pnpm build
```

## Project Highlights

1. Using Vue3 Composition API, the code organization is clearer
2. Using Pinia for state management, implementing global player functionality
3. Support for MV multiple resolution switching
4. Mobile-friendly UI design, based on Vant component library
5. Seamless switching between global player and mini player
