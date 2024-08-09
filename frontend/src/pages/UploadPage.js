import React, { useState } from 'react';
import axios from 'axios';
import './UploadPage.css';

const UploadPage = () => {
  const [file, setFile] = useState(null);
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleUrlChange = (event) => {
    setUrl(event.target.value);
  };

  const handleUpload = async () => {
    const formData = new FormData();

    if (file) {
      formData.append('file', file);
    } else if (url) {
      formData.append('url', url);
    } else {
      setStatus('Please provide a file or a YouTube URL');
      return;
    }

    try {
      const response = await axios.post('http://127.0.0.1:5000/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        },
      });
      setUploadProgress(100); // Ensure the progress bar finishes
      setStatus('Video processed successfully');
      console.log(response.data);
    } catch (error) {
      console.error('Error uploading file:', error);
      setStatus('Error processing video');
    }
  };

  return (
    <div className="upload-page">
      <h2>Upload Video</h2>
      <div className="input-section">
        <input type="file" onChange={handleFileChange} accept=".mp4" />
        <div className="or-divider">OR</div>
        <input type="text" placeholder="YouTube URL" value={url} onChange={handleUrlChange} />
      </div>
      <button onClick={handleUpload}>Upload</button>
      {status && <div className="status-dialog">{status}</div>}
      {uploadProgress > 0 && (
        <div className="progress-bar">
          <div className="progress" style={{ width: `${uploadProgress}%` }}></div>
        </div>
      )}
    </div>
  );
};

export default UploadPage;