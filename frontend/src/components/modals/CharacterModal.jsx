import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

/**
 * CharacterModal Component
 * Modal for creating or editing a character
 */
const CharacterModal = ({ isOpen, onClose, onSave, character = null }) => {
  const [formData, setFormData] = useState({
    name: '',
    chatName: '',
    universe: '',
    bio: '',
    personality: '',
    scenario: '',
    introMessage: '',
    tags: '',
    contentRating: 'sfw',
    notes: '',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  // Populate form when editing
  useEffect(() => {
    if (character) {
      setFormData({
        name: character.name || '',
        chatName: character.chatName || '',
        universe: character.universe || '',
        bio: character.bio || '',
        personality: character.personality || '',
        scenario: character.scenario || '',
        introMessage: character.introMessage || '',
        tags: character.tags ? character.tags.join(', ') : '',
        contentRating: character.contentRating || 'sfw',
        notes: character.notes || '',
      });
    } else {
      // Reset form for new character
      setFormData({
        name: '',
        chatName: '',
        universe: '',
        bio: '',
        personality: '',
        scenario: '',
        introMessage: '',
        tags: '',
        contentRating: 'sfw',
        notes: '',
      });
    }
    setError(null);
  }, [character, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSaving(true);

    try {
      // Convert tags string to array
      const tags = formData.tags
        ? formData.tags.split(',').map((tag) => tag.trim()).filter(Boolean)
        : [];

      const characterData = {
        ...formData,
        tags,
      };

      await onSave(characterData, character?.id);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save character');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-dark-card border border-dark-border rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-dark-border">
          <h2 className="text-xl font-semibold">
            {character ? 'Edit Character' : 'Create Character'}
          </h2>
          <button
            onClick={onClose}
            className="hover:bg-dark-hover p-2 rounded transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-4">
          {error && (
            <div className="bg-red-900/30 border border-red-700 text-red-400 p-3 rounded">
              {error}
            </div>
          )}

          {/* Name (Required) */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full bg-dark-bg border border-dark-border rounded px-3 py-2 focus:outline-none focus:border-gray-500"
              placeholder="Aria Stormwind"
            />
          </div>

          {/* Chat Name (Optional) */}
          <div>
            <label className="block text-sm font-medium mb-1">Chat Name (Optional)</label>
            <input
              type="text"
              name="chatName"
              value={formData.chatName}
              onChange={handleChange}
              className="w-full bg-dark-bg border border-dark-border rounded px-3 py-2 focus:outline-none focus:border-gray-500"
              placeholder="Aria"
            />
          </div>

          {/* Universe (Required) */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Universe <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="universe"
              value={formData.universe}
              onChange={handleChange}
              required
              className="w-full bg-dark-bg border border-dark-border rounded px-3 py-2 focus:outline-none focus:border-gray-500"
              placeholder="Fantasy Realms"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium mb-1">Bio</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows={3}
              className="w-full bg-dark-bg border border-dark-border rounded px-3 py-2 focus:outline-none focus:border-gray-500 resize-none"
              placeholder="A powerful mage from the northern mountains..."
            />
          </div>

          {/* Personality */}
          <div>
            <label className="block text-sm font-medium mb-1">Personality</label>
            <textarea
              name="personality"
              value={formData.personality}
              onChange={handleChange}
              rows={3}
              className="w-full bg-dark-bg border border-dark-border rounded px-3 py-2 focus:outline-none focus:border-gray-500 resize-none"
              placeholder="Confident, intelligent, protective..."
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              className="w-full bg-dark-bg border border-dark-border rounded px-3 py-2 focus:outline-none focus:border-gray-500"
              placeholder="fantasy, mage, fire-magic"
            />
          </div>

          {/* Content Rating */}
          <div>
            <label className="block text-sm font-medium mb-1">Content Rating</label>
            <select
              name="contentRating"
              value={formData.contentRating}
              onChange={handleChange}
              className="w-full bg-dark-bg border border-dark-border rounded px-3 py-2 focus:outline-none focus:border-gray-500"
            >
              <option value="sfw">SFW (Safe for Work)</option>
              <option value="nsfw">NSFW (Not Safe for Work)</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium mb-1">Personal Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={2}
              className="w-full bg-dark-bg border border-dark-border rounded px-3 py-2 focus:outline-none focus:border-gray-500 resize-none"
              placeholder="Your private notes about this character..."
            />
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-dark-border">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 hover:bg-dark-hover rounded transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isSaving}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Saving...' : character ? 'Update' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CharacterModal;
