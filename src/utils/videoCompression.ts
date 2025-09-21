// Video compression utilities using FFmpeg.js

import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

let ffmpeg: FFmpeg | null = null;
let ffmpegLoaded = false;

// Initialize FFmpeg instance
export const initializeFFmpeg = async (): Promise<FFmpeg> => {
  if (ffmpeg && ffmpegLoaded) return ffmpeg;
  
  ffmpeg = new FFmpeg();
  
  // Set up logging for debugging
  ffmpeg.on('log', ({ message }) => {
    console.log('FFmpeg log:', message);
  });
  
  try {
    console.log('Loading FFmpeg core...');
    
    // Try multiple CDN sources for better reliability
    const cdnSources = [
      'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd',
      'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/umd',
      'https://unpkg.com/@ffmpeg/core-st@0.12.6/dist/umd'
    ];
    
    let loadSuccess = false;
    
    for (const baseURL of cdnSources) {
      try {
        console.log(`Trying to load FFmpeg from: ${baseURL}`);
        
        await ffmpeg.load({
          coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
          wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
          workerURL: await toBlobURL(`${baseURL}/ffmpeg-core.worker.js`, 'text/javascript'),
        });
        
        loadSuccess = true;
        console.log(`FFmpeg loaded successfully from: ${baseURL}`);
        break;
      } catch (error) {
        console.warn(`Failed to load from ${baseURL}:`, error);
        continue;
      }
    }
    
    if (!loadSuccess) {
      throw new Error('Failed to load FFmpeg from all CDN sources');
    }
    
    ffmpegLoaded = true;
    console.log('FFmpeg loaded successfully');
  } catch (error) {
    console.error('Failed to load FFmpeg:', error);
    ffmpeg = null;
    ffmpegLoaded = false;
    throw new Error('Video compression is not available in your browser. Please try uploading without compression or use a different browser.');
  }
  
  return ffmpeg;
};

// Video compression settings based on file size and resolution
export const getCompressionSettings = (
  fileSize: number, 
  width: number, 
  height: number,
  duration: number
): {
  targetBitrate: string;
  maxWidth: number;
  maxHeight: number;
  crf: number;
  preset: string;
} => {
  const fileSizeMB = fileSize / (1024 * 1024);
  const pixels = width * height;
  
  // Determine compression level based on file size and resolution
  if (fileSizeMB > 100 || pixels > 1920 * 1080) {
    // Heavy compression for large files or 4K+
    return {
      targetBitrate: '2000k',
      maxWidth: 1920,
      maxHeight: 1080,
      crf: 28,
      preset: 'medium'
    };
  } else if (fileSizeMB > 50 || pixels > 1280 * 720) {
    // Medium compression for medium files or 1080p
    return {
      targetBitrate: '1500k',
      maxWidth: 1280,
      maxHeight: 720,
      crf: 26,
      preset: 'medium'
    };
  } else if (fileSizeMB > 25) {
    // Light compression for smaller files
    return {
      targetBitrate: '1000k',
      maxWidth: 1280,
      maxHeight: 720,
      crf: 24,
      preset: 'fast'
    };
  } else {
    // Minimal compression for small files
    return {
      targetBitrate: '800k',
      maxWidth: width, // Keep original resolution
      maxHeight: height,
      crf: 23,
      preset: 'fast'
    };
  }
};

// Get video metadata
export const getVideoMetadata = (file: File): Promise<{
  width: number;
  height: number;
  duration: number;
}> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    
    video.onloadedmetadata = () => {
      resolve({
        width: video.videoWidth,
        height: video.videoHeight,
        duration: video.duration
      });
      URL.revokeObjectURL(video.src);
    };
    
    video.onerror = () => {
      reject(new Error('Failed to load video metadata'));
      URL.revokeObjectURL(video.src);
    };
    
    video.src = URL.createObjectURL(file);
  });
};

// Compress video file
export const compressVideo = async (
  file: File,
  onProgress?: (progress: number) => void
): Promise<File> => {
  // Check if compression is supported
  if (!window.SharedArrayBuffer) {
    console.warn('SharedArrayBuffer not available - compression not supported');
    throw new Error('Video compression requires SharedArrayBuffer support. Please enable it in your browser or upload without compression.');
  }
  
  try {
    console.log('Starting compression process...');
    
    // Initialize FFmpeg with timeout
    let ffmpegInstance: FFmpeg;
    try {
      console.log('Initializing FFmpeg with 30 second timeout...');
      ffmpegInstance = await Promise.race([
        initializeFFmpeg(),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('FFmpeg initialization timeout')), 30000)
        )
      ]);
    } catch (error) {
      console.error('FFmpeg initialization failed:', error);
      throw new Error('Failed to initialize video compression engine. Please try uploading without compression.');
    }
    
    console.log('FFmpeg initialized');
    
    // Get video metadata
    let metadata;
    try {
      metadata = await getVideoMetadata(file);
    } catch (error) {
      console.error('Failed to get video metadata:', error);
      throw new Error('Unable to read video file. Please try a different video format.');
    }
    console.log('Video metadata:', metadata);
    
    const settings = getCompressionSettings(
      file.size, 
      metadata.width, 
      metadata.height, 
      metadata.duration
    );
    console.log('Compression settings:', settings);
    
    // Calculate if compression is needed
    const estimatedCompressedSize = file.size * 0.3; // Rough estimate
    const minCompressionThreshold = 50 * 1024 * 1024; // 50MB - increased threshold
    
    // Skip compression for very small files
    if (file.size < minCompressionThreshold) {
      console.log(`File size ${(file.size / 1024 / 1024).toFixed(2)}MB is below ${minCompressionThreshold / 1024 / 1024}MB threshold, using original`);
      return file;
    }
    
    console.log('Starting video compression...', {
      originalSize: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
      resolution: `${metadata.width}x${metadata.height}`,
      duration: `${metadata.duration.toFixed(2)}s`,
      settings
    });
    
    // Set up progress tracking
    if (onProgress) {
      console.log('Setting up progress tracking...');
      
      // Remove any existing progress listeners
      ffmpegInstance.off('progress');
      
      // Add new progress listener
      ffmpegInstance.on('progress', ({ progress, time }) => {
        const progressPercent = Math.round(progress * 100);
        console.log(`Compression progress: ${progressPercent}%`);
        onProgress(progressPercent);
      });
    }
    
    // Write input file
    const inputFileName = 'input.mp4';
    const outputFileName = 'output.mp4';
    
    console.log('Writing input file to FFmpeg filesystem...');
    await ffmpegInstance.writeFile(inputFileName, await fetchFile(file));
    console.log('Input file written successfully, size:', file.size);
    
    // Verify file was written
    const fileList = await ffmpegInstance.listDir('/');
    console.log('FFmpeg filesystem contents:', fileList);
    
    // Build FFmpeg command for high-quality compression
    const ffmpegArgs = [
      '-i', inputFileName,
      '-c:v', 'libx264', // Use H.264 codec
      '-crf', settings.crf.toString(), // Constant Rate Factor for quality
      '-preset', settings.preset, // Encoding speed vs compression efficiency
      '-c:a', 'aac', // Audio codec
      '-b:a', '128k', // Audio bitrate
      '-progress', 'pipe:1', // Enable progress reporting
    ];
    
    // Add resolution scaling if needed
    if (metadata.width > settings.maxWidth || metadata.height > settings.maxHeight) {
      ffmpegArgs.push(
        '-vf', 
        `scale=${settings.maxWidth}:${settings.maxHeight}:force_original_aspect_ratio=decrease`
      );
    }
    
    // Add target bitrate as a guideline (CRF takes precedence)
    ffmpegArgs.push('-maxrate', settings.targetBitrate);
    ffmpegArgs.push('-bufsize', `${parseInt(settings.targetBitrate) * 2}k`);
    
    // Add web optimization
    ffmpegArgs.push('-movflags', '+faststart');
    
    ffmpegArgs.push(outputFileName);
    
    console.log('FFmpeg command:', ffmpegArgs.join(' '));
    
    // Execute compression
    console.log('Starting FFmpeg execution...');
    
    try {
      await ffmpegInstance.exec(ffmpegArgs);
    } catch (execError) {
      console.error('FFmpeg execution failed:', execError);
      // Try to get more info about the error
      const logs = await ffmpegInstance.listDir('/');
      console.log('FFmpeg filesystem after error:', logs);
      throw new Error('Video compression failed during processing. The video format may not be supported.');
    }
    console.log('FFmpeg execution completed');
    
    // Read compressed file
    console.log('Reading compressed file...');
    const compressedData = await ffmpegInstance.readFile(outputFileName);
    console.log('Compressed file read successfully');
    
    // Verify compressed data
    if (!compressedData || compressedData.length === 0) {
      throw new Error('Compression produced empty file');
    }
    
    // Clean up
    try {
      await ffmpegInstance.deleteFile(inputFileName);
      await ffmpegInstance.deleteFile(outputFileName);
    } catch (cleanupError) {
      console.warn('Cleanup failed:', cleanupError);
    }
    console.log('Cleanup completed');
    
    // Create new File object
    const compressedBlob = new Blob([compressedData], { type: 'video/mp4' });
    const compressedFile = new File([compressedBlob], file.name, {
      type: 'video/mp4',
      lastModified: Date.now()
    });
    
    const compressionRatio = ((file.size - compressedFile.size) / file.size * 100).toFixed(1);
    
    console.log('Video compression completed:', {
      originalSize: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
      compressedSize: `${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`,
      compressionRatio: `${compressionRatio}%`,
      spaceSaved: `${((file.size - compressedFile.size) / 1024 / 1024).toFixed(2)}MB`
    });
    
    return compressedFile;
    
  } catch (error) {
    console.error('Video compression failed:', error);
    // Return original file if compression fails
    console.log('Falling back to original file due to compression error:', error.message);
    if (onProgress) {
      onProgress(0); // Reset progress on error
    }
    return file;
  }
};

// Utility to check if compression is recommended
export const shouldCompressVideo = (file: File): boolean => {
  const fileSizeMB = file.size / (1024 * 1024);
  
  // Compress files larger than 50MB
  return fileSizeMB > 50;
};

// Get compression info for UI display
export const getCompressionInfo = (file: File): {
  shouldCompress: boolean;
  estimatedSavings: string;
  estimatedTime: string;
} => {
  const fileSizeMB = file.size / (1024 * 1024);
  const shouldCompress = shouldCompressVideo(file);
  
  if (!shouldCompress) {
    return {
      shouldCompress: false,
      estimatedSavings: '0%',
      estimatedTime: '0s'
    };
  }
  
  // Estimate compression savings (typically 60-80% for video)
  const estimatedSavingsPercent = Math.min(80, Math.max(30, fileSizeMB * 2));
  
  // Estimate processing time (roughly 1-2 minutes per 100MB)
  const estimatedTimeMinutes = Math.max(0.5, fileSizeMB / 50);
  
  return {
    shouldCompress: true,
    estimatedSavings: `${estimatedSavingsPercent.toFixed(0)}%`,
    estimatedTime: estimatedTimeMinutes < 1 
      ? `${Math.round(estimatedTimeMinutes * 60)}s`
      : `${estimatedTimeMinutes.toFixed(1)}min`
  };
};