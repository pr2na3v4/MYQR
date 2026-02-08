import React, { useState, useEffect, useCallback, useRef } from 'react';
import './App.css';

// Constants for better maintainability
const API_ENDPOINT = 'https://myqr-backend-2q84.onrender.com/generate-pdf';
const INITIAL_FORM_DATA = {
  shop_name: 'My Shop',
  upi_id: 'payment@bank',
  tagline: 'Quality you can trust',
  primary_color: '#646cff',
  text_color: '#000000',
  logoFile: null
};

// Custom hook for logo preview
const useLogoPreview = (logoFile) => {
  const [previewLogo, setPreviewLogo] = useState(null);

  useEffect(() => {
    if (!logoFile) {
      setPreviewLogo(null);
      return;
    }

    const objectUrl = URL.createObjectURL(logoFile);
    setPreviewLogo(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [logoFile]);

  return previewLogo;
};

// Validation utilities
const validateUPI = (upiId) => upiId.includes('@');
const sanitizeFileName = (name) => name.replace(/\s+/g, '_');

// Custom hook for form state management
const useFormState = (initialData) => {
  const [formData, setFormData] = useState(initialData);
  
  const updateField = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleFileChange = useCallback((file) => {
    updateField('logoFile', file);
  }, [updateField]);

  const resetForm = useCallback(() => {
    setFormData(initialData);
  }, [initialData]);

  return {
    formData,
    updateField,
    handleFileChange,
    resetForm
  };
};

// Reusable form components
const FormHeader = () => (
  <div className="form-header">
    <h2>Brand Your QR</h2>
    <p>Customize your shop's payment poster</p>
  </div>
);

const InputGroup = ({ label, children, className = '' }) => (
  <div className={`input-group ${className}`}>
    {label && <label>{label}</label>}
    {children}
  </div>
);

const ColorPicker = ({ label, value, onChange, name }) => (
  <InputGroup label={label}>
    <div className="color-picker-container">
      <input 
        type="color" 
        value={value}
        onChange={(e) => onChange(name, e.target.value)}
        className="color-input"
      />
      <span className="color-value">{value}</span>
    </div>
  </InputGroup>
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
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="file-input"
        />
        <div className="file-upload-content">
          <span className="upload-icon">📁</span>
          <span className="upload-text">
            {fileName || 'Click to upload logo'}
          </span>
          {fileName && (
            <button 
              type="button" 
              className="clear-file-btn"
              onClick={(e) => {
                e.stopPropagation();
                setFileName('');
                onFileChange(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
            >
              ✕
            </button>
          )}
        </div>
      </div>
    </InputGroup>
  );
};

// Main App Component
function App() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const abortControllerRef = useRef(null);
  
  const { formData, updateField, handleFileChange } = useFormState(INITIAL_FORM_DATA);
  const previewLogo = useLogoPreview(formData.logoFile);

  const validateForm = useCallback(() => {
    if (!formData.shop_name.trim()) {
      setError('Shop name is required');
      return false;
    }

    if (!validateUPI(formData.upi_id)) {
      setError('Please enter a valid UPI ID (e.g., name@bank)');
      return false;
    }

    setError('');
    return true;
  }, [formData.shop_name, formData.upi_id]);

  const generatePDF = useCallback(async () => {
    if (!validateForm()) return null;

    setLoading(true);
    setError('');

    // Abort previous request if exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('shop_name', formData.shop_name.trim());
      formDataToSend.append('upi_id', formData.upi_id.trim());
      formDataToSend.append('tagline', formData.tagline?.trim() || '');
      formDataToSend.append('primary_color', formData.primary_color);
      formDataToSend.append('text_color', formData.text_color);

      if (formData.logoFile) {
        formDataToSend.append('logo', formData.logoFile);
      }

      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        body: formDataToSend,
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      const blob = await response.blob();
      
      // Check if it's actually a PDF
      if (blob.type !== 'application/pdf') {
        throw new Error('Received non-PDF response from server');
      }

      return blob;
    } catch (err) {
      if (err.name === 'AbortError') {
        console.log('Request was aborted');
        return null;
      }
      throw err;
    } finally {
      abortControllerRef.current = null;
    }
  }, [formData, validateForm]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const pdfBlob = await generatePDF();
      
      if (pdfBlob) {
        const url = window.URL.createObjectURL(pdfBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${sanitizeFileName(formData.shop_name)}_MYQR.pdf`;
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        
        // Cleanup
        setTimeout(() => {
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        }, 100);
      }
    } catch (error) {
      console.error('PDF generation failed:', error);
      setError(
        error.message.includes('fetch')
          ? 'Could not connect to the server. Please ensure the backend is running.'
          : `Error: ${error.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return (
    <div className="app-layout">
      {/* Form Section */}
      <section className="form-container">
        <form onSubmit={handleSubmit} className="qr-form" noValidate>
          <FormHeader />
          
          {error && (
            <div className="error-message">
              ⚠️ {error}
            </div>
          )}

          <InputGroup label="Shop Name">
            <input
              type="text"
              placeholder="e.g. Sharma Sweets"
              maxLength="25"
              value={formData.shop_name}
              onChange={(e) => updateField('shop_name', e.target.value)}
              className={error && !formData.shop_name.trim() ? 'input-error' : ''}
              required
              disabled={loading}
            />
            <div className="character-count">
              {formData.shop_name.length}/25
            </div>
          </InputGroup>

          <InputGroup label="UPI ID">
            <input
              type="text"
              placeholder="name@okaxis"
              value={formData.upi_id}
              onChange={(e) => updateField('upi_id', e.target.value)}
              className={error && !validateUPI(formData.upi_id) ? 'input-error' : ''}
              required
              disabled={loading}
            />
          </InputGroup>

          <InputGroup label="Tagline (Optional)">
            <input
              type="text"
              placeholder="Best quality in town"
              value={formData.tagline}
              onChange={(e) => updateField('tagline', e.target.value)}
              disabled={loading}
            />
          </InputGroup>

          <div className="color-row">
            <ColorPicker
              label="Brand Color"
              value={formData.primary_color}
              onChange={updateField}
              name="primary_color"
            />
            <ColorPicker
              label="Text Color"
              value={formData.text_color}
              onChange={updateField}
              name="text_color"
            />
          </div>

          <FileUpload onFileChange={handleFileChange} />

          <button
            type="submit"
            className={`submit-btn ${loading ? 'loading' : ''}`}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Generating PDF...
              </>
            ) : (
              'Download PDF Poster'
            )}
          </button>

          <div className="form-footer">
            <p className="form-hint">
              ⓘ Poster will be generated in A4 format with embedded QR code
            </p>
          </div>
        </form>
      </section>

      {/* Preview Section */}
      <section className="preview-container">
        <div className="sticky-preview">
          <div className="preview-header">
            <h3>Live Preview</h3>
            <span className="preview-badge">A4 Size</span>
          </div>
          
          <div 
            className="poster-preview"
            style={{ 
              '--primary-color': formData.primary_color,
              '--text-color': formData.text_color
            }}
          >
            <div className="poster-header">
              <h1 className="shop-name">
                {formData.shop_name || "YOUR SHOP NAME"}
              </h1>
              <p className="tagline">
                {formData.tagline || "Your tagline goes here"}
              </p>
            </div>
            
            <div className="qr-section">
              <div className="qr-box">
                <div className="qr-placeholder">
                  <span className="qr-icon">QR</span>
                  {previewLogo && (
                    <img 
                      src={previewLogo} 
                      className="inner-logo" 
                      alt="Shop logo" 
                      onError={(e) => {
                        e.target.style.display = 'none';
                        console.error('Failed to load logo');
                      }}
                    />
                  )}
                </div>
              </div>
              <div className="upi-display">
                {formData.upi_id || "upi@example"}
              </div>
            </div>

            <div className="footer-icons">
              <span className="payment-icon">💳</span>
              <span>GPay</span>
              <span className="divider">•</span>
              <span>PhonePe</span>
              <span className="divider">•</span>
              <span>Paytm</span>
              <span className="payment-icon">📱</span>
            </div>
          </div>
          
          <div className="preview-footer">
            <p className="preview-note">
              Colors and content update in real-time
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default App;