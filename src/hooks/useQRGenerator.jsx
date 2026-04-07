import { useState, useEffect, useRef } from 'react';
import Swal from 'sweetalert2';

const API_ENDPOINT = 'https://myqr-backend-2q84.onrender.com/generate-pdf';
const REGISTER_ENDPOINT = 'https://myqr-backend-node.onrender.com/api/shops/register';

export const useQRGenerator = (initialData) => {
  const [formData, setFormData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [logoUrl, setLogoUrl] = useState(null);
  const abortControllerRef = useRef(null);

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
    setLoading(true);
    abortControllerRef.current = new AbortController();
    
    Swal.fire({ title: 'Generating...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

    try {
      // 1. Register with Node Backend
      const saveResponse = await fetch(REGISTER_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: formData.shop_name,
          upiId: formData.upi_id,
          tagline: formData.tagline,
          theme: { primaryColor: formData.primary_color }
        })
      });
      
      const { slug } = await saveResponse.json();
      const landingUrl = `https://business-paymentqr-generator.netlify.app/landing/${slug}`;

      // 2. Generate PDF via Python Backend
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'logoFile' && formData[key]) data.append('logo', formData[key]);
        else if (key === 'website') data.append('website_url', formData[key]);
        else data.append(key, formData[key]);
      });
      data.append('landing_url', landingUrl);

      const response = await fetch(API_ENDPOINT, { 
        method: 'POST', 
        body: data, 
        signal: abortControllerRef.current.signal 
      });

      if (!response.ok) throw new Error('Generation failed');

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${formData.shop_name}_QR.pdf`;
      link.click();
      
      Swal.fire({ icon: 'success', title: 'Downloaded!', timer: 2000, showConfirmButton: false });
    } catch (err) {
      if (err.name !== 'AbortError') {
        Swal.fire({ icon: 'error', title: 'Error', text: 'Something went wrong. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  return { formData, loading, logoUrl, updateField, applyPreset, handleSubmit };
};