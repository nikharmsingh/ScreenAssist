import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import ReactPlayer from 'react-player';
import './QueryPage.css';

const QueryPage = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const playerRef = useRef(null);

  const handleQueryChange = (event) => {
    setQuery(event.target.value);
  };

  const handleQuerySubmit = async () => {
    try {
      const response = await axios.post('http://127.0.0.1:5000/query', { query });
      setResults(response.data.segments);
    } catch (error) {
      console.error('Error submitting query:', error);
    }
  };

  useEffect(() => {
    if (results.length > 0 && playerRef.current) {
      playerRef.current.seekTo(results[0].start / 1000, 'seconds');
    }
  }, [results]);

  return (
    <div className="query-page">
      <h2>Submit Query</h2>
      <input type="text" value={query} onChange={handleQueryChange} placeholder="Give the Prompt" />
      <button onClick={handleQuerySubmit}>Submit</button>
      <div className="results-section">
        {results.length > 0 && (
          <>
            <div className="results">
              <h3>Top Result</h3>
              <p>Filename: {results[0].filename}</p>
              <p>Start: {results[0].start}</p>
              <p>End: {results[0].end}</p>
              <p>Headline: {results[0].headline}</p>
              <p>Gist: {results[0].gist}</p>
              <p>Similarity Score: {results[0].similarity_score}</p>
            </div>
            <div className="video">
              <ReactPlayer
                ref={playerRef}
                url={`${results[0].filename}`}
                controls
                playing
                onProgress={({ playedSeconds }) => {
                  if (playedSeconds >= results[0].end / 1000) {
                    playerRef.current.seekTo(results[0].start / 1000, 'seconds');
                  }
                }}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default QueryPage;
