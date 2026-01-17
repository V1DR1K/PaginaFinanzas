import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

export type WsConnectionStatus = 'disconnected' | 'connecting' | 'connected';

export interface BitgetTickerUpdate {
  instId: string;
  last?: number;
  changePct?: number;
  high24h?: number;
  low24h?: number;
  bid?: number;
  ask?: number;
  ts?: number;
}

interface BitgetSubscribeArg {
  instType: string;
  channel: string;
  instId: string;
}

export interface BitgetSubscribeRequest {
  instId: string;
  instType?: string;
}

@Injectable({ providedIn: 'root' })
export class BitgetWsService {
  private readonly WS_URL = 'wss://ws.bitget.com/v2/ws/public';
  private socket: WebSocket | null = null;
  private reconnectTimer: any;
  private pendingArgs: BitgetSubscribeArg[] = [];

  private tickerSubject = new Subject<BitgetTickerUpdate>();
  readonly connectionStatus$ = new BehaviorSubject<WsConnectionStatus>('disconnected');

  subscribeTickers(pairs: BitgetSubscribeRequest[]): Observable<BitgetTickerUpdate> {
    this.pendingArgs = pairs.map((pair) => ({
      instType: (pair.instType || 'SPOT').toUpperCase(),
      channel: 'ticker',
      instId: pair.instId,
    }));

    this.ensureSocket();
    this.sendSubscribe();
    return this.tickerSubject.asObservable();
  }

  disconnect(): void {
    this.clearReconnect();
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

    this.connectionStatus$.next('connecting');
    this.socket = new WebSocket(this.WS_URL);

    this.socket.onopen = () => {
      this.connectionStatus$.next('connected');
      this.sendSubscribe();
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
    if (this.reconnectTimer) {
      return;
    }
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.ensureSocket();
    }, 3000);
  }

  private clearReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  private startPing(): void {
    // Ping deshabilitado por solicitud; Bitget soporta conexión sin ping mientras haya tráfico
  }

  private clearPing(): void {
    // noop sin ping
  }

  private sendSubscribe(): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      return;
    }

    const payload = {
      op: 'subscribe',
      args: this.pendingArgs,
    };

    this.socket.send(JSON.stringify(payload));
  }

  private handleMessage(event: MessageEvent<any>): void {
    try {
      const msg = JSON.parse(event.data);

      if (msg.op === 'pong') {
        return;
      }

      if (msg.event === 'error') {
        console.error('Bitget WS error:', msg);
        if (msg.code === '30001' || msg.msg?.toLowerCase().includes('param')) {
          console.error('Revisa instType/instId del payload enviado', this.pendingArgs);
        }
        return;
      }

      if (!msg.data || !Array.isArray(msg.data)) {
        return;
      }

      const instId = msg.arg?.instId as string | undefined;

      msg.data.forEach((raw: any) => {
        const last = this.toNumber(raw.lastPr || raw.last || raw.price);
        const open = this.toNumber(raw.open24h || raw.open || raw.openUtc0);
        const changeField = this.toNumber(raw.change24h || raw.chgUTC || raw.change);

        const changePct = open && last ? ((last - open) / open) * 100 : changeField;

        const update: BitgetTickerUpdate = {
          instId: raw.instId || instId,
          last,
          changePct,
          high24h: this.toNumber(raw.high24h || raw.high || raw.highUtc0),
          low24h: this.toNumber(raw.low24h || raw.low || raw.lowUtc0),
          bid: this.toNumber(raw.bidPr || raw.bestBid),
          ask: this.toNumber(raw.askPr || raw.bestAsk),
          ts: raw.ts ? Number(raw.ts) : Date.now(),
        };

        if (update.instId) {
          this.tickerSubject.next(update);
        }
      });
    } catch (error) {
      console.error('Bitget WS parse error', error);
    }
  }

  private toNumber(value: any): number | undefined {
    const num = Number(value);
    return isFinite(num) ? num : undefined;
  }
}
