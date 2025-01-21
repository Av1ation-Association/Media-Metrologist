import {
    type ChildProcessByStdio,
    spawn,
} from 'child_process';
import EventEmitter from 'events';
import { promises as fsp } from 'fs';
import path from 'path';
import { createInterface } from 'readline';
import {
    type Readable,
    type Writable,
} from 'stream';
import { fileURLToPath } from 'url';
import typia, { type tags } from 'typia';
import {
    type SceneFrameScores,
    type Configuration,
} from './types/Configuration/Configuration.js';
import { MetricType } from './types/Configuration/Metric.js';
import {
    type Status,
    type ScoringStatus,
    type ErrorStatus,
    State,
} from './types/Status.js';

export type MetrologistEvent = Record<typeof State[keyof typeof State], [Status]> & { status: [Status] };

export class Metrologist extends EventEmitter<MetrologistEvent> {
    private childProcess?: ChildProcessByStdio<Writable | null, Readable, Readable | null>;

    constructor(public config: Configuration, public readonly statuses: Status[] = [{ time: new Date(), state: State.Idle }]) {
        super();

        // If config has score data and statuses is empty, add status for each scored frame
        const validation = typia.validate<Configuration>(this.config);

        console.log('Validation:', validation.success);

        // Populate statuses with scores if statuses is empty and config has score data
        if (this.statuses.length <= 1) {
            // Generate status for each scored frame
            const scoreEvents = this.config.scenes.reduce((events, scene, sceneIndex) => {
                Object.entries(scene.distorted).forEach(([distortedId, distorted]) => {
                    Object.entries(distorted.scores).forEach(([metric, scores], index) => {
                        if (scores) {
                            scores.forEach(score => {
                                events.push({
                                    time: score.time,
                                    state: State.Scoring,
                                    distortedId,
                                    sceneIndex,
                                    frameIndex: index,
                                    metric: MetricType[metric],
                                    score: score.value,
                                });
                            });
                        }
                    });
                });

                return events;
            }, [] as Status[]);

            // Sort events by time
            this.statuses.push(...scoreEvents.sort((a, b) => a.time.getTime() - b.time.getTime()));
        }
    }

    public static Serialize(config: Configuration) {
        const formattedConfig: Configuration<'Array'> = {
            ...config,
            reference: {
                ...config.reference,
                importMethods: Array.from(config.reference.importMethods),
            },
            distorted: Object.entries(config.distorted).reduce((formattedDistorted, [id, distorted]) => {
                formattedDistorted[id] = {
                    ...distorted,
                    importMethods: Array.from(distorted.importMethods),
                };
                return formattedDistorted;
            }, {} as Configuration<'Array'>['distorted']),
            scenes: config.scenes.map(scene => {
                return {
                    ...scene,
                    reference: {
                        start: scene.reference.start,
                        end: scene.reference.end,
                    },
                    distorted: Object.entries(scene.distorted).reduce((formattedDistorted, [id, distorted]) => {
                        formattedDistorted[id] = {
                            ...distorted,
                            scores: Object.entries(distorted.scores).reduce((scores, [metric, score]) => {
                                scores[metric] = Array.from(score ?? []);
                                return scores;
                            }, {} as Configuration<'Array'>['scenes'][0]['distorted'][0]['scores']),
                        };
                        return formattedDistorted;
                    }, {} as Configuration<'Array'>['scenes'][0]['distorted']),
                };
            }),
        };

        return formattedConfig;
    }

    public static async Deserialize(configPath: string) {
        const configString = await fsp.readFile(configPath, 'utf-8');

        // Ensure config exists, is valid JSON, and can be parsed
        try {
            const config: Configuration = JSON.parse(configString);

            // Ensure config is valid


            return config;
        } catch (error) {
            throw new Error('Invalid config file');
        }
    }
    
    public static GenerateRandomConfiguration() {
        // Metrics contains empty objects by design and requires special handling
        // TODO: Ensure scenes start and end are valid
        const output = typia.random<Configuration['output']>();
        const threads = typia.random<Configuration['threads']>();
        return {
            $schema: typia.random<Configuration['$schema']>(),
            reference: typia.random<Configuration['reference']>(),
            distorted: typia.random<Configuration['distorted']>(),
            metrics: typia.random<(keyof typeof MetricType)[] & tags.UniqueItems>().reduce((metricObject, metric) => {
                switch (metric) {
                    case MetricType.SSIMULACRA2:
                        metricObject[metric] = typia.random<Pick<Configuration['metrics'], 'SSIMULACRA2'>>() ?? {};
                        break;
                    case MetricType.Butteraugli:
                        metricObject[metric] = typia.random<Pick<Configuration['metrics'], 'Butteraugli'>>() ?? {};
                        break;
                    default:
                        metricObject[metric] = {};
                        break;
                }
                return metricObject;
            }, {}),
            scenes: typia.random<Configuration['scenes']>(),
            ...(output && { output }),
            ...(threads && { threads }),
        } as Configuration;
    }
    
    public static CalculateTotalFrames(config: Configuration) {
        const frames = config.scenes.reduce((sceneFrameTotal, scene) => {
            // Frames per scene for all encoded inputs
            return sceneFrameTotal + Object.entries(scene.distorted).reduce((frameTotal, [_id, distorted]) => {
                return frameTotal + Object.keys(distorted.scores).length * (distorted.end - distorted.start);
            }, 0);
        }, 0);
    
        return frames;
    }

    public static CalculateTotalFramesScored(config: Configuration) {
        return config.scenes.reduce((framesScored, scene) => {
            // Frames per scene for all encoded inputs
            const expectedSceneTotal = scene.reference.end - scene.reference.start;
            Object.values(scene.distorted).forEach(distorted => {
                if (Object.values(distorted.scores).every(sceneFrameScores => sceneFrameScores.length === expectedSceneTotal)) {
                    // All metrics scored for this scene
                    framesScored.completed = framesScored.completed + expectedSceneTotal;
                } else {
                    // At least one metric unscored for this scene
                    framesScored.remaining = framesScored.remaining + expectedSceneTotal;
                }
            });

            return framesScored;
        }, { completed: 0, remaining: 0 });
    }

    public static CalculateStatistics(config: Configuration) {
        // TODO: Refactor to utils module
        type SceneStatistics = {
            scores: number[];
            average: number;
            minimum: number;
            maximum: number;
            standardDeviation: number;
            median: number;
            percentile1: number;
            percentile5: number;
        };

        function generateStatistics(scores: number[]) {
            const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
            const minimum = Math.min(...scores.map(score => score));
            const maximum = Math.max(...scores.map(score => score));
        
            // Calculate the squared differences between each score and the average
            const squaredDifferences = scores.map(score => Math.pow(score - average, 2));
            // Calculate the average of the squared differences
            const averageSquaredDifference = squaredDifferences.reduce((sum, difference) => sum + difference, 0) / scores.length;
            // Calculate the standard deviation by taking the square root of the average squared difference
            const standardDeviation = Math.sqrt(averageSquaredDifference);
        
            const sortedScores = scores.sort((a, b) => a - b);
        
            function calculatePercentile(percentile: number) {
                const index = (percentile / 100) * (sortedScores.length - 1);
                const lowerIndex = Math.floor(index);
                const upperIndex = Math.ceil(index);
                const lower = sortedScores[lowerIndex];
                const upper = sortedScores[upperIndex];
                return lowerIndex === upperIndex ? sortedScores[lowerIndex] : lower + (upper - lower) * (index - lowerIndex);
            }
        
            return {
                average,
                minimum,
                maximum,
                standardDeviation,
                percentile: (percentile: number) => calculatePercentile(percentile),
            };
        }

        // Statistics must be calculated per metric per distorted
        const metricScenesMap = Object.keys(config.distorted).reduce((distortedMap, distortedId) => {
            distortedMap[distortedId] = Object.keys(config.metrics).reduce((metricsMap, metric) => {
                metricsMap[metric] = [];
                return metricsMap;
            }, {} as { [metric: string]: number[][] });
            return distortedMap;
        }, {} as { [distortedId: string]: { [metric: string]: number[][] } });

        config.scenes.forEach(scene => {
            Object.entries(scene.distorted).forEach(([distortedId, distorted]) => {
                Object.entries(distorted.scores).forEach(([metric, scores]) => {
                    const scenesScores = scores.map(score => {
                        if (Array.isArray(score.value)) {
                            const allScores = score.value.flat();
                            return allScores.reduce((sum, regionScore) => sum + regionScore, 0) / allScores.length;
                        } else {
                            return score.value;
                        }
                    });
                    
                    metricScenesMap[distortedId][metric].push(scenesScores);
                });
            });
        });

        return Object.entries(metricScenesMap).reduce((result, [distortedId, metricsMap]) => {
            Object.entries(metricsMap).forEach(([metric, scores]) => {
                if (!result[distortedId]) {
                    result[distortedId] = {};
                }

                const allScores = scores.flat();

                result[distortedId][metric] = {
                    scenes: scores.map(scores => {
                        const generatedStatistics = generateStatistics(scores);
                        return {
                            scores,
                            minimum: generatedStatistics.minimum,
                            maximum: generatedStatistics.maximum,
                            average: generatedStatistics.average,
                            standardDeviation: generatedStatistics.standardDeviation,
                            median: generatedStatistics.percentile(50),
                            percentile1: generatedStatistics.percentile(1),
                            percentile5: generatedStatistics.percentile(5),
                        };
                    }),
                    statistics: {
                        scores: allScores,
                        minimum: Math.min(...allScores),
                        maximum: Math.max(...allScores),
                        average: allScores.reduce((sum, score) => sum + score, 0) / allScores.length,
                        standardDeviation: generateStatistics(allScores).standardDeviation,
                        median: generateStatistics(allScores).percentile(50),
                        percentile1: generateStatistics(allScores).percentile(1),
                        percentile5: generateStatistics(allScores).percentile(5),
                    },
                };
            });
            return result;
        }, {} as { [distortedId: string]: { [metric: string]: { scenes: SceneStatistics[]; statistics: SceneStatistics; } } });
    }

    // public static CalculateSceneStatistics(config: SceneFrameScores) {
        
    // }

    public static CalculateFramerate(config: Configuration, metric?: keyof typeof MetricType) {
        const sceneFramerates = config.scenes.reduce((sceneFramerates, scene) => {
            const sceneFrames = Object.values(scene.distorted)
                .reduce((allScores, distorted) => {
                    if (metric) {
                        return allScores.concat(distorted.scores[metric] ?? []);
                    }
                    return allScores.concat(Object.values(distorted.scores).reduce((metricScores, scores) => metricScores.concat(scores), []));
                }, [] as SceneFrameScores[])
                .sort((a, b) => a.time.getTime() - b.time.getTime());

            const firstCompleted = sceneFrames[0].time;
            const lastCompleted = sceneFrames[sceneFrames.length - 1].time;

            const totalFrames = scene.reference.end - scene.reference.start;
            const totalSeconds = (lastCompleted.getTime() - firstCompleted.getTime()) / 1000;

            const framerate = totalFrames / totalSeconds;

            return sceneFramerates.concat(framerate);
        }, [] as number[]);

        return sceneFramerates.reduce((average, framerate) => average + framerate, 0) / sceneFramerates.length;
    }

    public get totalFrames() {
        return Metrologist.CalculateTotalFrames(this.config);
    }

    public get configPath() {
        return this.config.output?.path ?? path.resolve(path.dirname(this.config.reference.path), 'config.json');
    }

    public get completedFramesScored() {
        return Metrologist.CalculateTotalFramesScored(this.config);
    }

    public get statistics() {
        return Metrologist.CalculateStatistics(this.config);
    }

    public get framerate() {
        return Metrologist.CalculateFramerate(this.config);
    }

    private addStatus(status: Omit<Status, 'time'> & Partial<Pick<Status, 'time'>>) {
        const newStatus = {
            time: status.time ?? new Date(),
            ...status,
        } as Status;
        this.statuses.push(newStatus);
        this.emit('status', newStatus);
        this.emit(status.state, newStatus);
    }

    public async measure() {
        // Start WAMP server and listen for measurement updates
        // Execute metrologist.vpy
        // Stop WAMP server

        // Write config file to disk
        await fsp.writeFile(this.configPath, JSON.stringify(Metrologist.Serialize(this.config), null, 4));
        
        return new Promise<Configuration>((resolve, reject) => {
            // Run metrologist
            this.childProcess = spawn(
                'python',
                [
                    path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'metrologist.vpy'),
                    this.configPath,
                ],
                {
                    stdio: ['pipe', 'pipe', 'inherit'],
                },
            );

            const stdoutReader = createInterface({ input: this.childProcess.stdout });
            stdoutReader.on('line', (line) => {
                if (line.startsWith('SCORE:')) {
                    // Parse score
                    const scoreJson = line.substring('SCORE: '.length);
                    try {
                        const {
                            scene: sceneIndex,
                            distortedId,
                            frame,
                            metric: metricType,
                            score,
                        } = JSON.parse(scoreJson) as {
                            scene: number;
                            distortedId: string;
                            frame: number;
                            metric: keyof typeof MetricType;
                            score: SceneFrameScores;
                        };

                        const time = new Date(score.time);
                        const metric = MetricType[metricType as keyof typeof MetricType];
    
                        const sceneLength = this.config.scenes[sceneIndex].distorted[distortedId].end - this.config.scenes[sceneIndex].distorted[distortedId].start;
                        
                        // Add score to config
                        if (!this.config.scenes[sceneIndex].distorted[distortedId].scores[metric].length || this.config.scenes[sceneIndex].distorted[distortedId].scores[metric].length < sceneLength) {
                            this.config.scenes[sceneIndex].distorted[distortedId].scores[metric] = new Array(sceneLength).fill(undefined);
                        }
    
                        this.config.scenes[sceneIndex].distorted[distortedId].scores[metric][frame] = {
                            time,
                            value: score.value,
                        };
    
                        // Add new status with the state 'scoring'
                        this.addStatus({
                            time,
                            state: State.Scoring,
                            sceneIndex,
                            distortedId,
                            metric,
                            frameIndex: frame,
                            score: score.value,
                        } as ScoringStatus);
                    } catch (error) {
                        console.error(error);
                        return;
                    }
                } else {
                    if (this.config.output?.verbose) {
                        console.log(`[Metrologist] ${line}`);
                    }
                }
            });

            this.childProcess.on('close', (code) => {
                // // Close the server
                // server.close();
                if (code === 0) {
                    // Add new status with the state 'done'
                    this.addStatus({
                        state: State.Done,
                    });

                    // // Read config file from disk
                    // const finalConfig = Metrologist.Deserialize(this.configPath);

                    // // Resolve with the final config
                    // resolve(finalConfig);
                    resolve(this.config);
                } else {
                    // Add new status with the state 'error'
                    const error = new Error(`SSIMULACRA2 exited with code ${code}`);
                    this.addStatus({
                        state: State.Error,
                        error,
                    } as ErrorStatus);
                    reject(error);
                }
            });

            this.childProcess.on('error', (error) => {
                // // Close the server
                // server.close();
                // Add new status with the state 'error'
                this.addStatus({
                    state: State.Error,
                    error,
                } as ErrorStatus);
                reject(error);
            });

            // Add new status with the state 'running'
            this.addStatus({
                state: State.Running,
            });
        });
    }

}
