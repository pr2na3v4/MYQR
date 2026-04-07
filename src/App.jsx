import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useQRGenerator } from './hooks/useQRGenerator';
import { PRESETS, INITIAL_FORM_DATA } from './config/constants';
import { PreviewCard } from './components/PreviewCard';
import { FileUpload, InputGroup } from './components/FormControls';
import About from './About';
import LandingPage from './components/LandingPage';
import './App.css';

const GeneratorView = () => {
  const { formData, loading, logoUrl, updateField, applyPreset, handleSubmit } = useQRGenerator(INITIAL_FORM_DATA);

  return (
    <div className="app-layout">
      <section className="form-container">
        <div className="qr-form">
          <header className="form-header">
            <h2>Brand Your QR</h2>
            <p>Create professional UPI posters instantly</p>
          </header>
          
          <div className="preset-section">
            <p className="form-hint">Try a preset:</p>
            <div className="preset-container">
              {PRESETS.map(p => (
                <button key={p.id} className="preset-chip" onClick={() => applyPreset(p.data)}>
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="form-grid-vertical">
            <InputGroup label="Shop Name">
              <input type="text" value={formData.shop_name} onChange={e => updateField('shop_name', e.target.value)} />
            </InputGroup>
            
            <InputGroup label="UPI ID">
              <input type="text" value={formData.upi_id} onChange={e => updateField('upi_id', e.target.value)} />
            </InputGroup>

            <div className="social-grid">
              <InputGroup label="Instagram">
                <input type="text" placeholder="@handle" value={formData.instagram} onChange={e => updateField('instagram', e.target.value)} />
              </InputGroup>
              <InputGroup label="Website">
                <input type="text" placeholder="www.site.com" value={formData.website} onChange={e => updateField('website', e.target.value)} />
              </InputGroup>
            </div>

            <InputGroup label="Tagline">
              <input type="text" value={formData.tagline} onChange={e => updateField('tagline', e.target.value)} />
            </InputGroup>

            <div className="color-row">
              <InputGroup label="Brand Color">
                <input type="color" value={formData.primary_color} onChange={e => updateField('primary_color', e.target.value)} />
              </InputGroup>
              <InputGroup label="Text Color">
                <input type="color" value={formData.text_color} onChange={e => updateField('text_color', e.target.value)} />
              </InputGroup>
            </div>

            <FileUpload onFileChange={file => updateField('logoFile', file)} loading={loading} />
            
            <button type="submit" className={`submit-btn ${loading ? 'btn-loading' : ''}`} disabled={loading}>
              {loading ? 'Processing...' : 'Download PDF Poster'}
            </button>
          </form>
        </div>
      </section>

      <section className="preview-container">
        <PreviewCard formData={formData} logoUrl={logoUrl} />
      </section>
    </div>
  );
};

export default function App() {
  return (
    <Router>
      <div className="app-shell">
        <nav className="navbar">
          <div className="nav-logo">MyQR</div>
          <div className="nav-links">
            <Link to="/" className="nav-item">Generator</Link>
            <Link to="/about" className="nav-item">About Us</Link>
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<GeneratorView />} />
          <Route path="/about" element={<About />} />
          <Route path="/landing/:slug" element={<LandingPage />} />
        </Routes>
      </div>
    </Router>
  );
}