import { TransactionPayload } from './types';

// lib/gateway.ts
const GATEWAY_DEV = 'https://ais-dev-76nmmkjruw6sgqkbpb2xsy-756359165063.asia-east1.run.app';
const GATEWAY_PRE = 'https://ais-pre-76nmmkjruw6sgqkbpb2xsy-756359165063.asia-east1.run.app';

type GatewayEnv = 'dev' | 'pre';

function getGatewayUrl(env: GatewayEnv): string {
    return env === 'dev' ? GATEWAY_DEV : GATEWAY_PRE;
}

// Contoh: Fetch prediksi dari gateway
export async function fetchGatewayPrediction(
    commodityId: string,
    env: GatewayEnv = 'dev'
) {
    const baseUrl = getGatewayUrl(env);
    const response = await fetch(`${baseUrl}/predictions/${commodityId}`, {
        headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
        throw new Error(`Gateway error: ${response.status}`);
    }

    return response.json();
}

// Contoh: Sync transaksi ke gateway
export async function syncTransactionToGateway(
    payload: TransactionPayload,
    env: GatewayEnv = 'dev'
) {
    const baseUrl = getGatewayUrl(env);
    const response = await fetch(`${baseUrl}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });

    return response.json();
}