import React, { useState, useEffect, useCallback, useRef } from 'react';
import Swal from 'sweetalert2';
import './App.css';

// Configuration
const API_ENDPOINT = 'https://myqr-backend-2q84.onrender.com/generate-pdf';
const INITIAL_FORM_DATA = {
  shop_name: 'My Shop',
  upi_id: 'payment@bank',
  tagline: 'Quality you can trust',
  primary_color: '#646cff',
  text_color: '#000000',
  logoFile: null
};

/**
 * Custom hook to handle logo object URL lifecycle
 */
const useLogoPreview = (logoFile) => {
  const [previewLogo, setPreviewLogo] = useState(null);

  useEffect(() => {
    if (!logoFile) {
      setPreviewLogo(null);
      return;
    }
    const objectUrl = URL.createObjectURL(logoFile);
    setPreviewLogo(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [logoFile]);

  return previewLogo;
};

// --- Reusable UI Components ---

const InputGroup = ({ label, children }) => (
  <div className="input-group">
    {label && <label>{label}</label>}
    {children}
  </div>
);

const FileUpload = ({ onFileChange, loading }) => {
  const fileInputRef = useRef(null);
  const [fileName, setFileName] = useState('');

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
      onFileChange(file);
    }
  };

  const clearFile = (e) => {
    e.stopPropagation();
    setFileName('');
    onFileChange(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
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
          className="file-input" 
          disabled={loading}
        />
        <div className="file-upload-content">
          <span className="upload-icon">📁</span>
          <span className="upload-text">{fileName || 'Click to upload logo'}</span>
          {fileName && (
            <button type="button" className="clear-file-btn" onClick={clearFile}>✕</button>
          )}
        </div>
      </div>
    </InputGroup>
  );
};

// --- Main Application ---

function App() {
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [loading, setLoading] = useState(false);
  const abortControllerRef = useRef(null);
  
  const previewLogo = useLogoPreview(formData.logoFile);

  // Generic change handler
  const updateField = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Validation Logic
    if (!formData.shop_name.trim()) {
      return Swal.fire({ icon: 'error', title: 'Missing Info', text: 'Shop name is required.' });
    }
    if (!formData.upi_id.includes('@')) {
      return Swal.fire({ icon: 'warning', title: 'Invalid UPI', text: 'UPI ID must contain "@" (e.g., name@bank)' });
    }

    setLoading(true);

    // 2. Setup AbortController for this specific request
    abortControllerRef.current = new AbortController();

    // 3. Inform user about the "Cold Start"
    Swal.fire({
      title: 'Generating PDF',
      html: 'Designing your poster... <br/><b>Note:</b> Free servers may take up to 60s to wake up.',
      allowOutsideClick: false,
      showConfirmButton: false,
      didOpen: () => { Swal.showLoading(); }
    });

    try {
      const data = new FormData();
      data.append('shop_name', formData.shop_name.trim());
      data.append('upi_id', formData.upi_id.trim());
      data.append('tagline', formData.tagline || '');
      data.append('primary_color', formData.primary_color);
      data.append('text_color', formData.text_color);
      if (formData.logoFile) data.append('logo', formData.logoFile);

      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        body: data,
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) throw new Error('Failed to generate PDF');

      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${formData.shop_name.replace(/\s+/g, '_')}_QR.pdf`;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup download artifacts
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);

      Swal.fire({
        icon: 'success',
        title: 'Ready!',
        text: 'Your payment poster has been downloaded.',
        timer: 2500,
        showConfirmButton: false
      });

    } catch (err) {
      if (err.name === 'AbortError') return;
      
      Swal.fire({
        icon: 'error',
        title: 'Connection Error',
        text: 'Server is currently warming up. Please try again in 10-15 seconds.',
      });
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, []);

  return (
    <div className="app-layout">
      {/* FORM SECTION */}
      <section className="form-container">
        <form onSubmit={handleSubmit} className="qr-form">
          <header className="form-header">
            <h2>Brand Your QR</h2>
            <p>Create professional UPI posters instantly</p>
          </header>

          <InputGroup label="Shop Name">
            <input 
              type="text" 
              maxLength="25" 
              value={formData.shop_name} 
              onChange={(e) => updateField('shop_name', e.target.value)} 
              disabled={loading}
              placeholder="e.g. Sharma Sweets"
            />
          </InputGroup>

          <InputGroup label="UPI ID">
            <input 
              type="text" 
              value={formData.upi_id} 
              onChange={(e) => updateField('upi_id', e.target.value)} 
              disabled={loading}
              placeholder="name@okaxis"
            />
          </InputGroup>

          <InputGroup label="Tagline">
            <input 
              type="text" 
              value={formData.tagline} 
              onChange={(e) => updateField('tagline', e.target.value)} 
              disabled={loading}
              placeholder="Best quality in town"
            />
          </InputGroup>

          <div className="color-row">
            <InputGroup label="Brand Color">
              <input 
                type="color" 
                value={formData.primary_color} 
                onChange={(e) => updateField('primary_color', e.target.value)} 
              />
            </InputGroup>
            <InputGroup label="Text Color">
              <input 
                type="color" 
                value={formData.text_color} 
                onChange={(e) => updateField('text_color', e.target.value)} 
              />
            </InputGroup>
          </div>

          <FileUpload onFileChange={(file) => updateField('logoFile', file)} loading={loading} />

          <button 
            type="submit" 
            className={`submit-btn ${loading ? 'btn-loading' : ''}`} 
            disabled={loading}
          >
            {loading ? <span className="loader"></span> : 'Download PDF Poster'}
          </button>
        </form>
      </section>

      {/* PREVIEW SECTION */}
      <section className="preview-container">
        <div className="sticky-preview">
          <div 
            className="poster-preview" 
            style={{ 
              '--primary-color': formData.primary_color, 
              '--text-color': formData.text_color 
            }}
          >
            <div className="poster-header">
              <h1 className="shop-name">{formData.shop_name || "YOUR SHOP"}</h1>
              <p className="tagline">{formData.tagline || "Tagline here"}</p>
            </div>
            
            <div className="qr-section">
              <div className="qr-box">
                <div className="qr-placeholder">
                  <span className="qr-icon">QR</span>
                  {previewLogo && <img src={previewLogo} className="inner-logo" alt="logo" />}
                </div>
              </div>
              <div className="upi-display">{formData.upi_id || "upi@example"}</div>
            </div>
            
            <footer className="poster-footer">
               <p>Accepted Here: GPay • PhonePe • Paytm</p>
            </footer>
          </div>
        </div>
      </section>
    </div>
  );
}

export default App;