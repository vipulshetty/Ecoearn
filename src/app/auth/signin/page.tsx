'use client';

import { signIn } from 'next-auth/react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export default function SignIn() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const searchParams = useSearchParams();
  const router = useRouter();
  const redirect = searchParams.get('redirect') || '/dashboard';
  const message = searchParams.get('message');
  const errorParam = searchParams.get('error');

  useEffect(() => {
    // Handle error from URL parameters
    if (errorParam) {
      if (errorParam === 'AccessDenied') {
        setError('Access denied. You may not have permission to sign in with this account.');
      } else if (errorParam === 'Configuration') {
        setError('There is a problem with the server configuration. Please contact support.');
      } else if (errorParam === 'OAuthSignin' || errorParam === 'OAuthCallback') {
        setError('There was a problem with the authentication process. Please try again.');
      } else if (errorParam === 'Callback') {
        setError('There was a problem with the authentication process. Please try again later.');
      } else {
        setError(`Authentication error: ${errorParam}. Please try again.`);
      }
    }
  }, [errorParam]);

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      setError('');
      // Add error=true parameter to capture errors in the callback
      await signIn('google', { 
        callbackUrl: redirect,
        redirect: true
      });
    } catch (error) {
      setError('Failed to sign in with Google');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-12 flex flex-col bg-gray-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="w-16 h-16 mx-auto bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl shadow-xl flex items-center justify-center"
        >
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
          </svg>
        </motion.div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          Welcome back
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{' '}
          <Link href="/auth/signup" className="font-medium text-primary-600 hover:text-primary-500">
            create a new account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10"
        >
          {message && (
            <div className="mb-4 p-4 text-sm text-green-700 bg-green-100 rounded-xl">
              {message}
            </div>
          )}
          
          {error && (
            <div className="mb-4 p-4 text-sm text-red-700 bg-red-100 rounded-xl">
              {error}
            </div>
          )}

          <div className="space-y-6">
            <div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-xl shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                {isLoading ? 'Signing in...' : 'Continue with Google'}
              </motion.button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Secure authentication</span>
              </div>
            </div>
            
            <p className="text-center text-sm text-gray-500">
              We use Google for secure authentication. Your data is protected and we don't store your password.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
