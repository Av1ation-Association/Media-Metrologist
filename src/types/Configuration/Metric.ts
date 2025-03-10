import { type tags } from 'typia';
// export const MetricType = {
//     PSNR: 'PSNR' as 'PSNR' & tags.Constant<string, { title: 'PSNR', description: 'Peak Signal to Noise Ratio' }>,
//     SSIMULACRA: 'SSIMULACRA' as 'SSIMULACRA' & tags.Constant<string, { title: 'SSIMULACRA', description: 'Structural Similarity Index' }>,
//     SSIMULACRA2: 'SSIMULACRA2' as 'SSIMULACRA2' & tags.Constant<string, { title: 'SSIMULACRA2', description: 'Structural Similarity Index 2' }>,
//     VMAF: 'VMAF' as 'VMAF' & tags.Constant<string, { title: 'VMAF', description: 'Video Multi-Method Assessment Framework' }>,
//     Butteraugli: 'Butteraugli' as 'Butteraugli' & tags.Constant<string, { title: 'Butteraugli', description: 'Butteraugli Distance' }>,
//     XPSNR: 'XPSNR' as 'XPSNR' & tags.Constant<string, { title: 'XPSNR', description: 'Extended Peak Signal to Noise Ratio' }>,
// } as const;

export enum MetricType {
    PSNR = 'PSNR',
    SSIMULACRA = 'SSIMULACRA',
    SSIMULACRA2 = 'SSIMULACRA2',
    VMAF = 'VMAF',
    Butteraugli = 'Butteraugli',
    XPSNR = 'XPSNR',
}

/**
 * Represents an empty object type that cannot be assigned any properties unlike `{}` or `object`.
 * Thanks to Matt Pocock at Total Typescript.
 * @author Matt Pocock
 * @see https://www.totaltypescript.com/the-empty-object-type-in-typescript#representing-an-empty-object
 */
// type EmptyObject = Record<PropertyKey, never>;

export type Metric<T extends keyof typeof MetricType | undefined = undefined> = T extends typeof MetricType.PSNR
    ? PSNRMetric
    : T extends typeof MetricType.SSIMULACRA
    ? SSIMULACRAMetric
    : T extends typeof MetricType.SSIMULACRA2
    ? SSIMULACRA2Metric
    : T extends typeof MetricType.VMAF
    ? VMAFMetric
    : T extends typeof MetricType.Butteraugli
    ? ButteraugliMetric
    : T extends typeof MetricType.XPSNR
    ? XPSNRMetric
    : BaseMetric;

export type MetricValue = (number & tags.Type<'float'>);
export type ButteraugliValue = { Norm2: (number & tags.Type<'float'> & tags.Minimum<0>); Norm3: (number & tags.Type<'float'> & tags.Minimum<0>); NormInfinite: (number & tags.Type<'float'> & tags.Minimum<0>); };

export interface BaseMetric {
    regions?: {
        rows: number & tags.Type<'int32'> & tags.Minimum<1>;
        columns: number & tags.Type<'int32'> & tags.Minimum<1>;
    };
}

export type PSNRMetric = BaseMetric;
export type SSIMULACRAMetric = BaseMetric;

export const SSIMULACRA2Implementation = {
    CUDA: 'cuda',
    HIP: 'hip',
    CPU: 'cpu',
} as const;

export interface SSIMULACRA2Metric extends BaseMetric {
    /**
     * Implementation to use. Can be 'cuda', 'hip', or 'cpu'. If 'cuda' or 'hip' is unavailable, 'cpu' will be used.
     * @enum {SSIMULACRA2Implementation}
     */
    implementation?: typeof SSIMULACRA2Implementation[keyof typeof SSIMULACRA2Implementation];
}

export type VMAFMetric = BaseMetric;

export const ButteraugliImplementation = {
    CUDA: 'cuda',
    HIP: 'hip',
    CPU: 'cpu',
} as const;

export interface ButteraugliMetric extends BaseMetric {
    /**
     * Implementation to use. Can be 'cuda', 'hip', or 'cpu'. If 'cuda' or 'hip' is unavailable, 'cpu' will be used.
     * @enum {ButteraugliImplementation}
     */
    implementation?: typeof ButteraugliImplementation[keyof typeof ButteraugliImplementation];

    /**
     * Viewing conditions screen nits.
     * @default 80
     */
    intensity_target: number & tags.Type<'int32'> & tags.Default<80>;

    /**
     * If true, the input must have linear transfer functions.
     * Otherwise, the input clips are assumed in sRGB color space and internally converted to linear transfer.
     * @default false
     */
    linput: boolean & tags.Default<false>;
}

export type XPSNRMetric = BaseMetric;
