import argparse
from dataclasses import asdict, dataclass, is_dataclass
import datetime
from enum import Enum
from functools import reduce
import json
import os
import sys
import subprocess
import time
from typing import Any, Callable, Dict, List, Union
import vapoursynth
from vapoursynth import core

# region Types

# region Import Methods

@dataclass(frozen=True)
class ImportMethod:
    DGDECNV = 'dgdecnv'
    BESTSOURCE = 'bestsource'
    LSMASH = 'lsmash'
    FFMS2 = 'ffms2'

@dataclass(frozen=True)
class FFMS2Resizer:
    FAST_BILINEAR = 'FAST_BILINEAR'
    BILINEAR = 'BILINEAR'
    BICUBIC = 'BICUBIC'
    X = 'X'
    POINT = 'POINT'
    AREA = 'AREA'
    BICUBLIN = 'BICUBLIN'
    GAUSS = 'GAUSS'
    SINC = 'SINC'
    LANCZOS = 'LANCZOS'
    SPLINE = 'SPLINE'

@dataclass(frozen=True)
class FFMS2Import:
    type: ImportMethod = ImportMethod.FFMS2 # type: ignore
    track: int | None = None
    cache: bool | None = None
    cachefile: str | None = None
    fpsnum: int | None = None
    fpsden: int | None = None
    threads: int | None = None
    timecodes: str | None = None
    seekmode: int | None = None
    width: int | None = None
    height: int | None = None
    resizer: FFMS2Resizer | None = None
    format: int | None = None
    alpha: bool | None = None

@dataclass(frozen=True)
class LSMASHSeekMode:
    Normal = 0
    Unsafe = 1
    Aggressive = 2

@dataclass(frozen=True)
class LSMASHFormat:
    YUV420P8 = 'YUV420P8'
    YUV422P8 = 'YUV422P8'
    YUV444P8 = 'YUV444P8'
    YUV410P8 = 'YUV410P8'
    YUV411P8 = 'YUV411P8'
    YUV440P8 = 'YUV440P8'
    YUV420P9 = 'YUV420P9'
    YUV422P9 = 'YUV422P9'
    YUV444P9 = 'YUV444P9'
    YUV420P10 = 'YUV420P10'
    YUV422P10 = 'YUV422P10'
    YUV444P10 = 'YUV444P10'
    YUV420P12 = 'YUV420P12'
    YUV422P12 = 'YUV422P12'
    YUV444P12 = 'YUV444P12'
    YUV420P14 = 'YUV420P14'
    YUV422P14 = 'YUV422P14'
    YUV444P14 = 'YUV444P14'
    YUV420P16 = 'YUV420P16'
    YUV422P16 = 'YUV422P16'
    YUV444P16 = 'YUV444P16'
    Y8 = 'Y8'
    Y16 = 'Y16'
    RGB24 = 'RGB24'
    RGB27 = 'RGB27'
    RGB30 = 'RGB30'
    RGB48 = 'RGB48'
    RGB64BE = 'RGB64BE'
    XYZ12LE = 'XYZ12LE'

@dataclass(frozen=True)
class LSMASHFFmpegLogLevel:
    AV_LOG_QUIET = 0
    AV_LOG_PANIC = 8
    AV_LOG_FATAL = 16
    AV_LOG_ERROR = 24
    AV_LOG_WARNING = 32
    AV_LOG_INFO = 40
    AV_LOG_VERBOSE = 48
    AV_LOG_DEBUG = 56
    AV_LOG_TRACE = 64

@dataclass(frozen=True)
class LSMASHDominance:
    ObeySourceFlags = 0
    TFF = 1
    BFF = 2

@dataclass(frozen=True)
class LSMASHImport:
    """LSMASH import method configuration
    @see https://github.com/HomeOfAviSynthPlusEvolution/L-SMASH-Works/blob/master/VapourSynth/README.md#lsmaslwlibavsource
    """
    type: ImportMethod = ImportMethod.LSMASH # type: ignore
    stream_index: int | None = None
    threads: int | None = None
    cache: bool | None = None
    cachefile: str | None = None
    cachedir: str | None = None
    seek_mode: LSMASHSeekMode | None = None
    seek_threshold: int | None = None
    dr: bool | None = None
    fpsnum: int | None = None
    fpsden: int | None = None
    variable: bool | None = None
    format: LSMASHFormat | None = None
    repeat: int | None = None
    dominance: LSMASHDominance | None = None
    decoder: List[str] | None = None
    prefer_hw: int | None = None
    ff_loglevel: LSMASHFFmpegLogLevel | None = None
    ff_options: str | None = None

@dataclass(frozen=True)
class DGDecNVImport:
    type: ImportMethod = ImportMethod.DGDECNV # type: ignore
    indexPath: str | None = None

@dataclass(frozen=True)
class BestSourceCacheMode:
    Never = 0
    Read = 1
    Always = 2
    AbsoluteRead = 3
    AbsoluteWrite = 4

@dataclass(frozen=True)
class BestSourceImport:
    type: ImportMethod = ImportMethod.BESTSOURCE # type: ignore
    track: int | None = None
    variableformat: bool | None = None
    fpsnum: int | None = None
    fpsden: int | None = None
    rff: bool | None = None
    threads: int | None = None
    seekpreroll: int | None = None
    enable_drefs: bool | None = None
    use_absolute_path: bool | None = None
    cachemode: BestSourceCacheMode | None = None
    cachepath: str | None = None
    cachesize: int | None = None
    hwdevice: str | None = None
    extrahwframes: int | None = None
    timecodes: str | None = None
    start_number: int | None = None
    showprogress: bool | None = None

# endregion Import Methods

# region Metrics

class MetricType(Enum):
    PSNR = 'PSNR'
    SSIMULACRA = 'SSIMULACRA'
    SSIMULACRA2 = 'SSIMULACRA2'
    VMAF = 'VMAF'
    Butteraugli = 'Butteraugli'
    XPSNR = 'XPSNR'

@dataclass(frozen=True)
class MetricRegions:
    rows: int
    columns: int

class Metric:
    regions: MetricRegions | None

    def __init__(self, regions: MetricRegions | None = None):
        self.regions = regions

@dataclass(frozen=True)
class PSNRMetric(Metric):
    pass

class SSIMULACRAMetric(Metric):
    pass

class SSIMULACRA2Implementation(Enum):
    ZIG = 'zig'
    CUDA = 'cuda'
    HIP = 'hip'

class SSIMULACRA2Metric(Metric):
    implementation: SSIMULACRA2Implementation | None

    def __init__(self, implementation: SSIMULACRA2Implementation | None,  region: MetricRegions | None = None):
        super().__init__(region)
        match implementation:
            case SSIMULACRA2Implementation.ZIG.value:
                self.implementation = SSIMULACRA2Implementation.ZIG
            case SSIMULACRA2Implementation.CUDA.value:
                self.implementation = SSIMULACRA2Implementation.CUDA
            case SSIMULACRA2Implementation.HIP.value:
                self.implementation = SSIMULACRA2Implementation.HIP
            case _:
                self.implementation = None

class VMAFMetric(Metric):
    pass

class ButteraugliMetric(Metric):
    intensity_target: int | None
    linput: bool | None

    def __init__(self, region: MetricRegions | None = None, intensity_target: int | None = None, linput: bool | None = None):
        super().__init__(region)
        self.intensity_target = intensity_target
        self.linput = linput

class XPSNRMetric(Metric):
    pass

# endregion Metrics

@dataclass(frozen=True)
class InputScale:
    width: int
    height: int

@dataclass(frozen=True)
class Input:
    path: str
    importMethods: List[Union[FFMS2Import, LSMASHImport, DGDecNVImport, BestSourceImport]]
    scale: InputScale | None = None

@dataclass(frozen=True)
class SceneFrames:
    start: int
    end: int

@dataclass(frozen=True)
class MetricScore:
    time: datetime.datetime
    value: list[list[float]]

@dataclass(frozen=True)
class SceneFramesWithScores(SceneFrames):
    scores: Dict[MetricType, List[MetricScore]]

@dataclass(frozen=True)
class Scene:
    reference: SceneFrames
    distorted: Dict[str, SceneFramesWithScores]

@dataclass(frozen=True)
class Wamp:
    host: str
    realm: str

@dataclass(frozen=True)
class Output:
    path: str | None
    wamp: Wamp | None
    console: bool | None
    verbose: bool | None

@dataclass(frozen=True)
class Configuration:
    schema: str | None
    reference: Input
    distorted: Dict[str, Input]
    metrics: Dict[MetricType, Metric]
    scenes: List[Scene]
    output: Output
    threads: int | None

@dataclass(frozen=True)
class ScoreReport:
    scene: int
    distortedId: str
    frame: int
    metric: MetricType
    score: MetricScore

# Library value must be the name of the plugin as found on the VapourSynth Core
class Library(Enum):
    DGDecodeNV = 'dgdecodenv'
    BestSource = 'bs'
    LSmashWorks = 'lsmas'
    FFMS2 = 'ffms2'
    VMAF = 'vmaf'
    SSIMULACRA2_ZIG = 'ssimulacra2'
    Julek = 'julek'
    VSZip = 'vszip'
    VSHIP = 'vship'

# endregion Types

# region Utility Functions

def deserialize_config(json_path: str) -> Configuration:
    with open(json_path, 'r') as f:
        data = json.load(f)

    # Helper function to parse import methods
    def parse_import_methods(import_methods):
        def map_import_methods(method):
            method_type = method['type']
            if method_type == ImportMethod.FFMS2:
                return FFMS2Import(**method)
            elif method_type == ImportMethod.LSMASH:
                return LSMASHImport(**method)
            elif method_type == ImportMethod.DGDECNV:
                return DGDecNVImport(**method)
            elif method_type == ImportMethod.BESTSOURCE:
                return BestSourceImport(**method)
            else:
                raise ValueError(f"Unknown import method type: {method_type}")

        return list(map(map_import_methods, import_methods))

    schema = data['$schema'] if '$schema' in data else None

    reference = Input(
        path=data['reference']['path'],
        importMethods=parse_import_methods(data['reference']['importMethods']),
        scale=InputScale(**data['reference']['scale']) if 'scale' in data['reference'] else None,
    )

    distorted = {
        key: Input(
            path=value['path'],
            importMethods=parse_import_methods(value['importMethods']),
            scale=InputScale(**value['scale']) if 'scale' in value else None,
        )
        for key, value in data['distorted'].items()
    }

    metrics = {}
    for key, value in data['metrics'].items():
        if 'regions' in value:
            value['regions'] = MetricRegions(**value['regions'])

        if key == MetricType.PSNR.value:
            metrics[MetricType[key]] = PSNRMetric(**value)
        elif key == MetricType.SSIMULACRA.value:
            metrics[MetricType[key]] = SSIMULACRAMetric(**value)
        elif key == MetricType.SSIMULACRA2.value:
            metrics[MetricType[key]] = SSIMULACRA2Metric(**value)
        elif key == MetricType.VMAF.value:
            metrics[MetricType[key]] = VMAFMetric(**value)
        elif key == MetricType.Butteraugli.value:
            metrics[MetricType[key]] = ButteraugliMetric(**value)
        elif key == MetricType.XPSNR.value:
            metrics[MetricType[key]] = XPSNRMetric(**value)

    scenes = [
        Scene(
            reference=SceneFrames(**scene['reference']),
            distorted={
                key: SceneFramesWithScores(
                    start=value['start'],
                    end=value['end'],
                    scores={
                        MetricType[metric]: [
                            MetricScore(
                                time=datetime.datetime.fromisoformat(score['time']),
                                value=score['value']
                            ) for score in value['scores'][metric]
                        ]
                        for metric in value['scores']
                    }
                ) for key, value in scene['distorted'].items()
            }
        ) for scene in data['scenes']
    ]

    output = Output(
        path=data['output']['path'],
        wamp=Wamp(**data['output']['wamp']),
        console=data['output']['console'] if 'console' in data['output'] else True,
        verbose=data['output']['verbose'] if 'verbose' in data['output'] else False,
    )

    if 'threads' in data:
        threads = data['threads']
    else:
        threads = None

    return Configuration(
        schema=schema,
        reference=reference,
        distorted=distorted,
        metrics=metrics,
        scenes=scenes,
        output=output,
        threads=threads,
    )

# Custom JSON Encoder
class ConfigurationEncoder(json.JSONEncoder):
    def default(self, obj: Any) -> Any: # type: ignore
        if is_dataclass(obj):
            return self.filter_none(asdict(obj)) # type: ignore
        # if isinstance(obj, set):
        #     # Convert sets to lists for JSON serialization
        #     return list(obj)
        if isinstance(obj, Enum):
            # Serialize enum members as their values
            return obj.value
        if isinstance(obj, Metric):
            return self.filter_none({k.value if isinstance(k, Enum) else k: (v.value if isinstance(v, Enum) else v) for k, v in obj.__dict__.items()})
        if isinstance(obj, datetime.datetime):  # Handle datetime objects
            return obj.isoformat()
        return super().default(obj)
    
    def filter_none(self, d: Dict[str, Any]) -> Dict[str, Any]:
        d = {k: v for k, v in d.items() if v is not None}
        for k, v in d.items():
            if isinstance(v, dict):
                d[k] = self.filter_none(v)
            elif isinstance(v, list):
                d[k] = [self.filter_none(i) if isinstance(i, dict) else i for i in v]
        return {k: v for k, v in d.items() if v != {} and v != []}

def serialize_config(config: Configuration) -> str:
    def serialize_keys(obj: Any) -> Any:
        if isinstance(obj, dict):
            return {str(k.value if isinstance(k, Enum) else k): serialize_keys(v) for k, v in obj.items()}
        elif isinstance(obj, list):
            return [serialize_keys(i) for i in obj]
        return obj

    config_dict = serialize_keys(asdict(config))

    # Add $schema if it doesn't exist
    if config.schema is not None:
        config_dict['$schema'] = config.schema
        # Remove the old schema field
        del config_dict['schema']

    config_dict = ConfigurationEncoder().filter_none(config_dict)
    return json.dumps(config_dict, cls=ConfigurationEncoder, indent=4)

def serialize_score_report(score_report: ScoreReport) -> str:
    return json.dumps(asdict(score_report), cls=ConfigurationEncoder)

def import_video(path: str, import_methods: List[Union[FFMS2Import, LSMASHImport, DGDecNVImport, BestSourceImport]]) -> vapoursynth.VideoNode:
    global installed
    _path_base, path_ext = os.path.splitext(path)

    if (path_ext is not None and path_ext.lower() in ('.py', '.vpy')):
        # Input is a VapourSynth script
        input_locals: Dict[str, vapoursynth.VideoNode] = {}

        # Attempt to execute VapourSynth script
        try:
            exec(open(path).read(), None, input_locals)

            if 'metrologist_input' in input_locals:
                return input_locals['metrologist_input']
            else:
                raise ValueError(f'Failed to import video from {path}: global-scoped variable "metrologist_input" not found')
        except Exception as error:
            raise ValueError(f'Failed to import video from {path}: {error}')
    else:
        # Iterate over each import method in order of preference and return the first one that succeeds
        for import_method in import_methods:
            if (isinstance(import_method, DGDecNVImport) and installed[Library.DGDecodeNV]):
                absolute_dgindex_path = import_method.indexPath or os.path.splitext(path)[0] + '.dgi'

                try:
                    # Index given path if not already indexed
                    if not os.path.exists(absolute_dgindex_path):
                        print(f'Indexing {os.path.basename(path)}...')
                        subprocess.run(['dgindexnv', '-h', '-i', path, '-o', absolute_dgindex_path], check=True)

                    return core.dgdecodenv.DGSource(absolute_dgindex_path)
                except FileNotFoundError:
                    print('The dgdecnv indexer (dgindexnv) is not installed', file=sys.stderr)
                except Exception as error:
                    print(f'Failed to import video with {import_method.type}', file=sys.stderr)
            elif (isinstance(import_method, BestSourceImport) and installed[Library.BestSource]):
                # Different versions of BestSource have different behaviors on Windows
                # Versions R1 and older support absolute paths (with .json extension)
                # Versions R8 and newer support absolute paths for cache files, but require setting cachemode to 4
                # Versions since ~R2 attempt to create a path stemming from CWD but using the path of the source and also appends the track index and a .bsindex extension
                # Unfortunately, BestSource is not keeping the reported version number updated properly so we cannot reliably determine if it supports absolute paths or not
                # At best, we can wrap an attempt in a try/except block as previous versions of BestSource should throw an exception if an invalid cachemode value is provided
                try:
                    return core.bs.VideoSource(
                        source=path,
                        track=import_method.track,
                        variableformat=import_method.variableformat,
                        fpsnum=import_method.fpsnum,
                        fpsden=import_method.fpsden,
                        rff=import_method.rff,
                        threads=import_method.threads,
                        seekpreroll=import_method.seekpreroll,
                        enable_drefs=import_method.enable_drefs,
                        use_absolute_path=import_method.use_absolute_path,
                        cachemode=import_method.cachemode or 4, # type: ignore
                        cachepath=import_method.cachepath,
                        cachesize=import_method.cachesize,
                        hwdevice=import_method.hwdevice,
                        extrahwframes=import_method.extrahwframes,
                        timecodes=import_method.timecodes,
                        start_number=import_method.start_number,
                        showprogress=import_method.showprogress,
                    )
                except Exception:
                    # Installed BestSource version does not support absolute paths, fallback to default behavior
                    return core.bs.VideoSource(
                        source=path,
                        track=import_method.track,
                        variableformat=import_method.variableformat,
                        fpsnum=import_method.fpsnum,
                        fpsden=import_method.fpsden,
                        rff=import_method.rff,
                        threads=import_method.threads,
                        seekpreroll=import_method.seekpreroll,
                        enable_drefs=import_method.enable_drefs,
                        use_absolute_path=import_method.use_absolute_path,
                        cachemode=import_method.cachemode if import_method != BestSourceCacheMode.AbsoluteRead or import_method.cachemode != BestSourceCacheMode.AbsoluteWrite else None, # type: ignore
                        cachepath=import_method.cachepath,
                        cachesize=import_method.cachesize,
                        hwdevice=import_method.hwdevice,
                        extrahwframes=import_method.extrahwframes,
                        timecodes=import_method.timecodes,
                        start_number=import_method.start_number,
                        showprogress=import_method.showprogress,
                    )
            elif (isinstance(import_method, LSMASHImport) and installed[Library.LSmashWorks]):
                return core.lsmas.LWLibavSource(
                    source=path,
                    stream_index=import_method.stream_index,
                    threads=import_method.threads,
                    cache=import_method.cache,
                    cachefile=import_method.cachefile,
                    cachedir=import_method.cachedir,
                    seek_mode=import_method.seek_mode, # type: ignore
                    seek_threshold=import_method.seek_threshold,
                    dr=import_method.dr,
                    fpsnum=import_method.fpsnum,
                    fpsden=import_method.fpsden,
                    variable=import_method.variable,
                    format=import_method.format,
                    repeat=import_method.repeat,
                    dominance=import_method.dominance, # type: ignore
                    prefer_hw=import_method.prefer_hw or 3,
                    ff_loglevel=import_method.ff_loglevel, # type: ignore
                    ff_options=import_method.ff_options,
                )
            elif (isinstance(import_method, FFMS2Import) and installed[Library.FFMS2]):
                return core.ffms2.Source(
                    source=path,
                    track=import_method.track,
                    cache=import_method.cache,
                    cachefile=import_method.cachefile,
                    fpsnum=import_method.fpsnum,
                    fpsden=import_method.fpsden,
                    threads=import_method.threads,
                    timecodes=import_method.timecodes,
                    seekmode=import_method.seekmode,
                    width=import_method.width,
                    height=import_method.height,
                    resizer=import_method.resizer,
                    format=import_method.format,
                    alpha=import_method.alpha
                )

        # If no import method was found, raise an error
        raise ValueError(f'No supported import method found for {path}')

def crop_video_regions(video: vapoursynth.VideoNode, rows: int, columns: int) -> list[list[vapoursynth.VideoNode]]:
    """
    Crops a video into a grid of regions given rows and columns.

    Args:
        video (vapoursynth.VideoNode): The input video.
        rows (int): The number of rows in the grid.
        columns (int): The number of columns in the grid.

    Returns:
        list[list[vapoursynth.VideoNode]]: A 2D list of cropped video regions.
    """

    # Calculate the width and height of each region
    region_width = video.width // columns
    region_height = video.height // rows

    # Use a reduce to generate the 2D list
    return reduce(lambda video_regions, row: video_regions + [[
        video.std.CropAbs(
            region_width if col != columns - 1 or video.width % columns == 0 else video.width - left,
            region_height if row != rows - 1 or video.height % rows == 0 else video.height - top,
            left,
            top
        )
        for col, left, top in (
            (col, col * region_width, row * region_height)
            for col in range(columns)
        )
    ]], range(rows), [])

def compare_video(reference: vapoursynth.VideoNode, distorted: vapoursynth.VideoNode, metric: Metric, score_frame: Callable[[int, MetricScore], None]) -> list[MetricScore]:
    global installed

    def retrieve_score(frame: vapoursynth.VideoFrame) -> float:
        if (isinstance(metric, PSNRMetric)):
            return frame.props['PSNR'] or 0 # type: ignore
        elif (isinstance(metric, ButteraugliMetric)):
            return frame.props['_FrameButteraugli'] or 0 # type: ignore
        elif (isinstance(metric, SSIMULACRAMetric)):
            return frame.props['_SSIMULACRA'] or 0 # type: ignore
        elif (isinstance(metric, SSIMULACRA2Metric)):
            return frame.props['_SSIMULACRA2'] or 0 # type: ignore
        elif (isinstance(metric, XPSNRMetric)):
            return frame.props['_XPSNR'] or 0 # type: ignore
        else:
            raise ValueError(f'Unknown metric: {metric}')

    def compare(comparer: Callable[[vapoursynth.VideoNode, vapoursynth.VideoNode], vapoursynth.VideoNode]):
        scores: list[MetricScore] = []

        if (metric.regions is not None):
            reference_regions = crop_video_regions(reference, metric.regions.rows, metric.regions.columns)
            distorted_regions = crop_video_regions(distorted, metric.regions.rows, metric.regions.columns)

            # Frame-Optimized "Depth-First" - iterate over each frame, then each region, then each row, column by column
            # Flatten the 3D list into a 1D "list" - improves VapourSynth performance by avoiding single-threaded processing
            score_grids = [[[float(0) for _ in range(metric.regions.columns)] for _ in range(metric.regions.rows)] for _ in range(reference.num_frames)]
            reference_frames = core.std.Splice([reference_regions[row][column][frame_index] for column in range(metric.regions.columns) for row in range(metric.regions.rows) for frame_index in range(reference.num_frames)])
            distorted_frames = core.std.Splice([distorted_regions[row][column][frame_index] for column in range(metric.regions.columns) for row in range(metric.regions.rows) for frame_index in range(distorted.num_frames)])

            for region_index, region_frame in enumerate(comparer(reference_frames, distorted_frames).frames()):
                # Calculate row, column, and frame from region_index
                frame = region_index // (metric.regions.rows * metric.regions.columns)
                column = (region_index // metric.regions.rows) % metric.regions.columns
                row = region_index % metric.regions.rows
                score_grids[frame][row][column] = retrieve_score(region_frame)

                # Last row and column in frame completed
                if (row == metric.regions.rows - 1 and column == metric.regions.columns - 1):
                    metric_score = MetricScore(time=datetime.datetime.now(), value=score_grids[frame])
                    scores.append(metric_score)
                    score_frame(frame, metric_score)
        else:
            for index, frame in enumerate(comparer(reference, distorted).frames()):
                score = retrieve_score(frame)
                metric_score = MetricScore(time=datetime.datetime.now(), value=[[score]])
                scores.append(metric_score)
                score_frame(index, metric_score)

        return scores

    if (isinstance(metric, PSNRMetric)):
        if (not installed[Library.VMAF]):
            return [MetricScore(time=datetime.datetime.now(), value=[[0]])] * len(reference)

        return compare(lambda ref, dist: ref.vmaf.Metric(dist, feature=0))
    elif (isinstance(metric, ButteraugliMetric)):
        if (not installed[Library.Julek]):
            return [MetricScore(time=datetime.datetime.now(), value=[[0]])] * len(reference)
        
        return compare(lambda ref, dist: ref.julek.Butteraugli(dist, intensity_target=metric.intensity_target, linput=metric.linput))
    elif (isinstance(metric, SSIMULACRAMetric)):
        if (not installed[Library.Julek]):
            return [MetricScore(time=datetime.datetime.now(), value=[[0]])] * len(reference)

        def callback(ref: vapoursynth.VideoNode, dist: vapoursynth.VideoNode) -> vapoursynth.VideoNode:
            # julek.SSIMULACRA requires RGB24
            return ref.resize.Bicubic(format=vapoursynth.RGB24, matrix_in_s='709').julek.SSIMULACRA(dist.resize.Bicubic(format=vapoursynth.RGB24, matrix_in_s='709'), feature=0)

        return compare(callback)
    elif (isinstance(metric, SSIMULACRA2Metric)):
        if (not installed[Library.VSHIP] and not installed[Library.VSZip] and not installed[Library.SSIMULACRA2_ZIG]):
            print('SSIMULACRA2 requires either vship, vszip, or ssimulacra2-zig to be installed')
            return [MetricScore(time=datetime.datetime.now(), value=[[0]])] * len(reference)

        def callback(ref: vapoursynth.VideoNode, dist: vapoursynth.VideoNode) -> vapoursynth.VideoNode:
            # vship.SSIMULACRA2 requires RGBS and linear transfer
            if ((metric.implementation == SSIMULACRA2Implementation.CUDA or metric.implementation == SSIMULACRA2Implementation.HIP) and installed[Library.VSHIP]):
                ref = ref.resize.Bicubic(format=vapoursynth.RGBS, matrix_in_s='709')
                dist = dist.resize.Bicubic(format=vapoursynth.RGBS, matrix_in_s='709')
            
            
            return ref.vship.SSIMULACRA2(dist) if ((metric.implementation == SSIMULACRA2Implementation.CUDA or metric.implementation == SSIMULACRA2Implementation.HIP) and installed[Library.VSHIP]) else ref.vszip.Metrics(dist, mode=0) if installed[Library.VSZip] else ref.ssimulacra2.SSIMULACRA2(dist)

        return compare(callback)
    elif (isinstance(metric, XPSNRMetric)):
        if (not installed[Library.VSZip]):
            return [MetricScore(time=datetime.datetime.now(), value=[[0]])] * len(reference)

        return compare(lambda ref, dist: ref.vszip.Metrics(dist, mode=1))
    else:
        print(f'Unsupported metric: {metric}')
        return [MetricScore(time=datetime.datetime.now(), value=[[0]])] * len(reference)

def compare_frame(reference: vapoursynth.VideoNode, distorted: vapoursynth.VideoNode, metric: Metric, score_frame: Callable[[int, MetricScore], None] = lambda index, score: None) -> MetricScore:
    scores = compare_video(reference, distorted, metric, score_frame)
    return scores[0]

def get_installed_plugins() -> Dict[Library, bool]:
    installed = {
        library: hasattr(core, str(library.value)) for library in Library
    }
    return installed

def count_scene_unscored_frames(scene: Scene) -> int:
    unscored_frames = 0
    for distorted_tuple in scene.distorted.items():
        _distorted_id, distorted = distorted_tuple
        scene_frame_count = distorted.end - distorted.start
        for _metric_type, scores in distorted.scores.items():
            if (len(scores) == 0):
                unscored_frames = unscored_frames + scene_frame_count
    return unscored_frames

def calculate_metric_scores_average(metric_scores: list[MetricScore]) -> float:
    total = 0

    for metric_score in metric_scores:
        if (type(metric_score.value) is float):
            total = total + metric_score.value
        elif (type(metric_score.value) is list):
            subtotal = 0
            for row in metric_score.value:
                for column in row:
                    subtotal = subtotal + column
            
            subaverage = subtotal / (len(metric_score.value) * len(metric_score.value[0]))
            total = total + subaverage
        else:
            print(f'Unsupported metric score type: {type(metric_score.value)}')
            return 0

    return total / len(metric_scores)

# endregion Utility Functions

# region Main

# Check which dependencies are installed
installed = get_installed_plugins()

# Parse arguments
parser = argparse.ArgumentParser(prog='Multimedia Metrologist', description='Measure video quality between videos.')
parser.add_argument('config', help='Configuration JSON path. Can be relative to this script or a full path. Results will also be saved to this path.')
args = parser.parse_args()
config_path = str(args.config)

# Resolve the config JSON path
if (not os.path.isabs(config_path)):
    config_path = os.path.join(os.getcwd(), config_path)

# Load the configuration
config = deserialize_config(config_path)

# Get report on installed plugins and print to console
if (config.output.verbose):
    print('Installed Plugins:')
    for library, is_installed in installed.items():
        print(f'  - {library.name}: {("Yes" if is_installed else "No")}')
    print()

# Set threads if defined
if (config.threads and config.threads > 0):
    core.num_threads = config.threads

# Import each video file with the respective selected importer if available
reference_video = import_video(config.reference.path, config.reference.importMethods)
distorted_map: Dict[str, vapoursynth.VideoNode] = {}

# Scale reference video if defined
if (config.reference.scale is not None):
    reference_video = reference_video.resize.Bicubic(width=config.reference.scale.width, height=config.reference.scale.height)

for key, value in config.distorted.items():
    distorted_map[key] = import_video(value.path, value.importMethods)

    # Scale distorted video if defined otherwise scale to match the dimensions of the reference video
    distorted_map[key] = distorted_map[key].resize.Bicubic(width=value.scale.width if value.scale is not None else reference_video.width, height=value.scale.height if value.scale is not None else reference_video.height)

# Start timer for metrics comparison
comparison_start_time = time.time()
total_unscored_frames = reduce(lambda total, scene: total + count_scene_unscored_frames(scene), config.scenes, 0)

# Compare each scene
for scene_index, scene in enumerate(config.scenes):
    # Separate into individual frames
    frame_count = scene.reference.end - scene.reference.start
    scene_start_time = time.time()

    for distorted_id, distorted in scene.distorted.items():
        # Get the imported distorted video
        distorted_video = distorted_map[distorted_id]
        # Compare each distorted frame with the reference frame and store the score for each metric
        for metric_type, scores in distorted.scores.items():
            # Skip frames that have already been compared
            if (len(scores) > 0):
                continue

            def score_frame(frame_index: int, score: MetricScore):
                if config.output.console:
                    score_report = ScoreReport(
                        scene=scene_index,
                        distortedId=distorted_id,
                        frame=frame_index,
                        metric=metric_type,
                        score=score
                    )

                    print(f'SCORE: {serialize_score_report(score_report)}', flush=True)

            metric = config.metrics[metric_type]

            # Compare the distorted frame against the reference frame
            config.scenes[scene_index].distorted[distorted_id].scores[metric_type] = compare_video(reference_video[scene.reference.start:scene.reference.end], distorted_video[distorted.start:distorted.end], metric, score_frame)

            # Scoring done for this metric
            scene_metric_end_time = time.time()
            scene_metric_fps = len(config.scenes[scene_index].distorted[distorted_id].scores[metric_type]) / (scene_metric_end_time - scene_start_time)

            average = calculate_metric_scores_average(config.scenes[scene_index].distorted[distorted_id].scores[metric_type])
            if (config.output.verbose):
                print(f'[{datetime.datetime.now().isoformat()}] Scene {scene_index} (Distorted {distorted_id}): {metric_type.value}: {average:.2f} | ({scene_metric_fps:.2f} FPS)')

            new_json = serialize_config(config)
            with open(config.output.path or config_path, 'w') as f:
                f.write(new_json)

if config.output.verbose:
    comparison_end_time = time.time()
    frames_per_second = (total_unscored_frames / (comparison_end_time - comparison_start_time)) if (comparison_end_time - comparison_start_time) > 0 else 0
    print(f'[{datetime.datetime.fromtimestamp(comparison_end_time).isoformat()}] Processed {total_unscored_frames} frames in {comparison_end_time - comparison_start_time} seconds. Average FPS: ({frames_per_second:.2f} FPS)')

# Write the configuration back to the JSON file
new_json = serialize_config(config)
with open(config.output.path or config_path, 'w') as f:
    f.write(new_json)

# endregion Main