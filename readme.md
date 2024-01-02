# Installation of Discord Bot and ESP32

## Node.js Installation Guide

### Step 1: Download Node.js

1. Visit the official Node.js website at [nodejs.org](https://nodejs.org).
2. Click on the "LTS" button to download the Long Term Support version.

### Step 2: Run the Installer

1. Once the download is complete, run the installer executable.
2. Follow the installation wizard, ensure that you tick the checkbox to install the necessary tools for Node.js.
3. This installation will take a few minutes to complete.

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

## Create Discord Bot

1. Visit the Discord Developer Portal at [discord.com/developers](https://discord.com/developers).
2. Click on the "New Application" button.
3. Enter the name of your bot and click on the "Create" button.
4. Go to the "Bot" tab on the left side of the page.
5. Click on the "Reset Token" button.
6. Copy the token and save it for later.

## Enable Discord Bot Privileged Gateway Intents

1. Go to the "Bot" tab on the left side of the page.
2. Under the "Privileged Gateway Intents" section, enable the "Presence Intent", "Server Members Intent" and "Message Content Intent" checkboxes.

## Adding Discord Bot to Server

1. Go to the "OAuth2" tab on the left side of the page.
2. Under the "OAuth2 URL Generator" section, select the "bot" checkbox.
3. Copy the URL and paste it into your browser.

## Preparing for System Source Code

### Step 1: Download the Files

1. Download the zip file by clicking the "Code" button and selecting "Download ZIP."

### Step 2: Extract the Files

1. Extract the zip file to a folder of your choice.

### Step 3: Open in Visual Studio Code

1. Open Visual Studio Code.
2. Navigate to "File" > "Open Folder" and select the folder you extracted.

### Step 4: Open Terminal

1. Open the terminal in Visual Studio Code using the shortcut or by navigating to "View" > "Terminal."

### Step 5: Change Directory

1. In the terminal, type the following command and press Enter:

   ```bash
   cd discord
   ```

### Step 6: Install Dependencies

1. Install Dependendecies by typing the following command and press Enter:

   ```bash
   npm install
   ```

### Step 7: Configure the Discord Bot

1. Open the file named `.env` in the `discord` folder.
2. Configure the following settings:
   - `TOKEN`: The token of your Discord bot.
3. To enable Developer Mode in Discord, go to "App Settings" > "Advance" and enable the "Developer Mode" checkbox.
4. Copy the ID of the server you added the bot to by right-clicking on the server icon and selecting "Copy ID."
5. Navigate to `discord/lib/validation/constant.js` and change the following settings:
   - `guildId`: The ID of the server you added the bot to.

### Step 8: Run the Bot

1. Run the bot by typing the following command and press Enter:

   ```bash
   node index.js
   ```

### Step 9: Verify the Discord Bot

1. Open Discord.
2. Go to the server you added the bot to.
3. See if the bot is online.
4. Type the command `mi!send` to see if the bot responds.
5. If the bot response with embed message and buttons, you have successfully set up the Discord bot.

## Preparing ESP32 Source Code

### Step 1: Open the Project

1. Open the folder named `src` in the folder you extracted.
2. Open the file named `main.cpp` in the `src` folder.
3. Open the file named `main.cpp` in the `src` folder.
4. Configure the following settings:
   - `ssid`: The name of your WiFi network.
   - `password`: The password of your WiFi network.
5. By using the shortcut `Ctrl+Shift+P`, type "PlatformIO: Upload" and press Enter.
