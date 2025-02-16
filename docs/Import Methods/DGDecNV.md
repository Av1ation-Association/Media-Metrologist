# DGDecNV

Requires a supported NVIDIA graphics processing unit and does not support all video codecs and bit-depths. NVIDIA provides documentation on decode capabilities of their various hardware [here](https://developer.nvidia.com/video-encode-and-decode-gpu-support-matrix-new).

## Options

DGDecNV also accepts the following options:

Name | Type | Description
--- | --- | ---
indexPath | string | The path to an existing index file (*.dgi) to use

More information on DGDecNV and documentation on the options can be found on their [repository][dgdecnv].

<!-- Import Methods -->
[ffms2]: https://github.com/FFMS/ffms2 "FFmpegSource (usually known as FFMS or FFMS2) is a cross-platform wrapper library around FFmpeg"
[bestsource]: https://github.com/vapoursynth/bestsource "BestSource (abbreviated as BS) is a cross-platform wrapper library around FFmpeg that ensures always sample and frame accurate access to audio and video with good seeking performance for everything except some lossy audio formats"
[dgdecnv]: https://www.rationalqm.us/dgdecnv/dgdecnv.html "AVC/HEVC/MPG/VC1 Decoder and Frame Server"
[lsmash]: https://github.com/HomeOfAviSynthPlusEvolution/L-SMASH-Works "This source function for VapourSynth uses libavcodec as the video decoder and libavformat as the demuxer"