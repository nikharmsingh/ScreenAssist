import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ReactPlayer from 'react-player';
import Navbar from './Navbar';
import './QueryPage.css';
import { checkAuthStatus } from '../utils/auth';

const QueryPage = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const playerRef = useRef(null);
  const [noRelevantVideo, setNoRelevantVideo] = useState(false);
  const [selectedVideoIndex, setSelectedVideoIndex] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const verifyAuth = async () => {
      const isAuthenticated = await checkAuthStatus();
      if (!isAuthenticated) {
        navigate('/');
      }
    };

    verifyAuth();
  }, [navigate]);

  const handleQueryChange = (event) => {
    setQuery(event.target.value);
  };

  const handleQuerySubmit = async () => {
    try {
      const response = await axios.post('http://127.0.0.1:5000/query', { query });
      const segments = response.data.segments;
      segments.sort((a, b) => b.similarity_score - a.similarity_score);
      setResults(segments.slice(0, 2));
      setNoRelevantVideo(segments.length === 0);
    } catch (error) {
      console.error('Error submitting query:', error);
    }
  };

  const handleVideoSelect = (index) => {
    setSelectedVideoIndex(index);
  };

  return (
    <div className="query-page">
      <Navbar />
      <h2>Submit Query</h2>
      <input type="text" value={query} onChange={handleQueryChange} placeholder="Give the Prompt" />
      <button onClick={handleQuerySubmit}>Submit</button>
      <Link to="/landing">
        <button>Go Back</button>
      </Link>
      <div className="results-section">
        {noRelevantVideo && <div className="no-video-dialog">No relevant video found</div>}
        {results.length > 0 && (
          <>
            <div className="video-selection">
              {results.map((result, index) => (
                <button key={index} onClick={() => handleVideoSelect(index)}>
                  {`Video ${index + 1}`}
                </button>
              ))}
            </div>
            {selectedVideoIndex !== null && (
              <div className="video">
                <ReactPlayer
                  ref={playerRef}
                  url={`${results[selectedVideoIndex].filename}`}
                  controls
                  playing
                />
                <div className="video-info">
                  <p>Filename: {results[selectedVideoIndex].filename}</p>
                  <p>Headline: {results[selectedVideoIndex].headline}</p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      <footer className="footer">
        <p>Powered by Tekion</p>
      </footer>
    </div>
  );
};

export default QueryPage;