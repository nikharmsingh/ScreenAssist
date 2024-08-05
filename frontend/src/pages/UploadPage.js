import React, { useState } from 'react';
import axios from 'axios';
import './UploadPage.css';

const UploadPage = () => {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('');

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleFileUpload = async () => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('http://127.0.0.1:5000/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Start polling for status updates
      pollStatus();
      console.log(response.data);
    } catch (error) {
      console.error('Error uploading file:', error);
      setStatus('Error processing video');
    }
  };

  const pollStatus = () => {
    const interval = setInterval(async () => {
      try {
        const response = await axios.get('http://127.0.0.1:5000/status');
        setStatus(response.data.status);
        if (response.data.status === 'Video processed' || response.data.status.startsWith('Error')) {
          clearInterval(interval);
        }
      } catch (error) {
        console.error('Error fetching status:', error);
        clearInterval(interval);
      }
    }, 1000); // Poll every second
  };

  return (
    <div className="upload-page">
      <h2>Upload Video</h2>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleFileUpload}>Upload</button>
      {status && <div className="status-dialog">{status}</div>}
    </div>
  );
};

export default UploadPage;
