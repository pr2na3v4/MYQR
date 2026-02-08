import React, { useState, useEffect, useCallback, useRef } from 'react';
import Swal from 'sweetalert2';
import './App.css';

// Constants
const API_ENDPOINT = 'https://myqr-backend-2q84.onrender.com/generate-pdf';
const INITIAL_FORM_DATA = {
  shop_name: 'My Shop',
  upi_id: 'payment@bank',
  tagline: 'Quality you can trust',
  primary_color: '#646cff',
  text_color: '#000000',
  logoFile: null
};

// --- Custom Hooks ---

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

const useFormState = (initialData) => {
  const [formData, setFormData] = useState(initialData);
  const updateField = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);
  const handleFileChange = useCallback((file) => {
    updateField('logoFile', file);
  }, [updateField]);
  const resetForm = useCallback(() => setFormData(initialData), [initialData]);
  return { formData, updateField, handleFileChange, resetForm };
};

// --- Helper Components ---

const InputGroup = ({ label, children }) => (
  <div className="input-group">
    {label && <label>{label}</label>}
    {children}
  </div>
);

const FileUpload = ({ onFileChange }) => {
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
      <div className="file-upload-area" onClick={() => fileInputRef.current?.click()}>
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="file-input" />
        <div className="file-upload-content">
          <span className="upload-icon">📁</span>
          <span className="upload-text">{fileName || 'Click to upload logo'}</span>
          {fileName && (
            <button type="button" className="clear-file-btn" onClick={(e) => {
              e.stopPropagation();
              setFileName('');
              onFileChange(null);
              if (fileInputRef.current) fileInputRef.current.value = '';
            }}>✕</button>
          )}
        </div>
      </div>
    </InputGroup>
  );
};

// --- Main App Component ---

function App() {
  const [loading, setLoading] = useState(false);
  const abortControllerRef = useRef(null);
  const { formData, updateField, handleFileChange } = useFormState(INITIAL_FORM_DATA);
  const previewLogo = useLogoPreview(formData.logoFile);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Validations with SweetAlert Pops
    if (!formData.shop_name.trim()) {
      return Swal.fire({ icon: 'error', title: 'Shop Name Missing', text: 'Please enter a name for your shop.' });
    }
    if (!formData.upi_id.includes('@')) {
      return Swal.fire({ icon: 'warning', title: 'Invalid UPI ID', text: 'UPI ID must contain "@" (e.g., shopname@bank)' });
    }

    setLoading(true);

    // 2. Loading Pop for Render's "Cold Start"
    Swal.fire({
      title: 'Designing Your Poster',
      html: 'Our server is generating your high-quality QR PDF.<br/><b>Note:</b> This may take 30-60s if the server is waking up.',
      allowOutsideClick: false,
      didOpen: () => { Swal.showLoading(); }
    });

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('shop_name', formData.shop_name.trim());
      formDataToSend.append('upi_id', formData.upi_id.trim());
      formDataToSend.append('tagline', formData.tagline || '');
      formDataToSend.append('primary_color', formData.primary_color);
      formDataToSend.append('text_color', formData.text_color);
      if (formData.logoFile) formDataToSend.append('logo', formData.logoFile);

      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        body: formDataToSend,
      });

      if (!response.ok) throw new Error('Generation failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${formData.shop_name.replace(/\s+/g, '_')}_QR.pdf`;
      link.click();

      // 3. Success Pop
      Swal.fire({
        icon: 'success',
        title: 'Downloaded!',
        text: 'Your professional QR poster is ready to print.',
        timer: 3000,
        showConfirmButton: false
      });

    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Server Timeout',
        text: 'The server is still warming up. Please try again in 10 seconds.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-layout">
      <section className="form-container">
        <form onSubmit={handleSubmit} className="qr-form">
          <div className="form-header">
            <h2>Brand Your QR</h2>
            <p>Customize your shop's payment poster</p>
          </div>

          <InputGroup label="Shop Name">
            <input type="text" maxLength="25" value={formData.shop_name} 
              onChange={(e) => updateField('shop_name', e.target.value)} disabled={loading} />
          </InputGroup>

          <InputGroup label="UPI ID">
            <input type="text" value={formData.upi_id} 
              onChange={(e) => updateField('upi_id', e.target.value)} disabled={loading} />
          </InputGroup>

          <InputGroup label="Tagline">
            <input type="text" value={formData.tagline} 
              onChange={(e) => updateField('tagline', e.target.value)} disabled={loading} />
          </InputGroup>

          <div className="color-row">
            <InputGroup label="Brand Color">
              <input type="color" value={formData.primary_color} onChange={(e) => updateField('primary_color', e.target.value)} />
            </InputGroup>
            <InputGroup label="Text Color">
              <input type="color" value={formData.text_color} onChange={(e) => updateField('text_color', e.target.value)} />
            </InputGroup>
          </div>

          <FileUpload onFileChange={handleFileChange} />

          <button type="submit" className={`submit-btn ${loading ? 'btn-loading' : ''}`} disabled={loading}>
            {loading ? <span className="loader"></span> : 'Download PDF Poster'}
          </button>
        </form>
      </section>

      {/* Live Preview Section */}
      <section className="preview-container">
        <div className="sticky-preview">
          <div className="poster-preview" style={{ '--primary-color': formData.primary_color, '--text-color': formData.text_color }}>
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
              <div className="upi-display">{formData.upi_id}</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default App;