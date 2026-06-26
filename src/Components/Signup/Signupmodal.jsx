import { useState } from 'react';
import { supabase } from '../../Services/supabase.js';
import toast from 'react-hot-toast';
import './Signupmodal.css';
import { IoClose } from 'react-icons/io5';
import { FaRegUser, FaVoicemail, FaEye, FaEyeSlash } from 'react-icons/fa';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const SignupModal = ({ isOpen, onClose }) => {

    const [step, setStep] = useState('details');
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [sending, setSending] = useState(false);

    if (!isOpen) return null;

    const resetModal = () => {
        setStep('details');
        setFullName('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
    };

    const handleCloseModal = () => {
        resetModal();
        onClose();
    };

    const handleSignUp = async () => {
        const cleanedEmail = email.trim();
        if (sending) return;
        if (!fullName.trim()) {
            toast.error('Full Name is Required');
            return;
        };
        if (!cleanedEmail) {
            toast.error('Email is required');
            return;
        };
        if(!emailRegex.test(cleanedEmail)) {
            toast.error('Enter a valid email address');
            return;
        };
        if(!password.trim()) {
            toast.error('Passsword is required');
            return;
        };
        if(password.length < 6) {
            toast.error('Password length must be at least 6 characters.');
            return;
        };
        if(!confirmPassword.trim()) {
            toast.error("Confirm password is required");
            return;
        };
        if(password !== confirmPassword) {
            toast.error('Password doesnot match'); return;
        };
        try {
            setSending(true);
            const { error } = await supabase.auth.signUp({
                email: cleanedEmail,
                 password, 
                options: {
                    data:{
                        full_name: fullName
                    }
                }
            });
            if (error) {
                console.log('sign up error', error);
                toast.error(error.message);
                return;
            }
            setStep('sent');
            toast.success('Magic link sent to your email');
        } catch (err) {
    console.log('Full Error:', err);
    console.log('Error Name:', err.name);
    console.log('Error Message:', err.message);
    console.log('Error Stack:', err.stack);

    toast.error(err.message || 'Signup Failed');

            toast.error('Failed to send email');
        } finally {
            setSending(false);
        }
    };

    // OTP verification and resend logic removed: using email magic link only

    return (
        <div className="signupOverlay">

            <div className="signupModal">

                <button
                    className="signupCloseBtn"
                    onClick={handleCloseModal}
                >
                    <IoClose />
                </button>

                <div className="signupIcon">
                    <FaRegUser />
                </div>

                {step === 'details' ? (

                    <>
                        <h2>Create Account</h2>

                        <p className="signupSubtitle">
                            Enter your details to continue
                        </p>

                        <form className="signupForm" onSubmit={handleSignUp}>

                            <div className="signupInputBox">

                                <input
                                    type="text"
                                    placeholder=" "
                                    className="signupInput"
                                    value={fullName}
                                    onChange={(e) =>
                                        setFullName(e.target.value)
                                    }
                                />

                                <label className="signupLabel">
                                    Full Name
                                </label>

                                <FaRegUser className="signupInputIcon" />

                            </div>

                            <div className="signupInputBox">

                                <input
                                    type="email"
                                    placeholder=" "
                                    className="signupInput"
                                    value={email}
                                    onChange={(e) =>
                                        setEmail(e.target.value)
                                    }
                                />

                                <label className="signupLabel">
                                    Email Address
                                </label>

                                <FaVoicemail className="signupInputIcon" />

                            </div>

                            <div className="signupInputBox">

                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder=" "
                                    className="signupInput"
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                />

                                <label className="signupLabel">
                                    Password
                                </label>

                                { showPassword ? (
                                    <FaEyeSlash className='signupInputIcon' onClick={() => setShowPassword(false)} />
                                ) : (
                                    <FaEye className='signupInputIcon' onClick={() => setShowPassword(true)} />
                                ) }

                            </div>

                            <div className="signupInputBox">

                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    placeholder=" "
                                    className="signupInput"
                                    value={confirmPassword}
                                    onChange={(e) =>
                                        setConfirmPassword(e.target.value)
                                    }
                                />

                                <label className="signupLabel">
                                    Confirm Password
                                </label>

                                { showConfirmPassword ? (
                                    <FaEyeSlash className='signupInputIcon' onClick={() => setShowConfirmPassword(false)} />
                                ) : (
                                    <FaEye className='signupInputIcon' onClick={() => setShowConfirmPassword(true)} />
                                ) }

                            </div>

                            <button
                                type="button"
                                className="signupBtn"
                                onClick={handleSignUp}
                                disabled={sending}
                            >
                                {sending ? 'Creating Account...' : 'Create Account'}
                            </button>

                        </form>
                    </>
                ) : (

                    <>
                        <h2>Check Your Email</h2>

                        <p className="signupSubtitle">
                            We've Sent a verification link to your email.
                        </p>
                        <p className='signupSubtitle'>
                            Click the link to activate your account before logging in.
                        </p>

                        <p className="signupEmail">
                            {email}
                        </p>

                        <button
                            type="button"
                            className="signupBtn"
                            onClick={handleCloseModal}
                        >
                            Close
                        </button>
                    </>
                )}

            </div>

        </div>
    );
};

export default SignupModal;