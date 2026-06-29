import { BrowserRouter } from 'react-router-dom'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { CartProvider } from './Context/Cartcontext.jsx'
import { StoreSettingsProvider } from './Context/StoreSettingsContext.jsx'

createRoot(document.getElementById('root')).render(
  <StoreSettingsProvider>
    <CartProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </CartProvider>
  </StoreSettingsProvider>
)
