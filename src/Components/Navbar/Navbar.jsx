import React, { useState,useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';
import { useNavigate } from 'react-router-dom';
import { getCategories } from '../../Services/categoryServices.js';


const Navbar = () => {

  const navigate = useNavigate();
  const [activeItem, setActiveItem] = useState('Home');
  const [categories, setCategories] = useState([]);


  useEffect(() => {
    const loadCategories = async() => {
      const data = await getCategories();
      setCategories(data || []);
    };
    loadCategories();
  }, []);

  const menuItems = [
    {
      name: 'Home',
      to: '/Home',
    },
    {
      name: 'Categories',
      isDropdown: true,
      dropdownItems: categories
    },
    {
      name: 'Offers'
    },
    {
      name: 'New Arrivals'
    },
    {
      name: 'About Us'
    },
    {
      name: 'Contact Us'
    }
  ];

  return (
    <nav className="navigation-bar">
      <ul className="nav-menu">

        {menuItems.map((item) => {

          if (item.isDropdown) {
            return (
              <li
                key={item.name}
                className={`nav-item dropdown ${
                  activeItem === item.name ? 'active' : ''
                }`}
              >
                <a
                  href="#"
                  className="nav-link"
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveItem(item.name);
                  }}
                >
                  {item.name}
                  <span className="chevron">▼</span>
                </a>

                <ul className="dropdown-menu">
                  {item.dropdownItems.map((dropItem) => (
                    <li key={dropItem.id}>
                      <a href="#" 
                          onClick={(e) => {
                            e.preventDefault();
                            console.log(dropItem);
                            navigate(`/products/${dropItem.id}`)
                          }}
                           >{dropItem.name}</a>
                    </li>
                  ))}
                </ul>
              </li>
            );
          }

          return (
            <li
              key={item.name}
              className={`nav-item ${
                activeItem === item.name ? 'active' : ''
              }`}
            >
              {item.to ? (
                <Link
                  to={item.to}
                  className="nav-link"
                  onClick={() => setActiveItem(item.name)}
                >
                  {item.name}
                </Link>
              ) : (
                <a
                  href="#"
                  className="nav-link"
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveItem(item.name);
                  }}
                >
                  {item.name}
                </a>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default Navbar;