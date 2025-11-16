import React, { useState, useEffect } from 'react';
import { X, MessageSquare, AlertCircle, CheckCircle, Upload } from 'lucide-react';

/**
 * ChatImportModal Component
 * Modal for importing chat conversations from JSON files
 */
const ChatImportModal = ({ isOpen, onClose, onImportSuccess }) => {
  const [chatFile, setChatFile] = useState(null);
  const [characterId, setCharacterId] = useState('');
  const [characters, setCharacters] = useState([]);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Load characters when modal opens
  useEffect(() => {
    if (isOpen) {
      loadCharacters();
    }
  }, [isOpen]);

  const loadCharacters = async () => {
    try {
      const { characterAPI } = await import('../../services/api.js');
      const response = await characterAPI.getAll();
      setCharacters(response.data || []);
    } catch (err) {
      console.error('Error loading characters:', err);
    }
  };

  const handleReset = () => {
    setChatFile(null);
    setCharacterId('');
    setError(null);
    setSuccess(null);
    setIsImporting(false);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setChatFile(file);
      setError(null);
    }
  };

  const handleImport = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsImporting(true);

    try {
      if (!chatFile) {
        throw new Error('Please select a chat file');
      }

      // Read file
      const text = await chatFile.text();
      const chatData = JSON.parse(text);

      // Import from API
      const { chatAPI } = await import('../../services/api.js');
      const response = await chatAPI.import(chatData, characterId || null);

      // Show success message
      setSuccess(
        `Chat imported successfully! ${response.data.message_count || 0} messages loaded.`
      );
      setChatFile(null);

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
      setError(err.message || 'Failed to import chat');
    } finally {
      setIsImporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-dark-card rounded-lg shadow-xl w-full max-w-2xl mx-4 border border-dark-border">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-dark-border">
          <div className="flex items-center gap-3">
            <MessageSquare className="text-purple-500" size={24} />
            <h2 className="text-xl font-semibold">Import Chat</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors"
            disabled={isImporting}
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <form onSubmit={handleImport} className="space-y-6">
            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Chat JSON File
                <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileSelect}
                  disabled={isImporting}
                  className="block w-full text-sm text-gray-400
                    file:mr-4 file:py-2 file:px-4
                    file:rounded file:border-0
                    file:text-sm file:font-semibold
                    file:bg-purple-600 file:text-white
                    hover:file:bg-purple-700
                    file:cursor-pointer
                    cursor-pointer
                    border border-dark-border rounded-lg
                    bg-dark-bg p-2"
                />
              </div>
              {chatFile && (
                <p className="text-sm text-gray-400 mt-2">
                  Selected: {chatFile.name}
                </p>
              )}
              <p className="text-sm text-gray-500 mt-2">
                Upload a chat JSON file exported from JanitorAI Chat Downloader addon
              </p>
            </div>

            {/* Character Selection (Optional) */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Link to Character (Optional)
              </label>
              <select
                value={characterId}
                onChange={(e) => setCharacterId(e.target.value)}
                disabled={isImporting}
                className="w-full px-4 py-2 rounded-lg border border-dark-border bg-dark-bg
                  text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">None</option>
                {characters.map((char) => (
                  <option key={char.id} value={char.id}>
                    {char.name} ({char.universe})
                  </option>
                ))}
              </select>
              <p className="text-sm text-gray-500 mt-2">
                Optionally link this chat to an existing character
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
                <div className="flex-1">
                  <p className="text-red-500 font-medium">Error</p>
                  <p className="text-red-400 text-sm whitespace-pre-wrap">{error}</p>
                </div>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="flex items-start gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                <CheckCircle className="text-green-500 flex-shrink-0 mt-0.5" size={20} />
                <div className="flex-1">
                  <p className="text-green-500 font-medium">Success!</p>
                  <p className="text-green-400 text-sm">{success}</p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 justify-end pt-4 border-t border-dark-border">
              <button
                type="button"
                onClick={handleClose}
                disabled={isImporting}
                className="px-6 py-2 rounded-lg border border-dark-border hover:bg-dark-hover
                  transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isImporting || !chatFile}
                className="px-6 py-2 rounded-lg bg-purple-600 hover:bg-purple-700
                  transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                  flex items-center gap-2"
              >
                {isImporting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload size={18} />
                    Import Chat
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatImportModal;
