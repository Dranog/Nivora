import { Injectable } from '@nestjs/common';
import { Counter, Histogram, Gauge, register } from 'prom-client';

@Injectable()
export class MetricsService {
  private httpRequestsTotal: Counter<string>;
  private httpRequestDuration: Histogram<string>;
  private activeConnections: Gauge<string>;

  constructor() {
    // Counter for HTTP requests
    this.httpRequestsTotal = new Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status'],
    });

    // Histogram for request duration
    this.httpRequestDuration = new Histogram({
      name: 'http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'route', 'status'],
      buckets: [0.1, 0.5, 1, 2, 5],
    });

    // Gauge for active connections
    this.activeConnections = new Gauge({
      name: 'active_connections',
      help: 'Number of active connections',
    });
  }

  incrementHttpRequests(method: string, route: string, status: number) {
    this.httpRequestsTotal.inc({ method, route, status });
  }

  observeHttpDuration(method: string, route: string, status: number, duration: number) {
    this.httpRequestDuration.observe({ method, route, status }, duration);
  }

  incrementActiveConnections() {
    this.activeConnections.inc();
  }

  decrementActiveConnections() {
    this.activeConnections.dec();
  }

  getMetrics() {
    return register.metrics();
  }
}
