# Import Methods

In order for Media Metrologist for read and decode video into individual frames for evaluation, at least 1 [VapourSynth plugin][vs-plugins] must be installed. In case a method fails to decode the video, Media Metrologist will attempt to decode the video using the next method listed in the [Configuration](./Configuration.md) for the given [video input](./Configuration.md#video-inputs). There are currently 4 methods supported:

Method | Website
--- | ---
[FFmpegSource](./Import%20Methods/FFmpegSource.md) | [GitHub][ffms2]
[BestSource](./Import%20Methods/BestSource.md) | [GitHub][bestsource]
[DGDecodeNV](./Import%20Methods/DGDecodeNV.md) | [rationalqm.us][dgdecnv]
[L-SMASH-Works](./Import%20Methods/L-SMASH-Works.md) | [GitHub][lsmash]

> [!NOTE]
> Not all methods work for every input and system hardware combination so Media Metrologist [Configuration](./Configuration.md) allows defining multiple methods per input to better ensure inputs are imported successfully.


[vs-plugins]: https://www.vapoursynth.com/doc/installation.html#plugins-and-scripts "Plugins and Scripts"

<!-- Import Methods -->
[ffms2]: https://github.com/FFMS/ffms2 "FFmpegSource (usually known as FFMS or FFMS2) is a cross-platform wrapper library around FFmpeg"
[bestsource]: https://github.com/vapoursynth/bestsource "BestSource (abbreviated as BS) is a cross-platform wrapper library around FFmpeg that ensures always sample and frame accurate access to audio and video with good seeking performance for everything except some lossy audio formats"
[dgdecnv]: https://www.rationalqm.us/dgdecnv/dgdecnv.html "AVC/HEVC/MPG/VC1 Decoder and Frame Server"
[lsmash]: https://github.com/HomeOfAviSynthPlusEvolution/L-SMASH-Works "This source function for VapourSynth uses libavcodec as the video decoder and libavformat as the demuxer"