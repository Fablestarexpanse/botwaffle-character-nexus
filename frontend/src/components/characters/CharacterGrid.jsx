import React from 'react';
import CharacterCard from './CharacterCard';

/**
 * CharacterGrid Component
 * Displays characters in a responsive grid layout
 */
const CharacterGrid = ({ characters, onDelete, onEdit, onView, isLoading }) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-400 mb-4"></div>
          <p className="text-gray-400">Loading characters...</p>
        </div>
      </div>
    );
  }

  if (!characters || characters.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center max-w-md">
          <svg
            className="mx-auto h-24 w-24 text-gray-600 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
          <h3 className="text-xl font-semibold mb-2">No Characters Yet</h3>
          <p className="text-gray-400 mb-6">
            Get started by creating your first character or importing from JanitorAI.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {characters.map((character) => (
        <CharacterCard
          key={character.id}
          character={character}
          onDelete={onDelete}
          onEdit={onEdit}
          onView={onView}
        />
      ))}
    </div>
  );
};

export default CharacterGrid;
