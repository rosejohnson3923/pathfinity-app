import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import '../../design-system/tokens/colors.css';
import '../../design-system/tokens/spacing.css';
import '../../design-system/tokens/borders.css';
import '../../design-system/tokens/typography.css';
import '../../design-system/tokens/shadows.css';
import '../../design-system/tokens/dashboard.css';

interface UserPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (itemsPerPage: number) => void;
}

const ITEMS_PER_PAGE_OPTIONS = [10, 25, 50, 100];

export function UserPagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange
}: UserPaginationProps) {
  const [prevHover, setPrevHover] = useState(false);
  const [nextHover, setNextHover] = useState(false);
  const [selectHover, setSelectHover] = useState(false);
  const [pageHover, setPageHover] = useState<number | null>(null);

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 7;
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show first page
      pages.push(1);
      
      if (currentPage > 4) {
        pages.push('...');
      }
      
      // Show pages around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (currentPage < totalPages - 3) {
        pages.push('...');
      }
      
      // Show last page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  if (totalPages <= 1) {
    return (
      <div style={{
        background: 'var(--dashboard-bg-secondary)',
        padding: 'var(--space-3) var(--space-6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-2)'
        }}>
          <span style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--dashboard-text-secondary)'
          }}>
            Showing {totalItems} of {totalItems} users
          </span>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-2)'
        }}>
          <label style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--dashboard-text-secondary)'
          }}>Show:</label>
          <select
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
            onMouseEnter={() => setSelectHover(true)}
            onMouseLeave={() => setSelectHover(false)}
            style={{
              padding: 'var(--space-1) var(--space-3)',
              border: '1px solid var(--dashboard-border-primary)',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--text-sm)',
              background: selectHover ? 'var(--dashboard-bg-hover)' : 'var(--dashboard-bg-secondary)',
              color: 'var(--dashboard-text-primary)',
              cursor: 'pointer'
            }}
          >
            {ITEMS_PER_PAGE_OPTIONS.map(option => (
              <option key={option} value={option}>
                {option} per page
              </option>
            ))}
          </select>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      background: 'var(--dashboard-bg-secondary)',
      padding: 'var(--space-3) var(--space-6)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 'var(--space-3)'
    }}>
      <style>{`
        @media (min-width: 640px) {
          .pagination-container {
            flex-direction: row !important;
            gap: 0 !important;
          }
          .pagination-info {
            gap: var(--space-4) !important;
          }
          .page-numbers {
            display: flex !important;
          }
          .mobile-indicator {
            display: none !important;
          }
          .prev-text, .next-text {
            display: inline !important;
          }
        }
      `}</style>
      <div className="pagination-container" style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div className="pagination-info" style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-2)'
        }}>
          <div style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--dashboard-text-secondary)'
          }}>
            Showing {startItem} to {endItem} of {totalItems} users
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)'
          }}>
            <label style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--dashboard-text-secondary)'
            }}>Show:</label>
            <select
              value={itemsPerPage}
              onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
              onMouseEnter={() => setSelectHover(true)}
              onMouseLeave={() => setSelectHover(false)}
              style={{
                padding: 'var(--space-1) var(--space-3)',
                border: '1px solid var(--dashboard-border-primary)',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--text-sm)',
                background: selectHover ? 'var(--dashboard-bg-hover)' : 'var(--dashboard-bg-secondary)',
                color: 'var(--dashboard-text-primary)',
                cursor: 'pointer'
              }}
            >
              {ITEMS_PER_PAGE_OPTIONS.map(option => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <span style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--dashboard-text-secondary)'
            }}>per page</span>
          </div>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-1)'
        }}>
          {/* Previous Button */}
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            onMouseEnter={() => setPrevHover(true)}
            onMouseLeave={() => setPrevHover(false)}
            style={{
              padding: 'var(--space-2) var(--space-3)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--dashboard-border-primary)',
              fontSize: 'var(--text-sm)',
              fontWeight: '500',
              color: 'var(--dashboard-text-secondary)',
              background: prevHover && currentPage !== 1 ? 'var(--dashboard-bg-hover)' : 'transparent',
              opacity: currentPage === 1 ? 0.5 : 1,
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-1)'
            }}
          >
            <ChevronLeft style={{ height: '16px', width: '16px' }} />
            <span className="prev-text" style={{ display: 'none' }}>Previous</span>
          </button>

          {/* Page Numbers */}
          <div className="page-numbers" style={{
            display: 'none',
            alignItems: 'center',
            gap: 'var(--space-1)'
          }}>
            {getPageNumbers().map((page, index) => (
              <React.Fragment key={index}>
                {page === '...' ? (
                  <span style={{
                    padding: 'var(--space-2) var(--space-3)',
                    color: 'var(--dashboard-text-secondary)'
                  }}>...</span>
                ) : (
                  <button
                    onClick={() => onPageChange(page as number)}
                    onMouseEnter={() => setPageHover(page as number)}
                    onMouseLeave={() => setPageHover(null)}
                    style={{
                      padding: 'var(--space-2) var(--space-3)',
                      borderRadius: 'var(--radius-lg)',
                      fontSize: 'var(--text-sm)',
                      fontWeight: '500',
                      background: currentPage === page
                        ? '#2563eb'
                        : pageHover === page
                          ? 'var(--dashboard-bg-hover)'
                          : 'transparent',
                      color: currentPage === page
                        ? '#ffffff'
                        : 'var(--dashboard-text-secondary)',
                      border: currentPage === page
                        ? 'none'
                        : '1px solid var(--dashboard-border-primary)',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    {page}
                  </button>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Mobile Page Indicator */}
          <div className="mobile-indicator" style={{
            padding: 'var(--space-2) var(--space-3)',
            fontSize: 'var(--text-sm)',
            color: 'var(--dashboard-text-secondary)'
          }}>
            Page {currentPage} of {totalPages}
          </div>

          {/* Next Button */}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            onMouseEnter={() => setNextHover(true)}
            onMouseLeave={() => setNextHover(false)}
            style={{
              padding: 'var(--space-2) var(--space-3)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--dashboard-border-primary)',
              fontSize: 'var(--text-sm)',
              fontWeight: '500',
              color: 'var(--dashboard-text-secondary)',
              background: nextHover && currentPage !== totalPages ? 'var(--dashboard-bg-hover)' : 'transparent',
              opacity: currentPage === totalPages ? 0.5 : 1,
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-1)'
            }}
          >
            <span className="next-text" style={{ display: 'none' }}>Next</span>
            <ChevronRight style={{ height: '16px', width: '16px' }} />
          </button>
        </div>
      </div>
    </div>
  );
}