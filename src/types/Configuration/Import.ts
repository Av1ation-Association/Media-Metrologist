import { type tags } from 'typia';

export const ImportMethodType = {
    FFMS2: 'ffms2',
    LSMASH: 'lsmash',
    DGDecNV: 'dgdecnv',
    BestSource: 'bestsource',
} as const;

export type ImportMethod = FFMS2Import | LSMASHImport | DGDecNVImport | BestSourceImport;

//#region FFMS2

export const FFMS2Resizer = {
    FAST_BILINEAR: 'FAST_BILINEAR',
    BILINEAR: 'BILINEAR',
    BICUBIC: 'BICUBIC',
    X: 'X',
    POINT: 'POINT',
    AREA: 'AREA',
    BICUBLIN: 'BICUBLIN',
    GAUSS: 'GAUSS',
    SINC: 'SINC',
    LANCZOS: 'LANCZOS',
    SPLINE: 'SPLINE',
} as const;

/**
 * FFMS2 import method configuration
 * @see https://github.com/FFMS/ffms2/blob/master/doc/ffms2-vapoursynth.md#source
 */
export interface FFMS2Import {
    type: typeof ImportMethodType.FFMS2;

    /**
     * The video track number to open, as seen by the relevant demuxer.
     * 
     * Track numbers start from zero, and are guaranteed to be continous (i.e. there must be a track 1 if there is a track 0 and a track 2).
     * 
     * -1 means open the first video track.
     * 
     * Note that FFMS2's idea about what track has what number may (or may not) be completely different from what some other application might think.
     * @default -1 (First video track)
     */
    track?: number & tags.Type<'int32'> & tags.Minimum<-1>;

    /**
     * If set to true (the default), Source will first check if the cachefile contains a valid index, and if it does, that index will be used. If no index is found, all video tracks will be indexed, and the indexing data will be written to cachefile afterwards. If set to false, Source will not look for an existing index file; instead all video tracks will be indexed when the script is opened, and the indexing data will be discarded after the script is closed; you will have to index again next time you open the script.
     * @default true
     */
    cache?: boolean & tags.Default<true>;

    /**
     * The filename of the index file (where the indexing data is saved). Defaults to sourcefilename.ffindex.
     * 
     * Note that if you didn't change this parameter from its default value and Source encounters an index file that doesn't seem to match the file it's trying to open, it will automatically reindex and then overwrite the old index file. On the other hand, if you do change it, Source will assume you have your reasons and throw an error instead if the index doesn't match the file.
     * @default (source + ".ffindex")
     */
    cachefile?: string & tags.Pattern<`${string}.ffindex`> & tags.Default<`${string}.ffindex`>;

    /**
     * Controls the framerate of the output; used for VFR to CFR conversions.
     * 
     * If fpsnum is less than or equal to zero (the default), the output will contain the same frames that the input did, and the frame rate reported to VapourSynth will be set based on the input clip's average frame duration. If fpsnum is greater than zero, Source will force a constant frame rate, expressed as a rational number where fpsnum is the numerator and fpsden is the denominator. This may naturally cause Source to drop or duplicate frames to achieve the desired frame rate, and the output is not guaranteed to have the same number of frames that the input did.
     * @default -1
     */
    fpsnum?: number & tags.Type<'int32'> & tags.Minimum<-1> & tags.Default<-1>;

    /**
     * Controls the framerate of the output; used for VFR to CFR conversions.
     * 
     * If fpsnum is less than or equal to zero (the default), the output will contain the same frames that the input did, and the frame rate reported to VapourSynth will be set based on the input clip's average frame duration. If fpsnum is greater than zero, Source will force a constant frame rate, expressed as a rational number where fpsnum is the numerator and fpsden is the denominator. This may naturally cause Source to drop or duplicate frames to achieve the desired frame rate, and the output is not guaranteed to have the same number of frames that the input did.
     * @default 1
     */
    fpsden?: number & tags.Type<'int32'> & tags.Minimum<-1> & tags.Default<1>;

    /**
     * The number of decoding threads to request from libavcodec. Setting it to less than or equal to zero means it defaults to the number of logical CPU's reported by the OS. Note that this setting might be completely ignored by libavcodec under a number of conditions; most commonly because a lot of decoders actually do not support multithreading.
     * @default -1
     */
    threads?: number & tags.Type<'int32'> & tags.Minimum<-1> & tags.Default<-1>;

    /**
     * Filename to write Matroska v2 timecodes for the opened video track to. If the file exists, it will be truncated and overwritten. Set to the empty string to disable timecodes writing (this is the default).
     * @default ""
     */
    timecodes?: string;

    /**
     * Controls how seeking is done. Mostly useful for getting uncooperative files to work.
     * 
     * Valid modes are:
     * - `-1`: Linear access without rewind; i.e. will throw an error if each successive requested frame number isn't bigger than the last one.
     *   Only intended for opening images, but might work on well with some obscure video format.
     * - `0`: Linear access (i.e. if you request frame `n` without having requested all frames from `0` to `n-1` in order first,
     *   all frames from `0` to `n` will have to be decoded before `n` can be delivered).
     *   The definition of "slow", but should make some formats "usable".
     * - `1`: Safe normal. Bases seeking decisions on the keyframe positions reported by libavformat.
     * - `2`: Unsafe normal. Same as mode 1, but no error will be thrown if the exact seek destination has to be guessed.
     * - `3`: Aggressive. Seeks in the forward direction even if no closer keyframe is known to exist.
     *   Only useful for testing and containers where libavformat doesn't report keyframes properly.
     * @default 1
     */
    seekmode?: -1 | 0 | 1 | 2 | 3 & tags.Type<'int32'> & tags.Minimum<-1> & tags.Maximum<3> & tags.Default<1>;

    /**
     * Sets the resolution of the output video, in pixels.
     * 
     * Setting either dimension to less than or equal to zero means the resolution of the first decoded video frame is used for that dimension. These parameters are mostly useful because FFMS2 supports video streams that change resolution mid-stream which would otherwise have to be handled with a more complicated script.
     * @default -1
     */
    width?: number & tags.Type<'int32'> & tags.Minimum<-1> & tags.Default<-1>;

    /**
     * Sets the resolution of the output video, in pixels.
     * 
     * Setting either dimension to less than or equal to zero means the resolution of the first decoded video frame is used for that dimension. These parameters are mostly useful because FFMS2 supports video streams that change resolution mid-stream which would otherwise have to be handled with a more complicated script.
     * @default -1
     */
    height?: number & tags.Type<'int32'> & tags.Minimum<-1> & tags.Default<-1>;

    /**
     * The resizing algorithm to use if rescaling the image is necessary.
     * 
     * If the video uses subsampled chroma but your chosen output colorspace does not, the chosen resizer will be used to upscale the chroma planes, even if you did not request an image rescaling. The available choices are FAST_BILINEAR, BILINEAR, BICUBIC (default), X, POINT, AREA, BICUBLIN, GAUSS, SINC, LANCZOS and SPLINE.
     * @default "BICUBIC"
     */
    resizer?: typeof FFMS2Resizer[keyof typeof FFMS2Resizer] & tags.Default<'BICUBIC'>;

    /**
     * Convert the output from whatever it was to the given format. If not specified the best matching output format is used.
     */
    format?: number & tags.Type<'int32'>;

    /**
     * Output the alpha channel as a second clip if it is present in the file. When set to True an array of two clips will be returned with alpha in the second one. If there is alpha information present.
     * @default false
     */
    alpha?: boolean & tags.Default<false>;
}

//#endregion FFMS2

//#region LSMASH

export const LSMASHSeekMode = {
    Normal: 0,
    Unsafe: 1,
    Aggressive: 2,
} as const;

export const LSMASHFormat = {
    YUV420P8: 'YUV420P8',
    YUV422P8: 'YUV422P8',
    YUV444P8: 'YUV444P8',
    YUV410P8: 'YUV410P8',
    YUV411P8: 'YUV411P8',
    YUV440P8: 'YUV440P8',
    YUV420P9: 'YUV420P9',
    YUV422P9: 'YUV422P9',
    YUV444P9: 'YUV444P9',
    YUV420P10: 'YUV420P10',
    YUV422P10: 'YUV422P10',
    YUV444P10: 'YUV444P10',
    YUV420P12: 'YUV420P12',
    YUV422P12: 'YUV422P12',
    YUV444P12: 'YUV444P12',
    YUV420P14: 'YUV420P14',
    YUV422P14: 'YUV422P14',
    YUV444P14: 'YUV444P14',
    YUV420P16: 'YUV420P16',
    YUV422P16: 'YUV422P16',
    YUV444P16: 'YUV444P16',
    Y8: 'Y8',
    Y16: 'Y16',
    RGB24: 'RGB24',
    RGB27: 'RGB27',
    RGB30: 'RGB30',
    RGB48: 'RGB48',
    RGB64BE: 'RGB64BE',
    XYZ12LE: 'XYZ12LE',
} as const;

export const LSMASHFFmpegLogLevel = {
    AV_LOG_QUIET: 0,
    AV_LOG_PANIC: 1,
    AV_LOG_FATAL: 2,
    AV_LOG_ERROR: 3,
    AV_LOG_WARNING: 4,
    AV_LOG_INFO: 5,
    AV_LOG_VERBOSE: 6,
    AV_LOG_DEBUG: 7,
    AV_LOG_TRACE: 8,
} as const;

export const LSMASHDominance = {
    ObeySourceFlags: 0,
    TFF: 1,
    BFF: 2,
} as const;

/**
 * LSMASH import method configuration
 * @see https://github.com/HomeOfAviSynthPlusEvolution/L-SMASH-Works/blob/master/VapourSynth/README.md#lsmaslwlibavsource
 */
export interface LSMASHImport {
    type: typeof ImportMethodType.LSMASH;

    /**
     * The stream index to open in the source file.
     * 
     * The value -1 means trying to get the video stream which has the largest resolution.
     * @default -1
     */
    stream_index?: number & tags.Type<'int32'> & tags.Minimum<-1>;

    /**
     * The number of threads to decode a stream by libavcodec
     * 
     * The value 0 means the number of threads is determined automatically and then the maximum value will be up to 16.
     * @default 0
     */
    threads?: number & tags.Type<'int32'> & tags.Minimum<0> & tags.Maximum<16>;

    /**
     * Create the index file (.lwi) to the same directory as the source file if set to 1.
     * 
     * The index file avoids parsing all frames in the source file at the next or later access.
     * 
     * Parsing all frames is very important for frame accurate seek.
     * @default false
     */
    cache?: boolean & tags.Default<false>;

    /**
     * The filename of the index file (where the indexing data is saved).
     * @default source + ".lwi"
     */
    cachefile?: string & tags.Pattern<`${string}.lwi`> & tags.Default<`${string}.lwi`>;

    /**
     * Create *.lwi file under this directory with names encoding the full path to avoid collisions.
     */
    cachedir?: string;

    /**
     * How to process when any error occurs during decoding a video frame
     *  - {@link LSMASHSeekMode.Normal} - Retry sequential decoding from the next closest RAP up to 3 cycles when any decoding error occurs.
     *      If all 3 trial failed, retry sequential decoding from the last RAP by ignoring trivial errors.
     *      If Still error occurs, then return the last returned frame.
     *  - {@link LSMASHSeekMode.Unsafe} - Retry sequential decoding from the next closest RAP up to 3 cycles when any fatal decoding error occurs. If all 3 trial failed, then return the last returned frame.
     *  - {@link LSMASHSeekMode.Aggressive} - Return the last returned frame when any fatal decoding error occurs.
     * @default LSMASHSeekMode.Normal
     */
    seek_mode?: typeof LSMASHSeekMode[keyof typeof LSMASHSeekMode] & tags.Default<typeof LSMASHSeekMode.Normal>;

    /**
     *  The threshold to decide whether a decoding starts from the closest RAP to get the requested video frame or doesn't.
     * Let's say the threshold is T and you request to seek the M-th frame called f(M) from the N-th frame called f(N).
     * 
     * If M > N and M - N <= T, then the decoder tries to get f(M) by decoding frames from f(N) sequentially.
     * 
     * If M < N or M - N > T, then check the closest RAP at the first.
     * After the check, if the closest RAP is identical with the last RAP, do the same as the case M > N and M - N <= T.
     * Otherwise, the decoder tries to get f(M) by decoding frames from the frame which is the closest RAP sequentially.
     * @default 10
     */
    seek_threshold?: number & tags.Type<'int32'> & tags.Minimum<0>;

    /**
     * Try direct rendering from the video decoder if 'dr' is set to 1 and 'format' is unspecfied.
     * 
     * The output resolution will be aligned to be mod16-width and mod32-height by assuming two vertical 16x16 macroblock.
     * 
     * For H.264 streams, in addition, 2 lines could be added because of the optimized chroma MC.
     * @default false
     */
    dr?: boolean & tags.Default<false>;

    /**
     * Output frame rate numerator for VFR->CFR (Variable Frame Rate to Constant Frame Rate) conversion
     * 
     * If frame rate is set to a valid value, the conversion is achieved by padding and/or dropping frames at the specified frame rate.
     * Otherwise, output frame rate is set to a computed average frame rate and the output process is performed by actual frame-by-frame.
     * @default 0
     */
    fpsnum?: number & tags.Type<'int32'> & tags.Minimum<0>;

    /**
     * Output frame rate denominator for VFR->CFR (Variable Frame Rate to Constant Frame Rate) conversion
     * @default 1
     */
    fpsden?: number & tags.Type<'int32'> & tags.Minimum<1>;

    /**
     * Treat format, width and height of the video stream as variable if set to true (1)
     * @default false
     */
    variable?: boolean & tags.Default<false>;

    /**
     * Force specified output pixel format if 'format' is specified and 'variable' is set to false (0)
     */
    format?: typeof LSMASHFormat[keyof typeof LSMASHFormat];

    /**
     * Reconstruct frames by the flags specified in video stream if set to non-zero value.
     * 
     * If set to 1, and source file requested repeat and the filter is unable to obey the request, this filter will fail explicitly to eliminate any guesswork.
     * 
     * If set to 2, and source file requested repeat and the filter is unable to obey the request, silently returning a VFR clip with a constant (but wrong) fps.
     * 
     * Note that this option is ignored when VFR->CFR conversion is enabled.
     * 
     * @default 2
     */
    repeat?: number & tags.Type<'int32'> & tags.Minimum<0> & tags.Default<2>;

    /**
     * Which field, top or bottom, is displayed first.
     * - {@link LSMASHDominance.ObeySourceFlags} : Obey source flags
     * - {@link LSMASHDominance.TFF} : TFF i.e. Top -> Bottom
     * - {@link LSMASHDominance.BFF} : BFF i.e. Bottom -> Top
     * 
     * This option is enabled only if one or more of the following conditions is true.
     * - `repeat` is set to 1.
     * - There is a video frame consisting of two separated field coded pictures.
     */
    dominance?: typeof LSMASHDominance[keyof typeof LSMASHDominance];

    /**
     * Names of preferred decoder candidates
     * For instance, if you prefer to use the 'h264_qsv' and 'mpeg2_qsv' decoders instead of the generally
          used 'h264' and 'mpeg2video' decoder, then specify as "h264_qsv,mpeg2_qsv". The evaluations are done
          in the written order and the first matched decoder is used if any.
     * @example
     * ['h264_qsv', 'mpeg2_qsv', 'h264', 'mpeg2video'];
     */
    decoder?: string[] & tags.UniqueItems;

    /**
     * Whether to prefer hardware accelerated decoder to software decoder
     * - 0 - Use default software decoder.
     * - 1 - Use NVIDIA CUVID acceleration for supported codec, otherwise use default software decoder.
     * - 2 - Use Intel Quick Sync Video acceleration for supported codec, otherwise use default software decoder.
     * - 3 - Try hardware decoder in the order of CUVID->QSV. If none is available then use default software decoder.
     * @default 0
     */
    prefer_hw?: 0 | 1 | 2 | 3 & tags.Type<'int32'> & tags.Minimum<0> & tags.Maximum<3> & tags.Default<0>;

    /**
     * Set the log level in FFmpeg:
     * - {@link LSMASHFFmpegLogLevel.AV_LOG_QUIET} - Print no output.
     * - {@link LSMASHFFmpegLogLevel.AV_LOG_PANIC} - Something went really wrong and we will crash now.
     * - {@link LSMASHFFmpegLogLevel.AV_LOG_FATAL} - Something went wrong and recovery is not possible.
     * - {@link LSMASHFFmpegLogLevel.AV_LOG_ERROR} - Something went wrong and cannot losslessly be recovered. However, not all future data is affected.
     * - {@link LSMASHFFmpegLogLevel.AV_LOG_WARNING} - Something somehow does not look correct. This may or may not lead to problems.
     * - {@link LSMASHFFmpegLogLevel.AV_LOG_INFO} - Standard information.
     * - {@link LSMASHFFmpegLogLevel.AV_LOG_VERBOSE} - Detailed information.
     * - {@link LSMASHFFmpegLogLevel.AV_LOG_DEBUG} - Stuff which is only useful for libav* developers.
     * - {@link LSMASHFFmpegLogLevel.AV_LOG_TRACE} - Extremely verbose debugging, useful for libav* development.
     * @default LSMASHFFmpegLogLevel.AV_LOG_QUIET
     */
    ff_loglevel?: typeof LSMASHFFmpegLogLevel[keyof typeof LSMASHFFmpegLogLevel] & tags.Default<typeof LSMASHFFmpegLogLevel.AV_LOG_QUIET>;

    /**
     * Set the decoder options in FFmpeg
     */
    ff_options?: string;
}

//#endregion LSMASH

//#region DGDecNV

/**
 * DGDecNV import method configuration
 * @see https://www.rationalqm.us/dgdecnv/dgdecnv.html
 */
export interface DGDecNVImport {

    type: typeof ImportMethodType.DGDecNV;

    indexPath?: string;
}

//#endregion DGDecNV

//#region BestSource

export const BestSourceCacheMode = {
    Never: 0,
    Read: 1,
    Always: 2,
    AbsoluteRear: 3,
    AbsoluteWrite: 4,
} as const;

/**
 * BestSource import method configuration
 * @see https://github.com/vapoursynth/bestsource?tab=readme-ov-file#vapoursynth-usage
 */
export interface BestSourceImport {

    type: typeof ImportMethodType.BestSource;

    /**
     * Either a positive number starting from 0 specifying the absolute track number or a negative number to select the nth audio or video track.
     * 
     * Throws an error on wrong type or no matching track.
     * @default -1
     */
    track?: number & tags.Type<'int32'> & tags.Minimum<-1> & tags.Default<-1>;

    /**
     * Allow format changes in the output for video. Untested.
     * @default false
     */
    variableformat?: boolean & tags.Default<false>;

    /**
     * Convert the source material to constant framerate. Cannot be combined with rff.
     * @default -1
     */
    fpsnum?: number & tags.Type<'int32'> & tags.Minimum<-1> & tags.Default<-1>;

    /**
     * Convert the source material to constant framerate. Used in conjunction with fpsnum.
     * @default 1
     */
    fpsden?: number & tags.Type<'int32'> & tags.Minimum<1> & tags.Default<1>;

    /**
     * Apply RFF flags to the video. If the video doesn't have or use RFF flags the output is unchanged compare to when the option is disabled. Cannot be combined with fpsnum.
     * @default false
     */
    rff?: boolean & tags.Default<false>;

    /**
     * Number of threads to use for decoding. Pass 0 to autodetect.
     * @default 0
     */
    threads?: number & tags.Type<'int32'> & tags.Minimum<0> & tags.Default<0>;

    /**
     * Number of frames before the requested frame to cache when seeking.
     * @default 20
     */
    seekpreroll?: number & tags.Type<'int32'> & tags.Minimum<0> & tags.Default<20>;

    /**
     * Option passed to the FFmpeg mov demuxer.
     * @default false
     */
    enable_drefs?: boolean & tags.Default<false>;

    /**
     * Option passed to the FFmpeg mov demuxer.
     * @default false
     */
    use_absolute_path?: boolean & tags.Default<false>;

    
    /**
     * - {@link BestSourceCacheMode.Never} = Never read or write index to disk
     * - {@link BestSourceCacheMode.Read} = Always try to read index but only write index to disk when it will make a noticeable difference on subsequent runs
     * - {@link BestSourceCacheMode.Always} = Always try to read and write index to disk
     * - {@link BestSourceCacheMode.AbsoluteRead} = Always try to read index but only write index to disk when it will make a noticeable difference on subsequent runs and store index files in the absolute path in *cachepath* with track number and index extension appended
     * - {@link BestSourceCacheMode.AbsoluteWrite} = Always try to read and write index to disk and store index files in the absolute path in *cachepath* with track number and index extension appended
     * @default BestSourceCacheMode.Read
     */
    cachemode?: typeof BestSourceCacheMode[keyof typeof BestSourceCacheMode] & tags.Default<typeof BestSourceCacheMode.Read>;

    /**
     * The path where cache files are written. Note that the actual index files are written into subdirectories using based on the source location. Defaults to %LOCALAPPDATA% on Windows and ~/bsindex elsewhere.
     * @default %LOCALAPPDATA% or ~/bsindex
     */
    cachepath?: string;

    /**
     * Maximum internal cache size in MB.
     * @default 1000
     */
    cachesize?: number & tags.Type<'int32'> & tags.Minimum<0> & tags.Default<1000>;

    /**
     * The interface to use for hardware decoding. Depends on OS and hardware. On windows `d3d11va`, `cuda` and `vulkan` (H264, HEVC and AV1) are probably the ones most likely to work. Defaults to CPU decoding. Will throw errors for formats where hardware decoding isn't possible.
     */
    hwdevice?: string;

    /**
     * The number of additional frames to allocate when hwdevice is set. The number required is unknowable and found through trial and error. The default may be too high or too low. FFmpeg unfortunately is this badly designed.
     * @default 9
     */
    extrahwframes?: number & tags.Type<'int32'> & tags.Minimum<0> & tags.Default<9>;

    /**
     * Writes a timecode v2 file with all frame times to the file if specified. Note that this option will produce an error if any frame has an unknown timestamp which would result in an invalid timecode file.
     */
    timecodes?: string;

    /**
     * The first number of image sequences.
     */
    start_number?: number & tags.Type<'int32'> & tags.Minimum<0>;

    /**
     * Print indexing progress as VapourSynth information level log messages.
     * @default false
     */
    showprogress?: boolean & tags.Default<false>;
}

//#endregion BestSource