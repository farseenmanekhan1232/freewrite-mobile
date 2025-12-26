# Freewrite Mobile

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Expo](https://img.shields.io/badge/Runs%20with-Expo-4630EB.svg?style=flat-square&logo=EXPO&logoColor=white)](https://expo.dev/)

A minimalist, distraction-free writing app for mobile. This is a robust **React Native** port of the popular macOS [Freewrite](https://github.com/farseenmanekhan1232/freewrite-mobile) app, designed to help you generate ideas without self-editing.

## ✨ Features

- **Distraction-Free Editor**: Clean interface with custom Lato fonts.
- **15-Minute Timer**: Built-in countdown to keep you focused (tap to toggle, double-tap to reset).
- **Backspace Toggle**: Option to disable backspace to force forward momentum.
- **Customization**:
  - Light & Dark modes.
  - multiple font families (Lato, Arial, Serif, System).
  - Adjustable font sizes (16px - 26px).
- **Entry Management**: All entries specific to the device are persisted locally.
- **AI Integration**: One-tap prompts to discuss your entry with ChatGPT or Claude (opens external link).
- **Export**: formatting-free text export or share directly from the app.

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (LTS recommended)
- [Expo CLI](https://docs.expo.dev/get-started/installation/) (`npm install -g expo-cli`)

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/farseenmanekhan1232/freewrite-mobile.git
    cd freewrite-mobile
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Start the app**
    ```bash
    npx expo start
    ```

4.  **Run on Device/Emulator**
    -   Press `i` to open in iOS Simulator.
    -   Press `a` to open in Android Emulator.
    -   Scan the QR code with the **Expo Go** app on your physical device.

## 📱 Tech Stack

-   **Framework**: [React Native](https://reactnative.dev/) with [Expo](https://expo.dev/)
-   **Language**: TypeScript
-   **Icons**: [Lucide React Native](https://lucide.dev/)
-   **Storage**: `@react-native-async-storage/async-storage`
-   **Fonts**: `expo-font`

## 🤝 Contributing

Contributions are welcome! Please read our [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👏 Acknowledgments

-   Original macOS app concept by [Freewrite](https://github.com/farseenmanekhan1232/freewrite-main).
