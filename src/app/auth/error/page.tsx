'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function AuthError() {
  const searchParams = useSearchParams();
  const [errorMessage, setErrorMessage] = useState<string>('');
  
  useEffect(() => {
    const error = searchParams.get('error');
    
    if (error === 'AccessDenied') {
      setErrorMessage('Access denied. You may not have permission to sign in with this account.');
    } else if (error === 'Configuration') {
      setErrorMessage('There is a problem with the server configuration. Please contact support.');
    } else if (error === 'DatabaseConnection') {
      setErrorMessage('Unable to connect to the authentication service. Please try again later.');
    } else if (error === 'Verification') {
      setErrorMessage('The verification link may have expired or has already been used.');
    } else if (error === 'OAuthSignin' || error === 'OAuthCallback' || error === 'OAuthCreateAccount') {
      setErrorMessage('There was a problem with the OAuth authentication process. Please try again.');
    } else if (error === 'EmailCreateAccount') {
      setErrorMessage('There was a problem creating your account. Please try again.');
    } else if (error === 'Callback') {
      setErrorMessage('There was a problem with the authentication callback. Please try again.');
    } else if (error === 'OAuthAccountNotLinked') {
      setErrorMessage('This email is already associated with another account. Please sign in using your original provider.');
    } else if (error === 'EmailSignin') {
      setErrorMessage('The email could not be sent or the email link expired. Please try again.');
    } else if (error === 'CredentialsSignin') {
      setErrorMessage('The credentials you provided were invalid. Please check and try again.');
    } else {
      setErrorMessage('An unknown error occurred during authentication. Please try again.');
    }
  }, [searchParams]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md dark:bg-gray-800">
        <h1 className="mb-6 text-center text-2xl font-bold text-red-600 dark:text-red-400">Authentication Error</h1>
        
        <div className="mb-6 rounded-md bg-red-50 p-4 dark:bg-red-900/20">
          <p className="text-center text-red-700 dark:text-red-300">{errorMessage}</p>
        </div>
        
        <div className="flex flex-col space-y-4">
          <Link 
            href="/auth/signin"
            className="rounded-md bg-blue-600 px-4 py-2 text-center text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-700 dark:hover:bg-blue-600"
          >
            Try Again
          </Link>
          
          <Link 
            href="/"
            className="rounded-md border border-gray-300 px-4 py-2 text-center text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}