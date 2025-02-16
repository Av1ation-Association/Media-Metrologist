# FFmpegSource

As of the release of version 5.0, FFmpegSource (FFMS2) is now recommended over the previously recommended [L-SMASH-Works](#l-smash-works) for improvements in speed and reliability. However, FFMS2 is not the most hardy solution for decoding video available.

## Options

FFmpegSource also accepts the following options:

Name | Type | Description
--- | --- | ---
track | integer | The video track number to open, as seen by the relevant demuxer
cache | boolean | Whether or not to use or generate a cache file
cachefile | string | The cache file location (`${inputFileName}.ffindex`)
fpsnum | integer | Controls framerate of output
fpsden | integer | Controls framerate of output
threads | integer | The number of decoding threads to request from libavcodec
timecodes | string | The file name to write Matroska v2 timecodes to
seekmode | integer | Controls how seeking is done
width | integer | The width in pixels of the output video
height | integer | The height in pixels of the output video
resizer | [`FFMS2Resizer`](#ffms2resizer) | The resizing algorithm to use if rescaling the image is necessary
format | integer | Converts the output to the given format
alpha | boolean | The alpha channel if present in the input

### FFMS2Resizer

Available resizing algorithms:

* FAST_BILINEAR
* BILINEAR
* BICUBIC
* X
* POINT
* AREA
* BICUBLIN
* GAUSS
* SINC
* LANCZOS
* SPLINE

More information on FFmpegSource and documentation on the options can be found on their [repository][ffms2].



[vs-plugins]: https://www.vapoursynth.com/doc/installation.html#plugins-and-scripts "Plugins and Scripts"

<!-- Import Methods -->
[ffms2]: https://github.com/FFMS/ffms2 "FFmpegSource (usually known as FFMS or FFMS2) is a cross-platform wrapper library around FFmpeg"