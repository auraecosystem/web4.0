import React, { useState, useRef, useEffect, useMemo } from 'react';

export interface Option {
  label: string;
  value: string;
}

interface VirtualMultiSelectProps {
  options: Option[];
  value: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  label?: string;
  itemHeight?: number;       // Fixed height in px of each option (default: 36px)
  containerHeight?: number;  // Height in px of dropdown viewport (default: 250px)
}

export const VirtualMultiSelect: React.FC<VirtualMultiSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select items',
  label,
  itemHeight = 36,
  containerHeight = 250,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // 1. Virtualization Math
  const totalHeight = options.length * itemHeight;
  const buffer = 5; // Buffer items rendered above/below viewport to prevent scroll flicker

  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - buffer);
  const endIndex = Math.min(
    options.length,
    Math.floor((scrollTop + containerHeight) / itemHeight) + buffer
  );

  // Slice only the items currently in or near the visible window
  const visibleOptions = useMemo(() => {
    return options.slice(startIndex, endIndex).map((opt, idx) => ({
      option: opt,
      index: startIndex + idx,
    }));
  }, [options, startIndex, endIndex]);

  const toggleOption = (optValue: string) => {
    const updated = value.includes(optValue)
      ? value.filter((v) => v !== optValue)
      : [...value, optValue];
    onChange(updated);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="multi-select-wrapper" ref={containerRef}>
      {label && <label className="multi-select-label">{label}</label>}
      <div className="multi-select-container">
        {/* Trigger showing total selected count for performance */}
        <div className="multi-select-trigger" onClick={() => setIsOpen(!isOpen)}>
          {value.length === 0 ? (
            <span className="multi-select-placeholder">{placeholder}</span>
          ) : (
            <span className="multi-select-chip">{value.length} items selected</span>
          )}
        </div>

        {isOpen && (
          <div
            className="multi-select-dropdown"
            style={{
              height: containerHeight,
              overflowY: 'auto',
              position: 'relative',
            }}
            onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
          >
            {/* 2. Phantom Track: Outer div holds total height for correct native scrollbar */}
            <div style={{ height: totalHeight, width: '100%', position: 'relative' }}>
              {/* 3. Rendered Window: Positioned via translateY */}
              {visibleOptions.map(({ option, index }) => {
                const isSelected = value.includes(option.value);
                return (
                  <div
                    key={option.value}
                    className={`multi-select-option ${isSelected ? 'selected' : ''}`}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: itemHeight,
                      transform: `translateY(${index * itemHeight}px)`,
                      boxSizing: 'border-box',
                    }}
                    onClick={() => toggleOption(option.value)}
                  >
                    {option.label}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
