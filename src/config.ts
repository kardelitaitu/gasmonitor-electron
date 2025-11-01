export interface AppConfig {
  apiKey: string;
  contractAddress: string;
  transactionsPerPage: number;
  maxTransactionsToScan: number;
}

export interface GasTrackerData {
  lowestGweiResult: string;
  chartData: {
    labels: string[];
    data: {
      value: number;
      relativeTime: string;
    }[]; // Changed data to array of objects
  };
}

export const defaultConfig: AppConfig = {
  apiKey: '5BP11KFQGMKXSD5YDP45N5H5CXF1H3TVRD', 
  contractAddress: '0x0dE8bf93dA2f7eecb3d9169422413A9bef4ef628', 
  transactionsPerPage: 500, // tx per API request
  maxTransactionsToScan: 1000, // total tx to request
};