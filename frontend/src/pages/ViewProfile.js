import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import '../App.css';

function ViewProfile() {
  const { userId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (userId) {
      // If trying to view your own profile, redirect to MyProfile
      if (userId === currentUser.uid) {
        navigate('/profile');
        return;
      }
      fetchProfile();
    }
  }, [userId, currentUser]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = await currentUser.getIdToken();
      const response = await fetch(`http://localhost:8000/api/profile/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        setProfile(data.profile);
      } else {
        setError(data.detail || 'Failed to load profile');
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="auth-card" style={{ maxWidth: '620px', margin: '0 auto' }}>
        <h2>Loading Profile...</h2>
        <p className="subtext">Please wait while we load this user's profile.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="auth-card" style={{ maxWidth: '620px', margin: '0 auto' }}>
        <h2>Profile Not Found</h2>
        <div style={{ 
          padding: '12px', 
          marginTop: '16px',
          marginBottom: '20px',
          backgroundColor: 'rgba(239, 68, 68, 0.15)', 
          color: '#fca5a5', 
          borderRadius: '12px',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          fontSize: '0.9rem'
        }}>
          {error}
        </div>
        <button onClick={() => navigate(-1)} className="nav-btn nav-ghost" style={{ width: '100%' }}>
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="auth-card" style={{ maxWidth: '620px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ margin: '0 0 6px' }}>{profile?.name || 'User Profile'}</h2>
          <p className="subtext" style={{ margin: 0 }}>View this user's profile</p>
        </div>
        <button 
          onClick={() => navigate(-1)} 
          className="nav-btn nav-ghost"
          style={{ padding: '8px 18px' }}
        >
          ← Back
        </button>
      </div>

      <div>
        <div className="form-group">
          <div className="label-row">
            <span className="label">Name</span>
          </div>
          <div style={{ 
            padding: '10px 12px',
            borderRadius: '12px',
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-main)',
            fontSize: '1rem'
          }}>
            {profile?.name || 'Not available'}
          </div>
        </div>

        {(profile?.age || profile?.gender) && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            {profile?.age && (
              <div className="form-group">
                <div className="label-row">
                  <span className="label">Age</span>
                </div>
                <div style={{ 
                  padding: '10px 12px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-main)'
                }}>
                  {profile.age}
                </div>
              </div>
            )}

            {profile?.gender && (
              <div className="form-group">
                <div className="label-row">
                  <span className="label">Gender</span>
                </div>
                <div style={{ 
                  padding: '10px 12px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-main)'
                }}>
                  {profile.gender}
                </div>
              </div>
            )}
          </div>
        )}

        {profile?.sexual_orientation && (
          <div className="form-group">
            <div className="label-row">
              <span className="label">Sexual Orientation</span>
            </div>
            <div style={{ 
              padding: '10px 12px',
              borderRadius: '12px',
              backgroundColor: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-main)'
            }}>
              {profile.sexual_orientation}
            </div>
          </div>
        )}

        {profile?.location && (
          <div className="form-group">
            <div className="label-row">
              <span className="label">Location</span>
            </div>
            <div style={{ 
              padding: '10px 12px',
              borderRadius: '12px',
              backgroundColor: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-main)'
            }}>
              {profile.location}
            </div>
          </div>
        )}

        {profile?.interest_tags && (
          <div className="form-group">
            <div className="label-row">
              <span className="label">Interests</span>
            </div>
            <div style={{ 
              padding: '10px 12px',
              borderRadius: '12px',
              backgroundColor: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-main)'
            }}>
              {profile.interest_tags}
            </div>
          </div>
        )}

        {profile?.bio && (
          <div className="form-group" style={{ marginBottom: 0 }}>
            <div className="label-row">
              <span className="label">About</span>
            </div>
            <div style={{ 
              padding: '10px 12px',
              borderRadius: '12px',
              backgroundColor: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-main)',
              whiteSpace: 'pre-wrap',
              lineHeight: '1.6',
              minHeight: '80px'
            }}>
              {profile.bio}
            </div>
          </div>
        )}

        {!profile?.age && !profile?.gender && !profile?.location && !profile?.interest_tags && !profile?.bio && (
          <div style={{ 
            padding: '40px 20px',
            textAlign: 'center',
            color: 'var(--text-muted)',
            fontSize: '0.9rem',
            fontStyle: 'italic'
          }}>
            This user hasn't filled out their profile yet.
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
        <button 
          onClick={() => navigate(`/conversations/${userId}`)}
          className="primary-button"
          style={{ flex: 1 }}
        >
          Send Message
        </button>
        <button 
          onClick={() => navigate('/matches')}
          className="nav-btn nav-ghost"
          style={{ flex: 1 }}
        >
          View Matches
        </button>
      </div>
    </div>
  );
}

export default ViewProfile;
