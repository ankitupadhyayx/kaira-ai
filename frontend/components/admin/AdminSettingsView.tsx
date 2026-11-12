'use client';

import React from 'react';
import {
  Sliders,
  Save,
  Globe,
  HardDrive,
  FileCheck,
  Lock,
  Cloud,
  Clock,
  Shield,
  Monitor,
  Sun,
  Moon,
} from 'lucide-react';
import { useAdmin } from '../../features/admin/context/AdminContext';
import { SupportedFileType } from '../../types/admin';

export function AdminSettingsView() {
  const { settings, updateSettings, theme, setTheme } = useAdmin();

  const [defaultLanguage, setDefaultLanguage] = React.useState(settings.defaultLanguage || 'English (en-US)');
  const [maxUploadMb, setMaxUploadMb] = React.useState(Math.round((settings.maxUploadSizeBytes || 52428800) / 1024 / 1024));
  const [allowedTypes, setAllowedTypes] = React.useState<SupportedFileType[]>(
    settings.allowedFileTypes || ['PDF', 'DOCX', 'DOC', 'TXT', 'MD', 'CSV', 'XLSX', 'PPTX', 'JSON', 'IMAGE', 'ZIP', 'HTML']
  );

  const ALL_FORMATS: SupportedFileType[] = [
    'PDF',
    'DOCX',
    'DOC',
    'TXT',
    'MD',
    'CSV',
    'XLSX',
    'PPTX',
    'JSON',
    'IMAGE',
    'ZIP',
    'HTML',
  ];

  const toggleType = (type: SupportedFileType) => {
    if (allowedTypes.includes(type)) {
      if (allowedTypes.length === 1) return;
      setAllowedTypes(allowedTypes.filter((t) => t !== type));
    } else {
      setAllowedTypes([...allowedTypes, type]);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      defaultLanguage,
      maxUploadSizeBytes: maxUploadMb * 1024 * 1024,
      allowedFileTypes: allowedTypes,
    });
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Enterprise Settings & Storage Configuration</h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
          Configure allowed document formats, upload thresholds, default language, and inspect future retention & Cloudinary parameters.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* 1. Theme Configuration */}
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
          <div className="flex items-center space-x-2 text-xs font-bold text-zinc-900 dark:text-zinc-100 border-b border-zinc-200 dark:border-zinc-800 pb-3">
            <Monitor className="w-4 h-4 text-cyan-500" />
            <span>Theme Preference</span>
          </div>

          <div className="grid grid-cols-3 gap-3 max-w-md text-xs">
            <button
              type="button"
              onClick={() => setTheme('light')}
              className={`p-3 rounded-xl border flex flex-col items-center space-y-2 transition-all cursor-pointer ${
                theme === 'light'
                  ? 'border-cyan-500 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-bold'
                  : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 text-zinc-600 dark:text-zinc-400'
              }`}
            >
              <Sun className="w-5 h-5" />
              <span>Light Mode</span>
            </button>

            <button
              type="button"
              onClick={() => setTheme('dark')}
              className={`p-3 rounded-xl border flex flex-col items-center space-y-2 transition-all cursor-pointer ${
                theme === 'dark'
                  ? 'border-cyan-500 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-bold'
                  : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 text-zinc-600 dark:text-zinc-400'
              }`}
            >
              <Moon className="w-5 h-5" />
              <span>Dark Mode</span>
            </button>

            <button
              type="button"
              onClick={() => setTheme('system')}
              className={`p-3 rounded-xl border flex flex-col items-center space-y-2 transition-all cursor-pointer ${
                theme === 'system'
                  ? 'border-cyan-500 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-bold'
                  : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 text-zinc-600 dark:text-zinc-400'
              }`}
            >
              <Monitor className="w-5 h-5" />
              <span>System</span>
            </button>
          </div>
        </div>

        {/* 2. Ingestion & Format Settings */}
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
          <div className="flex items-center space-x-2 text-xs font-bold text-zinc-900 dark:text-zinc-100 border-b border-zinc-200 dark:border-zinc-800 pb-3">
            <Sliders className="w-4 h-4 text-purple-500" />
            <span>Document Allowed Formats & Size Limits</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-semibold text-zinc-700 dark:text-zinc-300 block mb-1.5 flex items-center space-x-1.5">
                <Globe className="w-3.5 h-3.5 text-indigo-500" />
                <span>Default Document Language</span>
              </label>
              <select
                value={defaultLanguage}
                onChange={(e) => setDefaultLanguage(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="English (en-US)">English (en-US)</option>
                <option value="Spanish (es-ES)">Spanish (es-ES)</option>
                <option value="French (fr-FR)">French (fr-FR)</option>
                <option value="German (de-DE)">German (de-DE)</option>
                <option value="Japanese (ja-JP)">Japanese (ja-JP)</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-zinc-700 dark:text-zinc-300 block mb-1.5 flex items-center space-x-1.5">
                <HardDrive className="w-3.5 h-3.5 text-amber-500" />
                <span>Maximum Single File Upload Limit (MB)</span>
              </label>
              <input
                type="number"
                min={1}
                max={500}
                value={maxUploadMb}
                onChange={(e) => setMaxUploadMb(parseInt(e.target.value, 10) || 50)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-zinc-700 dark:text-zinc-300 block mb-2 flex items-center space-x-1.5 text-xs">
              <FileCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Allowed Knowledge Document Extensions</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {ALL_FORMATS.map((fmt) => {
                const isSelected = allowedTypes.includes(fmt);
                return (
                  <button
                    key={fmt}
                    type="button"
                    onClick={() => toggleType(fmt)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 border border-zinc-200 dark:border-zinc-700'
                    }`}
                  >
                    .{fmt.toLowerCase()}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 3. Future Settings Placeholders (Step 9) */}
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4 opacity-80">
          <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
            <div className="flex items-center space-x-2 text-xs font-bold text-zinc-900 dark:text-zinc-100">
              <Lock className="w-4 h-4 text-cyan-500" />
              <span>Future Settings Placeholders</span>
            </div>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              Placeholder Only
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-800">
              <span className="text-zinc-400 block text-[10px] font-mono flex items-center space-x-1">
                <Cloud className="w-3 h-3 text-cyan-500" />
                <span>Cloudinary Environment</span>
              </span>
              <span className="font-bold text-zinc-900 dark:text-zinc-100 text-xs">Auto / Local Vault Fallback</span>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-800">
              <span className="text-zinc-400 block text-[10px] font-mono flex items-center space-x-1">
                <Clock className="w-3 h-3 text-purple-500" />
                <span>Retention Policy</span>
              </span>
              <span className="font-bold text-zinc-900 dark:text-zinc-100 text-xs">Soft-Delete 90 Days</span>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-800">
              <span className="text-zinc-400 block text-[10px] font-mono flex items-center space-x-1">
                <Shield className="w-3 h-3 text-emerald-500" />
                <span>Visibility Defaults</span>
              </span>
              <span className="font-bold text-zinc-900 dark:text-zinc-100 text-xs">Internal Scope</span>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center space-x-2 px-6 py-2.5 rounded-xl font-semibold text-xs bg-cyan-600 hover:bg-cyan-700 text-white shadow-md transition-colors cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Configuration Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
}
