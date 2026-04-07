import React, { useState } from 'react';

const CustomerForm = ({ shopSlug, primaryColor }) => {
    const [phone, setPhone] = useState('');
    const [status, setStatus] = useState('idle'); // idle, loading, success

    const handleJoin = async (e) => {
        e.preventDefault();
        if (phone.length < 10) return;

        setStatus('loading');
        try {
            const response = await fetch(`http://localhost:5000/api/customers/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    shopSlug: shopSlug,
                    phoneNumber: phone
                })
            });

            if (response.ok) {
                setStatus('success');
                setPhone('');
            }
        } catch (err) {
            console.error("Capture error:", err);
            setStatus('idle');
        }
    };

    if (status === 'success') {
        return (
            <div className="lead-capture success-msg">
                <p style={{ color: '#27ae60' }}>🎉 You're on the list! Expect exclusive offers soon.</p>
            </div>
        );
    }

    return (
        <div className="lead-capture">
            <p>Join our Loyalty Club for 10% off!</p>
            <form onSubmit={handleJoin}>
                <input 
                    type="tel" 
                    placeholder="Enter Phone Number" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    maxLength="10"
                    required
                />
                <button 
                    type="submit" 
                    disabled={status === 'loading'}
                    style={{ backgroundColor: status === 'loading' ? '#ccc' : '#2d3436' }}
                >
                    {status === 'loading' ? 'Joining...' : 'Claim My Discount'}
                </button>
            </form>
        </div>
    );
};

export default CustomerForm;