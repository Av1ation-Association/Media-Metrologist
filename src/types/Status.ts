import { type MetricType } from './Configuration/Metric.js';

export const State = {
    'Idle': 'idle',
    'Running': 'running',
    'Scoring': 'scoring',
    'Done': 'done',
    'Canceled': 'canceled',
    'Error': 'error',
} as const;

interface BaseStatus {
    time: Date;
    state: typeof State[keyof typeof State];
}

export type Status = IdleStatus | RunningStatus | ScoringStatus | DoneStatus | CanceledStatus | ErrorStatus;

export interface IdleStatus extends BaseStatus {
    state: typeof State.Idle;
}

export interface RunningStatus extends BaseStatus {
    state: typeof State.Running;
}

export interface ScoringStatus extends BaseStatus {
    state: typeof State.Scoring;
    sceneIndex: number;
    distortedId: string;
    metric: MetricType;
    frameIndex: number;
    score: number[][];
}

export interface DoneStatus extends BaseStatus {
    state: typeof State.Done;
}

export interface CanceledStatus extends BaseStatus {
    state: typeof State.Canceled;
}

export interface ErrorStatus extends BaseStatus {
    state: typeof State.Error;
    error: Error;
}

export interface MetrologistEvent {
    status: Status[];
    idle: IdleStatus[];
    running: RunningStatus[];
    scoring: ScoringStatus[];
    done: DoneStatus[];
    canceled: CanceledStatus[];
    error: ErrorStatus[];
};
