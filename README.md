# Media Metrologist

Measure video quality using a suite of metrics on a per-scene, per-frame, and per-region basis. Compare multiple encoded videos against a reference in a single operation. Track comparison data live as it's computed and generate quality reports per video, scene, and metric.

## Features

* JSON [Configuration](./docs/Configuration.md) and rich typings via Typescript
* Standalone [VapourSynth][vapoursynth] script: [Metrologist.vpy](./src/metrologist.vpy)
* Support for either video file or [VapourSynth][vapoursynth] script paths as inputs
* Support for several [VapourSynth][vapoursynth] video [import methods](./docs//Configuration.md#import-methods)
* Compare multiple distorted videos against a reference video at once
* Process multiple frame ranges defined as [scenes](./docs/Configuration.md#scenes) with the potential to trade accuracy for more speed
* Compute as many [metrics](./docs/Configuration.md#metrics) as desired per scene
* Split frames into a grid of regions with the potential for more spatial data
* Realtime feedback on processing speed and computed scores
* Resume processing only on scenes not yet measured
* Simple statistics for each distorted video input and for each scene

## Getting Started

Media Metrologist is designed to be used with the upcoming graphical user interface (GUI) so installation would not be strictly necessary. It is also in the process of being improved as it is currently unrefined. While some functionality such as statistics and report generation is done via NodeJS, most functionality is provided by the [Metrologist.vpy](./src/metrologist.vpy) VapourSynth script which can be executed by itself *without* NodeJS. For early users who want to test or implement Media Metrologist into their own NodeJS applications here are some loose instructions:

### VapourSynth (Python)

1. Clone or download [metrologist.vpy](./src/metrologist.vpy)
2. Ensure [Prerequisites](#prerequisites) are met
3. Create a JSON file adhering to [Configuration](./docs/Configuration.md)
4. Execute [metrologist.vpy](./src/metrologist.vpy) with the JSON file
    * `> python ./metrologist.vpy ./MyConfiguration.json`
5. Read the updated JSON file for results as configured

### NodeJS

1. Clone or download this repository
    * `> git clone https://wwww.github.com/Av1ation-Association/Media-Metrologist.git --depth 1`
2. Install dependencies
    * `> npm install`
3. Build
    * `> npm run build`
4. Ensure [Prerequisites](#prerequisites) are met
5. Create a new typescript file `./src/main.local.ts`
6. Import `Metrologist` and instantiate with the desired configuration
7. Execute the evalution with `Metrologist.measure()`
8. Read results and generate statistics

Currently, there are no specific exports yet but the [main.ts](./src/main.ts) exports the class `Metrologist` which provides all the [features](#features). Until there is more documentation please peruse the typings provided by the IDE. [Visual Studio Code](https://code.visualstudio.com/ "Visual Studio Code is a streamlined code editor with support for development operations like debugging, task running, and version control. It aims to provide just the tools a developer needs for a quick code-build-debug cycle and leaves more complex workflows to fuller featured IDEs, such as Visual Studio IDE.") (VS Code) is recommended and pre-configured for debugging. While using VSCode, you can test your own script by following the above instructions and debugging with the `Main Local` configuration. Below is an example `main.local.ts` which compares 2 videos imported with [DGDecodeNV][dgdecnv] and/or [BestSource][bestsource] using [VapourSynth-HIP][vship] to evaluate the [SSIMULACRA 2][ssimu2] metric:

<details>
<summary>Example</summary>

```ts
import { Metrologist } from './main.js';
import { type Configuration } from './types/Configuration/Configuration.js';
import {
    ImportMethodType,
    type ImportMethod,
} from './types/Configuration/Import.js';
import { SSIMULACRA2Implementation } from './types/Configuration/Metric.js';
import { type ScoringStatus } from './types/Status.js';

const testConfig: Configuration = {
    $schema: ``,
    reference: {
        path: 'C:/My Reference Video.mkv',
        importMethods: new Set([
            {
                type: ImportMethodType.DGDecNV,
            },
            {
                type: ImportMethodType.BestSource,
            },
        ] as ImportMethod[]),
    },
    distorted: {
        '1': {
            path: 'C:/My Distorted Video.mkv',
            importMethods: new Set([
                {
                    type: ImportMethodType.DGDecNV,
                },
                {
                    type: ImportMethodType.BestSource,
                },
            ] as ImportMethod[]),
        },
    },
    metrics: {
        SSIMULACRA2: {
            implementation: SSIMULACRA2Implementation.CUDA,
        },
    },
    scenes: [
        ...Array.from({ length: 1 }, (_, index) => ({
            reference: {
                start: index * 100,
                end: (index + 1) * 100,
            },
            distorted: {
                '1': {
                    start: index * 100,
                    end: (index + 1) * 100,
                    scores: {
                        SSIMULACRA2: [],
                    },
                },
            },
        })),
    ],
    output: {
        console: true,
        verbose: true,
    },
    threads: 4,
};

const metrologist = new Metrologist(testConfig);
const finalConfig = await metrologist.measure();

metrologist.on('scoring', (event: ScoringStatus) => {
    if (event.frameIndex === 0) {
        console.log(`Scene ${event.sceneIndex} Distorted ${event.distortedId}: ${event.metric} = ${event.score}`);
    }
});

console.log(`TOTAL FRAMES: ${metrologist.totalFrames}`);
console.log(`${(await import('util')).inspect(metrologist.completedFramesScored)}`);
console.log(`${metrologist.framerate} FPS`);
console.log(`${(await import('util')).inspect(metrologist.statistics, undefined, 10, true)}`);

console.log('Final config:', (await import('util')).inspect(finalConfig, undefined, 10, true));
```

</details>

### Prerequisites

Besides being a [NodeJS](https://nodejs.org/ "Node.js® is a free, open-source, cross-platform JavaScript runtime environment that lets developers create servers, web apps, command line tools and scripts.") application, Media Metrologist uses [VapourSynth][vapoursynth] and several [VapourSynth plugins][vs-plugins] in order to decode [input videos](./docs/Configuration.md#video-inputs) and evaluate the desired [metrics](./docs/Configuration.md#metrics). At a minimum, [metrologist.vpy](./src/metrologist.vpy) and by extension Media Metrologist both require the following to be installed:

* [VapourSynth][vapoursynth]
    * [Python](https://www.python.org/ "Python is a programming language. It’s used for many different applications. It’s used in some high schools and colleges as an introductory programming language because Python is easy to learn, but it’s also used by professional software developers at places such as Google, NASA, and Lucasfilm Ltd.")
* At least one of the following [VapourSynth plugins][vs-plugins] for decoding video:
    * [FFmpegSource][ffms2]
    * [BestSource][bestsource]
    * [DGDecodeNV][dgdecnv]
    * [L-SMASH-Works][lsmash]
* At least one of the following [VapourSynth plugins][vs-plugins] for evaluating metrics:
    * [VapourSynth-VMAF][vmaf-plugin]
    * [Vapoursynth-HIP][vship]
    * [VapourSynth Zig Image Process][vszip]
    * [vapoursynth-julek-plugin][julek]

For more information on the plugins see [Import Methods](./docs/Import%20Methods.md) and [Metrics](./docs/Configuration.md#metrics).

## Available Scripts

- `clean` - remove coverage data, Jest cache and transpiled files,
- `prebuild` - lint source files and tests before building,
- `build` - transpile TypeScript to ES6,
- `build:watch` - interactive watch mode to automatically transpile source files,
- `lint` - lint source files and tests,
- `prettier` - reformat files,
- `test` - run tests,
- `test:watch` - interactive watch mode to automatically re-run tests



<!-- Links -->

[vapoursynth]: https://github.com/vapoursynth/vapoursynth "A video processing framework with simplicity in mind"
[vs-plugins]: https://www.vapoursynth.com/doc/installation.html#plugins-and-scripts "Plugins and Scripts"

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