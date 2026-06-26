import './Home.css'
import { supabase } from '../../Services/supabase.js'
import Header from '../../Components/Header/Header.jsx'
import Hero from '../../Components/Hero/Hero.jsx'
import Navbar from '../../Components/Navbar/Navbar.jsx'
import Features from '../../Components/Features/Features.jsx'
import FeaturedCategories from '../../Components/FeaturedCategories/FeaturedCategories.jsx'
import Footer from '../../Components/Footer/Footer.jsx'



const Home = () => {

    return(
        <div className="homepage">
            <Header  />
            <Navbar />
            <main className='homeContent'>
                <Hero />
                <Features />
                <FeaturedCategories />
            </main>
            <Footer />
        </div>
    )
};

export default Home;