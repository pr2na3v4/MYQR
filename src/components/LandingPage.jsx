import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import PayButton from './PayButton';
import CustomerForm from './CustomerForm';
import '../styles/LandingPage.css';

const LandingPage = () => {
    const { slug } = useParams();
    const [shop, setShop] = useState(null);

    useEffect(() => {
        fetch(`https://myqr-backend-node.onrender.com/api/shops/landing/${slug}`)
            .then(res => res.json())
            .then(data => setShop(data))
            .catch(err => console.error("Load error", err));
    }, [slug]);

    if (!shop) return <div className="loader">Loading...</div>;

    return (
        <div className="v2-landing" style={{ '--brand': shop.theme.primaryColor }}>
            <div className="customer-card">
                <img src={shop.logoUrl || '/default-shop.png'} className="brand-logo" alt="logo" />
                <h1>{shop.businessName}</h1>
                <p>{shop.tagline}</p>
                
                <PayButton shop={shop} />
                
                <CustomerForm shopSlug={slug} />

                <footer className="trust-footer">
                    <p>Secure UPI Payment</p>
                    <div className="apps-row">
                        <span>GPay</span> • <span>PhonePe</span> • <span>Paytm</span>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default LandingPage;