import React from 'react';
import './App.css';

const About = () => {
  const features = [
    { title: "Instant Branding", desc: "Upload your logo and pick your colors. We handle the design architecture." },
    { title: "High Resolution", desc: "Generated in print-ready A4 PDF format for crystal clear physical signage." },
    { title: "Universal UPI", desc: "Compatible with all Indian payment apps including GPay, PhonePe, and Paytm." },
    { title: "Privacy First", desc: "We don't store your UPI or Shop details. Everything is processed on-the-fly." }
  ];

  return (
    <div className="about-page">
      <section className="about-hero">
        <h1 className="hero-title">Empowering Small Businesses</h1>
        <p className="hero-subtitle">
          In a digital-first India, your payment desk shouldn't look generic. 
          We help you turn a simple QR code into a professional brand asset.
        </p>
      </section>

      <section className="about-grid">
        {features.map((f, i) => (
          <div key={i} className="about-card">
            <div className="card-dot" />
            <h3>{f.title}</h3>
            <p>{f.desc}</p>
          </div>
        ))}
      </section>

      <section className="about-mission">
        <div className="mission-content">
          <h2>Our Mission</h2>
          <p>
            Our goal is to bridge the gap between "functional" and "professional." 
            Local vendors deserve the same design quality as top-tier retailers. 
            With our tool, you can generate a custom, beautiful payment poster 
            in less than 30 seconds—for free.
          </p>
        </div>
      </section>

      <footer className="about-footer">
        <p>© 2026 MyQR Generator. Built for the Modern Merchant.</p>
      </footer>
    </div>
  );
};

export default About;