"use client";
import { useState, useEffect } from "react";

interface UserStatus {
  isAuthenticated: boolean;
  userName?: string;
  userEmail?: string;
}

export default function SchedulerForm() {
  const [content, setContent] = useState("");
  const [time, setTime] = useState("");
  const [userStatus, setUserStatus] = useState<UserStatus>({ isAuthenticated: false });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
    
    // Set up polling to check for pending posts every 30 seconds
    const pollInterval = setInterval(() => {
      if (userStatus.isAuthenticated) {
        triggerPublish();
      }
    }, 30000); // 30 seconds

    return () => clearInterval(pollInterval);
  }, [userStatus.isAuthenticated]);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/linkedin/status');
      const data = await response.json();
      setUserStatus({
        isAuthenticated: data.connected,
        userName: data.userName,
        userEmail: data.userEmail
      });
    } catch (error) {
      console.error('Failed to check auth status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const triggerPublish = async () => {
    try {
      // Silently trigger publishing check
      await fetch('/api/trigger-publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      // Fail silently to avoid disturbing user experience
      console.log('Background publish check failed:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userStatus.isAuthenticated) {
      alert("Please connect your LinkedIn account first!");
      return;
    }

    const res = await fetch("/api/schedule", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content,
        scheduledTime: new Date(time),
      }),
    });
    
    const data = await res.json();
    
    if (data.success) {
      alert(`Post scheduled successfully for ${userStatus.userName}!`);
      setContent("");
      setTime("");
    } else {
      if (data.requiresAuth) {
        alert("Please connect your LinkedIn account first!");
      } else {
        alert(`Error: ${data.error}`);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 max-w-md mx-auto mt-10 p-4 border rounded-lg shadow">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 max-w-md mx-auto mt-10 p-4 border rounded-lg shadow">
      <h2 className="text-xl font-semibold text-center">Schedule a Post</h2>
      
      {/* User Authentication Status */}
      <div className={`p-3 rounded-lg text-sm ${
        userStatus.isAuthenticated 
          ? 'bg-green-100 border border-green-300 text-green-800' 
          : 'bg-red-100 border border-red-300 text-red-800'
      }`}>
        {userStatus.isAuthenticated ? (
          <div>
            <div className="font-medium">✅ LinkedIn Connected</div>
            <div>Posting as: {userStatus.userName}</div>
            <div className="text-xs opacity-75">{userStatus.userEmail}</div>
          </div>
        ) : (
          <div>
            <div className="font-medium">❌ LinkedIn Not Connected</div>
            <div>
              <a 
                href="/api/linkedin/auth" 
                className="text-blue-600 hover:text-blue-800 underline"
              >
                Connect your LinkedIn account
              </a> to schedule posts
            </div>
          </div>
        )}
      </div>

      {/* Manual Publish Trigger */}
      {userStatus.isAuthenticated && (
        <button
          type="button"
          onClick={() => triggerPublish()}
          className="bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 text-sm"
        >
          ⚡ Check & Post Pending Posts Now
        </button>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4"
        style={{ opacity: userStatus.isAuthenticated ? 1 : 0.6 }}
      >

      <textarea
        placeholder="Write your post..."
        className="p-2 border rounded-md"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        required
      />

      <input
        type="datetime-local"
        className="p-2 border rounded-md"
        value={time}
        onChange={(e) => setTime(e.target.value)}
        required
      />

      <button
        type="submit"
        disabled={!userStatus.isAuthenticated}
        className={`py-2 rounded-md font-medium ${
          userStatus.isAuthenticated 
            ? 'bg-blue-600 text-white hover:bg-blue-700' 
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        {userStatus.isAuthenticated ? 'Schedule Post' : 'Connect LinkedIn First'}
      </button>
      </form>
    </div>
  );
}
