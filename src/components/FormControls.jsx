import React, { useState, useRef } from 'react';

export const InputGroup = ({ label, children, className = "" }) => (
  <div className={`input-group ${className}`}>
    {label && <label>{label}</label>}
    {children}
  </div>
);

export const FileUpload = ({ onFileChange, loading }) => {
  const fileInputRef = useRef(null);
  const [fileName, setFileName] = useState('');

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
      onFileChange(file);
    }
  };

  return (
    <InputGroup label="Upload Shop Logo">
      <div 
        className={`file-upload-area ${loading ? 'disabled' : ''}`} 
        onClick={() => !loading && fileInputRef.current?.click()}
      >
        <input 
          ref={fileInputRef} 
          type="file" 
          accept="image/*" 
          onChange={handleFileSelect} 
          style={{ display: 'none' }} 
          disabled={loading} 
        />
        <div className="file-upload-content">
          <span className="upload-icon">📁</span>
          <span className="upload-text">{fileName || 'Click to upload logo'}</span>
        </div>
      </div>
    </InputGroup>
  );
};