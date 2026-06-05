"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";

export interface Option {
  id: string;
  label: string;
  image?: string;
  subLabel?: string;
}

interface LabeledSelectProps {
  label: string;
  options: Option[];
  selectedValue: string;
  onChange: (id: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

export function LabeledSelect({
  label,
  options,
  selectedValue,
  onChange,
  placeholder = "Select...",
  required = false,
  className = ""
}: LabeledSelectProps) {
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
  const selectedOption = options.find(o => o.id === selectedValue);
  const displayText = !selectedOption ? (
    <span className="text-gray-400 font-medium">{placeholder}</span>
  ) : (
    <span className="text-gray-900 font-semibold truncate block w-full">{selectedOption.label}</span>
  );

  return (
    <div className={`space-y-1 w-full ${className}`} ref={containerRef}>
      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative w-full">
        {/* Trigger */}
        <div
          onClick={() => setIsOpen(!isOpen)}
          className="w-full h-11 px-3 bg-white border border-gray-200 rounded-lg cursor-pointer flex items-center justify-between transition-all hover:shadow-sm"
        >
          <div className="flex-1 flex text-xs items-center gap-2 overflow-hidden pr-2 text-gray-600">
            {displayText}
          </div>
          {isOpen ? (
            <ChevronUpIcon className="w-5 h-5 text-gray-500 stroke-2" />
          ) : (
            <ChevronDownIcon className="w-5 h-5 text-gray-500 stroke-2" />
          )}
        </div>

        {/* Dropdown */}
        {isOpen && (
          <div
            className="absolute z-50 top-full left-0 mt-1.5 w-full min-w-[240px] rounded-[16px] shadow-[0px_10px_40px_rgba(0,0,0,0.08)] overflow-hidden p-1.5 animate-in fade-in zoom-in-95 duration-200 bg-gradient-to-bl from-[rgba(233,248,252,1)] via-white to-[rgba(255,241,241,1)] bg-opacity-90 backdrop-blur-md border border-gray-300"
          >
            <div className="max-h-[250px] overflow-y-auto custom-scrollbar flex flex-col gap-0.5 p-1">
              {options.map((option) => (
                <div
                  key={option.id}
                  onClick={() => {
                    onChange(option.id);
                    setIsOpen(false);
                  }}
                  className={`flex items-center gap-2.5 px-2.5 py-2.5 rounded-lg cursor-pointer transition-colors group ${
                    option.id === selectedValue
                      ? "bg-white/80 font-bold shadow-sm"
                      : "hover:bg-white/60"
                  }`}
                >
                  {option.image && (
                    <img
                      src={option.image}
                      alt=""
                      className="w-6 h-6 object-contain rounded bg-white border border-gray-100 p-0.5"
                    />
                  )}
                  <div className="flex-grow flex flex-col">
                    <span className={`text-xs font-semibold text-gray-800 group-hover:text-gray-900 ${option.id === selectedValue ? "text-green-700 font-bold" : ""}`}>
                      {option.label}
                    </span>
                    {option.subLabel && (
                      <span className="text-[10px] uppercase font-bold tracking-widest text-gray-500 mt-0.5">
                        {option.subLabel}
                      </span>
                    )}
                  </div>
                  {option.id === selectedValue && (
                    <svg
                      className="w-4 h-4 text-green-600 shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2.5"
                        d="M5 13l4 4L19 7"
                      ></path>
                    </svg>
                  )}
                </div>
              ))}
              {options.length === 0 && (
                <p className="text-sm text-gray-500 italic p-3 text-center font-medium">
                  No options available.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
