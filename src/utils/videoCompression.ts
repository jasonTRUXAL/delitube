// Video compression utilities using FFmpeg.js

import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

let ffmpeg: FFmpeg | null = null;

// Initialize FFmpeg instance
export const initializeFFmpeg = async (): Promise<FFmpeg> => {
  if (ffmpeg) return ffmpeg;
  
  ffmpeg = new FFmpeg();
  
  // Load FFmpeg core
  const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
  
  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
  });
  
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
  try {
    // Initialize FFmpeg
    const ffmpegInstance = await initializeFFmpeg();
    
    // Get video metadata
    const metadata = await getVideoMetadata(file);
    const settings = getCompressionSettings(
      file.size, 
      metadata.width, 
      metadata.height, 
      metadata.duration
    );
    
    // Calculate if compression is needed
    const estimatedCompressedSize = file.size * 0.3; // Rough estimate
    const minCompressionThreshold = 10 * 1024 * 1024; // 10MB
    
    // Skip compression for very small files
    if (file.size < minCompressionThreshold) {
      console.log('File too small for compression, using original');
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
      ffmpegInstance.on('progress', ({ progress }) => {
        onProgress(Math.round(progress * 100));
      });
    }
    
    // Write input file
    const inputFileName = 'input.mp4';
    const outputFileName = 'output.mp4';
    
    await ffmpegInstance.writeFile(inputFileName, await fetchFile(file));
    
    // Build FFmpeg command for high-quality compression
    const ffmpegArgs = [
      '-i', inputFileName,
      '-c:v', 'libx264', // Use H.264 codec
      '-crf', settings.crf.toString(), // Constant Rate Factor for quality
      '-preset', settings.preset, // Encoding speed vs compression efficiency
      '-c:a', 'aac', // Audio codec
      '-b:a', '128k', // Audio bitrate
      '-movflags', '+faststart', // Optimize for web streaming
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
    
    ffmpegArgs.push(outputFileName);
    
    // Execute compression
    await ffmpegInstance.exec(ffmpegArgs);
    
    // Read compressed file
    const compressedData = await ffmpegInstance.readFile(outputFileName);
    
    // Clean up
    await ffmpegInstance.deleteFile(inputFileName);
    await ffmpegInstance.deleteFile(outputFileName);
    
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
    console.log('Falling back to original file due to compression error');
    return file;
  }
};

// Utility to check if compression is recommended
export const shouldCompressVideo = (file: File): boolean => {
  const fileSizeMB = file.size / (1024 * 1024);
  
  // Compress files larger than 10MB
  return fileSizeMB > 10;
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