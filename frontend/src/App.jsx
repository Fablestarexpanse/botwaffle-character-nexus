import React from 'react';

function App() {
  const [status, setStatus] = React.useState(null);

  React.useEffect(() => {
    // Test backend connection
    fetch('http://localhost:3000/api/health')
      .then(res => res.json())
      .then(data => setStatus(data))
      .catch(err => setStatus({ error: err.message }));
  }, []);

  return (
    <div className="min-h-screen bg-dark-bg text-white">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-2">
            Botwaffle Character Nexus
          </h1>
          <p className="text-gray-400">
            Privacy-first local character management for JanitorAI bots
          </p>
        </header>

        <div className="max-w-2xl mx-auto">
          <div className="bg-dark-card border border-dark-border rounded-lg p-6 mb-6">
            <h2 className="text-2xl font-semibold mb-4">
              Welcome! 🎉
            </h2>
            <p className="text-gray-300 mb-4">
              The project structure has been successfully set up with security best practices.
            </p>
            <div className="bg-dark-bg border border-dark-border rounded p-4">
              <h3 className="font-semibold mb-2">Backend Connection Status:</h3>
              {status ? (
                status.error ? (
                  <div className="text-red-400">
                    ❌ Error: {status.error}
                    <p className="text-sm mt-2">Make sure the backend server is running on port 3000</p>
                  </div>
                ) : (
                  <div className="text-green-400">
                    ✅ Connected successfully!
                    <pre className="text-xs mt-2 bg-gray-900 p-2 rounded overflow-x-auto">
                      {JSON.stringify(status, null, 2)}
                    </pre>
                  </div>
                )
              ) : (
                <div className="text-yellow-400">⏳ Connecting...</div>
              )}
            </div>
          </div>

          <div className="bg-dark-card border border-dark-border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Next Steps:</h2>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-start">
                <span className="text-green-400 mr-2">✓</span>
                <span>Project structure created with security best practices</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-400 mr-2">✓</span>
                <span>Backend server running with Express, CORS, and Helmet</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-400 mr-2">✓</span>
                <span>Frontend running with React, Vite, and Tailwind CSS</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-400 mr-2">→</span>
                <span>Implement character import from JanitorAI URLs</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-400 mr-2">→</span>
                <span>Build character grid and card components</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-400 mr-2">→</span>
                <span>Add universe and group organization features</span>
              </li>
            </ul>
          </div>

          <div className="mt-6 text-center text-gray-500 text-sm">
            <p>Part of the <strong>Botwaffle</strong> suite of character management tools</p>
            <p className="mt-2">Version 0.1.0 • MIT License</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
