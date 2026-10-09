import React, { useMemo } from 'react';
import { Field } from '../../types/app.types';

interface CustomFieldsEditorProps {
  fields: Field[];
  values: Record<string, string>;
  onChange: (fieldId: string, value: string) => void;
  disabled?: boolean;
}

export function CustomFieldsEditor({
  fields,
  values,
  onChange,
  disabled = false,
}: CustomFieldsEditorProps) {
  // Group fields by section preserving sort order
  const groupedSections = useMemo(() => {
    const groups: Record<string, Field[]> = {};
    for (const f of fields) {
      const sec = f.section || 'Other';
      if (!groups[sec]) {
        groups[sec] = [];
      }
      groups[sec].push(f);
    }
    return groups;
  }, [fields]);

  const sectionNames = Object.keys(groupedSections);

  if (sectionNames.length === 0) {
    return (
      <div className="py-2 text-center text-xs text-slate-500">
        No custom fields configured
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sectionNames.map((section) => (
        <div key={section} className="space-y-2.5">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider font-display">
              {section}
            </span>
            <div className="h-px flex-1 bg-slate-800" />
          </div>

          <div className="space-y-2">
            {groupedSections[section].map((field) => {
              const val = values[field.id] || '';

              return (
                <div key={field.id} className="space-y-1">
                  <label className="block text-xs font-medium text-slate-300">
                    {field.label}
                  </label>
                  <input
                    type="text"
                    value={val}
                    disabled={disabled}
                    onChange={(e) => onChange(field.id, e.target.value)}
                    placeholder={`Enter ${field.label.toLowerCase()}`}
                    className="w-full bg-[#131E31] text-slate-100 placeholder-slate-500 text-xs rounded-xl px-3 py-2 border border-slate-700/60 hover:border-slate-600 focus:border-blue-500/60 focus:outline-none focus:ring-1 focus:ring-blue-500/60 transition-colors disabled:opacity-50"
                  />
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
