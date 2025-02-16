# BestSource

Most reliable but requires indexing the entire video.

## Options

BestSource also accepts the following options:

Name | Type | Description
--- | --- | ---
track | integer | The track index
variableformat | boolean | Allows format changes in output
fpsnum | integer | Converts the output to constant framerate
fpsden | integer | Converts the output to constant framerate
rff | boolean | Applies RFF flags to the output
threads | integer | The number of threads to use for decoding
seekpreroll | integer | The number of frames to cache when seeking before the requested frame
enable_drefs | boolean | Passes the value to the FFmpeg mov demuxer
use_absolute_path | boolean | Passes the value to the FFmpeg mov demuxer
cachemode | [BestSourceCacheMode](#bestsoucecachemode) | The indexing and caching behavior
cachepath | string | The path where  the cache files are written
cachesize | integer | The maximum internal cache size in MB
hwdevice | string | The interface to use for hardware decoding
extrahwframes | integer | The number of additional frames to allocate when hwdevice is set
timecodes | string | The timecode v2 file path to write to
start_number | integer | The first number of image sequences
showprogress | boolean | Whether or not to print indexing progress as VapourSynth information level log messages

### BestSouceCacheMode

The way BestSource will read and write index/cache files is determined by these values:

* 0 - Never
* 1 - Read
* 2 - Always
* 3 - AbsoluteRear
* 4 - AbsoluteWrite

More information on BestSource and documentation on the options can be found on their [repository][bestsource].

<!-- Import Methods -->
[ffms2]: https://github.com/FFMS/ffms2 "FFmpegSource (usually known as FFMS or FFMS2) is a cross-platform wrapper library around FFmpeg"
[bestsource]: https://github.com/vapoursynth/bestsource "BestSource (abbreviated as BS) is a cross-platform wrapper library around FFmpeg that ensures always sample and frame accurate access to audio and video with good seeking performance for everything except some lossy audio formats"
[dgdecnv]: https://www.rationalqm.us/dgdecnv/dgdecnv.html "AVC/HEVC/MPG/VC1 Decoder and Frame Server"
[lsmash]: https://github.com/HomeOfAviSynthPlusEvolution/L-SMASH-Works "This source function for VapourSynth uses libavcodec as the video decoder and libavformat as the demuxer"