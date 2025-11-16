import React, { useState, useEffect } from 'react';
import { Plus, Search, RefreshCw, Download } from 'lucide-react';
import { characterAPI } from './services/api';
import CharacterGrid from './components/characters/CharacterGrid';
import CharacterModal from './components/modals/CharacterModal';
import ImportModal from './components/modals/ImportModal';

function App() {
  const [characters, setCharacters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState(null);
  const [viewingCharacter, setViewingCharacter] = useState(null);

  // Load characters on mount
  useEffect(() => {
    loadCharacters();
  }, []);

  const loadCharacters = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await characterAPI.getAll({ limit: 100 });
      setCharacters(response.data || []);
    } catch (err) {
      setError(err.message);
      console.error('Failed to load characters:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCharacter = async (characterData) => {
    try {
      await characterAPI.create(characterData);
      await loadCharacters();
      setIsModalOpen(false);
    } catch (err) {
      throw new Error(err.message || 'Failed to create character');
    }
  };

  const handleUpdateCharacter = async (characterData, characterId) => {
    try {
      await characterAPI.update(characterId, characterData);
      await loadCharacters();
      setIsModalOpen(false);
      setEditingCharacter(null);
    } catch (err) {
      throw new Error(err.message || 'Failed to update character');
    }
  };

  const handleSaveCharacter = async (characterData, characterId) => {
    if (characterId) {
      return handleUpdateCharacter(characterData, characterId);
    } else {
      return handleCreateCharacter(characterData);
    }
  };

  const handleDeleteCharacter = async (characterId) => {
    try {
      await characterAPI.delete(characterId);
      await loadCharacters();
    } catch (err) {
      alert('Failed to delete character: ' + err.message);
    }
  };

  const handleEditCharacter = (character) => {
    setEditingCharacter(character);
    setIsModalOpen(true);
  };

  const handleViewCharacter = (character) => {
    setViewingCharacter(character);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCharacter(null);
  };

  const handleCloseViewModal = () => {
    setViewingCharacter(null);
  };

  const handleNewCharacter = () => {
    setEditingCharacter(null);
    setIsModalOpen(true);
  };

  const handleImportClick = () => {
    setIsImportModalOpen(true);
  };

  const handleImportSuccess = async () => {
    // Reload characters after successful import
    await loadCharacters();
  };

  const handleCloseImportModal = () => {
    setIsImportModalOpen(false);
  };

  // Filter characters by search term
  const filteredCharacters = characters.filter((char) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      char.name.toLowerCase().includes(search) ||
      char.universe.toLowerCase().includes(search) ||
      (char.tags && char.tags.some((tag) => tag.toLowerCase().includes(search)))
    );
  });

  return (
    <div className="min-h-screen bg-dark-bg text-white">
      {/* Header */}
      <header className="bg-dark-card border-b border-dark-border sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold">Botwaffle Character Nexus</h1>
              <p className="text-sm text-gray-400">
                Privacy-first character management
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleImportClick}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 px-4 py-2 rounded transition-colors"
              >
                <Download size={20} />
                <span className="hidden sm:inline">Import</span>
              </button>
              <button
                onClick={handleNewCharacter}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded transition-colors"
              >
                <Plus size={20} />
                <span>New Character</span>
              </button>
            </div>
          </div>

          {/* Search and filters */}
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search characters, universes, tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-dark-bg border border-dark-border rounded pl-10 pr-4 py-2 focus:outline-none focus:border-gray-500"
              />
            </div>
            <button
              onClick={loadCharacters}
              className="flex items-center gap-2 bg-dark-bg hover:bg-dark-hover border border-dark-border px-4 py-2 rounded transition-colors"
              title="Refresh"
            >
              <RefreshCw size={18} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-6">
        {/* Stats */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-gray-400">
            {isLoading ? (
              'Loading...'
            ) : (
              <>
                Showing {filteredCharacters.length} of {characters.length}{' '}
                {characters.length === 1 ? 'character' : 'characters'}
              </>
            )}
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-900/30 border border-red-700 text-red-400 p-4 rounded mb-6">
            Error: {error}
          </div>
        )}

        {/* Character grid */}
        <CharacterGrid
          characters={filteredCharacters}
          isLoading={isLoading}
          onDelete={handleDeleteCharacter}
          onEdit={handleEditCharacter}
          onView={handleViewCharacter}
        />
      </main>

      {/* Character modal (create/edit) */}
      <CharacterModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveCharacter}
        character={editingCharacter}
      />

      {/* Import modal */}
      <ImportModal
        isOpen={isImportModalOpen}
        onClose={handleCloseImportModal}
        onImportSuccess={handleImportSuccess}
      />

      {/* View character details modal */}
      {viewingCharacter && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-card border border-dark-border rounded-lg w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-dark-border">
              <h2 className="text-xl font-semibold">{viewingCharacter.name}</h2>
              <button
                onClick={handleCloseViewModal}
                className="hover:bg-dark-hover p-2 rounded transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-400 mb-1">Universe</h3>
                <p>{viewingCharacter.universe}</p>
              </div>

              {viewingCharacter.bio && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 mb-1">Bio</h3>
                  <p className="text-gray-300">{viewingCharacter.bio}</p>
                </div>
              )}

              {viewingCharacter.personality && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 mb-1">Personality</h3>
                  <p className="text-gray-300">{viewingCharacter.personality}</p>
                </div>
              )}

              {viewingCharacter.tags && viewingCharacter.tags.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {viewingCharacter.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="bg-dark-bg px-3 py-1 rounded text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {viewingCharacter.notes && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 mb-1">Notes</h3>
                  <p className="text-gray-300">{viewingCharacter.notes}</p>
                </div>
              )}

              <div>
                <h3 className="text-sm font-semibold text-gray-400 mb-1">Created</h3>
                <p className="text-gray-300">
                  {new Date(viewingCharacter.created).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-4 border-t border-dark-border">
              <button
                onClick={() => {
                  handleCloseViewModal();
                  handleEditCharacter(viewingCharacter);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded transition-colors"
              >
                Edit
              </button>
              <button
                onClick={handleCloseViewModal}
                className="px-4 py-2 hover:bg-dark-hover rounded transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
