import { Head } from 'ice';
import { useState } from 'react';
import './index.css';

function App() {
  const [count, setCount] = useState<number>(0);

  return (
    <div className="App">
      <Head>
        <meta charSet="utf-8" />
        <title>🚀 Vite + icejs</title>
        <meta name="keywords" content="About Keywords" />
        <meta name="description" content="About Description" />
      </Head>
      <header className="App-header">
        <p className="header">🚀 Vite + icejs</p>

        <div className="body">
          <button type="button" onClick={() => setCount((e) => e + 1)}>
            🪂 Click me : {count}
          </button>
          <p>
            <a
              className="App-link"
              href="https://reactjs.org"
              target="_blank"
              rel="noopener noreferrer"
            >
              Learn React
            </a>
            {' | '}
            <a
              className="App-link"
              href="https://vitejs.dev/guide/features.html"
              target="_blank"
              rel="noopener noreferrer"
            >
              Vite Docs
            </a>
          </p>
        </div>
      </header>
    </div>
  );
}

export default App;
