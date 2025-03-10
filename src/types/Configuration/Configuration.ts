import { type tags } from 'typia';
import { type ImportMethod } from './Import.js';
import {
    type ButteraugliValue,
    type MetricType,
    type Metric,
    type MetricValue,
} from './Metric.js';

/**
 * Video input
 */
export interface Input<T extends 'Set' | 'Array' = 'Set'> {
    /**
     * Path to the video file or VapourSynth script
     */
    path: string;

    /**
     * Import methods in priority order
     */
    importMethods: T extends 'Set' ? Set<ImportMethod> : T extends 'Array' ? ImportMethod[] : Set<ImportMethod> & tags.MinItems<1> & tags.UniqueItems;

    /**
     * Width and height to scale the video to
     */
    scale?: {
        /**
         * Width to scale the video to
         */
        width: number & tags.Type<'int32'> & tags.Minimum<1> & tags.Default<1>;

        /**
         * Height to scale the video to
         */
        height: number & tags.Type<'int32'> & tags.Minimum<1> & tags.Default<1>;
    }
}

/**
 * Frames of a scene to process and their scores for each metric
 */
export interface SceneFrames {
    start: number & tags.Type<'int32'> & tags.Minimum<0>;
    end: number & tags.Type<'int32'> & tags.Minimum<0>;
}

export interface SceneFrameScores<T extends MetricValue | ButteraugliValue = MetricValue> {
    time: Date;
    value: T[][];
}

/**
 * A scene to process and its reference and distorted inputs
 */
export interface Scene {
    reference: SceneFrames;
    distorted: {
        [id: string]: SceneFrames & {
            scores: Partial<Record<MetricType, SceneFrameScores[]>>;
        };
    };
}

/**
 * Results to save and broadcast
 */
export interface Output {
    /**
     * Path to save the results
     * Defaults to `config.json` in the same directory as the reference video
     */
    path?: string;

    /**
     * Whether to print the results to the console
     * @default true
     */
    console?: boolean & tags.Default<true>;

    /**
     * Whether to print verbose information to the console
     * @default false
     */
    verbose?: boolean & tags.Default<false>;
}

export interface Configuration<T extends 'Set' | 'Array' = 'Set'> {
    /**
     * Schema to validate the configuration
     */
    $schema: string;

    /**
     * Reference video input
     */
    reference: Input<T>;

    /**
     * Distorted video inputs
     */
    distorted: {
        [id: string]: Input<T>;
    };

    /**
     * Metrics to use and their parameters
     */
    metrics: {
        [P in MetricType]?: Metric<P>;
    };

    /**
     * Scenes to process
     */
    scenes: Scene[] & tags.MinItems<1> & tags.UniqueItems;

    /**
     * Output to save and broadcast
     */
    output?: Output;

    /**
     * Number of threads to use in VapourSynth
     * Defaults to the number of logical cores
     * Must be a positive integer
     * @minimum 1
     */
    threads?: number & tags.Type<'int32'> & tags.Minimum<1>;
}