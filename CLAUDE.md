# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a technical research repository focused on learning and documenting various technologies including:
- AI/LLM research and training
- Browser automation (Chrome DevTools Protocol)
- Frontend development technologies
- Linux kernel scheduling mechanisms
- Database systems (Redis)
- Version control (Git)

## Commands for Development

### Chrome DevTools Protocol Examples
```bash
# Navigate to CDP examples directory
cd chrome-devtools-protocol/examples

# Install dependencies
npm install

# Run specific examples
npm run screenshot    # Take screenshots using CDP
npm run network      # Network interception demo
npm run mobile       # Mobile device emulation
npm run python       # Python CDP example
```

### Frontend Development (Tailwind CSS Examples)
```bash
# Navigate to Tailwind project setup
cd frontend/tailwindcss/examples/project-setup

# Install dependencies
npm install

# Development server
npm run dev

# Build for production
npm run build

# Preview build
npm run preview
```

### Linux Scheduler Documentation
```bash
# Navigate to scheduler documentation
cd linux/01-scheduler

# Convert PlantUML diagrams to PNG
./convert_puml_to_png.sh

# Run CPU throttling demo
./throttle_low_utilization_demo.sh
```

## Architecture and Structure

### Learning Material Organization
- **Structured Curriculum**: Each major topic (AI, Frontend, Linux) follows a progressive learning path
- **Bilingual Documentation**: Content available in both English and Chinese
- **Visual Documentation**: Extensive use of PlantUML diagrams and flowcharts
- **Practical Examples**: Working code samples for each concept

### Key Components

#### AI/LLM Research (`/ai/`)
- **LLM Directory**: Comparative analysis of major language models (Claude, DeepSeek, Qianwen)
- **Training Directory**: Complete 8-chapter curriculum covering LLM training from basics to deployment
- **Structure**: Each chapter has README.md with theory and practical examples

#### Browser Automation (`/chrome-devtools-protocol/`)
- **Protocol Documentation**: Comprehensive CDP domain coverage
- **Examples**: Working implementations in JavaScript and Python
- **Architecture**: WebSocket-based communication with event-driven design

#### Frontend Learning (`/frontend/`)
- **Technology Coverage**: CSS, SVG, Canvas, WebGL, JavaScript, TypeScript, Vue, React, TailwindCSS
- **Example Structure**: Each technology has `/examples/` with working code and `/quick-start.md`
- **Progressive Learning**: From fundamentals to advanced concepts

#### Linux Systems (`/linux/`)
- **Scheduler Focus**: Deep analysis of CFS scheduler with visual diagrams
- **Tooling**: Performance analysis tools (htop, stress, cgroup)
- **Documentation**: Detailed analysis files with `.md` and `.puml` sources

### Development Patterns

#### Documentation Structure
- Each major directory has a `README.md` with overview and navigation
- `quick-start.md` files provide immediate getting-started guidance
- `examples/` directories contain working code samples
- Visual diagrams in `/images/` subdirectories

#### Code Organization
- Language-specific examples in dedicated subdirectories
- Package.json files only in directories with actual Node.js projects
- No root-level build system - projects are self-contained

#### Learning Path Design
- Concepts progress from basic to advanced within each topic
- Cross-references between related topics
- Practical examples follow theoretical explanations

## Important Notes

### No Root Build System
This repository is organized as a collection of learning materials rather than a single project. Individual examples have their own package.json and build systems where needed.

### Research-Oriented Structure
Content is organized for learning and research rather than production deployment. Focus is on understanding concepts, comparing technologies, and documenting findings.

### Visualization Tools
PlantUML is used extensively for architecture diagrams. The Linux scheduler section includes conversion scripts for generating PNG files from PlantUML sources.

### Multi-Language Support
Documentation and examples include both English and Chinese content, reflecting the international nature of the research materials.