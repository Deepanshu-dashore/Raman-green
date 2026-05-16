"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";

export interface Option {
  id: string;
  label: string;
  image?: string;
  subLabel?: string;
}

interface MultiSelectDropdownProps {
  label: string;
  options: Option[];
  selectedValues: string[];
  onChange: (id: string) => void;
  placeholder?: string;
}

export function MultiSelectDropdown({ label, options, selectedValues, onChange, placeholder = "Select..." }: MultiSelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Compute display value
  const selectedOptions = options.filter(o => selectedValues.includes(o.id));
  const displayText = selectedOptions.length === 0 
      ? <span className="text-gray-400 font-medium">{placeholder}</span>
      : <span className="text-gray-900 font-medium truncate block w-full">{selectedOptions.map(o => o.label).join(", ")}</span>;

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* Trigger */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-full border border-gray-200 rounded-lg px-3.5 py-3 cursor-pointer flex items-center justify-between bg-white transition-all hover:shadow-sm"
      >
        <label className="absolute -top-2.5 left-1.5 bg-white px-1.5 text-[13px] font-bold text-gray-800 pointer-events-none tracking-tight">
          {label}
        </label>
        <div className="flex-1 flex text-xs items-center gap-2 overflow-hidden pr-2 text-gray-600">
          {displayText}
        </div>
        {isOpen ? <ChevronUpIcon className="w-5 h-5 text-gray-500 stroke-2" /> : <ChevronDownIcon className="w-5 h-5 text-gray-500 stroke-2" />}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div 
          className="absolute z-50 top-full left-0 mt-1.5 w-full min-w-[240px] rounded-[16px] shadow-[0px_10px_40px_rgba(0,0,0,0.08)] overflow-hidden p-1.5 animate-in fade-in zoom-in-95 duration-200 bg-gradient-to-bl from-[rgba(233,248,252,1)] via-white to-[rgba(255,241,241,1)] bg-opacity-90 backdrop-blur-md border border-gray-300"
        >
          <div className="max-h-[250px] overflow-y-auto custom-scrollbar flex flex-col gap-0.5 p-1">
            {options.map((option) => (
              <label 
                key={option.id} 
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer hover:bg-white/60 transition-colors group"
              >
                <div className="relative flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={selectedValues.includes(option.id)}
                      onChange={() => onChange(option.id)}
                      className="w-4 h-4 rounded-[4px] border-2 border-gray-400 text-gray-900 focus:ring-gray-900 focus:ring-offset-0 cursor-pointer appearance-none checked:bg-gray-900 checked:border-gray-900 transition-colors"
                    />
                    {selectedValues.includes(option.id) && (
                        <svg className="w-3 h-3 text-white absolute pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                    )}
                </div>
                
                {option.image && (
                   <img src={option.image} alt="" className="w-6 h-6 object-contain rounded bg-white border border-gray-100 p-0.5" />
                )}
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-gray-800 group-hover:text-gray-900">{option.label}</span>
                  {option.subLabel && <span className="text-[10px] uppercase font-bold tracking-widest text-gray-500 mt-0.5">{option.subLabel}</span>}
                </div>
              </label>
            ))}
            {options.length === 0 && (
              <p className="text-sm text-gray-500 italic p-3 text-center font-medium">No options available.</p>
            )}
          </div>
          
          <div className="mt-1 p-1">
            <button 
              type="button"
              onClick={() => setIsOpen(false)}
              className="w-full bg-black/5 hover:bg-black/10 text-gray-900 font-bold py-2 rounded-lg transition-all text-[13px]"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
