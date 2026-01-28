<div id="top"></div>

<!-- PROJECT SHIELDS -->
<!--
*** I am using markdown "reference style" links for readability.
*** Reference links are enclosed in brackets [ ] instead of parentheses ( ).
*** See the bottom of this document for the declaration of the reference variables
*** for contributors-url, forks-url, etc. This is an optional, concise syntax you may use.
*** https://www.markdownguide.org/basic-syntax/#reference-style-links
-->

<!-- PROJECT LOGO -->
<div align="center">
  <picture>
    <source
      srcset="public/logo.svg"
      width="128"
      height="128"
      media="(prefers-color-scheme: light)"
    />
    <source
      srcset="public/logo.svg"
      width="128"
      height="128"
      media="(prefers-color-scheme: dark)"
    />
    <img src="docs/light/icon.png" alt="Logo" width="128" height="128">
  </picture>
  <h1 align="center">GraphSolver</h1>
  <p align="center">
    A complete web tool for graph theory. It solves the Dijkstra, Floyd–Warshall, and MST (Kruskal) algorithms and analyzes structural properties via adjacency matrices. Includes dynamic visualization and import/export options.
</p>
  <p>
    <a href="https://github.com/HenestrosaDev/graphsolver.com/stargazers">
      <img
        src="https://img.shields.io/github/stars/HenestrosaDev/graphsolver.com"
        alt="GitHub Contributors"
      />
    </a>
    <a href="https://github.com/HenestrosaDev/graphsolver.com/blob/main/LICENSE">
      <img
        src="https://img.shields.io/badge/License-MIT-green.svg"
        alt="License"
      />
    </a>
    <br>
    <a href="https://github.com/HenestrosaDev/graphsolver.com/graphs/contributors">
      <img
        src="https://img.shields.io/github/contributors/HenestrosaDev/graphsolver.com"
        alt="GitHub Contributors"
      />
    </a>
    <a href="https://github.com/HenestrosaDev/graphsolver.com/issues">
      <img
        src="https://img.shields.io/github/issues/HenestrosaDev/graphsolver.com"
        alt="Issues"
      />
    </a>
    <a href="https://github.com/HenestrosaDev/graphsolver.com/pulls">
      <img
        src="https://img.shields.io/github/issues-pr/HenestrosaDev/graphsolver.com"
        alt="GitHub pull requests"
      />
    </a>
  </p>
  <p>
    <a href="https://github.com/HenestrosaDev/graphsolver.com/issues/new/choose">
      Report Bug
    </a>
    ·
    <a href="https://github.com/HenestrosaDev/graphsolver.com/issues/new/choose">
      Request Feature
    </a>
    ·
    <a href="https://github.com/HenestrosaDev/graphsolver.com/discussions">
      Ask Question
    </a>
  </p>
</div>


<picture>
  <source
    srcset="docs/light.gif"
    media="(prefers-color-scheme: light)"
  />
  <source
    srcset="docs/dark.gif"
    media="(prefers-color-scheme: dark)"
  />
  <img src="docs/light.gif" alt="Logo">
</picture>

<select>

</select>

## Table of Contents

- [Features](#features)
- [Quick Start](#quick-start)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Build for Production](#build-for-production)
- [Usage](#usage)
  - [Basic Workflow](#basic-workflow)
  - [Supported File Formats](#supported-file-formats)
- [Testing](#testing)
- [Technologies Used](#technologies-used)
- [Internationalization](#internationalization)
- [Themes](#themes)
- [Contributing](#contributing)
  - [Development Guidelines](#development-guidelines)
- [License](#license)
- [Acknowledgments](#acknowledgments)
- [Support](#support)


## Features

- **Interactive Graph Visualization**: Real-time graph rendering using vis-network
- **Multiple Algorithms**:
  - **Dijkstra's Algorithm**: Shortest path between nodes
  - **Floyd-Warshall Algorithm**: All-pairs shortest paths
  - **Kruskal's Algorithm**: Minimum spanning tree
- **Flexible Input Methods**:
  - Matrix input interface
  - File import/export (JSON, LaTeX, Dot, GraphML, CSV, GML)
  - Copy/paste functionality
- **Graph Analysis**:
  - Graph properties (connectedness, diameter, etc.)
  - Path visualization
  - Algorithm step-by-step execution
- **Internationalization**: English and Spanish support
- **Dark/Light Theme**: Automatic theme switching
- **Responsive Design**: Works on desktop and mobile devices
- **TypeScript**: Full type safety and better developer experience

## Quick Start

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/graphsolver.com.git
   cd graphsolver.com
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**

   Navigate to `http://localhost:5173` to see GraphSolver in action!

### Build for Production

```bash
npm run build
npm run preview
```

## Usage

### Basic Workflow

1. **Input Your Graph**:
   - Use the matrix input section to define your adjacency matrix
   - Or import from a file (JSON, LaTeX, Dot, GraphML, CSV, GML formats supported)

2. **Select Algorithm**:
   - Choose from Dijkstra, Floyd-Warshall, or Kruskal algorithms
   - Configure algorithm parameters if needed

3. **Visualize Results**:
   - View the graph visualization with computed paths highlighted
   - Examine detailed results in the properties panel

4. **Export Results**:
   - Save your graph and results to various formats
   - Copy results for use in other applications

### Supported File Formats

- **JSON**: Standard graph representation with metadata
- **CSV**: Comma-separated values adjacency matrix format
- **LaTeX**: Matrix format for academic documents
- **Dot**: GraphViz DOT language format
- **GraphML**: XML-based graph format
- **GML**: Graph Modelling Language format

## Testing

Run the test suite using Vitest:

```bash
npm test
```

Tests cover algorithm implementations and core functionality to ensure correctness and reliability.

## Technologies Used

- **Frontend Framework**: Vue 3 with Composition API
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Type Safety**: TypeScript
- **Graph Visualization**: vis-network
- **Icons**: Tabler Icons
- **Internationalization**: Vue I18n
- **Testing**: Vitest
- **SEO**: Unhead (Vue Meta)

## Internationalization

GraphSolver supports multiple languages:

- English (en)
- Spanish (es)

Language switching is available in the navigation bar. Contributions for additional languages are welcome!

## Themes

The application includes both light and dark themes that automatically adapt to your system preferences. Manual theme switching is also available via the theme toggle in the navigation.

## Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes and add tests
4. Run tests: `npm test`
5. Commit your changes: `git commit -am 'Add some feature'`
6. Push to the branch: `git push origin feature/your-feature-name`
7. Submit a pull request

### Development Guidelines

- Use TypeScript for all new code
- Follow Vue 3 Composition API patterns
- Write unit tests for algorithm implementations
- Maintain internationalization for new strings
- Ensure responsive design principles

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Vue.js](https://vuejs.org/) - The Progressive JavaScript Framework
- [Vite](https://vitejs.dev/) - Next Generation Frontend Tooling
- [vis-network](https://visjs.org/) - Network visualization library
- [Tailwind CSS](https://tailwindcss.com/) - A utility-first CSS framework

## Support

If you have any questions or need help:

- Open an issue on GitHub
- Check the documentation

---

**Happy Graph Solving!**

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/henestrosadev)

<p align="right">(<a href="#top">back to top</a>)</p>