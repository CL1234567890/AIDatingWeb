import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

function TestAuth() {
    const { currentUser } = useAuth();
    const [testResult, setTestResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const testBackendAuth = async () => {
        setLoading(true);
        setError(null);
        setTestResult(null);

        try {
            // Get the Firebase ID token
            const token = await currentUser.getIdToken();
            console.log('🔑 Firebase Token obtained:', token.substring(0, 50) + '...');

            // Test 1: Health check (no auth required)
            console.log('Testing health endpoint...');
            const healthResponse = await fetch('http://localhost:8000/api/health');
            const healthData = await healthResponse.json();
            console.log('✅ Health check:', healthData);

            // Test 2: Protected endpoint (auth required)
            console.log('Testing protected endpoint with JWT...');
            const authResponse = await fetch('http://localhost:8000/api/auth/test', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!authResponse.ok) {
                throw new Error(`HTTP ${authResponse.status}: ${authResponse.statusText}`);
            }

            const authData = await authResponse.json();
            console.log('✅ Auth test successful:', authData);

            // Test 3: User profile endpoint
            console.log('Testing user profile endpoint...');
            const profileResponse = await fetch('http://localhost:8000/api/user/profile', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const profileData = await profileResponse.json();
            console.log('✅ Profile endpoint:', profileData);

            setTestResult({
                health: healthData,
                auth: authData,
                profile: profileData,
                success: true
            });

        } catch (err) {
            console.error('❌ Test failed:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const testWithoutAuth = async () => {
        setLoading(true);
        setError(null);

        try {
            console.log('Testing protected endpoint WITHOUT auth token...');
            const response = await fetch('http://localhost:8000/api/auth/test', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            console.log('Response:', data);
            
            if (!response.ok) {
                setError(`Expected error: ${response.status} - This endpoint requires authentication`);
            }
        } catch (err) {
            setError(`Expected error: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    if (!currentUser) {
        return (
            <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
                <h2>JWT Authentication Test</h2>
                <p style={{ color: 'red' }}>⚠️ You must be logged in to test authentication</p>
                <p>Please log in first.</p>
            </div>
        );
    }

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
            <h2>🔐 JWT Authentication Test</h2>
            
            <div style={{ background: '#f0f0f0', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
                <h3>Current User:</h3>
                <p><strong>Email:</strong> {currentUser.email}</p>
                <p><strong>UID:</strong> {currentUser.uid}</p>
                <p><strong>Email Verified:</strong> {currentUser.emailVerified ? 'Yes' : 'No'}</p>
            </div>

            <div style={{ marginBottom: '20px' }}>
                <button 
                    onClick={testBackendAuth}
                    disabled={loading}
                    style={{
                        padding: '12px 24px',
                        fontSize: '16px',
                        backgroundColor: '#4CAF50',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        marginRight: '10px'
                    }}
                >
                    {loading ? 'Testing...' : '✅ Test With Authentication'}
                </button>

                <button 
                    onClick={testWithoutAuth}
                    disabled={loading}
                    style={{
                        padding: '12px 24px',
                        fontSize: '16px',
                        backgroundColor: '#ff9800',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: loading ? 'not-allowed' : 'pointer'
                    }}
                >
                    {loading ? 'Testing...' : '❌ Test Without Authentication'}
                </button>
            </div>

            {error && (
                <div style={{ 
                    background: '#ffebee', 
                    color: '#c62828', 
                    padding: '15px', 
                    borderRadius: '4px',
                    marginBottom: '20px'
                }}>
                    <h4>Error:</h4>
                    <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{error}</pre>
                </div>
            )}

            {testResult && testResult.success && (
                <div style={{ 
                    background: '#e8f5e9', 
                    color: '#2e7d32', 
                    padding: '15px', 
                    borderRadius: '4px',
                    marginBottom: '20px'
                }}>
                    <h3>✅ All Tests Passed!</h3>
                    
                    <h4>1. Health Check (No Auth):</h4>
                    <pre style={{ 
                        background: 'white', 
                        padding: '10px', 
                        borderRadius: '4px',
                        overflow: 'auto'
                    }}>
                        {JSON.stringify(testResult.health, null, 2)}
                    </pre>

                    <h4>2. Auth Test (With JWT):</h4>
                    <pre style={{ 
                        background: 'white', 
                        padding: '10px', 
                        borderRadius: '4px',
                        overflow: 'auto'
                    }}>
                        {JSON.stringify(testResult.auth, null, 2)}
                    </pre>

                    <h4>3. User Profile (With JWT):</h4>
                    <pre style={{ 
                        background: 'white', 
                        padding: '10px', 
                        borderRadius: '4px',
                        overflow: 'auto'
                    }}>
                        {JSON.stringify(testResult.profile, null, 2)}
                    </pre>
                </div>
            )}

            <div style={{ 
                background: '#e3f2fd', 
                padding: '15px', 
                borderRadius: '4px',
                marginTop: '20px'
            }}>
                <h4>ℹ️ What This Tests:</h4>
                <ul>
                    <li>✅ Backend server is running on http://localhost:8000</li>
                    <li>✅ CORS is configured correctly</li>
                    <li>✅ Firebase JWT token is obtained from frontend</li>
                    <li>✅ Backend verifies JWT token with Firebase Admin SDK</li>
                    <li>✅ Protected endpoints require authentication</li>
                    <li>✅ User information is extracted from JWT token</li>
                </ul>
                <p><strong>Check the browser console for detailed logs!</strong></p>
            </div>
        </div>
    );
}

export default TestAuth;
