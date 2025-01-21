import { type tags } from 'typia';
export const MetricType = {
    PSNR: 'PSNR' as 'PSNR' & tags.Constant<string, { title: 'PSNR', description: 'Peak Signal to Noise Ratio' }>,
    SSIMULACRA: 'SSIMULACRA' as 'SSIMULACRA' & tags.Constant<string, { title: 'SSIMULACRA', description: 'Structural Similarity Index' }>,
    SSIMULACRA2: 'SSIMULACRA2' as 'SSIMULACRA2' & tags.Constant<string, { title: 'SSIMULACRA2', description: 'Structural Similarity Index 2' }>,
    VMAF: 'VMAF' as 'VMAF' & tags.Constant<string, { title: 'VMAF', description: 'Video Multi-Method Assessment Framework' }>,
    Butteraugli: 'Butteraugli' as 'Butteraugli' & tags.Constant<string, { title: 'Butteraugli', description: 'Butteraugli Distance' }>,
    XPSNR: 'XPSNR' as 'XPSNR' & tags.Constant<string, { title: 'XPSNR', description: 'Extended Peak Signal to Noise Ratio' }>,
} as const;

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
    ? SSIMULACRAMetric2
    : T extends typeof MetricType.VMAF
    ? VMAFMetric
    : T extends typeof MetricType.Butteraugli
    ? ButteraugliMetric
    : T extends typeof MetricType.XPSNR
    ? XPSNRMetric
    : BaseMetric;

interface BaseMetric {
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
    ZIG: 'zig',
} as const;

export interface SSIMULACRAMetric2 extends BaseMetric{
    /**
     * Implementation to use. Can be 'cuda', 'hip', or 'zig'. If 'cuda' or 'hip' is unavailable, 'zig' will be used.
     * @enum {SSIMULACRA2Implementation}
     */
    implementation?: typeof SSIMULACRA2Implementation[keyof typeof SSIMULACRA2Implementation];
}

export type VMAFMetric = BaseMetric;

export interface ButteraugliMetric extends BaseMetric {
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
