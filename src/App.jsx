import React, { useState, useEffect, useCallback, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import About from './About'; // Ensure the filename is exactly 'About.js'
import Swal from 'sweetalert2';
import './App.css';

// Configuration
const API_ENDPOINT = 'https://myqr-backend-2q84.onrender.com/generate-pdf';

const INITIAL_FORM_DATA = {
  shop_name: 'My Shop',
  upi_id: 'payment@bank',
  instagram: '',
  website: '',
  tagline: 'Quality you can trust',
  primary_color: '#646cff',
  text_color: '#000000',
  logoFile: null
};

const PRESETS = [
  { id: 'bakery', label: '🥐 Bakery', data: { shop_name: 'The Golden Whisk', tagline: 'Artisan Breads & Pastries', primary_color: '#d4a373', text_color: '#ffffff', upi_id: 'bakery@upi' }},
  { id: 'coffee', label: '☕ Coffee Bar', data: { shop_name: 'Brew & Bean', tagline: 'Freshly Roasted Daily', primary_color: '#463f3a', text_color: '#ffffff', upi_id: 'coffee@paytm' }},
  { id: 'pizza', label: '🍕 Pizzeria', data: { shop_name: 'Mama Mia Pizza', tagline: 'Authentic Wood-fired Pizza', primary_color: '#e63946', text_color: '#ffffff', upi_id: 'pizza@okaxis' }},
  { id: 'juice', label: '🥤 Juice Bar', data: { shop_name: 'Fresh Squeeze', tagline: '100% Organic Cold Press', primary_color: '#52b788', text_color: '#ffffff', upi_id: 'juice@upi' }},
  { id: 'burger', label: '🍔 Burger Joint', data: { shop_name: 'Stack House', tagline: 'Juiciest Patties in Town', primary_color: '#f4a261', text_color: '#264653', upi_id: 'burger@okicici' }},
  { id: 'boutique', label: '👗 Boutique', data: { shop_name: 'Elegance Attire', tagline: 'Curated Fashion for You', primary_color: '#ffb4a2', text_color: '#6d6875', upi_id: 'fashion@upi' }},
  { id: 'jewelry', label: '💎 Jewelry', data: { shop_name: 'Luxe Ornaments', tagline: 'Timeless Gold & Diamonds', primary_color: '#003049', text_color: '#eae2b7', upi_id: 'luxe@hdfc' }},
  { id: 'sneakers', label: '👟 Kick Store', data: { shop_name: 'Sole Searcher', tagline: 'Premium Sneaker Hub', primary_color: '#14213d', text_color: '#fca311', upi_id: 'kicks@upi' }},
  { id: 'flowers', label: '🌸 Florist', data: { shop_name: 'Petal Pushers', tagline: 'Flowers for Every Occasion', primary_color: '#cdb4db', text_color: '#5e548e', upi_id: 'blooms@okaxis' }},
  { id: 'thrift', label: '♻️ Thrift Shop', data: { shop_name: 'Vintage Finds', tagline: 'Pre-loved, Well-lived', primary_color: '#606c38', text_color: '#fefae0', upi_id: 'thrift@upi' }},
  { id: 'tech', label: '💻 Tech Repair', data: { shop_name: 'Pixel Repair Co.', tagline: 'Gadget Fixes & Upgrades', primary_color: '#0077b6', text_color: '#ffffff', upi_id: 'pixel@okaxis' }},
  { id: 'barber', label: '💈 Barbershop', data: { shop_name: 'Sharp Cuts', tagline: 'Classic Grooming & Shaves', primary_color: '#1b1b1b', text_color: '#e0e0e0', upi_id: 'cuts@upi' }},
  { id: 'gym', label: '🏋️ Fitness Hub', data: { shop_name: 'Iron Temple Gym', tagline: 'Push Your Limits', primary_color: '#bc4749', text_color: '#ffffff', upi_id: 'gym@upi' }},
  { id: 'pet', label: '🐾 Pet Grooming', data: { shop_name: 'Paws & Claws', tagline: 'Spa Day for Your Pets', primary_color: '#4cc9f0', text_color: '#ffffff', upi_id: 'pets@okicici' }},
  { id: 'studio', label: '📸 Photo Studio', data: { shop_name: 'Focus Frames', tagline: 'Capturing Your Best Moments', primary_color: '#7209b7', text_color: '#ffffff', upi_id: 'studio@upi' }},
  { id: 'dark', label: '🌑 Stealth', data: { shop_name: 'Modern Solutions', tagline: 'Minimalism at Its Best', primary_color: '#212529', text_color: '#f8f9fa', upi_id: 'minimal@upi' }},
  { id: 'neon', label: '🌈 Neon Vibe', data: { shop_name: 'Retro Arcade', tagline: 'Level Up Your Game', primary_color: '#ff006e', text_color: '#ffffff', upi_id: 'retro@upi' }},
  { id: 'organic', label: '🌿 Earthy', data: { shop_name: 'Eco Living', tagline: 'Sustainable Home Goods', primary_color: '#2d6a4f', text_color: '#d8f3dc', upi_id: 'eco@upi' }},
  { id: 'royal', label: '🏰 Royal', data: { shop_name: 'Imperial Suites', tagline: 'Luxury You Deserve', primary_color: '#6a040f', text_color: '#ffb703', upi_id: 'royal@upi' }},
  { id: 'candy', label: '🍭 Candy Shop', data: { shop_name: 'Sugar Rush', tagline: 'Sweet Treats & Smiles', primary_color: '#f72585', text_color: '#ffffff', upi_id: 'sugar@upi' }},
  { id: 'blue', label: '🌊 Ocean', data: { shop_name: 'Marine Co.', tagline: 'Deep Sea Explorations', primary_color: '#4895ef', text_color: '#f1f2f6', upi_id: 'marine@upi' }}
];

// --- Sub-Components ---
const InputGroup = ({ label, children, className = "" }) => (
  <div className={`input-group ${className}`}>
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

  return (
    <InputGroup label="Upload Shop Logo">
      <div className={`file-upload-area ${loading ? 'disabled' : ''}`} onClick={() => !loading && fileInputRef.current?.click()}>
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} style={{ display: 'none' }} disabled={loading} />
        <div className="file-upload-content">
          <span className="upload-icon">📁</span>
          <span className="upload-text">{fileName || 'Click to upload logo'}</span>
        </div>
      </div>
    </InputGroup>
  );
};

// --- Main Generator View ---
const GeneratorView = () => {
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [loading, setLoading] = useState(false);
  const abortControllerRef = useRef(null);

  const previewLogo = (file) => file ? URL.createObjectURL(file) : null;
  const [logoUrl, setLogoUrl] = useState(null);

  useEffect(() => {
    if (formData.logoFile) {
      const url = URL.createObjectURL(formData.logoFile);
      setLogoUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setLogoUrl(null);
  }, [formData.logoFile]);

  const updateField = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  const applyPreset = (presetData) => {
    setFormData(prev => ({ ...prev, ...presetData }));
    Swal.fire({ toast: true, position: 'top-end', icon: 'info', title: 'Preset Applied!', showConfirmButton: false, timer: 1500 });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.shop_name.trim() || !formData.upi_id.includes('@')) {
      return Swal.fire({ icon: 'error', title: 'Check Inputs', text: 'Ensure shop name is set and UPI ID is valid.' });
    }

    setLoading(true);
    abortControllerRef.current = new AbortController();
    Swal.fire({ title: 'Generating...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'logoFile' && formData[key]) data.append('logo', formData[key]);
        else if (key === 'website') data.append('website_url', formData[key]);
        else data.append(key, formData[key]);
      });

      const response = await fetch(API_ENDPOINT, { method: 'POST', body: data, signal: abortControllerRef.current.signal });
      if (!response.ok) throw new Error();

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${formData.shop_name}_QR.pdf`;
      link.click();
      Swal.fire({ icon: 'success', title: 'Downloaded!', timer: 2000, showConfirmButton: false });
    } catch (err) {
      if (err.name !== 'AbortError') Swal.fire({ icon: 'error', title: 'Error', text: 'Server Busy. Try again.' });
    } finally {
      setLoading(false);
    }
  };

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
                <button key={p.id} className="preset-chip" onClick={() => applyPreset(p.data)}>{p.label}</button>
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
              <InputGroup label="Brand Color"><input type="color" value={formData.primary_color} onChange={e => updateField('primary_color', e.target.value)} /></InputGroup>
              <InputGroup label="Text Color"><input type="color" value={formData.text_color} onChange={e => updateField('text_color', e.target.value)} /></InputGroup>
            </div>
            <FileUpload onFileChange={file => updateField('logoFile', file)} loading={loading} />
            <button type="submit" className={`submit-btn ${loading ? 'btn-loading' : ''}`} disabled={loading}>
              {loading ? 'Processing...' : 'Download PDF Poster'}
            </button>
          </form>
        </div>
      </section>

      <section className="preview-container">
        <div className="sticky-preview">
          <div className="a4-sheet-container">
            <div className="strong-preview" style={{ '--primary-color': formData.primary_color, '--text-color': formData.text_color }}>
              <div className="poster-top-accent"></div>
              <div className="poster-header">
                <h1 className="shop-name">{formData.shop_name || "YOUR SHOP"}</h1>
                <p className="tagline">{formData.tagline || "Tagline here"}</p>
              </div>
              <div className="qr-card">
                <div className="qr-placeholder-styled">
                  {logoUrl ? <img src={logoUrl} className="inner-logo" alt="logo" /> : <span style={{opacity: 0.2}}>QR</span>}
                </div>
                <div className="scan-text">SCAN TO PAY</div>
                <div className="upi-display">{formData.upi_id || "upi@example"}</div>
              </div>
              {(formData.instagram || formData.website) && (
                <div className="social-preview-section">
                  {formData.instagram && <div className="social-item">📸 @{formData.instagram.replace('@','')}</div>}
                  {formData.website && <div className="social-item">🌐 {formData.website.replace(/^https?:\/\//, '')}</div>}
                </div>
              )}
              <footer className="poster-footer-v2">
                <div className="accepted-apps"><span>GPay</span><span>PhonePe</span><span>Paytm</span></div>
                <p className="footer-label">ACCEPTED ON ALL UPI APPS</p>
              </footer>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

// --- Main App Shell ---
function App() {
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
        </Routes>
      </div>
    </Router>
  );
}

export default App;