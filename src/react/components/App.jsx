import React, { useState } from 'react';


const App = () => {
  const [message, setMessage] = useState('');

  const handleInsertDummyText = () => {

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0].url.includes('youtube.com/watch')) {
        chrome.tabs.sendMessage(
          tabs[0].id,
          { action: 'injectText' },
          (response) => {
            if (response && response.success) {
              setMessage('Dummy text injected!');
            } else {
              setMessage('Error ' + (chrome.runtime.lastError ? chrome.runtime.lastError.message : ''));
            }
          }
        );
      } else {
        setMessage('Please navigate to a YouTube video page.');
      }
  });
};

  return (
    <div style={{ 
      width: '300px', 
      padding: '10px', 
      fontFamily: 'Arial, sans-serif', 
      border: '1px solid #ccc', 
      borderRadius: '8px', 
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', 
      backgroundColor: '#f9f9f9' 
    }}>
      <h1 style={{ fontSize: '20px', marginBottom: '10px', color: '#333' }}>Comment Tool</h1>
      <h3 style={{ fontSize: '16px', marginBottom: '15px', color: '#555' }}>Search comments for answers to your questions</h3>
      <input 
        type='text' 
        placeholder='Search comments...' 
        required 
        style={{ 
          width: '80%', 
          padding: '8px', 
          marginBottom: '10px', 
          border: '1px solid #ccc', 
          borderRadius: '4px',
          display: 'block',
          margin: '1em auto',
        }} 
      />
      <button 
        onClick={handleInsertDummyText} 
        style={{ 
          width: '50%', 
          padding: '10px', 
          backgroundColor: '#007BFF', 
          color: '#fff', 
          border: 'none', 
          borderRadius: '4px', 
          cursor: 'pointer',
          display: 'block',
          margin: '1em auto',
        }}
      >
        Search
      </button>
      {message && <p style={{ marginTop: '10px', color: message.includes('Error') ? 'red' : 'green' }}>{message}</p>}
    </div>
  );
};

export default App;
