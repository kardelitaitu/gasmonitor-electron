# EVM Contract Gas Fee Tracker

## Description
This is an Electron-based desktop application that tracks the lowest gas fees for a specified EVM (Ethereum Virtual Machine) contract address. It fetches transaction data from Etherscan, processes it to find the lowest gas fees, and visualizes the gas fee trends over time using a Chart.js line chart.

## Features
- Tracks lowest gas fees for a given EVM contract address.
- Fetches transaction data from Etherscan API.
- Visualizes gas fee trends with a Chart.js line chart.
- Samples data for charting to provide a clear overview.
- Fixed window size for a consistent user experience.

## Setup and Running

### Prerequisites
- Node.js (LTS version recommended)
- npm (comes with Node.js)
- An Etherscan API Key (required to fetch transaction data)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/YOUR_USERNAME/evm-contract-gas-fee-tracker.git
    cd evm-contract-gas-fee-tracker
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```

### Configuration

1.  **Etherscan API Key:**
    Open `src/config.ts` and replace `'YOUR_ETHERSCAN_API_KEY'` with your actual Etherscan API key.
    ```typescript
    export const defaultConfig: AppConfig = {
      apiKey: 'YOUR_ETHERSCAN_API_KEY', // Replace with your Etherscan API Key
      contractAddress: '0x0dE8bf93dA2f7eecb3d9169422413A9bef4ef628', // Example contract address
      transactionsPerPage: 500,
      maxTransactionsToScan: 1000,
    };
    ```
2.  **Contract Address:**
    You can also change the `contractAddress` in `src/config.ts` to the desired EVM contract you wish to track.

### Running the Application

To start the application in development mode:

```bash
npm start
```

## Technologies Used
- Electron
- Vite
- TypeScript
- Chart.js
- Axios
- Etherscan API

## License
[Specify your license here, e.g., MIT License]