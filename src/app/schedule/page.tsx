'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SchedulerForm from '../../components/SchedulerForm';

export default function SchedulePage() {
  const router = useRouter();
  const [isConnected, setIsConnected] = useState(false);
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  
  // Check LinkedIn connection status
  useEffect(() => {
    checkLinkedInStatus();
    
    // Check for URL parameters (OAuth callback messages)
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    const error = urlParams.get('error');
    const name = urlParams.get('name');
    const errorMessage = urlParams.get('message');
    
    if (success === 'linkedin_connected' && name) {
      setMessage(`✅ Successfully connected to LinkedIn as ${decodeURIComponent(name)}!`);
      setIsConnected(true);
      setUserName(decodeURIComponent(name));
      // Clean up URL
      router.replace('/schedule');
    } else if (error) {
      const msg = errorMessage ? decodeURIComponent(errorMessage) : 'Connection failed';
      setMessage(`❌ LinkedIn connection error: ${msg}`);
    }
  }, [router]);

  const checkLinkedInStatus = async () => {
    try {
      const response = await fetch('/api/linkedin/status');
      if (response.ok) {
        const data = await response.json();
        setIsConnected(data.connected);
        if (data.connected) {
          setUserName(data.userName || 'Unknown User');
        }
      } else {
        // API doesn't exist yet, assume not connected
        setIsConnected(false);
      }
    } catch (error) {
      console.error('Failed to check LinkedIn status:', error);
      setIsConnected(false);
    } finally {
      setLoading(false);
    }
  };

  const connectToLinkedIn = () => {
    setMessage('🔄 Redirecting to LinkedIn...');
    window.location.href = '/api/linkedin/auth';
  };

  const disconnectLinkedIn = async () => {
    try {
      const response = await fetch('/api/linkedin/disconnect', {
        method: 'POST',
      });
      
      if (response.ok) {
        setIsConnected(false);
        setUserName('');
        setMessage('✅ Successfully disconnected from LinkedIn');
      } else {
        setMessage('❌ Failed to disconnect from LinkedIn');
      }
    } catch (error) {
      console.error('Failed to disconnect:', error);
      setMessage('❌ Failed to disconnect from LinkedIn');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Content Scheduler</h1>
      
      {/* LinkedIn Connection Status */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">LinkedIn Connection</h2>
        
        {loading ? (
          <div className="text-gray-600">🔄 Checking connection status...</div>
        ) : (
          <div className="space-y-4">
            {isConnected ? (
              <div className="space-y-3">
                <div className="flex items-center text-green-600">
                  <span className="text-lg">✅</span>
                  <span className="ml-2 font-medium">Connected to LinkedIn</span>
                </div>
                <div className="text-gray-700">
                  Logged in as: <span className="font-medium">{userName}</span>
                </div>
                <button
                  onClick={disconnectLinkedIn}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition-colors"
                >
                  Disconnect LinkedIn
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center text-yellow-600">
                  <span className="text-lg">⚠️</span>
                  <span className="ml-2">LinkedIn not connected</span>
                </div>
                <div className="text-gray-600 text-sm">
                  Connect your LinkedIn account to enable automatic posting
                </div>
                <button
                  onClick={connectToLinkedIn}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
                >
                  Connect LinkedIn
                </button>
              </div>
            )}
          </div>
        )}
        
        {message && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
            {message}
          </div>
        )}
      </div>

      {/* Scheduler Form */}
      <SchedulerForm />
    </div>
  );
}
