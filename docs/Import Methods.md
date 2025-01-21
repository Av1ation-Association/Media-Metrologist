# Import Methods

In order for Media Metrologist for read and decode video into individual frames for evaluation, at least 1 [VapourSynth plugin][vs-plugins] must be installed. In case 1 fails to decode the video, Media Metrologist will attempt to decode the video using the next method listed in the [Configuration](./Configuration.md) for the given [video input](./Configuration.md#video-inputs). As necessary functionality provided by [VapourSynth plugins][vs-plugins], there are currently 4 options to choose from:

* [FFmpegSource][ffms2]
* [BestSource][bestsource]
* [DGDecodeNV][dgdecnv]
* [L-SMASH-Works][lsmash]

> [!NOTE]
> Not all methods work for every input and system hardware combination so Media Metrologist [Configuration](./Configuration.md) allows defining multiple methods per input to try in order to improve overall reliability.

## FFmpegSource

As of the release of version 5.0, FFmpegSource (FFMS2) is now recommended over the previously recommended [L-SMASH-Works](#l-smash-works) for improvements in speed and reliability. However, FFMS2 is not the most hardy solution for decoding video available.

FFmpegSource also accepts the following options:

Name | Type | Description
--- | --- | ---
track | integer | The video track number to open, as seen by the relvant demuxer
cache | boolean |
cachefile | string |
fpsnum | integer |
fpsden | integer |
threads | integer |
timecodes | string |
seekmode | integer |
width | integer |
height | integer |
resizer | [`FFMS2Resizer`](./Import%20Methods/FFmpegSource.md#FFMS2Resizer) |
format | integer |
alpha | boolean |

More information on FFmpegSource and documentation on the options can be found on their [repository][ffms2].

## BestSource

Most reliable but requires indexing the entire video


## DGDecodeNV

Requires a supported NVIDIA graphics processing unit and does not support all video codecs


## L-SMASH-Works

Quick to index video but has [issues with reliability](https://github.com/master-of-zen/Av1an/issues/745 "Chunk methods introduce image glitches")


[vs-plugins]: https://www.vapoursynth.com/doc/installation.html#plugins-and-scripts "Plugins and Scripts"

<!-- Import Methods -->
[ffms2]: https://github.com/FFMS/ffms2 "FFmpegSource (usually known as FFMS or FFMS2) is a cross-platform wrapper library around FFmpeg"
[bestsource]: https://github.com/vapoursynth/bestsource "BestSource (abbreviated as BS) is a cross-platform wrapper library around FFmpeg that ensures always sample and frame accurate access to audio and video with good seeking performance for everything except some lossy audio formats"
[dgdecnv]: https://www.rationalqm.us/dgdecnv/dgdecnv.html "AVC/HEVC/MPG/VC1 Decoder and Frame Server"
[lsmash]: https://github.com/HomeOfAviSynthPlusEvolution/L-SMASH-Works "This source function for VapourSynth uses libavcodec as the video decoder and libavformat as the demuxer"