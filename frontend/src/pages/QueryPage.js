import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import ReactPlayer from 'react-player';
import { Link } from 'react-router-dom';
import Navbar from './Navbar';
import './QueryPage.css';

const QueryPage = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const playerRef = useRef(null);
  const [noRelevantVideo, setNoRelevantVideo] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [selectedVideoIndex, setSelectedVideoIndex] = useState(null);

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

  useEffect(() => {
    if (selectedVideoIndex !== null && playerRef.current) {
      playerRef.current.seekTo(results[selectedVideoIndex].start / 1000, 'seconds');
    }
  }, [selectedVideoIndex, results]);

  const handleProgress = ({ playedSeconds }) => {
    setCurrentTime(playedSeconds);
  };

  const handleDuration = (duration) => {
    setVideoDuration(duration);
  };

  const convertMillisecondsToHHMMSS = (milliseconds) => {
    const seconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="query-page">
      <Navbar /> {/* Add Navbar here */}
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
                  onProgress={handleProgress}
                  onDuration={handleDuration}
                />
                <div className="video-info">
                  <p>Filename: {results[selectedVideoIndex].filename}</p>
                  <p>Headline: {results[selectedVideoIndex].headline}</p>
                  <p>Start: {convertMillisecondsToHHMMSS(results[selectedVideoIndex].start)} End: {convertMillisecondsToHHMMSS(results[selectedVideoIndex].end)}</p>
                </div>
                {videoDuration > 0 && (
                  <div className="highlight-bar">
                    <div
                      className="highlight"
                      style={{
                        left: `${(results[selectedVideoIndex].start / videoDuration) * 100}%`,
                        width: `${((results[selectedVideoIndex].end - results[selectedVideoIndex].start) / videoDuration) * 100}%`,
                      }}
                    />
                  </div>
                )}
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