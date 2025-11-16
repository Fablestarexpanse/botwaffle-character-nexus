import React from 'react';
import { Trash2, Edit, Eye } from 'lucide-react';

/**
 * CharacterCard Component
 * Displays a single character in card format
 */
const CharacterCard = ({ character, onDelete, onEdit, onView }) => {
  const placeholderImage = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23333" width="200" height="200"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="16" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3ENo Image%3C/text%3E%3C/svg%3E';

  const imageUrl = character.image
    ? `http://localhost:3000/api/images/${character.image}`
    : placeholderImage;

  const handleDelete = (e) => {
    e.stopPropagation();
    if (window.confirm(`Delete "${character.name}"?`)) {
      onDelete(character.id);
    }
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    onEdit(character);
  };

  const handleView = () => {
    onView(character);
  };

  return (
    <div
      onClick={handleView}
      className="bg-dark-card border border-dark-border rounded-lg overflow-hidden hover:border-gray-500 transition-colors cursor-pointer group"
    >
      {/* Image */}
      <div className="aspect-square bg-dark-bg overflow-hidden">
        <img
          src={imageUrl}
          alt={character.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          onError={(e) => {
            e.target.src = placeholderImage;
          }}
        />
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Name */}
        <h3 className="font-semibold text-lg mb-1 truncate">{character.name}</h3>

        {/* Universe */}
        <p className="text-sm text-gray-400 mb-3 truncate">{character.universe}</p>

        {/* Tags */}
        {character.tags && character.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {character.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="text-xs bg-dark-bg px-2 py-1 rounded text-gray-300"
              >
                {tag}
              </span>
            ))}
            {character.tags.length > 3 && (
              <span className="text-xs text-gray-500 px-2 py-1">
                +{character.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Content Rating Badge */}
        {character.contentRating && (
          <div className="mb-3">
            <span
              className={`text-xs px-2 py-1 rounded ${
                character.contentRating === 'nsfw'
                  ? 'bg-red-900/30 text-red-400'
                  : 'bg-green-900/30 text-green-400'
              }`}
            >
              {character.contentRating.toUpperCase()}
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={handleView}
            className="flex-1 flex items-center justify-center gap-2 bg-dark-bg hover:bg-dark-hover px-3 py-2 rounded text-sm transition-colors"
            title="View Details"
          >
            <Eye size={16} />
            <span>View</span>
          </button>
          <button
            onClick={handleEdit}
            className="flex items-center justify-center bg-dark-bg hover:bg-dark-hover px-3 py-2 rounded text-sm transition-colors"
            title="Edit"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center justify-center bg-dark-bg hover:bg-red-900/30 hover:text-red-400 px-3 py-2 rounded text-sm transition-colors"
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CharacterCard;
