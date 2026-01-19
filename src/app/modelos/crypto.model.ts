export interface Crypto {
  id: number;
  userId: number;
  instId: string;        // Ej: 'BTCUSDT', 'ETHUSDT'
  symbol: string;        // Ej: 'BTC', 'ETH'
  amount: number;        // Cantidad que posee
  percentage: number;    // Porcentaje del portfolio
  source?: 'bitget' | 'binance';  // Exchange de origen
  display?: string;      // Nombre para mostrar ej: 'BTC / USDT'
  activo: boolean;       // Si está activo para mostrar
}

export interface CryptoRequest {
  instId: string;
  symbol: string;
  amount: number;
  percentage: number;
  source?: 'bitget' | 'binance';
  display?: string;
  activo: boolean;
}

export interface CryptoSymbol {
  instId: string;
  display: string;
  source?: 'bitget' | 'binance';
}
