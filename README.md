# Argon Design System Angular

This repository contains the Angular implementation of the Argon Design System. It bundles reusable UI components, example pages, and theming assets so you can bootstrap dashboards, landing pages, or marketing sites with Angular 13 and Bootstrap 4 styles.

## Contents
- [Overview](#overview)
- [Requirements](#requirements)
- [Installation](#installation)
- [Available scripts](#available-scripts)
- [Running the app](#running-the-app)
- [Building and deploying](#building-and-deploying)
- [Testing and linting](#testing-and-linting)
- [Project structure](#project-structure)
- [Styling and theming](#styling-and-theming)
- [Pages and components](#pages-and-components)
- [Environment configuration](#environment-configuration)
- [Documentation and resources](#documentation-and-resources)

## Overview
- **Frameworks:** Angular 13 with Angular CLI, Bootstrap 4 styles, and ng-bootstrap components.
- **Design system:** More than 100 UI elements (alerts, buttons, navigation, form controls, tables, etc.) wired with example data and interactions.
- **Use cases:** Starter for marketing pages (Home, Landing, Register, Login), profile layouts, and component gallery sections that showcase the design system.

## Requirements
- **Node.js:** 14.x or later (the project was built on Angular 13; Node 18 LTS also works in most environments).
- **npm:** 6.x or later.
- **Angular CLI:** Install globally if you want CLI commands available (`npm install -g @angular/cli`).

## Installation
1. Install dependencies:
   ```bash
   npm install
   ```
2. (Optional) If dependencies become inconsistent, use the clean install helper:
   ```bash
   npm run install:clean
   ```

## Available scripts
All commands are defined in `package.json`.

| Script | Description |
| --- | --- |
| `npm start` | Serve the app with live reload at `http://localhost:4200/`. |
| `npm run build` | Production build placed in `dist/`. CI is disabled to allow warnings to surface locally. |
| `npm test` | Run unit tests with Karma + Jasmine. |
| `npm run lint` | Analyze code quality using TSLint. |
| `npm run e2e` | Execute end-to-end tests with Protractor. |

## Running the app
Start a local dev server:
```bash
npm start
```
The server reloads when files change. Configure a different port with Angular CLI flags (e.g., `npm start -- --port 4300`).

## Building and deploying
Create an optimized build:
```bash
npm run build
```
The compiled assets are generated in `dist/argon-design-system-angular/`. Deploy the contents of this folder to any static host (e.g., Nginx, S3, Netlify, or Genezio’s one-click deployment).

## Testing and linting
Run quality checks before committing:
```bash
npm test       # unit tests
npm run lint   # static analysis
npm run e2e    # end-to-end smoke tests (requires WebDriver/Chrome)
```

## Project structure
The most important folders are:
```
src/
├── app/
│   ├── home/            # Landing hero and component showcase entry
│   ├── landing/         # Detailed product landing page
│   ├── login/           # Authentication form example
│   ├── profile/         # Profile layout with cards and tabs
│   ├── signup/          # Registration form example
│   ├── sections/        # Reusable sections (alerts, buttons, navigation, typography, etc.)
│   ├── shared/          # Navbar and footer components
│   ├── app.module.ts    # Root module wiring routes and shared modules
│   └── app.routing.ts   # Route declarations for all pages
├── assets/
│   ├── scss/            # Argon theme variables, Bootstrap overrides, utility mixins
│   ├── css/, img/, js/  # Compiled styles and static assets
│   └── vendor/          # Third-party scripts and styles bundled with the design system
├── environments/        # `environment.ts` and `environment.prod.ts` flags
├── index.html           # Application shell
└── styles.css           # Global stylesheet entry point
```

## Styling and theming
- Core styles live in `src/assets/scss/argon.scss` and the `custom/` and `bootstrap/` subfolders. Update these files to change colors, typography, or component spacing.
- If you prefer CSS, `src/assets/css/argon.css` contains the compiled stylesheet from the design tokens.
- Additional vendor assets are located under `src/assets/vendor/` and are imported as needed by components.

## Pages and components
- **Home/Sections:** Demonstrates the Argon components (alerts, buttons, navbars, inputs, tabs, typography, etc.) assembled as reusable Angular components under `src/app/sections/`.
- **Landing:** Marketing layout with hero, feature grids, and call-to-action content (`src/app/landing`).
- **Auth flows:** Login and Register examples provide form validation and layout patterns (`src/app/login`, `src/app/signup`).
- **Profile:** Showcases cards, tabs, and user information layouts (`src/app/profile`).
- **Shared UI:** Navbar and footer live in `src/app/shared/` and are imported into every page module.

## Environment configuration
Angular environment files reside in `src/environments/`:
- `environment.ts` is used for local development.
- `environment.prod.ts` is used for production builds. Replace or extend these files with API endpoints or feature flags as your project grows.

## Documentation and resources
- Online documentation for every component and customization option: <https://demos.creative-tim.com/argon-design-system-angular/documentation/tutorial>
- Live demo pages: <https://demos.creative-tim.com/argon-design-system-angular/home>
- License: [MIT](LICENSE.md)
- Issues and support: <https://github.com/creativetimofficial/argon-design-system-angular/issues>
