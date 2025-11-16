import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../App.css';

function MyProfile() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    sexual_orientation: '',
    location: '',
    interest_tags: '',
    education_level: '',
    income_bracket: '',
    bio: ''
  });

  useEffect(() => {
    fetchProfile();
  }, [currentUser]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = await currentUser.getIdToken();
      const response = await fetch('http://localhost:8000/api/profile/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        setProfile(data.profile);
        setFormData({
          name: data.profile.name || '',
          age: data.profile.age || '',
          gender: data.profile.gender || '',
          sexual_orientation: data.profile.sexual_orientation || '',
          location: data.profile.location || '',
          interest_tags: data.profile.interest_tags || '',
          education_level: data.profile.education_level || '',
          income_bracket: data.profile.income_bracket || '',
          bio: data.profile.bio || ''
        });
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const token = await currentUser.getIdToken();
      
      // Convert age to integer if provided
      const updateData = { ...formData };
      if (updateData.age) {
        updateData.age = parseInt(updateData.age);
      }

      const response = await fetch('http://localhost:8000/api/profile/me', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setProfile(data.profile);
        setSuccess('Profile updated successfully!');
        setIsEditing(false);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.detail || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset form to current profile data
    if (profile) {
      setFormData({
        name: profile.name || '',
        age: profile.age || '',
        gender: profile.gender || '',
        sexual_orientation: profile.sexual_orientation || '',
        location: profile.location || '',
        interest_tags: profile.interest_tags || '',
        education_level: profile.education_level || '',
        income_bracket: profile.income_bracket || '',
        bio: profile.bio || ''
      });
    }
    setIsEditing(false);
    setError('');
    setSuccess('');
  };

  if (loading) {
    return (
      <div className="auth-card" style={{ maxWidth: '620px', margin: '0 auto' }}>
        <h2>My Profile</h2>
        <p className="subtext">Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="auth-card" style={{ maxWidth: '620px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ margin: '0 0 6px' }}>My Profile</h2>
          <p className="subtext" style={{ margin: 0 }}>
            {isEditing ? 'Edit your information' : 'View your profile details'}
          </p>
        </div>
        {!isEditing && (
          <button 
            onClick={() => setIsEditing(true)}
            className="nav-btn nav-solid"
            style={{ padding: '8px 18px' }}
          >
            Edit Profile
          </button>
        )}
      </div>

      {error && (
        <div style={{ 
          padding: '12px', 
          marginBottom: '16px', 
          backgroundColor: 'rgba(239, 68, 68, 0.15)', 
          color: '#fca5a5', 
          borderRadius: '12px',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          fontSize: '0.9rem'
        }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{ 
          padding: '12px', 
          marginBottom: '16px', 
          backgroundColor: 'rgba(34, 197, 94, 0.15)', 
          color: '#86efac', 
          borderRadius: '12px',
          border: '1px solid rgba(34, 197, 94, 0.3)',
          fontSize: '0.9rem'
        }}>
          {success}
        </div>
      )}

      {!isEditing ? (
        // View Mode
        <div>
          <div className="form-group">
            <div className="label-row">
              <span className="label">Email</span>
            </div>
            <div style={{ 
              padding: '10px 12px',
              borderRadius: '12px',
              backgroundColor: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-main)'
            }}>
              {currentUser.email}
            </div>
          </div>

          <div className="form-group">
            <div className="label-row">
              <span className="label">Name</span>
            </div>
            <div style={{ 
              padding: '10px 12px',
              borderRadius: '12px',
              backgroundColor: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-main)'
            }}>
              {profile?.name || 'Not set'}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
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
                {profile?.age || 'Not set'}
              </div>
            </div>

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
                {profile?.gender || 'Not set'}
              </div>
            </div>
          </div>

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
              {profile?.sexual_orientation || 'Not set'}
            </div>
          </div>

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
              {profile?.location || 'Not set'}
            </div>
          </div>

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
              {profile?.interest_tags || 'Not set'}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="form-group">
              <div className="label-row">
                <span className="label">Education</span>
              </div>
              <div style={{ 
                padding: '10px 12px',
                borderRadius: '12px',
                backgroundColor: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-main)'
              }}>
                {profile?.education_level || 'Not set'}
              </div>
            </div>

            <div className="form-group">
              <div className="label-row">
                <span className="label">Income</span>
              </div>
              <div style={{ 
                padding: '10px 12px',
                borderRadius: '12px',
                backgroundColor: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-main)'
              }}>
                {profile?.income_bracket || 'Not set'}
              </div>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <div className="label-row">
              <span className="label">Bio</span>
            </div>
            <div style={{ 
              padding: '10px 12px',
              borderRadius: '12px',
              backgroundColor: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-main)',
              whiteSpace: 'pre-wrap',
              minHeight: '80px'
            }}>
              {profile?.bio || 'Not set'}
            </div>
          </div>
        </div>
      ) : (
        // Edit Mode
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <div className="label-row">
              <span className="label">Email</span>
              <span className="helper">Cannot be changed</span>
            </div>
            <input 
              type="email" 
              value={currentUser.email} 
              disabled
              className="input"
              style={{ 
                opacity: 0.6,
                cursor: 'not-allowed'
              }}
            />
          </div>

          <div className="form-group">
            <div className="label-row">
              <span className="label">Name *</span>
            </div>
            <input 
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="input"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="form-group">
              <div className="label-row">
                <span className="label">Age</span>
              </div>
              <input 
                type="number"
                name="age"
                value={formData.age}
                onChange={handleInputChange}
                min="18"
                max="120"
                className="input"
              />
            </div>

            <div className="form-group">
              <div className="label-row">
                <span className="label">Gender</span>
              </div>
              <input 
                type="text"
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                placeholder="e.g., Male, Female"
                className="input"
              />
            </div>
          </div>

          <div className="form-group">
            <div className="label-row">
              <span className="label">Sexual Orientation</span>
            </div>
            <input 
              type="text"
              name="sexual_orientation"
              value={formData.sexual_orientation}
              onChange={handleInputChange}
              placeholder="e.g., Straight, Gay, Bisexual"
              className="input"
            />
          </div>

          <div className="form-group">
            <div className="label-row">
              <span className="label">Location</span>
            </div>
            <input 
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="e.g., New York, NY"
              className="input"
            />
          </div>

          <div className="form-group">
            <div className="label-row">
              <span className="label">Interests</span>
              <span className="helper">Comma-separated</span>
            </div>
            <input 
              type="text"
              name="interest_tags"
              value={formData.interest_tags}
              onChange={handleInputChange}
              placeholder="e.g., hiking, cooking, movies"
              className="input"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="form-group">
              <div className="label-row">
                <span className="label">Education</span>
              </div>
              <input 
                type="text"
                name="education_level"
                value={formData.education_level}
                onChange={handleInputChange}
                placeholder="e.g., Bachelor's"
                className="input"
              />
            </div>

            <div className="form-group">
              <div className="label-row">
                <span className="label">Income</span>
              </div>
              <input 
                type="text"
                name="income_bracket"
                value={formData.income_bracket}
                onChange={handleInputChange}
                placeholder="e.g., $50k-$75k"
                className="input"
              />
            </div>
          </div>

          <div className="form-group">
            <div className="label-row">
              <span className="label">Bio</span>
              <span className="helper">{formData.bio.length}/500</span>
            </div>
            <textarea 
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              maxLength="500"
              rows="4"
              placeholder="Tell us about yourself..."
              className="input"
              style={{ 
                resize: 'vertical',
                minHeight: '80px',
                fontFamily: 'inherit'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button 
              type="submit" 
              disabled={saving}
              className="primary-button"
              style={{ flex: 1 }}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button 
              type="button" 
              onClick={handleCancel}
              disabled={saving}
              className="nav-btn nav-ghost"
              style={{ flex: 1 }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default MyProfile;
