import React from 'react';

export const PreviewCard = ({ formData, logoUrl }) => {
  const { 
    shop_name, 
    tagline, 
    upi_id, 
    primary_color, 
    text_color, 
    instagram, 
    website 
  } = formData;

  return (
    <div className="sticky-preview">
      <div className="a4-sheet-container">
        <div 
          className="strong-preview" 
          style={{ 
            '--primary-color': primary_color, 
            '--text-color': text_color 
          }}
        >
          <div className="poster-top-accent"></div>
          
          <div className="poster-header">
            <h1 className="shop-name">{shop_name || "YOUR SHOP"}</h1>
            <p className="tagline">{tagline || "Tagline here"}</p>
          </div>

          <div className="qr-card">
            <div className="qr-placeholder-styled">
              {logoUrl ? (
                <img src={logoUrl} className="inner-logo" alt="logo preview" />
              ) : (
                <span style={{ opacity: 0.2 }}>QR</span>
              )}
            </div>
            <div className="scan-text">SCAN TO PAY</div>
            <div className="upi-display">{upi_id || "upi@example"}</div>
          </div>

          {(instagram || website) && (
            <div className="social-preview-section">
              {instagram && (
                <div className="social-item">
                  📸 @{instagram.replace('@', '')}
                </div>
              )}
              {website && (
                <div className="social-item">
                  🌐 {website.replace(/^https?:\/\//, '')}
                </div>
              )}
            </div>
          )}

          <footer className="poster-footer-v2">
            <div className="accepted-apps">
              <span>GPay</span>
              <span>PhonePe</span>
              <span>Paytm</span>
            </div>
            <p className="footer-label">ACCEPTED ON ALL UPI APPS</p>
          </footer>
        </div>
      </div>
    </div>
  );
};