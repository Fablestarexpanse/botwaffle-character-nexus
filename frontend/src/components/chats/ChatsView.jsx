import React, { useState, useEffect } from 'react';
import { MessageSquare, Trash2, Download, Calendar, Hash, User } from 'lucide-react';
import { chatAPI } from '../../services/api';

/**
 * ChatsView Component
 * Displays list of chat conversations and allows viewing/managing them
 */
const ChatsView = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await chatAPI.getAll({ limit: 100 });
      setConversations(response.data || []);
    } catch (err) {
      setError(err.message);
      console.error('Failed to load conversations:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectConversation = async (conversation) => {
    setSelectedConversation(conversation);
    setIsLoadingMessages(true);
    try {
      const response = await chatAPI.getMessages(conversation.id);
      setMessages(response.data || []);
    } catch (err) {
      console.error('Failed to load messages:', err);
      setMessages([]);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const handleDeleteConversation = async (conversationId) => {
    if (!confirm('Are you sure you want to delete this conversation?')) {
      return;
    }

    try {
      await chatAPI.delete(conversationId);
      if (selectedConversation?.id === conversationId) {
        setSelectedConversation(null);
        setMessages([]);
      }
      await loadConversations();
    } catch (err) {
      alert('Failed to delete conversation: ' + err.message);
    }
  };

  const handleExport = async (conversationId, format) => {
    try {
      await chatAPI.export(conversationId, format);
    } catch (err) {
      alert('Failed to export conversation: ' + err.message);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  return (
    <div className="flex h-[calc(100vh-200px)] gap-4">
      {/* Conversation List */}
      <div className="w-1/3 bg-dark-card border border-dark-border rounded-lg overflow-hidden flex flex-col">
        <div className="p-4 border-b border-dark-border">
          <h2 className="text-lg font-semibold">Conversations</h2>
          <p className="text-sm text-gray-400">{conversations.length} total</p>
        </div>

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-gray-400">Loading...</div>
          ) : conversations.length === 0 ? (
            <div className="p-4 text-center text-gray-400">
              <MessageSquare size={48} className="mx-auto mb-2 opacity-50" />
              <p>No conversations yet</p>
              <p className="text-sm">Import a chat to get started</p>
            </div>
          ) : (
            <div className="divide-y divide-dark-border">
              {conversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => handleSelectConversation(conv)}
                  className={`p-4 cursor-pointer hover:bg-dark-hover transition-colors ${
                    selectedConversation?.id === conv.id ? 'bg-dark-hover' : ''
                  }`}
                >
                  <h3 className="font-medium mb-1 truncate">{conv.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    {conv.persona_name && (
                      <span className="flex items-center gap-1">
                        <User size={14} />
                        {conv.persona_name}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Hash size={14} />
                      {conv.message_count}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDate(conv.created)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Message Viewer */}
      <div className="flex-1 bg-dark-card border border-dark-border rounded-lg overflow-hidden flex flex-col">
        {selectedConversation ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-dark-border">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">{selectedConversation.title}</h2>
                  <p className="text-sm text-gray-400">
                    {selectedConversation.message_count} messages
                    {selectedConversation.persona_name && ` • ${selectedConversation.persona_name}`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {/* Export Dropdown */}
                  <div className="relative group">
                    <button className="flex items-center gap-2 px-3 py-2 bg-dark-bg hover:bg-dark-hover border border-dark-border rounded transition-colors">
                      <Download size={18} />
                      Export
                    </button>
                    <div className="absolute right-0 mt-1 w-40 bg-dark-card border border-dark-border rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                      <button
                        onClick={() => handleExport(selectedConversation.id, 'json')}
                        className="w-full px-4 py-2 text-left hover:bg-dark-hover transition-colors"
                      >
                        JSON
                      </button>
                      <button
                        onClick={() => handleExport(selectedConversation.id, 'txt')}
                        className="w-full px-4 py-2 text-left hover:bg-dark-hover transition-colors"
                      >
                        Text
                      </button>
                      <button
                        onClick={() => handleExport(selectedConversation.id, 'markdown')}
                        className="w-full px-4 py-2 text-left hover:bg-dark-hover transition-colors"
                      >
                        Markdown
                      </button>
                      <button
                        onClick={() => handleExport(selectedConversation.id, 'jsonl')}
                        className="w-full px-4 py-2 text-left hover:bg-dark-hover transition-colors"
                      >
                        SillyTavern
                      </button>
                    </div>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={() => handleDeleteConversation(selectedConversation.id)}
                    className="flex items-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 rounded transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {isLoadingMessages ? (
                <div className="text-center text-gray-400">Loading messages...</div>
              ) : messages.length === 0 ? (
                <div className="text-center text-gray-400">No messages</div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-4 ${
                        msg.role === 'user'
                          ? 'bg-blue-600/20 border border-blue-600/30'
                          : 'bg-dark-bg border border-dark-border'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-gray-400">
                          {msg.role === 'user'
                            ? selectedConversation.persona_name || 'User'
                            : 'Assistant'}
                        </span>
                        {msg.timestamp && (
                          <span className="text-xs text-gray-500">
                            {new Date(msg.timestamp).toLocaleTimeString()}
                          </span>
                        )}
                      </div>
                      <p className="whitespace-pre-wrap text-gray-200">{msg.content}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <MessageSquare size={64} className="mx-auto mb-4 opacity-50" />
              <p>Select a conversation to view messages</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatsView;
