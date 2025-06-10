import React from 'react';
import { ChevronLeft, ChevronRight, Square } from 'lucide-react';

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  loading?: boolean;
};

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalCount,
  pageSize,
  onPageChange,
  loading = false
}) => {
  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalCount);

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 7;
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      if (currentPage > 4) {
        pages.push('...');
      }
      
      // Show pages around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) {
          pages.push(i);
        }
      }
      
      if (currentPage < totalPages - 3) {
        pages.push('...');
      }
      
      // Always show last page
      if (!pages.includes(totalPages)) {
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="card-brutal p-6 mt-8">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Results info */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary-600 border-2 border-brutal-black flex items-center justify-center">
            <Square size={12} className="text-white" fill="currentColor" />
          </div>
          <p className="text-sm font-bold text-brutal-black font-mono uppercase">
            SHOWING {startItem}-{endItem} OF {totalCount} RESULTS
          </p>
        </div>

        {/* Pagination controls */}
        <div className="flex items-center gap-2">
          {/* Previous button */}
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1 || loading}
            className={`flex items-center gap-2 px-3 py-2 border-2 border-brutal-black font-bold uppercase text-sm transition-colors ${
              currentPage === 1 || loading
                ? 'bg-brutal-gray/20 text-brutal-gray cursor-not-allowed'
                : 'bg-white text-brutal-black hover:bg-primary-100 brutal-hover'
            }`}
          >
            <ChevronLeft size={16} />
            <span className="hidden sm:inline">PREV</span>
          </button>

          {/* Page numbers */}
          <div className="flex items-center gap-1">
            {pageNumbers.map((page, index) => (
              <React.Fragment key={index}>
                {page === '...' ? (
                  <span className="px-3 py-2 text-brutal-gray font-bold">...</span>
                ) : (
                  <button
                    onClick={() => onPageChange(page as number)}
                    disabled={loading}
                    className={`px-3 py-2 border-2 border-brutal-black font-bold text-sm transition-colors ${
                      currentPage === page
                        ? 'bg-primary-600 text-white'
                        : loading
                          ? 'bg-brutal-gray/20 text-brutal-gray cursor-not-allowed'
                          : 'bg-white text-brutal-black hover:bg-primary-100 brutal-hover'
                    }`}
                  >
                    {page}
                  </button>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Next button */}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages || loading}
            className={`flex items-center gap-2 px-3 py-2 border-2 border-brutal-black font-bold uppercase text-sm transition-colors ${
              currentPage === totalPages || loading
                ? 'bg-brutal-gray/20 text-brutal-gray cursor-not-allowed'
                : 'bg-white text-brutal-black hover:bg-primary-100 brutal-hover'
            }`}
          >
            <span className="hidden sm:inline">NEXT</span>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Loading indicator */}
      {loading && (
        <div className="flex items-center justify-center mt-4 pt-4 border-t-2 border-brutal-black">
          <div className="w-8 h-8 border-2 border-brutal-black bg-primary-600 animate-spin"></div>
          <span className="ml-3 text-sm font-bold text-brutal-black font-mono uppercase">
            LOADING...
          </span>
        </div>
      )}
    </div>
  );
};

export default Pagination;