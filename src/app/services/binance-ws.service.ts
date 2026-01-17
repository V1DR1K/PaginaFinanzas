import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

export type BinanceWsStatus = 'disconnected' | 'connecting' | 'connected';

export interface BinanceTickerUpdate {
  instId: string;
  last?: number;
  changePct?: number;
  high24h?: number;
  low24h?: number;
  bid?: number;
  ask?: number;
  ts?: number;
}

@Injectable({ providedIn: 'root' })
export class BinanceWsService {
  private socket: WebSocket | null = null;
  private reconnectTimer: any;
  private streams: string[] = [];

  private tickerSubject = new Subject<BinanceTickerUpdate>();
  readonly connectionStatus$ = new BehaviorSubject<BinanceWsStatus>('disconnected');

  subscribeTickers(pairs: string[]): Observable<BinanceTickerUpdate> {
    this.streams = pairs.map((p) => p.toLowerCase() + '@ticker');
    this.ensureSocket();
    return this.tickerSubject.asObservable();
  }

  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.connectionStatus$.next('disconnected');
  }

  private ensureSocket(): void {
    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      return;
    }

    const streamPath = this.streams.join('/');
    const url = `wss://stream.binance.com:9443/stream?streams=${streamPath}`;

    this.connectionStatus$.next('connecting');
    this.socket = new WebSocket(url);

    this.socket.onopen = () => {
      this.connectionStatus$.next('connected');
    };

    this.socket.onmessage = (event) => this.handleMessage(event);

    this.socket.onerror = () => {
      this.connectionStatus$.next('disconnected');
      this.scheduleReconnect();
    };

    this.socket.onclose = () => {
      this.connectionStatus$.next('disconnected');
      this.scheduleReconnect();
    };
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.ensureSocket();
    }, 3000);
  }

  private handleMessage(event: MessageEvent<any>): void {
    try {
      const msg = JSON.parse(event.data);
      const data = msg?.data;
      if (!data || !data.s) return;

      const instId = data.s;
      const update: BinanceTickerUpdate = {
        instId,
        last: this.toNumber(data.c),
        changePct: this.toNumber(data.P),
        high24h: this.toNumber(data.h),
        low24h: this.toNumber(data.l),
        bid: this.toNumber(data.b),
        ask: this.toNumber(data.a),
        ts: data.E ? Number(data.E) : Date.now(),
      };

      this.tickerSubject.next(update);
    } catch (err) {
      console.error('Binance WS parse error', err);
    }
  }

  private toNumber(value: any): number | undefined {
    const num = Number(value);
    return isFinite(num) ? num : undefined;
  }
}
