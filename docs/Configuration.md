# Configuration

The Media Metrologist library and underlying [VapourSynth][vapoursynth] script, [Metrologist.vpy](../src/metrologist.vpy) are designed to be configured for a given Configuration object or JSON file. The configuration includes details for the reference and distorted [video inputs](#video-input), the [metrics](#metrics) to compute, the [scenes/frames](#scenes) to process, and more. [Metrologist.vpy](../src/metrologist.vpy) will also save results as they are computed to this same file unless otherwise specified.

### Video Inputs

Video inputs are separated by 2 types: reference and distorted, where the reference video refers to the original and distorted to an encoded video. Both reference and distorted video inputs include the following properties:

* `path` (*required*) - File path to a video or [VapourSynth][vapoursynth] script. Must be an absolute file path. [VapourSynth][vapoursynth] files must use either the `.py` or `.vpy` extension and set the desired `VideoNode` output to a global variable named `metrologist_input`.
* `importMethods` (*required*) - `Set` or `Array` of [VapourSynth][vapoursynth] video [import methods](#import-methods)
    * At least 1 method must be provided
    * Methods should be provided in order of preference. If the previous method fails the next method is attempted.
* `scale` (*optional*) - Object containing the resolution in which the input should be scaled to before metric evaluation. Must contain both of the following properties:
    * `width` (*required*) - Number of pixels to scale the horizontal axis to. Must be a positive integer greater than 0.
    * `height` (*required*) - Number of pixels to scale the vertical axis to. Must be a positive integer greater than 0.

> [!NOTE]
> Before metric evaluation, the dimensions of all inputs must match the reference video input. Unless overridden with the `scale` property, distorted video inputs will be scaled to match the dimensions of the reference video input *after* the reference video input has been scaled as configured.

Distorted video inputs are defined under the `distorted` property as a hashmap where the keys are unique identifiers for each distorted video input.

<details>
<summary>Example</summary>

```json
{
    ...
    "reference": {
        "path": "C:/Tony's Debbouncy Caastle.mkv",
        "importMethods": [
            {
                "type": "dgdecnv"
            }
        ]
    },
    "distorted": {
        "1": {
            "path": "C:/Tony's Smaller Debbouncy Caastle.mkv",
            "importMethods": [
                {
                    "type": "bestsource"
                }
            ]
        },
        "2": {
            "path": "C:/Tony's Other Smaller Debbouncy Caastle.mp4",
            "importMethods": [
                {
                    "type": "ffms2",
                    "cache": false
                },
                {
                    "type": "bestsource"
                }
            ],
            "scale": {
                "width": 1280,
                "height": 720
            }
        }
    },
    ...
}
```

</details>

### Import Methods

At least one input method must be installed in order to import video for evaluation. The following are the supported input methods:

* [FFmpegSource][ffms2] - Recommended over L-SMASH-Works when using version 5.0 or newer
* [BestSource][bestsource] - Most reliable but requires indexing the entire video
* [DGDecodeNV][dgdecnv] - Requires a supported NVIDIA graphics processing unit and does not support all video codecs
* [L-SMASH-Works][lsmash] - Quick to index video but has [issues with reliability](https://github.com/master-of-zen/Av1an/issues/745 "Chunk methods introduce image glitches")

For more details, see the [Import Methods](./docs/Import%20Methods.md) documentation.

### Metrics

Metrics are evaluated using [VapourSynth plugins](https://www.vapoursynth.com/doc/installation.html#plugins-and-scripts "Plugins and Scripts") of which some can evaluate multiple metrics. The following are metrics supported by Media Metrologist and the plugin(s) required for each metric.

* [PSNR][psnr] - Peak signal-to-noise ratio
    * [VapourSynth-VMAF][vmaf-plugin]
* [VMAF][vmaf] - Video Multi-Method Assessment Fusion
    * [VapourSynth-VMAF][vmaf-plugin]
* [SSIMULACRA][ssim] - Structural SIMilarity Unveiling Local And Compression Related Artifacts
    * [vapoursynth-julek-plugin][julek]
* [SSIMULACRA 2][ssimu2] - Structural SIMilarity Unveiling Local And Compression Related Artifacts 2
    * [Vapoursynth-HIP][vship]
    * [VapourSynth Zig Image Process][vszip]
    * [vapoursynth-julek-plugin][julek]
* [Butteraugli][butteraugli]
    * [vapoursynth-julek-plugin][julek]

> [!NOTE]
> Some plugins output differing results due to their implementations and may not be directly comparable.

### Scenes



### Output



### Threads



### Schema



### Examples

Compare 2 scenes consisting of frames 1-3 and 4-5 respectively of `distorted-1.mkv` against `reference.mkv` using [CUDA-accelerated SSIMULACRA2][vship]. The `reference.mkv` file can be imported first with [DGDecodeNV][dgdecnv] or next with [BestSource][bestsource] if that fails. The `distorted-1.mkv` file will be imported only with [BestSource][bestsource]. Enable real-time feedback by setting `output.console` to `true`. The first scene already has scores so Media Metrologist will only process the remaining scene and update the configuration file once completed.

<details>
<summary>Example 1</summary>

```json
{
    "$schema": "",
    "reference": {
        "path": "C:/reference.mkv",
        "importMethods": [
            {
                "type": "dgdecnv"
            },
            {
                "type": "bestsource"
            }
        ]
    },
    "distorted": {
        "1": {
            "path": "C:/distorted-1.mkv",
            "importMethods": [
                {
                    "type": "bestsource"
                }
            ]
        }
    },
    "metrics": {
        "SSIMULACRA2": {
            "implementation": "cuda"
        }
    },
    "scenes": [
        {
            "reference": {
                "start": 0,
                "end": 3
            },
            "distorted": {
                "1": {
                    "start": 0,
                    "end": 2,
                    "scores": {
                        "SSIMULACRA2": [
                            {
                                "time": "2025-01-01T12:34:17.898066",
                                "value": [
                                    [
                                        95.71505737304688
                                    ]
                                ]
                            },
                            {
                                "time": "2025-01-01T12:34:18.052971",
                                "value": [
                                    [
                                        90.25774383544922
                                    ]
                                ]
                            },
                            {
                                "time": "2025-01-01T12:34:18.052971",
                                "value": [
                                    [
                                        89.20927429199219
                                    ]
                                ]
                            }
                        ]
                    }
                }
            }
        },
        {
            "reference": {
                "start": 3,
                "end": 5
            },
            "distorted": {
                "1": {
                    "start": 3,
                    "end": 5,
                    "scores": {
                        "SSIMULACRA2": []
                    }
                }
            }
        }
    ],
    "output": {
        "console": true,
        "verbose": true
    },
}
```
</details>

[vapoursynth]: https://github.com/vapoursynth/vapoursynth "A video processing framework with simplicity in mind"

<!-- Import Methods -->
[ffms2]: https://github.com/FFMS/ffms2 "FFmpegSource (usually known as FFMS or FFMS2) is a cross-platform wrapper library around FFmpeg"
[bestsource]: https://github.com/vapoursynth/bestsource "BestSource (abbreviated as BS) is a cross-platform wrapper library around FFmpeg that ensures always sample and frame accurate access to audio and video with good seeking performance for everything except some lossy audio formats"
[dgdecnv]: https://www.rationalqm.us/dgdecnv/dgdecnv.html "AVC/HEVC/MPG/VC1 Decoder and Frame Server"
[lsmash]: https://github.com/HomeOfAviSynthPlusEvolution/L-SMASH-Works "This source function for VapourSynth uses libavcodec as the video decoder and libavformat as the demuxer"

<!-- Metrics Info -->
[psnr]: https://en.wikipedia.org/wiki/Peak_signal-to-noise_ratio#Quality_estimation_with_PSNR "Wikipedia: Quality estimation with PSNR"
[vmaf]: https://github.com/Netflix/vmaf "VMAF - Video Multi-Method Assessment Fusion"
[ssim]: https://github.com/cloudinary/ssimulacra "SSIMULACRA - Structural SIMilarity Unveiling Local And Compression Related Artifacts"
[ssimu2]: https://github.com/cloudinary/ssimulacra2 "SSIMULACRA 2 - Structural SIMilarity Unveiling Local And Compression Related Artifacts"
[butteraugli]: https://github.com/google/butteraugli "A tool for measuring perceived differences between images"

<!-- Metrics VapourSynth Plugins -->
[vmaf-plugin]: https://github.com/HomeOfVapourSynthEvolution/VapourSynth-VMAF "Video Multi-Method Assessment Fusion, based on https://github.com/Netflix/vmaf"
[ssim]: https://github.com/cloudinary/ssimulacra "SSIMULACRA - Structural SIMilarity Unveiling Local And Compression Related Artifacts"
[ssimu2]: https://github.com/cloudinary/ssimulacra2 "SSIMULACRA2 - Structural SIMilarity Unveiling Local And Compression Related Artifacts"
[vszip]: https://github.com/dnjulek/vapoursynth-zip "VapourSynth Zig Image Process"
[ssimu2-zig]: https://github.com/dnjulek/vapoursynth-ssimulacra2 "vapoursynth-ssimulacra2"
[julek]: https://github.com/dnjulek/vapoursynth-julek-plugin "vapoursynth-julek-plugin is a collection of some new filters and some already known ones..."
[vship]: https://github.com/Line-fr/Vship "Vapoursynth-HIP - An easy to use plugin for vapoursynth performing SSIMU2 measurments using the GPU with HIP"