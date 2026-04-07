import React from 'react';

const PayButton = ({ shop, onPayInitiated }) => {
    const handlePayment = () => {
        // 1. Construct the deep link
        // pa = UPI ID, pn = Recipient Name, cu = Currency
        const upiLink = `upi://pay?pa=${shop.upiId}&pn=${encodeURIComponent(shop.businessName)}&cu=INR`;

        // 2. Trigger the OS to open GPay/PhonePe/Paytm
        window.location.href = upiLink;

        // 3. Optional: Callback to parent for analytics
        if (onPayInitiated) onPayInitiated();
    };

    return (
        <button className="pay-now-btn" onClick={handlePayment}>
            <span className="pay-icon">⚡</span>
            Pay Now
        </button>
    );
};

export default PayButton;