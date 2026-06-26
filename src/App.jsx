import './App.css';
import Login from './Pages/Login/Login.jsx';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from './Services/supabase.js';
import Home from './Pages/Home/Home.jsx';
import ProtectedRoute from './Components/ProtectedRoute.jsx';
import { Toaster  } from 'react-hot-toast';
import Cart from './Pages/Cart/Cart.jsx';
import Products from './Pages/Products/Products.jsx';
import SearchResults from './Pages/SearchResults/SearchResults.jsx';
import ProductDetails from './Pages/ProductDetails/ProductDetails.jsx';

function App() {
  const navigate = useNavigate();
  const [ session, setSession ] = useState(null);
  const [ loading,setLoading ] = useState(true);


  useEffect(() => {
    const checkSession = async () => {
      try {
        const{ data: { session }} = await supabase.auth.getSession();
        setSession(session);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    }; checkSession();
  }, []);

  useEffect(() => {
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log(event);
      setSession(session);
      if (event === 'SIGNED_IN') {
        navigate('/Home', { replace: true });
      }
      if(event === "SIGNED_OUT") {
        navigate('/');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  if(loading) {
    return <div
    style={{height: '100vh', display:'flex', justifyContent:'center', alignItems: 'center'}}>Loading...</div>
  }
  return (
<>
    <Toaster position='top-right' reverseOrder={false} />
    <Routes>
      <Route path='/' element={<Login />} />
      <Route
        path='/Home'
        element={
          <ProtectedRoute session={session} loading={loading}>
            <Home />
          </ProtectedRoute>
        }
      />
      <Route path='/Cart' element={<Cart />} />
      <Route path='/products/:categoryId' element={
        <ProtectedRoute session={session} loading={loading} >
          <Products />
        </ProtectedRoute>
      } />
      <Route path='/search' element={
        <ProtectedRoute session={session} loading={loading}>
          <SearchResults />
        </ProtectedRoute>
      } />
      <Route path='/product/:id' element = {
        <ProtectedRoute session={session} loading={loading}>
          <ProductDetails />
        </ProtectedRoute>
      } />
    </Routes>
    </>
  )
}

export default App
