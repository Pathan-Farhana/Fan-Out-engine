
export enum SinkType {
  REST = 'REST API',
  GRPC = 'gRPC',
  MQ = 'Message Queue',
  WIDE_COLUMN = 'Wide-Column DB'
}

export enum DataFormat {
  JSON = 'JSON',
  PROTOBUF = 'Protobuf',
  XML = 'XML',
  AVRO = 'Avro/CQL'
}

export interface SinkConfig {
  id: string;
  type: SinkType;
  format: DataFormat;
  rateLimit: number; // records per second
  active: boolean;
  successCount: number;
  failureCount: number;
}

export interface EngineStats {
  totalProcessed: number;
  currentThroughput: number;
  bufferUsage: number; // percentage 0-100
  startTime: number;
  uptime: number;
}

export interface LogEntry {
  id: string;
  timestamp: number;
  level: 'INFO' | 'WARN' | 'ERROR';
  message: string;
}
