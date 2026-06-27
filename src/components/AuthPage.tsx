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