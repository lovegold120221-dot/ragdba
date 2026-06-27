import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogIn, Shield, FileText, CheckCircle2, AlertCircle, Eye, EyeOff, Mail, Lock, X } from 'lucide-react';
import { auth, signInWithPopup, googleProvider } from '../lib/firebase';
import { User } from 'firebase/auth';

const GDPR_PRIVACY_TEXT = `By clicking "Sign in with Google", I consent to the processing of my personal data as outlined in the following document:

• Personal Data: Name, email address, and profile photo provided by Google authentication.
• Purpose: Authentication to access the Belgian Government Services Portal.
• Legal Basis: Legitimate interest for identification and secure service provision.
• Data Retention: Data stored in Firebase according to Belgian data protection regulations (GDPR Article 6(1)(f)).
• Rights: You may access, rectify, erase, or object to processing of your data at any time. Contact us at privacy@eburon.ai.
• Third Parties: Google processes authentication data per their Privacy Policy, which includes data transfers to the United States.

I have read and understood the privacy policy. I agree to the processing of my data for this authentication purpose.

For full details, please refer to our complete Privacy Policy at eburon.ai/privacy`; // End of consent text

const AuthPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [isConsentChecked, setIsConsentChecked] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      if (user && location.pathname === '/auth') {
        navigate('/', { replace: true });
      }
    });
    return unsubscribe;
  }, [navigate, location]);

  const handleGoogleSignIn = async () => {
    if (!isConsentChecked) {
      setError('You must agree to the GDPR privacy policy to continue');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error('Google Sign In Error:', err);
      if (err instanceof Error) {
        if (err.message.includes('auth/popup-blocked')) {
          setError('Popup blocked. Please allow popups for this site and try again.');
        } else if (err.message.includes('auth/too-many-requests')) {
          setError('Too many attempts. Please wait a moment and try again.');
        } else {
          setError('Authentication failed. Please check your network connection and try again.');
        }
      } else {
        setError('An unexpected error occurred during sign in.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestAccess = () => {
    navigate('/', { replace: true });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-100 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-neutral-950 rounded-3xl shadow-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden backdrop-blur-xs">
          <div className="p-8">
            <div className="text-center mb-8">
              <div className="w-20 h-20 rounded-full bg-neutral-900 dark:bg-neutral-800 flex items-center justify-center mx-auto mb-4">
                <Shield className="w-10 h-10 text-red-600 dark:text-red-500" />
              </div>
              <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">Federal Gateway Authentication</h1>
              <p className="text-neutral-600 dark:text-neutral-400 text-sm">Belgian Government Services</p>
            </div>

            <div className="space-y-6">
              <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  <p className="text-amber-800 dark:text-amber-300 text-sm font-medium">GDPR Compliance Required</p>
                </div>
                <p className="text-amber-700 dark:text-amber-400 text-xs leading-relaxed">
                  You must provide explicit consent to privacy processing before accessing the Belgian government services portal. All data handling complies with GDPR regulations.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="consent-checkbox"
                    checked={isConsentChecked}
                    onChange={(e) => setIsConsentChecked(e.target.checked)}
                    className="w-5 h-5 text-red-600 dark:text-red-500 border-neutral-300 dark:border-neutral-700 rounded focus:ring-red-500 dark:focus:ring-red-400 mt-0.5"
                  />
                  <label htmlFor="consent-checkbox" className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
                    <span className="font-medium">I agree to the processing of my personal data</span> as outlined in the privacy policy for authentication purposes to access Belgian government services.
                  </label>
                </div>

                <button
                  onClick={() => setShowPrivacyPolicy(true)}
                  className="text-red-600 dark:text-red-500 hover:text-red-700 dark:hover:text-red-400 text-sm underline cursor-pointer bg-transparent border-none p-0"
                >
                  View full Privacy Policy
                </button>
              </div>

              {error && (
                <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                  <p className="text-red-800 dark:text-red-300 text-sm">{error}</p>
                </div>
              )}

              <button
                onClick={handleGoogleSignIn}
                disabled={!isConsentChecked || isLoading}
                className="w-full py-4 px-6 bg-neutral-900 dark:bg-neutral-800 hover:bg-neutral-800 dark:hover:bg-neutral-750 disabled:bg-neutral-300 disabled:dark:bg-neutral-800 disabled:cursor-not-allowed text-white rounded-lg font-semibold text-base transition-all duration-200 flex items-center justify-center gap-3 shadow-lg cursor-pointer"
              >
                <LogIn className="w-5 h-5 text-amber-400" />
                <span>{isLoading ? 'Connecting...' : 'Sign in with Google'}</span>
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-neutral-200 dark:border-neutral-800" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white dark:bg-neutral-950 text-neutral-500 dark:text-neutral-400">or</span>
                </div>
              </div>

              <button
                onClick={handleGuestAccess}
                className="w-full py-3 px-6 bg-neutral-100 dark:bg-neutral-900 hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-900 dark:text-neutral-100 rounded-lg font-medium text-sm transition-all duration-200 cursor-pointer border border-neutral-300 dark:border-neutral-800"
              >
                Continue as Guest
              </button>
            </div>
          </div>

          <div className="px-8 pb-8">
            <div className="bg-neutral-50 dark:bg-neutral-900/50 rounded-lg p-4 border border-neutral-200 dark:border-neutral-800">
              <div className="flex items-center gap-3 mb-2">
                <FileText className="w-5 h-5 text-neutral-400 dark:text-neutral-500" />
                <p className="text-neutral-700 dark:text-neutral-300 text-sm font-medium">Authentication Security</p>
              </div>
              <ul className="text-xs text-neutral-600 dark:text-neutral-400 space-y-1">
                <li>• Google Identity Platform authentication</li>
                <li>• GDPR-compliant data processing</li>
                <li>• Secure session management</li>
                <li>• Belgian government services access</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {showPrivacyPolicy && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-950 rounded-2xl p-6 max-w-md w-full border border-neutral-300 dark:border-neutral-800 shadow-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">GDPR Privacy Policy</h3>
              <button
                onClick={() => setShowPrivacyPolicy(false)}
                className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-lg text-neutral-400 dark:text-neutral-500 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-neutral-700 dark:text-neutral-300 space-y-3 leading-relaxed">
              <p><strong>DATA COLLECTION:</strong> We collect Name, email address, and profile photo provided by Google authentication.</p>
              <p><strong>DATA PURPOSE:</strong> Authentication to access the Belgian Government Services Portal.</p>
              <p><strong>LEGAL BASIS:</strong> Legitimate interest for identification and secure service provision.</p>
              <p><strong>DATA RETENTION:</strong> Data stored in Firebase according to Belgian data protection regulations (GDPR Article 6(1)(f)).</p>
              <p><strong>USER RIGHTS:</strong> You may access, rectify, erase, or object to processing of your data at any time. Contact us at privacy@eburon.ai.</p>
              <p><strong>THIRD PARTIES:</strong> Google processes authentication data per their Privacy Policy, which includes data transfers to the United States.</p>
              <p><strong>CONTACT:</strong> For data protection questions or to exercise your rights, contact: privacy@eburon.ai</p>
            </div>

            <div className="mt-6 pt-4 border-t border-neutral-200 dark:border-neutral-800">
              <button
                onClick={() => setShowPrivacyPolicy(false)}
                className="w-full py-2.5 bg-neutral-900 dark:bg-neutral-800 hover:bg-neutral-800 dark:hover:bg-neutral-750 text-white rounded-lg font-medium text-sm transition-colors cursor-pointer"
              >
                I Understand and Accept
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthPage;