export const formatDate = (dateString) => {
    if (!dateString) return 'Date Unavailable';
    try {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    } catch {
        return 'Invalid Date';
    }
};

export const formatRupee = (num) => {
    if (num === null || num === undefined || isNaN(num)) return '₹0.00';
    return '₹' + Number(num).toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
};

export const getStatusClass = (status) => {
    if (!status) return 'unknown';
    const s = String(status).toLowerCase();
    switch (s) {
        case 'delivered': return 'delivered';
        case 'placed':
        case 'pending': return 'pending';
        case 'cancelled':
        case 'canceled': return 'cancelled';
        case 'processing':
        case 'confirmed':
        case 'packed':
        case 'out for delivery': return 'processing';
        default: return 'unknown';
    }
};

export const getStatusLabel = (status) => {
    if (!status) return 'Unknown';
    const s = String(status).toLowerCase();
    switch (s) {
        case 'delivered': return 'Delivered';
        case 'placed': return 'Placed';
        case 'pending': return 'Pending';
        case 'cancelled':
        case 'canceled': return 'Cancelled';
        case 'processing': return 'Processing';
        case 'confirmed': return 'Confirmed';
        case 'packed': return 'Packed';
        case 'out for delivery': return 'Out For Delivery';
        default: return String(status).charAt(0).toUpperCase() + String(status).slice(1);
    }
};

export const getPaymentStatusLabel = (status) => {
    if (!status) return 'Unknown';
    const s = String(status).toLowerCase();
    switch (s) {
        case 'pending': return 'Pending';
        case 'paid': return 'Paid';
        case 'failed': return 'Failed';
        case 'refunded': return 'Refunded';
        default: return String(status).charAt(0).toUpperCase() + String(status).slice(1);
    }
};

export const getPaymentMethodLabel = (method) => {
    if (!method) return 'Unknown Method';
    const m = String(method).toLowerCase();
    if (m === 'cod') return 'Cash on Delivery';
    if (m === 'online') return 'Online Payment';
    return method;
};
