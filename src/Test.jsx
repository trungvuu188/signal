import { useState, FormEvent } from 'react';

function ApiCaller() {
  const [ftId, setFtId] = useState('');
  const [jwt, setJwt] = useState('');
  const [apiUrl, setApiUrl] = useState('');
  const [method, setMethod] = useState('POST'); // Default to POST
  const [body, setBody] = useState(''); // For custom JSON body
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      // Parse body to validate JSON if provided
      let requestBody;
      if (body && method !== 'GET' && method !== 'HEAD') {
        try {
          JSON.parse(body); // Validate JSON
          requestBody = body;
        } catch (jsonError) {
          throw new Error('Invalid JSON body');
        }
      }

      const res = await fetch(apiUrl, {
        method,
        headers: {
          'X-FTId': ftId,
          'Authorization': `Bearer ${jwt}`,
          'Content-Type': 'application/json',
        },
        ...(requestBody && { body: requestBody }), // Include body only if provided and method allows
      });

      if (!res.ok) {
        const errorData = await res.text();
        throw new Error(`HTTP error! status: ${res.status}, message: ${errorData}`);
      }

      const data = await res.json();
      setResponse(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-gray-800 p-4">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="ftId" className="block text-sm font-medium text-gray-700">
              FTId (X-FTId header)
            </label>
            <input
              id="ftId"
              type="text"
              value={ftId}
              onChange={(e) => setFtId(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label htmlFor="jwt" className="block text-sm font-medium text-gray-700">
              JWT (Authorization: Bearer token)
            </label>
            <input
              id="jwt"
              type="text"
              value={jwt}
              onChange={(e) => setJwt(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label htmlFor="apiUrl" className="block text-sm font-medium text-gray-700">
              API URL
            </label>
            <input
              id="apiUrl"
              type="url"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label htmlFor="method" className="block text-sm font-medium text-gray-700">
              Request Method
            </label>
            <select
              id="method"
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="PATCH">PATCH</option>
              <option value="DELETE">DELETE</option>
            </select>
          </div>
          <div>
            <label htmlFor="body" className="block text-sm font-medium text-gray-700">
              Request Body (JSON)
            </label>
            <textarea
              id="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 h-32"
              placeholder={JSON.stringify(
                {
                  ftId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
                  ftMemberId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
                  authorizationList: [{ featureCode: 'MEMBER', methodsList: ['VIEW'] }],
                },
                null,
                2
              )}
              disabled={method === 'GET' || method === 'HEAD'} // Disable for GET/HEAD
            />
            {(method === 'GET' || method === 'HEAD') && (
              <p className="mt-1 text-sm text-gray-500">
                Request body is not applicable for {method} requests.
              </p>
            )}
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white font-medium py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Submit'}
          </button>
        </form>

        {loading && (
          <div className="mt-4 text-center">
            <p className="text-blue-500">Loading...</p>
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-md">
            <p>Error: {error}</p>
          </div>
        )}

        {response && (
          <div className="mt-4">
            <h2 className="text-lg font-medium text-gray-700">API Response:</h2>
            <pre className="mt-2 p-4 bg-gray-800 rounded-md overflow-auto max-h-96">
              {JSON.stringify(response, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

export default ApiCaller;