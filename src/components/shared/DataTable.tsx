"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  MagnifyingGlassIcon,
  EllipsisVerticalIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from "@heroicons/react/24/outline";
import { Icon } from "@iconify/react";
import { StatusBadge } from "./StatusBadge";

export type ColumnType = 'text' | 'user' | 'date' | 'status' | 'custom';
export type StatusColor = 'success' | 'warning' | 'error' | 'info' | 'default';

export interface ColumnDef<T> {
  key: string;
  label: string;
  type?: ColumnType;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  custom?: boolean;

  // Custom Render
  render?: (row: T) => React.ReactNode;

  // For 'user' type
  getAvatar?: (row: T) => string | React.ReactNode | null;
  getTitle?: (row: T) => string;
  getSubtitle?: (row: T) => string;

  // For 'date' type
  getDate?: (row: T) => string | Date; // We'll extract date and time


  // For 'status' type
  getStatus?: (row: T) => string; // Now can return a status key like "pending", "active"
  getStatusColor?: (row: T) => string; // Optional direct color override
}

export interface ActionDef<T> {
  label: string;
  icon?: React.ElementType | string;
  isDanger?: boolean;
  disabled?: (row: T) => boolean;
  onClick: (row: T) => void;
}

export interface TabDef {
  label: string;
  value: string;
  count?: number;
  color?: StatusColor;
}

export interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  loading?: boolean;

  // Table tools
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;

  // Tabs
  tabs?: TabDef[];
  activeTab?: string;
  onTabChange?: (tabValue: string) => void;
  showCheckBox?: boolean;
  showPagination?: boolean;
  showSearch?: boolean;

  // Actions
  onView?: (row: T) => void;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  hiddenActions?: ('view' | 'edit' | 'delete')[];
  additionalActions?: ActionDef<T>[];
  rowKey: (row: T) => string;
  renderRowDetails?: (row: T) => React.ReactNode;

  // State Overrides (if fully controlled, though we can do uncontrolled fallback)
}

function DropdownMenu<T>({
  actions,
  row,
  onClose,
  triggerRef
}: {
  actions: ActionDef<T>[],
  row: T,
  onClose: () => void,
  triggerRef: React.RefObject<HTMLButtonElement | null>
}) {
  const [style, setStyle] = useState<React.CSSProperties>({ opacity: 0 });
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (triggerRef.current && menuRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      // Display slightly below and align right edge of the menu with the right edge of the trigger button
      setStyle({
        top: rect.bottom + window.scrollY + 6,
        left: rect.right - 176 + window.scrollX, // 176 is w-44 width
        opacity: 1
      });
    }

    // Auto close when clicking outside
    const handleCapture = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    // Add small delay to prevent immediate closing from the trigger click itself
    setTimeout(() => {
      document.addEventListener('click', handleCapture);
    }, 10);

    return () => {
      document.removeEventListener('click', handleCapture);
    };
  }, [triggerRef, onClose]);

  return (
    <div
      ref={menuRef}
      style={style}
      className="fixed z-50 w-44 bg-white/80 backdrop-blur-md rounded-2xl border border-gray-200/50 shadow-[0_12px_24px_rgba(0,0,0,0.06)] p-1.5 animate-in fade-in zoom-in-95 duration-200 flex flex-col gap-0.5"
    >
      {actions.map((action, idx) => {
        const isDisabled = action.disabled?.(row);
        const showDivider = action.isDanger && idx > 0;

        return (
          <React.Fragment key={idx}>
            {showDivider && <div className="h-px bg-gray-200/50 my-1 mx-1" />}
            <button
              disabled={isDisabled}
              onClick={(e) => {
                e.stopPropagation();
                if (isDisabled) return;
                action.onClick(row);
                onClose();
              }}
              className={`w-full text-left px-3 py-2 text-[13px] font-semibold tracking-wide flex items-center gap-2.5 rounded-xl transition-all duration-150 ${isDisabled
                ? 'opacity-30 cursor-not-allowed text-gray-400'
                : action.isDanger
                  ? 'hover:bg-red-50/80 active:bg-red-100/80 text-red-500 cursor-pointer'
                  : 'hover:bg-slate-100/80 active:bg-slate-200/80 text-gray-700 hover:text-gray-900 cursor-pointer'
                }`}
            >
              {action.icon && (
                typeof action.icon === 'string' ? (
                  <Icon 
                    icon={action.icon}
                    className={`w-[17.5px] h-[17.5px] shrink-0 transition-colors ${
                      isDisabled 
                        ? 'text-gray-300' 
                        : action.isDanger 
                          ? 'text-red-500' 
                          : 'text-gray-400 group-hover:text-gray-700'
                    }`}
                  />
                ) : (
                  <action.icon 
                    className={`w-[17px] h-[17px] shrink-0 transition-colors ${
                      isDisabled 
                        ? 'text-gray-300' 
                        : action.isDanger 
                          ? 'text-red-500' 
                          : 'text-gray-400 group-hover:text-gray-700'
                    }`} 
                    strokeWidth={2} 
                  />
                )
              )}
              <span>{action.label}</span>
            </button>
          </React.Fragment>
        );
      })}
    </div>
  );
}

export function DataTable<T>({
  data,
  columns,
  loading = false,
  searchPlaceholder = "Search...",
  onSearch,
  tabs,
  activeTab,
  onTabChange,
  onView,
  onEdit,
  onDelete,
  hiddenActions = [],
  additionalActions = [],
  rowKey,
  showCheckBox = false,
  showPagination = true,
  showSearch = true,
  renderRowDetails,
}: DataTableProps<T>) {

  const [searchInput, setSearchInput] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [isDense, setIsDense] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);
  const [openActionId, setOpenActionId] = useState<string | null>(null);
  const [expandedRowIds, setExpandedRowIds] = useState<Set<string>>(new Set());

  const toggleRow = (id: string) => {
    setExpandedRowIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Track action buttons to attach dropdowns correctly
  const actionRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  // Build final actions list
  const finalActions: ActionDef<T>[] = [];
  if (!hiddenActions.includes('view')) {
    finalActions.push({ label: 'View', icon: "material-symbols-light:view-in-ar-rounded", onClick: (row) => onView?.(row) });
  }
  if (!hiddenActions.includes('edit')) {
    finalActions.push({ label: 'Edit', icon: "fa7-solid:edit", onClick: (row) => onEdit?.(row) });
  }
  if (!hiddenActions.includes('delete')) {
    finalActions.push({ label: 'Delete', icon: "mdi:shop-delete-outline", isDanger: true, onClick: (row) => onDelete?.(row) });
  }
  if (additionalActions && additionalActions.length > 0) {
    finalActions.push(...additionalActions);
  }

  // Internal filter/sort
  let processedData = [...data];

  // Pseudo-search mapping
  if (query && !onSearch) {
    const q = query.toLowerCase();
    processedData = processedData.filter(item => {
      return Object.values(item as any).some(val =>
        String(val).toLowerCase().includes(q)
      );
    });
  }

  // Sorting
  if (sortConfig) {
    processedData.sort((a: any, b: any) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }

  const totalCount = processedData.length;
  const totalPages = Math.ceil(totalCount / rowsPerPage) || 1;
  const currentData = processedData.slice((page - 1) * rowsPerPage, page * rowsPerPage);


  const handleSort = (key: string) => {
    setSortConfig(prev => {
      if (prev?.key === key) {
        return prev.direction === 'asc' ? { key, direction: 'desc' } : null;
      }
      return { key, direction: 'asc' };
    });
  };

  return (
    <div className="w-full bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 font-public text-sm flex flex-col overflow-hidden">

      {/* 1. Tabs Overlay */}
      {tabs && tabs.length > 0 && (
        <div className="flex px-2 pt-2 border-b border-gray-100 overflow-x-auto hide-scrollbar">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => onTabChange?.(tab.value)}
                className={`flex items-center gap-2 px-6 py-4 border-b-2 font-bold transition-all whitespace-nowrap ${isActive
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                {tab.label}
                {tab.count !== undefined && (
                  <span className={`px-2 py-0.5 rounded-full text-xs ${isActive ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'
                    }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* 2. Top Toolbar (Search, Filter, actions) */}
      {showSearch && (
        <div className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <form
            className="relative w-full max-w-md flex items-center gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              setQuery(searchInput);
              onSearch?.(searchInput);
            }}
          >
            <div className="relative w-full">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50/50 outline-none border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-[13px] text-gray-800 font-medium font-sans"
              />
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 cursor-pointer bg-gray-900 text-white text-[13px] font-bold rounded-xl hover:bg-gray-800 transition-colors shadow-sm whitespace-nowrap"
            >
              Search
            </button>
          </form>
          {/* Placeholder for Add/Export buttons if needed from parent */}
        </div>
      )}

      {/* 3. Main Data Table */}
      <div className="w-full overflow-x-auto relative min-h-[300px]">
        <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead>
            <tr className="bg-gray-50/50 border-y border-gray-100">
              {/* Checkbox column */}
              {showCheckBox && (
                <th className="px-6 py-4 w-12">
                  <div className="w-4 h-4 rounded-[4px] border-2 border-gray-300 cursor-pointer hover:border-gray-400"></div>
                </th>
              )}

              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className={`px-4 py-4 text-[13px] font-bold text-gray-500 tracking-wide select-none ${col.sortable ? 'cursor-pointer hover:text-gray-700' : ''
                    } ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'}`}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <div className={`flex items-center gap-1.5 ${col.align === 'right' ? 'justify-end' : col.align === 'center' ? 'justify-center' : 'justify-start'}`}>
                    {col.label}
                    {col.sortable && sortConfig?.key === col.key && (
                      sortConfig.direction === 'asc' ? <ArrowUpIcon className="w-3.5 h-3.5" /> : <ArrowDownIcon className="w-3.5 h-3.5" />
                    )}
                  </div>
                </th>
              ))}

              {((finalActions && finalActions.length > 0) || renderRowDetails) && (
                <th className="px-4 py-4 w-20"></th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {loading ? (
              // ----- SKELETON LOADER -----
              Array.from({ length: rowsPerPage }).map((_, rIdx) => (
                <tr key={`skel-${rIdx}`} className={isDense ? 'h-14' : 'h-20'}>
                  {showCheckBox && (
                    <td className="px-6 py-4"><div className="w-4 h-4 bg-gray-100 rounded animate-pulse" /></td>
                  )}
                  {columns.map((col, cIdx) => (
                    <td key={`skel-${rIdx}-${cIdx}`} className="px-4 py-4">
                      {col.type === 'user' ? (
                        <div className="flex gap-4 items-center">
                          <div className="w-10 h-10 rounded-full bg-gray-100 animate-pulse shrink-0"></div>
                          <div className="space-y-2 w-full">
                            <div className="h-4 bg-gray-100 rounded animate-pulse w-3/4"></div>
                            <div className="h-3 bg-gray-100 rounded animate-pulse w-1/2"></div>
                          </div>
                        </div>
                      ) : (
                        <div className="h-4 bg-gray-100 rounded animate-pulse w-full max-w-[150px]"></div>
                      )}
                    </td>
                  ))}
                  {finalActions && finalActions.length > 0 && (
                    <td className="px-4 py-4"><div className="h-8 w-8 bg-gray-100 rounded-full animate-pulse ml-auto" /></td>
                  )}
                </tr>
              ))
            ) : currentData.length === 0 ? (
              // ----- EMPTY STATE -----
              <tr>
                <td colSpan={columns.length + (finalActions.length > 0 ? 1 : 0) + (showCheckBox ? 1 : 0)} className="px-6 py-16 text-center text-gray-500 font-bold">
                  No data found
                </td>
              </tr>
            ) : (
              // ----- ACTUAL DATA -----
              currentData.map((row, idx) => {
                const id = rowKey(row) || `row-${idx}`;
                return (
                  <React.Fragment key={id}>
                    <tr className={`hover:bg-gray-50/50 transition-colors ${isDense ? 'h-14' : 'h-[72px]'}`}>
                      {/* Checkbox */}
                      {showCheckBox && (
                        <td className="px-6">
                          <div className="w-4 h-4 rounded-[4px] border-2 border-gray-300 cursor-pointer"></div>
                        </td>
                      )}

                      {columns.map((col, cIdx) => (
                        <td
                          key={`${id}-${cIdx}`}
                          className={`px-4 ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'}`}
                        >
                          {col.custom ? col.render?.(row) :
                            col.type === 'user' ? (
                              <div className="flex items-center gap-4">
                                {/* Avatar Gen */}
                                {col.getAvatar && (() => {
                                  const ava = col.getAvatar(row);
                                  if (typeof ava === 'string' && ava.startsWith('http')) {
                                    return <img src={ava} className="w-10 h-10 rounded-full object-cover shrink-0 z-0 bg-gray-100 shadow-sm" alt="" />
                                  } else if (typeof ava === 'string') {
                                    return <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-black flex items-center justify-center shrink-0 uppercase">{ava}</div>
                                  } else {
                                    return ava; // node
                                  }
                                })()}
                                <div className="flex flex-col text-left max-w-[250px]">
                                  <span className="font-semibold text-gray-900 line-clamp-1">{col.getTitle?.(row)}</span>
                                  <span className="text-[13px] text-gray-500 font-medium tracking-tight line-clamp-1">{col.getSubtitle?.(row)}</span>
                                </div>
                              </div>
                            ) :
                              col.type === 'date' ? (() => {
                                const dateVal = col.getDate?.(row);
                                if (!dateVal) return "-";
                                const d = new Date(dateVal);
                                return (
                                  <div className="flex flex-col">
                                    <span className="font-medium text-gray-800">
                                      {d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                    </span>
                                    <span className="text-[12.25px] text-gray-500 font-medium tracking-wider uppercase">
                                      {d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                                    </span>
                                  </div>
                                );
                              })() :
                                col.type === 'status' ? (() => {
                                  const statusKey = col.getStatus ? col.getStatus(row) : String((row as any)[col.key]);
                                  return (
                                    <StatusBadge
                                      status={statusKey}
                                      className={col.getStatusColor?.(row)}
                                    />
                                  )
                                })() :
                                  col.type === 'text' ? (
                                    <span className="text-[12.5px] text-gray-700 font-medium">
                                      {String((row as any)[col.key] || '-')}
                                    </span>
                                  ) : (
                                    <span className="text-[12.5px] text-gray-700 font-medium">
                                      {col.render ? col.render(row) : String((row as any)[col.key] || '-')}
                                    </span>
                                  )}
                        </td>
                      ))}

                      {/* Actions */}
                      {((finalActions && finalActions.length > 0) || renderRowDetails) && (
                        <td className="px-6 text-right relative whitespace-nowrap">
                          <div className="inline-flex items-center justify-end gap-1">
                            {renderRowDetails && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleRow(id);
                                }}
                                className="p-1.5 text-gray-400 hover:text-gray-955 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
                                title="Toggle details"
                              >
                                <Icon
                                  icon="solar:alt-arrow-down-linear"
                                  className={`w-[19px] h-[19px] transition-transform duration-200 ${expandedRowIds.has(id) ? "rotate-180" : ""}`}
                                />
                              </button>
                            )}
                            {finalActions && finalActions.length > 0 && (
                              <>
                                <button
                                  type="button"
                                  ref={el => { actionRefs.current[id] = el; }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenActionId(openActionId === id ? null : id);
                                  }}
                                  className="p-1.5 text-gray-400 hover:text-gray-955 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
                                >
                                  <EllipsisVerticalIcon className="w-5 h-5" />
                                </button>

                                {openActionId === id && (
                                  <DropdownMenu
                                    actions={finalActions}
                                    row={row}
                                    onClose={() => setOpenActionId(null)}
                                    triggerRef={{ current: actionRefs.current[id] }}
                                  />
                                )}
                              </>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                    {renderRowDetails && expandedRowIds.has(id) && (
                      <tr className="bg-gray-50/15">
                        <td 
                          colSpan={columns.length + (finalActions.length > 0 ? 1 : 0) + (showCheckBox ? 1 : 0)} 
                          className="px-6 py-4"
                        >
                          {renderRowDetails(row)}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* 4. Bottom Toolbar (Pagination, Settings) */}
      {showPagination && (
        <div className="border-t border-gray-100 p-4 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white">

          {/* Dense Toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsDense(!isDense)}
              className={`w-9 h-5 rounded-full relative transition-colors ${isDense ? 'bg-primary' : 'bg-gray-200'}`}
            >
              <div className={`absolute top-0.5 bottom-0.5 w-4 bg-white rounded-full transition-transform shadow-sm ${isDense ? 'translate-x-[18px]' : 'translate-x-0.5'}`} />
            </button>
            <span className="text-sm font-bold text-gray-700">Dense</span>
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-medium text-gray-500">Rows per page:</span>
              <select
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setPage(1);
                }}
                className="bg-transparent text-[13px] font-bold text-gray-900 outline-none cursor-pointer"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
            </div>

            <div className="text-[13px] font-medium text-gray-700">
              {totalCount === 0 ? '0-0' : `${(page - 1) * rowsPerPage + 1}-${Math.min(page * rowsPerPage, totalCount)}`} of {totalCount}
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-1.5 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
              >
                <ChevronLeftIcon className="w-5 h-5" />
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="p-1.5 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
              >
                <ChevronRightIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
