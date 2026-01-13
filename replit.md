# Nithish.T Portfolio

## Overview

This is a personal portfolio website for Nithish.T, built as a modern single-page application using React and Vite. The project showcases a minimalist, dark-themed design with purple accent colors and smooth animations powered by Framer Motion.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Stack
- **Framework**: React 19 with JSX - chosen for component-based architecture and modern React features
- **Build Tool**: Vite 7 - selected for fast development server and optimized production builds
- **Styling**: Tailwind CSS 4 with custom theme configuration - provides utility-first CSS with consistent design tokens
- **Animations**: Framer Motion - enables smooth, declarative animations for enhanced user experience
- **Icons**: Lucide React - lightweight, customizable icon library

### Project Structure
- `/src` - Main source directory containing React components and styles
- `/src/styles/index.css` - Global styles with Tailwind imports and custom CSS variables
- `/src/main.jsx` - Application entry point
- Root level configuration files for Vite, Tailwind, and PostCSS

### Design Decisions
- **Dark Theme**: Black background (#000000) with white text as the default color scheme
- **Purple Accent Colors**: Custom purple palette (500, 600, 700) for branding consistency
- **CSS Variables**: Theme colors defined using Tailwind's @theme directive for easy customization
- **Path Aliases**: `@assets` alias configured in Vite for clean asset imports from `/attached_assets`

### Development Server
- Configured to run on port 5000
- Bound to all network interfaces (0.0.0.0) for external access
- All hosts allowed for Replit compatibility

## External Dependencies

### Build & Development
- **Vite**: Development server and production bundler
- **@vitejs/plugin-react**: React Fast Refresh and JSX transformation
- **PostCSS & Autoprefixer**: CSS processing and vendor prefixing

### UI & Styling
- **Tailwind CSS**: Utility-first CSS framework
- **clsx & tailwind-merge**: Conditional class name utilities for dynamic styling

### Runtime Libraries
- **React & React DOM**: Core UI library
- **Framer Motion**: Animation library
- **Lucide React**: Icon components

No backend services, databases, or external APIs are currently integrated.