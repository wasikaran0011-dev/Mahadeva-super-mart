import './UserDropdown.css';
import { useNavigate } from 'react-router-dom';

const UserDropdown = ({onClose, userName}) => {
  const navigate = useNavigate();

  const handleMyAccount = (event) => {
    event.stopPropagation();
    onClose?.();
    navigate('/my-account');
  };

  const handleMyOrders = (event) => {
    event.stopPropagation();
    onClose?.();
    navigate('/my-orders');
  };
  
  return (
    <div className="user-dropdown" aria-label="User menu">
      {userName && (
        <div className="user-dropdown-greeting">
          Hi, {userName}!
        </div>
      )}
      <button 
        type="button" 
        className="dropdown-item" 
        onClick={(event) => handleMyAccount(event)}
      >
        My Account
      </button>
      <button 
        type="button" 
        className="dropdown-item" 
        onClick={(event) => handleMyOrders(event)}
      >
        My Orders
      </button>
    </div>
  );
};

export default UserDropdown;
