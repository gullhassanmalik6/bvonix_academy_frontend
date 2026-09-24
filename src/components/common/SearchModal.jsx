import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchService } from '../../services/searchService';
import { FiSearch, FiX, FiBook, FiUser, FiFileText } from 'react-icons/fi';

const SearchModal = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      // Load recent searches from localStorage
      const recent = JSON.parse(localStorage.getItem('recentSearches') || '[]');
      setRecentSearches(recent);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  const handleSearch = useCallback(async (searchQuery) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const response = await searchService.search(searchQuery, ['course', 'student', 'user'], 10);
      
      // Map API results to component format
      const mappedResults = response.results.map(result => ({
        type: result.type,
        id: result.id,
        title: result.title,
        description: result.description,
        icon: result.type === 'course' ? FiBook : 
              result.type === 'student' || result.type === 'user' ? FiUser : 
              FiFileText,
        url: result.url,
      }));

      setResults(mappedResults);
      
      // Save to recent searches
      if (searchQuery.trim()) {
        setRecentSearches(prev => {
          if (!prev.includes(searchQuery)) {
            const updated = [searchQuery, ...prev].slice(0, 5);
            localStorage.setItem('recentSearches', JSON.stringify(updated));
            return updated;
          }
          return prev;
        });
      }
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
      // Show error state - could add toast here if needed
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounce search to avoid too many API calls
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timeoutId = setTimeout(() => {
      handleSearch(query);
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [query, handleSearch]);

  const handleQueryChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    // Don't call handleSearch here - let useEffect handle it with debounce
  };

  const handleResultClick = (result) => {
    // Navigate based on result type and URL
    if (result.url) {
      // Use URL from API if available
      navigate(result.url);
    } else {
      // Fallback navigation
      if (result.type === 'course') {
        navigate(`/courses/${result.id}`);
      } else if (result.type === 'student') {
        navigate(`/admin/students/${result.id}`);
      } else if (result.type === 'user') {
        navigate(`/admin/users/${result.id}`);
      }
    }
    onClose();
  };

  const handleRecentSearchClick = (search) => {
    setQuery(search);
    handleSearch(search);
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 pointer-events-none">
        <div
          className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center border-b border-gray-200 p-4">
            <div className="relative flex-1">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search courses, students, or content..."
                value={query}
                onChange={handleQueryChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                onKeyDown={(e) => {
                  if (e.key === 'Escape') onClose();
                }}
              />
            </div>
            <button
              onClick={onClose}
              className="ml-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {loading ? (
              <div className="text-center py-8 text-gray-500">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                <p className="mt-2">Searching...</p>
              </div>
            ) : query.trim() ? (
              results.length > 0 ? (
                <div className="space-y-2">
                  {results.map((result) => {
                    const Icon = result.icon || FiBook;
                    return (
                      <button
                        key={`${result.type}-${result.id}`}
                        onClick={() => handleResultClick(result)}
                        className="w-full flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
                      >
                        <Icon className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{result.title}</p>
                          <p className="text-sm text-gray-500 truncate">{result.description}</p>
                          <span className="inline-block mt-1 text-xs text-gray-400 capitalize">
                            {result.type}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FiSearch className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>No results found</p>
                  <p className="text-sm mt-1">Try a different search term</p>
                </div>
              )
            ) : (
              <div>
                {recentSearches.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-gray-700">Recent Searches</h3>
                      <button
                        onClick={clearRecentSearches}
                        className="text-xs text-gray-500 hover:text-gray-700"
                      >
                        Clear
                      </button>
                    </div>
                    <div className="space-y-1">
                      {recentSearches.map((search, index) => (
                        <button
                          key={index}
                          onClick={() => handleRecentSearchClick(search)}
                          className="w-full flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 transition-colors text-left"
                        >
                          <FiSearch className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-700">{search}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <div className="mt-6 text-center text-gray-500">
                  <p className="text-sm">Start typing to search...</p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 p-3 text-xs text-gray-500 text-center">
            Press <kbd className="px-1.5 py-0.5 bg-gray-100 rounded">Esc</kbd> to close
          </div>
        </div>
      </div>
    </>
  );
};

export default SearchModal;
