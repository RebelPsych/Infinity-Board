# OnyxKey — High-Contrast Mobile Keyboard

An ergonomic, high-contrast dark mode keyboard designed to occupy approximately **1/3 of the mobile viewport** with intuitive gesture navigation.

[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE)
[![Build Status](https://img.shields.io/badge/Build-Passing-brightgreen.svg)](#)
[![Release](https://img.shields.io/badge/Release-v1.0.0-orange.svg)](build-outputs/app-debug.apk)

---

## 📱 Features

- **1/3 Screen Allocation**: Docked neatly at the bottom third of the display for effortless one-handed thumb typing.
- **Clean High-Contrast Keycaps**: High visibility bold lettering without confusing secondary clutter or superscript symbols.
- **Specialized Bottom Row**:
  - **Tab Key (`⇥`)**: Replaces standard control key for easy indentation.
  - **Comma (`,`)**: Ergonomically placed to the left of the spacebar.
  - **Spacebar with Infinity (`∞`)**:
    - Swipe left across the spacebar (or tap `∞`) to switch instantly to **Numbers & Symbols**.
    - Tactile slide animation and tactile click feedback.
  - **Period (`.`)**: Placed to the right of the spacebar.
  - **Enter Key (`↵`)**: Distinct accent key for quick line breaks.
- **Numbers & Symbols Layer**:
  - Two pages of math, currency (`€`, `£`, `¥`), punctuation, and typographic symbols including infinity (`∞`).
  - Swipe right on the keyboard or tap **ABC** to return to alphabet typing.
- **Zero-Latency Audio & Haptics**: Built-in Web Audio mechanical click generator and device vibration.

---

## 📦 APK Installation

Pre-built debug APKs are located in the repository:

- [`build-outputs/app-debug.apk`](build-outputs/app-debug.apk)
- [`build-outputs/app-debug.APK`](build-outputs/app-debug.APK)

### Installing on Android
1. Transfer `app-debug.apk` to your Android device via USB, Google Drive, or direct download.
2. Open the file on your device using a file manager.
3. If prompted, enable **"Install unknown apps"** in your device settings.
4. Tap **Install** to complete installation.

---

## 🛠️ Local Development & Web Build

### Prerequisites
- Node.js (v18+)
- npm or bun

### Setup & Run
```bash
# 1. Install dependencies
npm install

# 2. Start local development server (port 3000)
npm run dev

# 3. Create production web build
npm run build
```

---

## 🤖 GitHub Actions Workflow

This repository includes automated CI/CD in `.github/workflows/build-and-release.yml`. When you push a git release tag (e.g., `v1.0.0`), it:
1. Builds and validates the codebase.
2. Automatically generates a GitHub Release.
3. Attaches `app-debug.apk` directly to the release assets for download.

---

## 📄 License

Licensed under the Apache License, Version 2.0 (the "License"). See the [LICENSE](LICENSE) file for details.
