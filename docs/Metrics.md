# Metrics

In order for Media Metrologist to process, at least 1 [VapourSynth plugin][vs-plugins] must be installed. The following are metrics supported by Media Metrologist and the plugin(s) required for each metric:

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
    * [Vapoursynth-HIP][vship]
    * [vapoursynth-julek-plugin][julek]



[vs-plugins]: https://www.vapoursynth.com/doc/installation.html#plugins-and-scripts "Plugins and Scripts"

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