import { type MetricType } from './Configuration/Metric.js';

export const State = {
    'Idle': 'idle',
    'Running': 'running',
    'Connected': 'connected',
    'Scoring': 'scoring',
    'Done': 'done',
    'Disconnected': 'disconnected',
    'Canceled': 'canceled',
    'Error': 'error',
} as const;

interface BaseStatus {
    time: Date;
    state: typeof State[keyof typeof State];
}

export interface ScoringStatus extends BaseStatus {
    sceneIndex: number;
    distortedId: string;
    metric: typeof MetricType[keyof typeof MetricType];
    frameIndex: number;
    score: number | number[][];
}

export interface ErrorStatus extends BaseStatus {
    error: Error;
}

export type Status = BaseStatus | ScoringStatus | ErrorStatus;
