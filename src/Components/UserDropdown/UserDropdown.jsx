import './UserDropdown.css';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../Services/supabase';

const UserDropdown = () => {

  const navigate = useNavigate();
  const handleLogout = async () => {
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
    <button type="button" className="dropdown-item">My Orders</button>
    <button type="button" className="dropdown-item">Wishlist</button>
    <button type="button" className="dropdown-item"
    onClick={handleLogout}>Logout</button>
  </div>
  )
};

export default UserDropdown;
