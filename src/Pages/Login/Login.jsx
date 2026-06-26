import { FaRegUser, FaVoicemail,     FaMobileAlt } from 'react-icons/fa'
import './Login.css'
import { FaEye,FaEyeSlash } from 'react-icons/fa'
import Logo from '../../assets/Logo.png'
import { Link, useNavigate } from 'react-router-dom'
import { FcGoogle } from 'react-icons/fc'
import { useState } from 'react'
import { supabase } from '../../Services/supabase.js'
import MobileLoginModal from '../../Components/Mobilelogin/Mobileloginmodal.jsx'
import toast from 'react-hot-toast'
import SignupModal from '../../Components/Signup/Signupmodal.jsx'


const Login = () => {
    const navigate =    useNavigate();
    const [ email, setEmail ] = useState('');
    const [ password, setPassword ] = useState('');
    const [ rememberMe, setRememberMe ] = useState(false);
    const [ error, setError ] = useState('');
    const [ loading, setLoading ] = useState(false);
    const [ showPassword,setShowPassword ] = useState(false);
    const [ showMobileModal,setShowMobileModal ] = useState(false);
    const [ showSignUpModal,setShowSignUpModal ] = useState(false);

    const validationForm = () => {
        if(!email.trim()) {
            return 'Email is required';
        }
        if(!password.trim()){
            return 'Password is required';
        }
        if(password.length<6) {
            return 'Password must be atleast 6 characters'; 
        }
        return null;
    };

const signInWithGoogle = async () => {
    try {
        const { error } =
        await supabase.auth.signInWithOAuth({
            provider: 'google'
        });

        console.log('OAuth response received');

        if (error) {
            toast.error(error.message);
            setError(error.message);
        }

    } catch (err) {
        console.log('Catch Block:', err);
        setError(err.message);
    }
};

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError('');

        const validationError = validationForm();
        if (validationError) {
            setError(validationError);
            return
        }
        try{
            setLoading(true);
            const {data,error} = await supabase.auth
            .signInWithPassword({
                email,password
            }) 
            if(error) {
                setError(error.message);
                return;
            }
            if(data.user) {
                console.log(data.user);
                toast.success("Login Successful.");
                console.log(data.session);
                navigate('/Home')
            }
        }catch {
            setError('Something went wrong');
        }finally{
            setLoading(false);
        };
    };
    return (
        <div className="loginPage">
            <div className="overlay">
                <div className="contentWrapper">

                    <div className='logo'>
                        <img src={Logo} alt='mahadeva' />
                    </div>

                    <div className="loginCard">
                        <div className="userIcon">
                            <FaRegUser />
                        </div>

                        <form action='' className='loginForm' onSubmit={handleSubmit}>
                        <h3>Welcome</h3>
                        <p className='subtitle'>Please Login to Continue</p>

                        <div className="loginInputs">
                            <div className="loginBox">
                                <input type="email" name="email" id="email" placeholder='' className='loginInput'
                                value={email} onChange={(e) => {
                                    setEmail(e.target.value);
                                    setError('');}
                                } required/>
                                <label htmlFor='email' className='loginLabel'>Email Id</label>
                                <FaVoicemail className='loginIcon' />
                            </div>
                            <div className="loginBox">
                                <input type={showPassword ? 'text' : 'password'}
                                 name="password" id="password" className='loginInput'
                                value={password} onChange={(e) =>{ 
                                    setPassword(e.target.value);
                                    setError('');
                                }} placeholder='' required/>
                                <label htmlFor='password' className='loginLabel'>Password</label>
                                { showPassword ? (<FaEyeSlash className='loginIcon' onClick={() => setShowPassword(false)} />) :(
                                <FaEye className='loginIcon' onClick={() => setShowPassword(true)} />)}

                            </div>
                        </div>

                         {error && (<p className='errorMsg'>**{error}**</p>)}
                        <div className="loginCheck">
                            <div className="checkBox">
                                <input type="checkbox" className="checkInput" name='checkbox' id='user-check'
                                checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked) } />
                                <label htmlFor="user-check" className="checkLabel">Remember Me</label>
                            </div>
                            <Link to='' className='loginForgot'>Forgot Password?</Link>
                        </div>

                        <button type='submit' className='loginBtn'
                        disabled={
                            !email.trim() || !password.trim() ||    loading}>{loading ? 'Logging in...' : 'Login'}</button>
                        </form>

                        <p className='divider'>Or</p>

                        <div className='socialLoginSection'>
                            <button type='button' className='socialBtn'
                            onClick={signInWithGoogle} id='googleBtn'>
                                <FcGoogle className='svg' />
                                Google</button>
                            <button type='button' className='socialBtn'
                            onClick={() => setShowMobileModal(true)}>
                                <FaMobileAlt  className='svg' />
                                Mobile</button>

                            <MobileLoginModal 
                            isOpen={showMobileModal}
                            onClose={()=> setShowMobileModal(false)} />
                        </div>

                        <SignupModal
                            isOpen={showSignUpModal}
                            onClose={() => setShowSignUpModal(false)} />

                        <p className='noAccountSection'>Don't have account?
                             <Link className='signUpLink' to='#' onClick={(e) => {
                                e.preventDefault();
                                setShowSignUpModal(true);
                             }}>Sign Up</Link></p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Login;
