import { useState, useCallback } from 'react';

export function usePagination(initialPage = 1, initialPageSize = 12) {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize] = useState(initialPageSize);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const updatePagination = useCallback((count: number, size: number = pageSize) => {
    setTotalCount(count);
    setTotalPages(Math.ceil(count / size));
  }, [pageSize]);

  const goToPage = useCallback((page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  }, [totalPages]);

  const reset = useCallback(() => {
    setCurrentPage(1);
    setTotalPages(1);
    setTotalCount(0);
  }, []);

  return {
    currentPage,
    pageSize,
    totalPages,
    totalCount,
    setCurrentPage,
    updatePagination,
    goToPage,
    reset,
  };
}