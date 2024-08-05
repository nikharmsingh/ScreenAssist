import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import ReactPlayer from 'react-player';

function App() {
  const [file, setFile] = useState(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const playerRef = useRef(null);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleFileUpload = async () => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('http://localhost:5000/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log(response.data);
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  const handleQueryChange = (event) => {
    setQuery(event.target.value);
  };

  const handleQuerySubmit = async () => {
    try {
      const response = await axios.post('http://localhost:5000/query', { query });
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
    <div className="App">
      <h1>Video Processing and Query</h1>
      <div>
        <h2>Upload Video</h2>
        <input type="file" onChange={handleFileChange} />
        <button onClick={handleFileUpload}>Upload</button>
      </div>
      <div>
        <h2>Submit Query</h2>
        <input type="text" value={query} onChange={handleQueryChange} />
        <button onClick={handleQuerySubmit}>Submit</button>
      </div>
      <div>
        <h2>Results</h2>
        {results.length > 0 && (
          <div>
            <h3>Top Result</h3>
            <p>Filename: {results[0].filename}</p>
            <p>Start: {results[0].start}</p>
            <p>End: {results[0].end}</p>
            <p>Headline: {results[0].headline}</p>
            <p>Gist: {results[0].gist}</p>
            <p>Similarity Score: {results[0].similarity_score}</p>
            <ReactPlayer
              ref={playerRef}
              url={`http://localhost:5000/static/uploads/${results[0].filename}`}
              controls
              playing
              onProgress={({ playedSeconds }) => {
                if (playedSeconds >= results[0].end / 1000) {
                  playerRef.current.seekTo(results[0].start / 1000, 'seconds');
                }
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
