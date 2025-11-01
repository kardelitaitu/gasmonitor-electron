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
  apiKey: 'YTP2M89YKNXZMPCX9Q13YN17CGANIYR28P', 
  contractAddress: '0x0dE8bf93dA2f7eecb3d9169422413A9bef4ef628', 
  transactionsPerPage: 500, // tx per API request
  maxTransactionsToScan: 1000, // total tx to request
};