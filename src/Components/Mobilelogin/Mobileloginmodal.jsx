import { useState,useRef,useEffect } from 'react'
import './Mobileloginmodal.css'
import { FaMobileAlt } from 'react-icons/fa'
import { IoClose } from 'react-icons/io5'
import { supabase } from '../../Services/supabase'
import toast from 'react-hot-toast'


const MobileLoginModal = ({ isOpen,onClose }) => {
    const [ step,setStep ] = useState('mobile');
    const [ mobile,setMobile ] = useState('');
    const [ otp,setOtp ] = useState(['','','','','','']);
    const [ cooldown,setCooldown ] = useState(0);
    const [ otpTimer,setOtpTimer ] = useState(0);
    const [ otpAttempts,setOtpAttempts ] = useState(0);
    const [ sendingOtp,setSendingOtp ] = useState(false);
    
    const inputRefs = useRef([]);
    useEffect(() =>{
      if(cooldown <= 0) return;
      const timer = setInterval(() => {
        setCooldown(prev => {
          if(prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }, [cooldown]);

    useEffect(() => {
      if(otpTimer <= 0) return;
      const timer = setInterval(() => {
        setOtpTimer(prev => {
          if(prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }, [otpTimer]);

    if(!isOpen) return null;

    const resetModal = () => {
      setMobile('');
      setOtp(['','','','','','']);
      setStep('mobile');
      setCooldown(0);
      setOtpTimer(0);
      setOtpAttempts(0); 
    }

    const handleCloseModal = () => {
      resetModal();
      onClose(); 
    }

    const cleanMobile = (m) => m.replace(/\D/g, '').trim();

const handleSendOtp = async () => {

  if(sendingOtp) return;

  const cleanedMobile = cleanMobile(mobile);

  if(!cleanedMobile) {
    toast.error('Mobile Number is required');
    return;
  }

  const phoneRegex = /^[6-9]\d{9}$/;

  if(!phoneRegex.test(cleanedMobile)) {
    toast.error('Enter a valid Mobile number');
    return;
  }

  if(/^(\d)\1{9}$/.test(cleanedMobile)) {
    toast.error('Invalid mobile number');
    return;
  }

  try {

    setSendingOtp(true);

    const { error } =
    await supabase.auth.signInWithOtp({
      phone: `+91${cleanedMobile}`
    });

    if(error) {
      toast.error(error.message);
      return;
    }

    setOtp(['','','','','','']);
    setStep('otp');
    setCooldown(30);
    setOtpTimer(60);
    setOtpAttempts(0);

    toast.success('OTP Sent Successfully');

  } catch {

    toast.error('Failed to send OTP');

  } finally {

    setSendingOtp(false);

  }
};
    const handleVerifyOtp = async () => {
      const otpValue = otp.join('');
      if(otpAttempts >= 5) {
        toast.error('Too many attempts, Please request new OTP.');
        return;
      }
      if(otpTimer === 0) {
        toast.error('OTP Expired. Please Try Again');
        return;
      }

        if(otpValue.length!==6) {
            toast.error('Enter valid OTP.');
            return;
        }
        const cleanedMobile = cleanMobile(mobile);

        try {
          const { data, error } = await supabase.auth.verifyOtp({
            phone: `+91${cleanedMobile}`,
            token: otpValue,
            type: 'sms',
          });

          if (error || !data.session) {
            setOtpAttempts(prev => prev + 1);
            toast.error(`Invalid OTP. ${4 - otpAttempts} are remaining.`);
            return;
          }

          toast.success('Logged in successfully.');
          handleCloseModal();
        } catch {
          toast.error('Unable to verify OTP. Please try again.');
        }
    };

    
    const handleResendOtp = async () => {
      const cleanedMobile = cleanMobile(mobile);
      const { error } = 
      await supabase.auth.signInWithOtp({
        phone: `+91${cleanedMobile}`
      });
      if(error) {
        toast.error(error.message);
        return;
      }
      setOtp(['','','','','','']);
      inputRefs.current[0]?.focus();

      setCooldown(30);
      setOtpTimer(60);
      setOtpAttempts(0);
      toast.success('OTP Sent Again');
    }

    const handleOtpPaste = (e) => {
      e.preventDefault();
      const pasteData = e.clipboardData
      .getData('text')
      .replace(/\D/g,'')
      .slice(0,6);
      if(!pasteData) return;
      const newOtp = [...otp];
      pasteData.split('').forEach((digit,index) => {
        if (index < 6) {
          newOtp[index] = digit;
        }
      });
      setOtp(newOtp);
      const lastIndex = Math.max(pasteData.length - 1,5);
      inputRefs.current[lastIndex]?.focus();
    }

    const handleMobileSubmit = (e) => {
      e.preventDefault();
      handleSendOtp();
    }

    const handleOtpSubmit = (e) => {
      e.preventDefault();
      handleVerifyOtp();
    }

    const handleOtpChange = (value, index) => {
      if(!/^\d?$/.test(value)) 
        return;

      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      if (value && index < 5) {
        inputRefs.current[index+1]?.focus();
      }
    };

    const handleKeyDown = (e,index) => {
      if(e.key === 'Backspace' && !otp[index] && index>0) {
        inputRefs.current[index-1]?.focus();
      }
    }

    return (
        <div className="mobileOverlay">

      <div className="mobileModal">

        <button
          className="closeBtn"
          onClick={handleCloseModal}
        >
          <IoClose />
        </button>

        <div className="mobileHeader">
          <FaMobileAlt />
          <h3>
            {step === 'mobile'
              ? 'Mobile Login'
              : 'Verify OTP'}
          </h3>
        </div>

        <div className="sliderContainer">

          <div
            className="slider"
            style={{
              transform:
                step === 'mobile'
                  ? 'translateX(0%)'
                  : 'translateX(-50%)'
            }}
          >

            {/* MOBILE SCREEN */}

            <form className="stepScreen" onSubmit={handleMobileSubmit}>

              <p className="mobileSubTitle">
                Enter your mobile number
              </p>

              <input
                type="tel"
                maxLength="10"
                className="mobileInput"
                placeholder="9876543210"
                value={mobile}
                onChange={(e) =>
                  setMobile(
                    e.target.value.replace(/\D/g, '')
                  )
                }
              />

              <button
              type='submit'
                className="actionBtn"
                disabled={sendingOtp}
              >
                {sendingOtp ? 'Sending OTP..' : 'Send OTP'}
              </button>

            </form>

            {/* OTP SCREEN */}

            <form className="stepScreen" onSubmit={handleOtpSubmit}>

              <p className="mobileSubTitle">
                OTP sent to +91 {mobile}
              </p>

              <p className="otpExpiry">
                OTP Expires in {otpTimer}s
              </p>

              <p className='otpAttempts'>Attempts Remaining: {5 - otpAttempts}</p>

              <div className="otpContainer">
                {otp.map((digit,index) => (
                  <input key={index} ref={(el) => inputRefs.current[index] = el}
                  type='text' maxLength={1} value={digit} className='otpBox' 
                  onChange={(e) => handleOtpChange(e.target.value,index)} 
                  onKeyDown={(e) => handleKeyDown(e,index)} 
                  onPaste={handleOtpPaste}/>
                ))}
              </div>

              <button
                className="actionBtn"
                disabled={otpTimer === 0 || otpAttempts >= 5}
              >
                {otpAttempts >= 5 ? 'Request New OTP' 
                : otpTimer === 0 ? 'OTP Expired! Try Again'
                : 'Verify OTP'}
              </button>

              <button
                className="resendBtn" type='button'
                onClick={handleResendOtp} disabled={cooldown > 0}
              >
                {cooldown > 0 ?  `Resend in ${cooldown}` : `Resend OTP`}
              </button>

            </form>

          </div>

        </div>

      </div>

    </div>
    );

};

export default MobileLoginModal;
