import React from 'react';
import { X, Zap, Clock, HardDrive, CheckCircle, AlertCircle } from 'lucide-react';

type VideoCompressionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onSkip: () => void;
  file: File | null;
  compressionInfo: {
    shouldCompress: boolean;
    estimatedSavings: string;
    estimatedTime: string;
  };
  isCompressing: boolean;
  compressionProgress: number;
  compressionComplete: boolean;
  originalSize?: number;
  compressedSize?: number;
};

const VideoCompressionModal: React.FC<VideoCompressionModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  onSkip,
  file,
  compressionInfo,
  isCompressing,
  compressionProgress,
  compressionComplete,
  originalSize,
  compressedSize
}) => {
  if (!isOpen || !file) return null;

  const formatFileSize = (bytes: number) => {
    return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
  };

  const actualSavings = originalSize && compressedSize 
    ? ((originalSize - compressedSize) / originalSize * 100).toFixed(1)
    : null;

  return (
    <div className="fixed inset-0 bg-brutal-black/70 flex items-center justify-center z-50 p-4">
      <div className="card-brutal max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-warning-500 border-3 border-brutal-black flex items-center justify-center">
                <Zap size={24} className="text-white" />
              </div>
              <div>
                <h2 className="text-xl font-black text-brutal-black font-mono uppercase dark:text-white">
                  VIDEO COMPRESSION
                </h2>
                <p className="text-brutal-gray font-bold uppercase text-sm dark:text-gray-400">
                  OPTIMIZE YOUR VIDEO FOR FASTER UPLOADS
                </p>
              </div>
            </div>
            {!isCompressing && (
              <button
                onClick={onClose}
                className="w-10 h-10 bg-brutal-gray border-2 border-brutal-black flex items-center justify-center hover:bg-brutal-black hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* File Info */}
          <div className="card-brutal p-6 mb-6 bg-primary-50 dark:bg-primary-900">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-primary-600 border-2 border-brutal-black flex items-center justify-center">
                <HardDrive size={16} className="text-white" />
              </div>
              <div>
                <h3 className="font-black text-brutal-black font-mono uppercase dark:text-white">
                  {file.name}
                </h3>
                <p className="text-brutal-gray font-bold text-sm dark:text-gray-400">
                  ORIGINAL SIZE: {formatFileSize(file.size)}
                </p>
              </div>
            </div>
            
            {compressionInfo.shouldCompress && (
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <HardDrive size={16} className="text-brutal-gray" />
                  <span className="text-sm font-bold text-brutal-black font-mono uppercase dark:text-white">
                    ESTIMATED SAVINGS: {compressionInfo.estimatedSavings}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-brutal-gray" />
                  <span className="text-sm font-bold text-brutal-black font-mono uppercase dark:text-white">
                    ESTIMATED TIME: {compressionInfo.estimatedTime}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Compression Status */}
          {isCompressing && (
            <div className="card-brutal p-6 mb-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-secondary-600 border-2 border-brutal-black flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-white border-t-transparent animate-spin"></div>
                </div>
                <div>
                  <h3 className="font-black text-brutal-black font-mono uppercase dark:text-white">
                    COMPRESSING VIDEO...
                  </h3>
                  <p className="text-brutal-gray font-bold text-sm dark:text-gray-400">
                    PROGRESS: {compressionProgress}%
                  </p>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-brutal-gray/20 border-2 border-brutal-black h-6">
                <div 
                  className="h-full bg-secondary-600 transition-all duration-300"
                  style={{ width: `${compressionProgress}%` }}
                ></div>
              </div>
              
              <div className="mt-2 space-y-1">
                <p className="text-xs text-brutal-gray font-bold uppercase dark:text-gray-400">
                  PLEASE WAIT WHILE WE OPTIMIZE YOUR VIDEO...
                </p>
                {compressionProgress === 0 && (
                  <p className="text-xs text-warning-600 font-bold uppercase">
                    {isCompressing ? 'INITIALIZING COMPRESSION ENGINE...' : 'READY TO COMPRESS'}
                  </p>
                )}
                {compressionProgress > 0 && compressionProgress < 100 && (
                  <p className="text-xs text-success-600 font-bold uppercase">
                    PROCESSING VIDEO... {compressionProgress}% COMPLETE
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Compression Complete */}
          {compressionComplete && originalSize && compressedSize && (
            <div className="card-brutal p-6 mb-6 bg-success-50 dark:bg-success-900">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-success-600 border-2 border-brutal-black flex items-center justify-center">
                  <CheckCircle size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="font-black text-brutal-black font-mono uppercase dark:text-white">
                    COMPRESSION COMPLETE!
                  </h3>
                  <p className="text-brutal-gray font-bold text-sm dark:text-gray-400">
                    YOUR VIDEO HAS BEEN OPTIMIZED
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-sm font-bold text-brutal-black font-mono uppercase dark:text-white">
                    ORIGINAL
                  </p>
                  <p className="text-lg font-black text-brutal-gray dark:text-gray-400">
                    {formatFileSize(originalSize)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-brutal-black font-mono uppercase dark:text-white">
                    COMPRESSED
                  </p>
                  <p className="text-lg font-black text-success-600">
                    {formatFileSize(compressedSize)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-brutal-black font-mono uppercase dark:text-white">
                    SAVED
                  </p>
                  <p className="text-lg font-black text-success-600">
                    {actualSavings}%
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Benefits */}
          {!isCompressing && !compressionComplete && compressionInfo.shouldCompress && (
            <div className="card-brutal p-6 mb-6">
              <h3 className="font-black text-brutal-black font-mono uppercase mb-4 dark:text-white">
                COMPRESSION BENEFITS
              </h3>
              <div className="mb-4 p-3 bg-warning-100 border-2 border-warning-500 dark:bg-warning-900">
                <p className="text-xs text-warning-800 font-bold uppercase dark:text-warning-200">
                  ⚠️ COMPRESSION MAY REQUIRE A PAGE RELOAD TO ENABLE BROWSER FEATURES
                </p>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-success-600 border-2 border-brutal-black flex items-center justify-center">
                    <span className="text-white text-xs font-black">✓</span>
                  </div>
                  <span className="text-sm font-bold text-brutal-black dark:text-white">
                    FASTER UPLOAD TIMES
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-success-600 border-2 border-brutal-black flex items-center justify-center">
                    <span className="text-white text-xs font-black">✓</span>
                  </div>
                  <span className="text-sm font-bold text-brutal-black dark:text-white">
                    REDUCED STORAGE COSTS
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-success-600 border-2 border-brutal-black flex items-center justify-center">
                    <span className="text-white text-xs font-black">✓</span>
                  </div>
                  <span className="text-sm font-bold text-brutal-black dark:text-white">
                    BETTER STREAMING PERFORMANCE
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-success-600 border-2 border-brutal-black flex items-center justify-center">
                    <span className="text-white text-xs font-black">✓</span>
                  </div>
                  <span className="text-sm font-bold text-brutal-black dark:text-white">
                    MAINTAINS HIGH QUALITY
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* No Compression Needed */}
          {!compressionInfo.shouldCompress && (
            <div className="card-brutal p-6 mb-6 bg-primary-50 dark:bg-primary-900">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary-600 border-2 border-brutal-black flex items-center justify-center">
                  <AlertCircle size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="font-black text-brutal-black font-mono uppercase dark:text-white">
                    NO COMPRESSION NEEDED
                  </h3>
                  <p className="text-brutal-gray font-bold text-sm dark:text-gray-400">
                    YOUR VIDEO IS ALREADY OPTIMIZED FOR UPLOAD
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {!isCompressing && !compressionComplete && (
            <div className="flex gap-4 justify-end">
              {compressionInfo.shouldCompress ? (
                <>
                  <button
                    onClick={onSkip}
                    className="btn-brutal-secondary px-6 py-3"
                  >
                    SKIP COMPRESSION
                  </button>
                  <button
                    onClick={onConfirm}
                    className="btn-brutal px-6 py-3"
                  >
                    <Zap size={16} className="inline mr-2" />
                    COMPRESS VIDEO
                  </button>
                </>
              ) : (
                <button
                  onClick={onSkip}
                  className="btn-brutal px-6 py-3"
                >
                  CONTINUE WITH UPLOAD
                </button>
              )}
            </div>
          )}

          {compressionComplete && (
            <div className="flex gap-4 justify-end">
              <button
                onClick={onClose}
                className="btn-brutal px-6 py-3"
              >
                <CheckCircle size={16} className="inline mr-2" />
                CONTINUE WITH COMPRESSED VIDEO
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoCompressionModal;