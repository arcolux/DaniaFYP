# Installation of Discord Bot and ESP32

## Node.js Installation Guide

### Step 1: Download Node.js

1. Visit the official Node.js website at [nodejs.org](https://nodejs.org).
2. Click on the "LTS" button to download the Long Term Support version.

### Step 2: Run the Installer

1. Once the download is complete, run the installer executable.
2. Follow the installation wizard, accepting the default settings unless you have specific preferences.

### Step 3: Verify Installation

1. Open a command prompt or PowerShell window.
2. Type the following commands to check if Node.js and npm (Node Package Manager) are installed:

   ```bash
   node -v
   npm -v
   ```

## Visual Studio Code and PlatformIO Installation Guide

### Visual Studio Code Installation

1. Visit the official Visual Studio Code website at [code.visualstudio.com](https://code.visualstudio.com/).
2. Click on the "Download" button to download the installer for your operating system.
3. Run the installer and follow the installation wizard, accepting the default settings.

### PlatformIO Extension Installation

1. Open Visual Studio Code after installation.
2. Go to the Extensions view by clicking on the Extensions icon in the Activity Bar on the side of the window or using the keyboard shortcut `Ctrl+Shift+X`.
3. Search for "PlatformIO" in the Extensions view search box.
4. Install the "PlatformIO IDE" extension.

### Verify PlatformIO Installation

1. Open Visual Studio Code.
2. Go to the Activity Bar and select the "PlatformIO" icon.
3. If the installation was successful, you should see the PlatformIO home page.

## Setting Up Discord Bot and ESP32

## Preparing Discord Bot

### Step 1: Extract the Files

1. Download the zip file and extract it to a location of your choice.

### Step 2: Open in Visual Studio Code

1. Open Visual Studio Code.
2. Navigate to "File" > "Open Folder" and select the folder you extracted.

### Step 3: Open Terminal

1. Open the terminal in Visual Studio Code using the shortcut or by navigating to "View" > "Terminal."

### Step 4: Change Directory

1. In the terminal, type the following command and press Enter:

   ```bash
   cd discord
   ```

### Step 5: Install Dependencies

1. Install Dependendecies by typing the following command and press Enter:

   ```bash
   npm install
   ```

### Step 6: Run the Bot

1. Run the bot by typing the following command and press Enter:

   ```bash
   node index.js
   ```

## Preparing ESP32

1. Open the file named `main.cpp` in the `src` folder.
2. Configure the following settings:
   - `ssid`: The name of your WiFi network.
   - `password`: The password of your WiFi network.
3. Upload the code to your ESP32.
