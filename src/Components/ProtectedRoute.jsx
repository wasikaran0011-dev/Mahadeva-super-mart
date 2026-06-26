import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({
    session, loading, children
}) => {
    if(loading) {
        return null;
    }
    if(!session) {
        return <Navigate to='/' />
    }
    return children;
};

export default ProtectedRoute;