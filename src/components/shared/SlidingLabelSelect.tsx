"use client";
import React, { useRef, useState, useEffect, useMemo } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";

export default function SlidingLabelSelect({
  className = "w-full",
  label,
  name,
  options = [],
  onChange: onChangeProp,
  value = "",
  error = [],
  disabled = false,
  children,
  typeOptions = []
}: any) {
  const [isFocused, setIsFocused] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 'auto', bottom: 'auto', left: 'auto', width: 'auto', maxHeight: 'auto' } as any);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const anchorEl = useRef<HTMLButtonElement>(null);

  const processedOptions = useMemo(() => {
    if (typeOptions.length > 0) {
      return typeOptions.map((option: any) => ({
        value: option.value || option,
        label: option.label || option,
        ...option
      }));
    }
    
    if (children) {
      const childOptions: any[] = [];
      React.Children.forEach(children, (child: any) => {
        if (child && child.type === 'option') {
          childOptions.push({
            value: child.props.value,
            label: child.props.children,
            ...child.props
          });
        }
      });
      return childOptions;
    }
    
    return options.map((option: any) => ({
      value: option.value || option,
      label: option.label || option,
      ...option
    }));
  }, [typeOptions, children, options]);

  const calculateDropdownPosition = () => {
    if (!anchorEl.current) return { top: 0, left: 0, width: 0, maxHeight: 100 };

    const anchorRect = anchorEl.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    const dropdownHeight = 240; 
    const spaceBelow = viewportHeight - anchorRect.bottom;
    const spaceAbove = anchorRect.top;

    let top = anchorRect.bottom + 4; 
    let maxHeight = dropdownHeight;

    if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
      top = anchorRect.top - dropdownHeight - 4;
      maxHeight = Math.min(dropdownHeight, spaceAbove - 8); 
    } else {
      maxHeight = Math.min(dropdownHeight, spaceBelow - 8); 
    }

    let left = anchorRect.left;
    const dropdownWidth = anchorRect.width;
    
    if (left + dropdownWidth > viewportWidth) {
      left = viewportWidth - dropdownWidth - 8; 
    }
    if (left < 8) {
      left = 8; 
    }

    return {
      top: Math.max(8, top), 
      left: left,
      width: dropdownWidth,
      maxHeight: Math.max(100, maxHeight) 
    };
  };

  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    };

    const handleScroll = () => {
      if (isOpen) {
        setDropdownPosition(calculateDropdownPosition());
      }
    };

    const handleResize = () => {
      if (isOpen) {
        setDropdownPosition(calculateDropdownPosition());
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('scroll', handleScroll, true);
      window.addEventListener('resize', handleResize);
      requestAnimationFrame(() => {
        setDropdownPosition(calculateDropdownPosition());
      });
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleResize);
    };
  }, [isOpen]);

  const handleKeyDown = (e: any) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        setIsOpen(true);
        setHighlightedIndex(0);
        requestAnimationFrame(() => {
          setDropdownPosition(calculateDropdownPosition());
        });
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => prev < processedOptions.length - 1 ? prev + 1 : 0);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : processedOptions.length - 1);
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0) {
          handleOptionSelect(processedOptions[highlightedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  const handleOptionSelect = (option: any) => {
    const syntheticEvent = { target: { name: name, value: option.value } };
    onChangeProp && onChangeProp(syntheticEvent);
    setIsFocused(Boolean(option.value));
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  return (
    <div className={`relative ${className}`}>
      <label
        htmlFor={name}
        className={`absolute transition-all duration-300 px-1 capitalize 
          ${isFocused || value ? `-top-2 z-10 left-2 text-xs font-semibold text-gray-800` : `top-3.5 z-10 left-4 text-[13px] text-gray-400`}
          ${disabled ? (!value ? (error.includes(name) ? "bg-red-50" : "bg-gray-100") : "bg-gradient-to-b from-white to-gray-100 rounded-b-md") 
          : (!isFocused ? (error.includes(name) ? "bg-red-50" : "bg-white") : "bg-gradient-to-t from-white to-gray-100 rounded-b-md")}`
        }
      >
        {label}
      </label>

      <div className="relative" ref={dropdownRef}>
        <button
          ref={anchorEl}
          type="button"
          id={name}
          name={name}
          disabled={disabled}
          onClick={() => {
            if (!disabled) {
              const newIsOpen = !isOpen;
              setIsOpen(newIsOpen);
              if (newIsOpen) {
                setTimeout(() => setDropdownPosition(calculateDropdownPosition()), 0);
              }
            }
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => !value && setIsFocused(false)}
          onKeyDown={handleKeyDown}
          className={`w-full text-left cursor-pointer text-xs md:text-[14px] disabled:bg-gray-100 text-gray-700 border rounded-lg px-4 pr-10 pt-3 pb-3 focus:outline-none 
          ${error.includes(name) ? "border-red-600 bg-red-50" : "bg-white border-gray-200"}`}
        >
          <span className={value ? "text-gray-700" : "text-gray-400"}>
            {(value ? processedOptions.find((opt: any) => opt.value === value)?.label || value : "\u00A0").length > 24 
              ? (value ? processedOptions.find((opt: any) => opt.value === value)?.label || value : "\u00A0").slice(0, 24) + "..." 
              : (value ? processedOptions.find((opt: any) => opt.value === value)?.label || value : "\u00A0")}
          </span>
        </button>

        <div className="absolute z-0 right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
          {isOpen ? <ChevronUpIcon className="w-4 h-4 text-gray-600" /> : <ChevronDownIcon className="w-4 h-4 text-gray-600" />}
        </div>

        {isOpen && (
          <div 
            className="fixed z-[9999] overflow-auto border rounded-lg shadow-xl box-border bg-gradient-to-bl from-[rgba(233,248,252,1)] via-white to-[rgba(255,241,241,1)] bg-opacity-90 backdrop-blur-md border-gray-300"
            style={{
              top: `${dropdownPosition.top}px`,
              left: `${dropdownPosition.left}px`,
              width: `${dropdownPosition.width}px`,
              maxHeight: `${dropdownPosition.maxHeight}px`
            }}
            onMouseLeave={() => setIsOpen(false)}
          >
            {processedOptions.length === 0 ? (
              <div className="px-4 py-3 text-xs md:text-[14px] text-gray-500">No options available</div>
            ) : (
              processedOptions.map((option: any, index: number) => (
                <button 
                  key={option.value || index}
                  type="button"
                  onClick={() => handleOptionSelect(option)}
                  className={`w-full border-b border-gray-100 border-dashed text-left px-4 py-3 text-xs cursor-pointer md:text-[14px] transition-colors duration-150
                    ${index === highlightedIndex ? "bg-gray-100 text-gray-700" : "text-gray-700 hover:bg-gray-100"}
                    ${option.value === value ? "bg-gray-200 text-gray-700 font-medium" : ""}`}
                  onMouseEnter={() => setHighlightedIndex(index)}
                >
                  {option.label}
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
