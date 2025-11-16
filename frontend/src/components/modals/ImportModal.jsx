import React, { useState } from 'react';
import { X, Download, AlertCircle, CheckCircle, Link, Upload } from 'lucide-react';

/**
 * ImportModal Component
 * Modal for importing characters from external sources
 */
const ImportModal = ({ isOpen, onClose, onImportSuccess }) => {
  const [importType, setImportType] = useState('janitorai'); // 'janitorai' or 'json'
  const [url, setUrl] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleReset = () => {
    setUrl('');
    setError(null);
    setSuccess(null);
    setIsImporting(false);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleImportFromJanitorAI = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsImporting(true);

    try {
      // Validate URL
      if (!url.trim()) {
        throw new Error('Please enter a JanitorAI URL');
      }

      if (!url.includes('janitorai.com')) {
        throw new Error('Invalid JanitorAI URL. URL must contain "janitorai.com"');
      }

      // Import from API
      const { importAPI } = await import('../../services/api.js');
      const response = await importAPI.fromJanitorAI(url);

      // Show success message
      setSuccess(response.message || 'Character imported successfully!');
      setUrl('');

      // Notify parent component
      if (onImportSuccess) {
        onImportSuccess(response.data);
      }

      // Auto-close after 2 seconds
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (err) {
      console.error('Import error:', err);

      // Handle specific error cases
      if (err.message.includes('Puppeteer')) {
        setError(
          'Puppeteer is not installed. To enable JanitorAI imports:\n' +
          '1. Stop the server\n' +
          '2. Run: cd backend && npm install puppeteer\n' +
          '3. Restart the server'
        );
      } else {
        setError(err.message || 'Failed to import character');
      }
    } finally {
      setIsImporting(false);
    }
  };

  const handleImportFromJSON = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setSuccess(null);
    setIsImporting(true);

    try {
      // Read file
      const text = await file.text();
      const data = JSON.parse(text);

      // Ensure it's an array
      const characters = Array.isArray(data) ? data : [data];

      // Import from API
      const { importAPI } = await import('../../services/api.js');
      const response = await importAPI.fromJSON(characters);

      // Show success message
      const successCount = response.data?.success?.length || 0;
      const totalCount = characters.length;
      setSuccess(`Imported ${successCount} of ${totalCount} characters`);

      // Notify parent component
      if (onImportSuccess) {
        onImportSuccess();
      }

      // Auto-close after 2 seconds
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (err) {
      console.error('JSON import error:', err);
      setError(err.message || 'Failed to import JSON file');
    } finally {
      setIsImporting(false);
      // Reset file input
      e.target.value = '';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-dark-card border border-dark-border rounded-lg w-full max-w-xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-dark-border">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Download size={24} />
            Import Character
          </h2>
          <button
            onClick={handleClose}
            className="hover:bg-dark-hover p-2 rounded transition-colors"
            disabled={isImporting}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Import Type Selector */}
          <div className="flex gap-2 p-1 bg-dark-bg rounded">
            <button
              onClick={() => setImportType('janitorai')}
              className={`flex-1 px-4 py-2 rounded transition-colors flex items-center justify-center gap-2 ${
                importType === 'janitorai'
                  ? 'bg-blue-600 text-white'
                  : 'hover:bg-dark-hover text-gray-400'
              }`}
            >
              <Link size={16} />
              JanitorAI URL
            </button>
            <button
              onClick={() => setImportType('json')}
              className={`flex-1 px-4 py-2 rounded transition-colors flex items-center justify-center gap-2 ${
                importType === 'json'
                  ? 'bg-blue-600 text-white'
                  : 'hover:bg-dark-hover text-gray-400'
              }`}
            >
              <Upload size={16} />
              JSON File
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-900/30 border border-red-700 text-red-400 p-3 rounded flex items-start gap-2">
              <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
              <div className="whitespace-pre-line text-sm">{error}</div>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="bg-green-900/30 border border-green-700 text-green-400 p-3 rounded flex items-center gap-2">
              <CheckCircle size={20} />
              <div>{success}</div>
            </div>
          )}

          {/* JanitorAI Import Form */}
          {importType === 'janitorai' && (
            <form onSubmit={handleImportFromJanitorAI} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  JanitorAI Character URL
                </label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://janitorai.com/characters/..."
                  className="w-full bg-dark-bg border border-dark-border rounded px-3 py-2 focus:outline-none focus:border-gray-500"
                  disabled={isImporting}
                  required
                />
                <p className="mt-2 text-xs text-gray-500">
                  Paste the URL of a JanitorAI character page to import it
                </p>
              </div>

              <button
                type="submit"
                disabled={isImporting || !url.trim()}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isImporting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Download size={16} />
                    Import Character
                  </>
                )}
              </button>
            </form>
          )}

          {/* JSON Import Form */}
          {importType === 'json' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Upload JSON File
                </label>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportFromJSON}
                  className="w-full bg-dark-bg border border-dark-border rounded px-3 py-2 focus:outline-none focus:border-gray-500 file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:bg-blue-600 file:text-white file:cursor-pointer hover:file:bg-blue-700"
                  disabled={isImporting}
                />
                <p className="mt-2 text-xs text-gray-500">
                  Upload a JSON file containing character data (single object or array)
                </p>
              </div>

              {isImporting && (
                <div className="flex items-center justify-center gap-2 text-gray-400">
                  <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                  Processing JSON file...
                </div>
              )}
            </div>
          )}

          {/* Info Box */}
          <div className="bg-blue-900/20 border border-blue-700/50 text-blue-300 p-3 rounded text-sm">
            <p className="font-medium mb-1">Import Notes:</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>JanitorAI imports will download character images automatically</li>
              <li>Character images are processed to remove EXIF metadata</li>
              <li>All data is stored locally on your machine</li>
              <li>Imported characters can be edited after import</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportModal;
