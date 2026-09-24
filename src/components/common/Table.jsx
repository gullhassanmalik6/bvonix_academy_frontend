import React, { useState, useMemo } from 'react';
import { FiChevronDown, FiChevronUp, FiChevronLeft, FiChevronRight, FiFilter } from 'react-icons/fi';
import Button from './Button';
import Input from './Input';

const Table = ({
  data = [],
  columns = [],
  sortable = true,
  filterable = false,
  pagination = true,
  pageSize = 10,
  onRowClick,
  className = '',
  emptyMessage = 'No data available',
  ariaLabel = 'Data table',
}) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({});
  const [showFilters, setShowFilters] = useState(false);

  // Filter data
  const filteredData = useMemo(() => {
    if (!filterable || Object.keys(filters).length === 0) return data;

    return data.filter((row) => {
      return columns.every((column) => {
        if (!filters[column.key]) return true;
        const cellValue = column.render
          ? column.render(row[column.key], row)
          : row[column.key];
        return cellValue
          ?.toString()
          .toLowerCase()
          .includes(filters[column.key].toLowerCase());
      });
    });
  }, [data, filters, filterable, columns]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortConfig.key || !sortable) return filteredData;

    const sorted = [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortConfig.direction === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
    });

    return sorted;
  }, [filteredData, sortConfig, sortable]);

  // Paginate data
  const paginatedData = useMemo(() => {
    if (!pagination) return sortedData;
    const startIndex = (currentPage - 1) * pageSize;
    return sortedData.slice(startIndex, startIndex + pageSize);
  }, [sortedData, currentPage, pageSize, pagination]);

  const totalPages = Math.ceil(sortedData.length / pageSize);

  const handleSort = (key) => {
    if (!sortable) return;

    setSortConfig((prev) => {
      if (prev.key === key) {
        return {
          key,
          direction: prev.direction === 'asc' ? 'desc' : 'asc',
        };
      }
      return { key, direction: 'asc' };
    });
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value || undefined,
    }));
    setCurrentPage(1); // Reset to first page on filter change
  };

  const clearFilters = () => {
    setFilters({});
    setCurrentPage(1);
  };

  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) {
      return <FiChevronDown className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />;
    }
    return sortConfig.direction === 'asc' ? (
      <FiChevronUp className="w-4 h-4 text-primary-500" />
    ) : (
      <FiChevronDown className="w-4 h-4 text-primary-500" />
    );
  };

  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500" role="status" aria-live="polite">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      {/* Filters */}
      {filterable && (
        <div className="mb-4">
          <Button
            onClick={() => setShowFilters(!showFilters)}
            className="mb-2 flex items-center gap-2"
            aria-expanded={showFilters}
            aria-controls="table-filters"
          >
            <FiFilter className="w-4 h-4" />
            Filters
            {Object.keys(filters).filter((k) => filters[k]).length > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs">
                {Object.keys(filters).filter((k) => filters[k]).length}
              </span>
            )}
          </Button>
          {showFilters && (
            <div
              id="table-filters"
              className="p-4 bg-gray-50 rounded-lg border border-gray-200 mb-4 grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              {columns
                .filter((col) => col.filterable !== false)
                .map((column) => (
                  <Input
                    key={column.key}
                    label={column.label || column.key}
                    name={`filter-${column.key}`}
                    value={filters[column.key] || ''}
                    onChange={(e) => handleFilterChange(column.key, e.target.value)}
                    placeholder={`Filter by ${column.label || column.key}`}
                    ariaLabel={`Filter ${column.label || column.key}`}
                  />
                ))}
              {Object.keys(filters).filter((k) => filters[k]).length > 0 && (
                <div className="flex items-end">
                  <Button
                    onClick={clearFilters}
                    className="bg-gray-500 hover:bg-gray-600 text-white"
                  >
                    Clear Filters
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table
          className="min-w-full bg-white border border-gray-200 rounded-lg"
          role="table"
          aria-label={ariaLabel}
        >
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`
                    px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider
                    ${sortable && column.sortable !== false ? 'cursor-pointer hover:bg-gray-100 group' : ''}
                    ${column.className || ''}
                  `}
                  onClick={() => sortable && column.sortable !== false && handleSort(column.key)}
                  scope="col"
                  aria-sort={
                    sortConfig.key === column.key
                      ? sortConfig.direction === 'asc'
                        ? 'ascending'
                        : 'descending'
                      : 'none'
                  }
                >
                  <div className="flex items-center gap-2">
                    <span>{column.label || column.key}</span>
                    {sortable && column.sortable !== false && getSortIcon(column.key)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {paginatedData.map((row, rowIndex) => (
              <tr
                key={row.id || rowIndex}
                onClick={() => onRowClick && onRowClick(row)}
                className={`
                  hover:bg-gray-50 transition-colors
                  ${onRowClick ? 'cursor-pointer' : ''}
                `}
                role="row"
                tabIndex={onRowClick ? 0 : undefined}
                onKeyDown={(e) => {
                  if (onRowClick && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault();
                    onRowClick(row);
                  }
                }}
                aria-label={`Row ${rowIndex + 1}`}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${column.cellClassName || ''}`}
                    role="cell"
                  >
                    {column.render
                      ? column.render(row[column.key], row)
                      : row[column.key] ?? '-'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div
          className="mt-4 flex items-center justify-between"
          role="navigation"
          aria-label="Table pagination"
        >
          <div className="text-sm text-gray-700">
            Showing{' '}
            <span className="font-medium">
              {(currentPage - 1) * pageSize + 1}
            </span>{' '}
            to{' '}
            <span className="font-medium">
              {Math.min(currentPage * pageSize, sortedData.length)}
            </span>{' '}
            of <span className="font-medium">{sortedData.length}</span> results
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1"
              aria-label="Previous page"
            >
              <FiChevronLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                return (
                  <Button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-1 ${
                      currentPage === pageNum
                        ? 'bg-primary-500 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                    aria-label={`Go to page ${pageNum}`}
                    aria-current={currentPage === pageNum ? 'page' : undefined}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            <Button
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1"
              aria-label="Next page"
            >
              <FiChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Table;
