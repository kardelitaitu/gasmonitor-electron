# ⛽ EVM Contract Gas Fee Tracker

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

A simple desktop application that tracks the lowest gas fees for any EVM (Ethereum Virtual Machine) contract. It fetches transaction data from Etherscan, finds the lowest gas fees, and visualizes the trends over time using a clean Chart.js line chart.

---

## 📸 Screenshot

![My App Demo](assets/demo.gif)

---

## ✨ Features

* **Tracks Lowest Gas:** Monitors the lowest gas fees (in Gwei) for any specified EVM contract.
* **Etherscan API:** Fetches real transaction data directly from the Etherscan API.
* **Data Visualization:** Displays gas fee trends in a clean, responsive line chart (using Chart.js).
* **Smart Sampling:** Samples the data to provide a clear and readable chart, even with thousands of transactions.
* **Simple UI:** A fixed-size, "always on top" desktop window for easy monitoring.

---

## 🛠️ Technologies Used

* **Electron:** For building the cross-platform desktop app.
* **Vite:** As the fast frontend build tool.
* **TypeScript:** For a modern and type-safe codebase.
* **Chart.js:** For rendering the beautiful line chart.
* **Axios:** For making requests to the Etherscan API.

---

## 🚀 Getting Started

Follow these steps to get the application running on your local machine.

### 1. Prerequisites

Before you begin, you will need a few things:

* **Node.js:** (LTS version recommended). You can download it from [nodejs.org](https://nodejs.org/).
* **npm:** This comes included with Node.js.
* **Etherscan API Key:** This is **required** to fetch transaction data. You can get a free API key from the [Etherscan website](https://etherscan.io/myapikey).

### 2. Installation

First, you need to download the code and install all the project dependencies.

1.  **Clone the repository:**
    *(Replace `your-username/your-repo-name.git` with your actual repository URL)*

    ```bash
    git clone [https://github.com/your-username/your-repo-name.git](https://github.com/your-username/your-repo-name.git)
    cd your-repo-name
    ```

2.  **Install dependencies:**
    This command reads the `package.json` file and installs all the necessary libraries.

    ```bash
    npm install
    ```

### 3. Configuration

This is the most important step! You must add your Etherscan API key to make the app work.

1.  Open the `src/config.ts` file in your code editor.
2.  You will see a `defaultConfig` object.
3.  Replace the placeholder `'YOUR_ETHERSCAN_API_KEY'` with your actual API key.

```typescript
// src/config.ts

export const defaultConfig: AppConfig = {
  // --- PUT YOUR KEY HERE ---
  apiKey: 'YOUR_ETHERSCAN_API_KEY',

  // You can also change this to any contract you want to track
  contractAddress: '0x0dE8bf93dA2f7eecb3d9169422413A9bef4ef628',

  // --- Optional Settings ---
  // How many transactions to fetch per API call
  transactionsPerPage: 500,
  // The total number of recent transactions to scan
  maxTransactionsToScan: 1000,
};
```
### 💨 Running the Application
Once you have configured your API key, you can start the app:
```bash
npm start
```
This will launch the application in development mode, and you should see the chart window appear.

📄 License
This project is licensed under the MIT License. See the LICENSE file for more details.