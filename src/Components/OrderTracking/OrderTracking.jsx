import React from 'react';
import './OrderTracking.css';
import { FaCheck } from 'react-icons/fa';

const OrderTracking = ({ status }) => {
    // Normalise status
    const currentStatus = (status || 'Placed').toLowerCase();
    
    const steps = [
        { key: 'placed', label: 'Order Placed' },
        { key: 'out for delivery', label: 'Out for Delivery' },
        { key: 'delivered', label: 'Delivered' }
    ];

    let activeIndex = 0;
    if (currentStatus === 'out for delivery') activeIndex = 1;
    if (currentStatus === 'delivered') activeIndex = 2;

    return (
        <div className="order-tracking-container">
            <div className="order-tracking-timeline">
                {steps.map((step, index) => {
                    const isCompleted = index <= activeIndex;
                    const isActive = index === activeIndex;
                    
                    return (
                        <div key={step.key} className={`tracking-step ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}>
                            <div className="step-icon-container">
                                <div className="step-icon">
                                    {isCompleted ? <FaCheck /> : <span className="empty-dot"></span>}
                                </div>
                                {index < steps.length - 1 && (
                                    <div className={`step-line ${index < activeIndex ? 'completed-line' : ''}`}></div>
                                )}
                            </div>
                            <div className="step-label">{step.label}</div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default OrderTracking;
