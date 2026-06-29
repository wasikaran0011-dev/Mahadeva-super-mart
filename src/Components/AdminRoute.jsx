import { Navigate } from 'react-router-dom';

const AdminRoute = ({
    session, loading, isAdmin, children
}) => {
    if (loading) {
        return (
            <div
                style={{
                    height: '100vh',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    flexDirection: 'column',
                    gap: '12px',
                    fontFamily: 'inherit',
                    color: '#555',
                }}
            >
                <div
                    style={{
                        width: '40px',
                        height: '40px',
                        border: '3px solid #e5e5e5',
                        borderTop: '3px solid #e53935',
                        borderRadius: '50%',
                        animation: 'spin 0.8s linear infinite',
                    }}
                />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                <span style={{ fontSize: '0.9rem' }}>Verifying Admin Access…</span>
            </div>
        );
    }
    if (!session) {
        return <Navigate to='/' replace />;
    }
    if (!isAdmin) {
        return <Navigate to='/Home' replace />;
    }
    return children;
};

export default AdminRoute;
