import './UserDropdown.css';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../Services/supabase';

const UserDropdown = ({onClose}) => {

  const navigate = useNavigate();

    const handleMyOrders = (event) => {
    event.stopPropagation();
    onClose?.();
    navigate('/my-orders');
  };

  const handleLogout = async (event) => {
    event.stopPropagation();
    onClose?.();
    const { error } = 
    await supabase.auth.signOut();

    if(error) {
        console.error(error.message);
        return;
    }
    navigate('/');
  };
  
  return (
  <div className="user-dropdown" aria-label="User menu">
    <button type="button" className="dropdown-item" 
    onClick={(event) => handleMyOrders(event) }>My Orders</button>
    <button type="button" className="dropdown-item">Wishlist</button>
    <button type="button" className="dropdown-item"
    onClick={(event) => handleLogout(event)}>Logout</button>
  </div>
  )
};

export default UserDropdown;
