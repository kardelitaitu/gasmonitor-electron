import axios from 'axios';
import { defaultConfig, GasTrackerData } from './config'; // Import GasTrackerData

// Helper function to calculate time difference
function timeAgo(pastDate: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - pastDate.getTime();

    if (diffMs < 0) return 'in the future'; // Should not happen for past transactions

    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    const days = diffDays;
    const hours = diffHours % 24;
    const minutes = diffMinutes % 60;

    let result = '';
    if (days > 0) {
        result += `${days} day${days > 1 ? 's' : ''} `;
    }
    if (hours > 0 || days > 0) { // Show hours if there are days or hours
        result += `${hours} hr${hours > 1 ? 's' : ''} `;
    }
    result += `${minutes} min ago`;

    return `(${result.trim()})`;
}


export async function findLowestGweiTransaction(
    // Removed parameters
): Promise<GasTrackerData> { // Changed return type
    console.log('DEBUG: Entering findLowestGweiTransaction function.');
    console.log(`DEBUG: Using default parameters from config.ts - apiKey: ${defaultConfig.apiKey ? defaultConfig.apiKey.substring(0, 4) + '...' + defaultConfig.apiKey.substring(defaultConfig.apiKey.length - 4) : 'Not Provided'}, contractAddress: ${defaultConfig.contractAddress}, maxTransactionsToScan: ${defaultConfig.maxTransactionsToScan}, transactionsPerPage: ${defaultConfig.transactionsPerPage}`);

    return (async () => {
        const apiKey = defaultConfig.apiKey;
        const contractAddress = defaultConfig.contractAddress;
        const maxTransactionsToScan = defaultConfig.maxTransactionsToScan;
        const transactionsPerPage = defaultConfig.transactionsPerPage;

        if (apiKey === 'YOUR_ETHERSCAN_API_KEY' || !apiKey) {
            console.error('DEBUG: API Key not provided or is default placeholder.');
            return { lowestGweiResult: 'Error: Please input your Etherscan API key', chartData: { labels: [], data: [] } }; // Return structured error
        }
        if (!contractAddress) {
            console.error('DEBUG: Contract address not provided.');
            return { lowestGweiResult: 'Error: Please input a contract address', chartData: { labels: [], data: [] } }; // Return structured error
        }

        try { // <--- Start of the try block
            const numPages = Math.ceil(maxTransactionsToScan / transactionsPerPage);
            console.log(`DEBUG: Calculated numPages: ${numPages} (maxTransactionsToScan: ${maxTransactionsToScan}, transactionsPerPage: ${transactionsPerPage})`);

            const fetchPromises: Promise<any>[] = [];
            let allTransactions: any[] = [];

            for (let page = 1; page <= numPages; page++) {
                const apiUrl = `https://api.etherscan.io/v2/api?chainid=1&module=account&action=txlist&address=${contractAddress}&startblock=0&endblock=99999999&page=${page}&offset=${transactionsPerPage}&sort=desc&apikey=${apiKey}`;
                console.log(`DEBUG: Fetching page ${page} with URL: ${apiUrl}`);
                fetchPromises.push(axios.get(apiUrl));
            }

            console.log('DEBUG: Waiting for all fetch promises to resolve...');
            const responses = await Promise.all(fetchPromises);
            console.log(`DEBUG: Received ${responses.length} responses from Etherscan API.`);

            for (const response of responses) {
                console.log(`DEBUG: Processing API response. Status: ${response.data.status}, Message: ${response.data.message}`);
                if (response.data && response.data.status === '1' && Array.isArray(response.data.result)) {
                    console.log(`DEBUG: Page returned ${response.data.result.length} transactions.`);
                    allTransactions = allTransactions.concat(response.data.result);
                } else if (response.data && response.data.message) {
                    if (response.data.message === 'No transactions found') {
                        console.log('DEBUG: No transactions found for this page.');
                    } else {
                        console.error('DEBUG: Error fetching transactions from Etherscan API (page-level):');
                        console.error(response.data.message);
                        if (response.data.result) console.error('DEBUG: Result:', response.data.result);
                        return { lowestGweiResult: `Error fetching transactions: ${response.data.message}`, chartData: { labels: [], data: [] } }; // Return structured error
                    }
                } else {
                    console.error('DEBUG: Unexpected response format from Etherscan API (page-level):');
                    console.error(response.data);
                    return { lowestGweiResult: 'Unexpected response format from Etherscan API.', chartData: { labels: [], data: [] } }; // Return structured error
                }
            }

            console.log(`DEBUG: Total transactions fetched before slicing: ${allTransactions.length}`);
            // Limit to maxTransactionsToScan if more were fetched
            allTransactions = allTransactions.slice(0, maxTransactionsToScan);
            console.log(`DEBUG: Total transactions after slicing to maxTransactionsToScan (${maxTransactionsToScan}): ${allTransactions.length}`);


            if (allTransactions.length === 0) {
                console.log('DEBUG: No transactions found for this contract address after all fetches.');
                return { lowestGweiResult: 'No transactions found for this contract address.', chartData: { labels: [], data: [] } }; // Return structured error
            }

            console.log(`DEBUG: Found ${allTransactions.length} transactions. Analyzing for lowest gas fee...`);

            let overallLowestGwei = Infinity; // Renamed to avoid confusion
            let overallLowestTx: any = null; // Renamed to avoid confusion

            // First, find the overall lowest Gwei transaction
            for (const tx of allTransactions) {
                const gasPriceWei = parseInt(tx.gasPrice, 10);
                const gasPriceGwei = gasPriceWei / 1e9;

                if (isNaN(gasPriceWei) || gasPriceWei <= 0) {
                    continue;
                }

                if (gasPriceGwei < overallLowestGwei) {
                    overallLowestGwei = gasPriceGwei;
                    overallLowestTx = tx;
                }
            }

            const chartLabels: string[] = [];
            const chartDataPoints: { value: number; relativeTime: string }[] = []; // Changed type

            // Sort transactions by timestamp in ascending order for charting
            allTransactions.sort((a, b) => parseInt(a.timeStamp) - parseInt(b.timeStamp));

            const numberOfSegments = 25;
            const totalTransactions = allTransactions.length;
            const segmentSize = Math.ceil(totalTransactions / numberOfSegments); // Calculate segment size

            console.log(`DEBUG: Sampling ${totalTransactions} transactions into ${numberOfSegments} segments of size ${segmentSize}.`);

            if (totalTransactions === 0) {
                console.log('DEBUG: No transactions available for chart sampling.');
            }

            for (let i = 0; i < numberOfSegments; i++) {
                const startIndex = i * segmentSize;
                const endIndex = Math.min(startIndex + segmentSize, totalTransactions);

                if (startIndex >= totalTransactions) {
                    console.log(`DEBUG: Breaking segment loop at index ${i} as startIndex (${startIndex}) >= totalTransactions (${totalTransactions}).`);
                    break; // No more transactions to process
                }

                const segmentTransactions = allTransactions.slice(startIndex, endIndex);
                console.log(`DEBUG: Segment ${i}: startIndex=${startIndex}, endIndex=${endIndex}, segmentTransactions.length=${segmentTransactions.length}`);


                if (segmentTransactions.length === 0) {
                    console.log(`DEBUG: Segment ${i} is empty, skipping.`);
                    continue; // Skip empty segments
                }

                let lowestGweiInSegment = Infinity;
                let lowestTxInSegment: any = null;

                for (const tx of segmentTransactions) {
                    const gasPriceWei = parseInt(tx.gasPrice, 10);
                    const gasPriceGwei = gasPriceWei / 1e9;

                    if (isNaN(gasPriceWei) || gasPriceWei <= 0) {
                        continue;
                    }

                    if (gasPriceGwei < lowestGweiInSegment) {
                        lowestGweiInSegment = gasPriceGwei;
                        lowestTxInSegment = tx;
                    }
                }

                if (lowestTxInSegment) {
                    const txDate = new Date(parseInt(lowestTxInSegment.timeStamp) * 1000);
                    const relativeTime = timeAgo(txDate); // Get relative time
                    chartLabels.push(txDate.toLocaleTimeString()); // Remove relative time from X-axis label
                    chartDataPoints.push({ value: lowestGweiInSegment, relativeTime: relativeTime }); // Store as object
                    console.log(`DEBUG: Segment ${i} - Lowest Gwei: ${lowestGweiInSegment.toFixed(4)}, Time: ${txDate.toLocaleTimeString()} ${relativeTime}`);
                } else {
                    console.log(`DEBUG: Segment ${i} - No valid lowest Gwei found.`);
                }
            }

            console.log('DEBUG: Final chartLabels:', chartLabels);
            console.log('DEBUG: Final chartDataPoints:', chartDataPoints);


            if (overallLowestTx) { // Correct: Use overallLowestTx here
                const txUrl = `https://etherscan.io/tx/${overallLowestTx.hash}`;
                const timestamp = parseInt(overallLowestTx.timeStamp, 10);
                const txDate = new Date(timestamp * 1000);
                const relativeTime = timeAgo(txDate);

                const lowestGweiResult = `Lowest fee ${overallLowestGwei.toFixed(4)} Gwei\nTx link : ${txUrl}\nTimestamp: ${txDate.toLocaleString()} ${relativeTime}`;
                console.log('DEBUG: Lowest gas fee found and formatted.');
                console.log('DEBUG: Exiting findLowestGweiTransaction function successfully.');
                return { lowestGweiResult, chartData: { labels: chartLabels, data: chartDataPoints } }; // Return structured data
            } else {
                console.log('DEBUG: Could not determine the transaction with the lowest Gwei.');
                console.log('DEBUG: Exiting findLowestGweiTransaction function.');
                return { lowestGweiResult: 'Could not determine the transaction with the lowest Gwei (perhaps all transactions had zero gas price).', chartData: { labels: [], data: [] } }; // Return structured error
            }

        } catch (e) {
            const error = e as any;
            console.error('DEBUG: An error occurred in findLowestGweiTransaction catch block:', error.message);
            let errorMessage = `An unexpected error occurred: ${error.message}`;
            if (error.response) {
                console.error('DEBUG: Response Status:', error.response.status);
                console.error('DEBUG: Response Data:', JSON.stringify(error.response.data, null, 2));
                errorMessage = `API Error: ${error.response.status} - ${JSON.stringify(error.response.data)}`;
            } else if (error.request) {
                console.error('DEBUG: No response received:', error.request);
                errorMessage = 'Network Error: No response received from Etherscan API.';
            } else {
                console.error('DEBUG: Error details:', error);
            }
            return { lowestGweiResult: errorMessage, chartData: { labels: [], data: [] } }; // Return structured error
        }
    })();
}
