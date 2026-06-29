import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../Services/supabase.js';
import './Header.css';
import Logo from '../../assets/Logo.png';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../../Context/Cartcontext.jsx';
import UserDropdown from '../UserDropdown/UserDropdown';
import { getSearchSuggestions   } from '../../Services/productServices.js';

const Header = () => {
  const { cartItems } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState(() => (
    new URLSearchParams(location.search).get('q') ?? ''
  ));
  const [ userName,setUserName] = useState(null);
  const [ isInputFocused,setIsInputFocused ] = useState(false);
  const [ suggestions,setSuggestions ] = useState([]);
  const [ isSearching,setIsSearching ] = useState(false);
  const [ showDropdown,setShowDropdown ] = useState(false);
  const searchRef = useRef(null);
  const dropdownRef = useRef(null);

  const shouldShowSuggestions = isInputFocused && searchTerm.trim().length >= 2 && suggestions.length > 0;


  useEffect(() => {
    const fetchSuggestions = async() => {
      if(searchTerm.trim().length < 2) {
        setSuggestions([]); 
        return;
      }

      try {
      setIsSearching(true);
      const data = await getSearchSuggestions(searchTerm);
      setSuggestions(data || []);
      } catch(error) {
        console.log(error);
        setSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    };
    const timer = setTimeout(fetchSuggestions,300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

      useEffect(() => {
      const query = new URLSearchParams(location.search).get('q') ?? '';
      setSearchTerm(query);
    }, [location.search])

  const fetchProfileName = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', userId)
        .single();
      if (!error && data) {
        return data.full_name;
      }
    } catch (err) {
      console.error('Error fetching name from profiles:', err);
    }
    return null;
  };

  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const { data:{ user } } = await supabase.auth.getUser();
        if(user) {
          const dbName = await fetchProfileName(user.id);
          const fullName = dbName || user.user_metadata?.full_name || '';
          setUserName(fullName.trim().split(/\s+/)[0] || user.email || null);
        }
      } catch(error) {
        console.error("Failed to load user", error);
      }
    };
    getCurrentUser();
  }, []);

  useEffect(() => {
    const handleProfileUpdate = async () => {
      try {
        const { data:{ user } } = await supabase.auth.getUser();
        if(user) {
          const dbName = await fetchProfileName(user.id);
          const fullName = dbName || user.user_metadata?.full_name || '';
          setUserName(fullName.trim().split(/\s+/)[0] || user.email || null);
        }
      } catch (err) {
        console.error(err);
      }
    };

    window.addEventListener('profile-updated', handleProfileUpdate);

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      const user = session?.user;
      if(user) {
        const dbName = await fetchProfileName(user.id);
        const fullName = dbName || user.user_metadata?.full_name || '';
        setUserName(fullName.trim().split(/\s+/)[0] || user.email); 
      } else {
        setUserName(null);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
      window.removeEventListener('profile-updated', handleProfileUpdate);
    };
  }, []);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if(searchRef.current && !searchRef.current.contains(event.target)) {
        setIsInputFocused(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);

    return () => {document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  useEffect(() => {
    const dropdownOutsideClick = (event) => {
      if(dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", dropdownOutsideClick);

    return () => {
      document.removeEventListener("mousedown", dropdownOutsideClick);
    }
  }, []);

  const cartCount  = cartItems.reduce((total,item) => total+item.quantity, 0);

  const handleSearch = (event) => {
    event.preventDefault();
    setIsInputFocused(false);
    navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
  };

  console.log('ShowDropdown: ', showDropdown);

  return (
    <header className="main-header" id="main-header">
      <div className="header-top-row">
        {/* Left: Logo */}
        <Link to="/Home" className="logo-link" id="logo-link" aria-label="Mahadeva Super Mart Home">
          <img src={Logo} alt="Mahadeva Super Mart" className="header-logo" />
        </Link>

        {/* Center: Search Bar */}
        <div className="search-bar-container" id="search-section" ref={searchRef}>
          <form className="search-form" onSubmit={handleSearch} role="search">
            <div className="search-input-wrapper">
              {/* Search icon inside input */}
              <svg className="search-inside-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input
                type="search"
                className="search-input"
                id="product-search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search for products..."
                aria-label="Search for products"
                onFocus={() => {
                  setIsInputFocused(true);
                }}
              />
              {
 shouldShowSuggestions  &&
 suggestions.length > 0 && (

  <div className="search-suggestions">

   {
    suggestions.map(item => (

      <div
       key={item.id}
       className="suggestion-item"
       onMouseDown={() => {
        console.log('Suggestion Clicked.')
        setSearchTerm(item.title);
        setIsInputFocused(false);
        navigate(`/search?q=${encodeURIComponent(item.title)}`);
       }}
      >

        <img
         src={item.image || '/placeholder-product.png' }
         alt={item.title}
        />

        <span>
          {item.title}
        </span>

      </div>

    ))
   }

  </div>

 )
}
            </div>
          </form>
        </div>

        {/* Right: User Actions */}
        <div className="header-actions">
          <div className="action-item user-menu" id="login-link" onClick={() => setShowDropdown(prev => !prev)}
           aria-label="Login or Sign up" ref={dropdownRef}>
            <div className="action-icon-wrapper">
              <svg className="action-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            <span className="action-text">{userName ? userName : 'Login / SignUp'}</span>

            {
              showDropdown && (
                <UserDropdown onClose={() => setShowDropdown(false)} userName={userName} />
              )
            }
          </div>

          <Link to="/Cart" className="action-item" id="cart-link" aria-label={`View shopping cart, ${cartCount} items`}>
            <div className="action-icon-wrapper cart-wrapper">
              <svg className="action-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              <span className="cart-badge" id="cart-count">{cartCount}</span>
            </div>
            <span className="action-text">Cart</span>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
