"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { Search, ChevronDown, Plus, Check, X } from "lucide-react";

export interface ComboboxOption {
  value: string;
  label: string;
  sublabel?: string;
  badge?: string;
}

interface SearchableComboboxProps {
  value: string;
  onChange: (value: string, item?: ComboboxOption) => void;
  options: ComboboxOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  onAddNew?: () => void;
  addNewTitle?: string;
  disabled?: boolean;
}

export default function SearchableCombobox({
  value,
  onChange,
  options,
  placeholder = "-- Select Option --",
  searchPlaceholder = "Search options...",
  onAddNew,
  addNewTitle = "Add New",
  disabled = false,
}: SearchableComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Auto focus search input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Selected Option Object
  const selectedOption = useMemo(() => {
    return options.find((opt) => opt.value === value);
  }, [options, value]);

  // Filtered options based on search query
  const filteredOptions = useMemo(() => {
    if (!query.trim()) return options;
    const q = query.toLowerCase();
    return options.filter(
      (opt) =>
        opt.label.toLowerCase().includes(q) ||
        (opt.sublabel && opt.sublabel.toLowerCase().includes(q)) ||
        (opt.badge && opt.badge.toLowerCase().includes(q))
    );
  }, [options, query]);

  function handleSelect(opt: ComboboxOption) {
    setIsOpen(false);
    onChange(opt.value, opt);
  }

  function handleClear(e: React.MouseEvent) {
    e.stopPropagation();
    onChange("");
  }

  return (
    <div
      className={`relative mt-1.5 flex items-center gap-1.5 w-full min-w-0 ${
        isOpen ? "z-40" : "z-auto"
      }`}
      ref={containerRef}
    >
      {/* Trigger Button */}
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`flex-1 min-w-0 overflow-hidden flex items-center justify-between border rounded-xl px-3 py-2 text-xs bg-white transition cursor-pointer select-none min-h-[38px] ${
          isOpen
            ? "border-blue-500 ring-2 ring-blue-100 shadow-2xs"
            : "border-slate-200 hover:border-slate-300"
        } ${disabled ? "opacity-60 cursor-not-allowed bg-slate-50" : ""}`}
      >
        <div className="flex items-center gap-2 min-w-0 pr-1 flex-1 overflow-hidden">
          {selectedOption ? (
            <div className="flex items-center gap-1.5 min-w-0 w-full overflow-hidden">
              <span className="font-semibold text-slate-800 truncate">
                {selectedOption.label}
              </span>
              {selectedOption.badge && (
                <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.2 rounded font-medium border border-blue-100 shrink-0">
                  {selectedOption.badge}
                </span>
              )}
            </div>
          ) : (
            <span className="text-slate-400 font-normal truncate">{placeholder}</span>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0 ml-1">
          {selectedOption && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="p-0.5 text-slate-300 hover:text-slate-600 rounded transition"
              title="Clear selection"
            >
              <X size={13} />
            </button>
          )}
          <ChevronDown
            size={14}
            className={`text-slate-400 transition-transform duration-200 ${
              isOpen ? "rotate-180 text-blue-600" : ""
            }`}
          />
        </div>
      </div>

      {/* Little Plus Button to Add New Item */}
      {onAddNew && !disabled && (
        <button
          type="button"
          onClick={onAddNew}
          title={addNewTitle}
          className="h-[38px] w-[38px] rounded-xl bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white border border-blue-200 hover:border-blue-600 flex items-center justify-center shrink-0 transition shadow-2xs cursor-pointer group"
        >
          <Plus size={16} className="group-hover:scale-110 transition-transform" />
        </button>
      )}

      {/* Dropdown Menu Popover */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Sticky Search Header */}
          <div className="p-2 border-b border-slate-100 bg-slate-50/80">
            <div className="relative flex items-center">
              <Search
                size={13}
                className="absolute left-2.5 text-slate-400 pointer-events-none"
              />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full text-xs bg-white border border-slate-200 rounded-lg pl-8 pr-7 py-1.5 outline-none focus:border-blue-500 transition text-slate-800 placeholder-slate-400"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute right-2 text-slate-400 hover:text-slate-600"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          </div>

          {/* Options List */}
          <div className="max-h-56 overflow-y-auto p-1.5 space-y-0.5 divide-y divide-slate-50">
            {filteredOptions.length === 0 ? (
              <div className="py-6 px-3 text-center">
                <p className="text-xs text-slate-400">
                  No matching options for &quot;{query}&quot;
                </p>
                {onAddNew && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      onAddNew();
                    }}
                    className="mt-2 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200 hover:bg-blue-100 transition inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Plus size={13} />
                    {addNewTitle}
                  </button>
                )}
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <button
                    type="button"
                    key={opt.value}
                    onClick={() => handleSelect(opt)}
                    className={`w-full text-left px-2.5 py-2 rounded-xl text-xs flex items-center justify-between gap-2 transition cursor-pointer ${
                      isSelected
                        ? "bg-blue-50 text-blue-900 font-semibold"
                        : "hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="truncate">{opt.label}</span>
                        {opt.badge && (
                          <span className="text-[9.5px] bg-slate-100 text-slate-500 px-1.5 py-0.2 rounded font-medium border border-slate-200 shrink-0">
                            {opt.badge}
                          </span>
                        )}
                      </div>
                      {opt.sublabel && (
                        <div className="text-[10.5px] text-slate-400 truncate mt-0.5">
                          {opt.sublabel}
                        </div>
                      )}
                    </div>

                    {isSelected && (
                      <Check size={14} className="text-blue-600 shrink-0" />
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* Footer with count & quick add shortcut */}
          <div className="p-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[10.5px] text-slate-400">
            <span>
              {filteredOptions.length} of {options.length} items
            </span>
            {onAddNew && (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onAddNew();
                }}
                className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-0.5 cursor-pointer"
              >
                <Plus size={12} /> {addNewTitle}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

