import React, { useState, useEffect } from 'react';
import Cage from './views/cages/Cage';
import SignIn from './views/auth/SignIn';
import SignUp from './views/auth/SignUp';
import OwnerDashboard from './views/dashboard/OwnerDashboard';
import RecordedData from './views/RecordedData';
import './index.css';

const App = () => {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [isCagesAdded, setIsCagesAdded] = useState(false);
  const [date, setDate] = useState('');
  const [cages, setCages] = useState([]);
  const [shadeEggs, setShadeEggs] = useState('');
  const [cageEggData, setCageEggData] = useState({});

  // Check for existing session on app load
  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (token && savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        setIsSignedIn(true);
      } catch (error) {
        // If parsing fails, clear storage and start fresh
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, []);

  useEffect(() => {
    const currentDate = new Date();
    const formattedDate = currentDate.toISOString().split('T')[0];
    setDate(formattedDate);
  }, []);

  // We removed the dynamic cage count input since we have a fixed farm layout

  const handleDateChange = (e) => {
    setDate(e.target.value);
  };

  const addCages = () => {
    setError('');
    // Set up the farm's cage layout for egg collection
    // We have 2 cages with different configurations
    const newCages = [
      {
        id: 1,
        type: 'combined', // Combined front and back partitions
        partitions: Array.from({ length: 32 }, () => ({
          chickens: 4,
          eggsCollected: 0,
          comments: '',
        })),
      },
      {
        id: 2,
        type: 'standard', // Separate front and back partitions
        partitions: Array.from({ length: 32 }, () => ({
          chickens: 4,
          eggsCollected: 0,
          comments: '',
        })),
      }
    ];

    setCages(newCages);
    setIsCagesAdded(true);
  };

  const handleSignIn = (userData) => {
    setIsSignedIn(true);
    setUser(userData);
  };

  // Signup is now restricted to owners only

  const handleSignUpSuccess = (userData) => {
    setIsSigningUp(false);
    // After successful signup, check if user is automatically logged in
    const token = localStorage.getItem('token');
    if (token) {
      setIsSignedIn(true);
      if (userData) {
        setUser(userData);
      }
    }
  };

  const viewRecordedData = () => {
    alert('Feature coming soon - view recorded egg collection data');
  };

  const handleSubmitAllData = async () => {
    // Make sure we have some data to submit
    const hasShadeEggs = parseInt(shadeEggs) > 0;
    const hasCageData = Object.keys(cageEggData).length > 0;

    console.log('DEBUG: Starting submission check');
    console.log('DEBUG: hasShadeEggs:', hasShadeEggs, 'shadeEggs value:', shadeEggs);
    console.log('DEBUG: hasCageData:', hasCageData, 'cageEggData keys:', Object.keys(cageEggData));

    if (!hasShadeEggs && !hasCageData) {
      alert('Please enter egg counts from either the shade area or cage collection before submitting.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      console.log('DEBUG: Token present:', !!token);

      // Prepare cage data for submission
      const cageData = Object.entries(cageEggData).map(([cageId, eggData]) => {
        const cage = cages.find(c => c.id === parseInt(cageId));
        if (!cage) return null;

        // Organize eggs by partition and box
        const partitionCounts = {};
        Object.entries(eggData).forEach(([key, value]) => {
          const parts = key.split('-');
          const partitionIndex = parseInt(parts[1]);
          const rowIndex = parseInt(parts[2]);
          const colIndex = parseInt(parts[3]);

          // Support both old and new data formats
          let count = 0;
          let boxNumber = colIndex + 1;

          if (typeof value === 'object' && value.count !== undefined) {
            count = value.count;
            boxNumber = value.boxNumber || boxNumber;
          } else {
            count = parseInt(value) || 0;
          }

          if (count > 0) {
            if (!partitionCounts[partitionIndex]) {
              partitionCounts[partitionIndex] = [];
            }
            // Record each box with its egg count
            partitionCounts[partitionIndex].push({
              value: count,
              boxNumber: boxNumber,
              partitionIndex: partitionIndex
            });
          }
        });

        return {
          cageId: parseInt(cageId),
          cageType: cage.type,
          partitions: Object.entries(partitionCounts).map(([partitionIndex, eggs]) => ({
            partitionIndex: parseInt(partitionIndex) + 1,
            eggsCollected: eggs,
            comments: '',
          })),
        };
      }).filter(Boolean);

      const submissionData = {
        date: date,
        shade_eggs: parseInt(shadeEggs) || 0,
        cages: cageData,
      };

      console.log('DEBUG: Prepared submission data:', submissionData);

      // Send the data to the backend for processing

      const response = await fetch('/api/cages/eggs/submit-daily-collection/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify(submissionData),
      });

      console.log('DEBUG: Response status:', response.status);
      console.log('DEBUG: Response ok:', response.ok);

      if (response.ok) {
        const responseData = await response.json();
        console.log('DEBUG: Submission successful, response:', responseData);
        alert('Egg collection data submitted successfully!');
        // Clear the form for the next collection
        setIsCagesAdded(false);
        setCages([]);
        setShadeEggs('');
        setCageEggData({});
      } else {
        const errorData = await response.json();
        console.error('DEBUG: Submission failed:', errorData);
        alert(`Submission failed: ${errorData.detail || errorData.message || 'Please try again'}`);
      }
    } catch (error) {
      console.error('DEBUG: Network error during submission:', error);
      alert('Connection error. Please check your internet and try again.');
    }
  };

  if (isSigningUp) {
    return <SignUp onSignUpSuccess={handleSignUpSuccess} onBack={() => setIsSigningUp(false)} />;
  }

  if (!isSignedIn) {
    return <SignIn onSignIn={handleSignIn} onSignUp={() => setIsSigningUp(true)} />;
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsSignedIn(false);
    setUser(null);
    setIsCagesAdded(false);
    setCages([]);
    setShadeEggs('');
    setError('');
  };

  // Owners get the full dashboard with management features
  if (user && user.role === 'owner') {
    return (
      <div className="eggventory-app">
        <div className="header" style={{ display: 'none' }}>
          <h1 className="companyname">Joe Farm - Owner Dashboard</h1>
        </div>
        <OwnerDashboard />
        <div className="worker-interface-section" style={{
          marginTop: '20px',
          padding: '15px',
          background: 'linear-gradient(135deg, rgba(255, 193, 7, 0.08) 0%, rgba(255, 235, 59, 0.08) 100%)',
          border: '1px solid #ff6b35',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(255, 107, 53, 0.15)',
          backdropFilter: 'blur(5px)'
        }}>
          <h3 style={{
            color: '#f57c00',
            fontSize: '1.3rem',
            fontWeight: '600',
            textAlign: 'center',
            marginBottom: '15px',
            textShadow: '1px 1px 2px rgba(0,0,0,0.1)'
          }}>
            🥚 Egg Collection Entry (Owner Access)
          </h3>
          <div className="date-section" style={{
            textAlign: 'center',
            marginBottom: '15px'
          }}>
            <label style={{
              fontSize: '1rem',
              fontWeight: '500',
              color: '#f57c00',
              marginRight: '8px'
            }}>
              📅 Date:
            </label>
            <input
              type="date"
              value={date}
              onChange={handleDateChange}
              className="input-date"
              style={{
                padding: '6px 10px',
                borderRadius: '6px',
                border: '1px solid #ff6b35',
                fontSize: '0.9rem',
                fontWeight: '400',
                backgroundColor: 'white'
              }}
            />
          </div>
          <div className="input-section" style={{ textAlign: 'center' }}>
            {!isCagesAdded && (
              <>
                <button
                  onClick={addCages}
                  className="btn-add-cages"
                  style={{
                    background: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)',
                    color: 'white',
                    border: 'none',
                    padding: '8px 20px',
                    borderRadius: '15px',
                    fontSize: '1rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    boxShadow: '0 3px 10px rgba(255, 107, 53, 0.25)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    textTransform: 'none'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.boxShadow = '0 4px 15px rgba(255, 107, 53, 0.35)';
                    e.target.style.transform = 'translateY(-1px) scale(1.01)';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.boxShadow = '0 3px 10px rgba(255, 107, 53, 0.25)';
                    e.target.style.transform = 'translateY(0) scale(1)';
                  }}
                >
                  🚀 Start Egg Collection
                </button>
              </>
            )}
            {error && <p className="error-message" style={{
              color: '#d32f2f',
              fontWeight: '400',
              marginTop: '10px',
              fontSize: '0.9rem'
            }}>{error}</p>}
          </div>
          {isCagesAdded && cages.map((cage) => <Cage key={cage.id} cage={cage} onEggDataChange={setCageEggData} />)}

          {/* Additional eggs from shade areas */}
          {isCagesAdded && (
            <div className="shade-section" style={{
              marginTop: '30px',
              padding: '25px',
              background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.08) 0%, rgba(139, 195, 74, 0.08) 100%)',
              border: '2px solid #4caf50',
              borderRadius: '16px',
              boxShadow: '0 6px 20px rgba(76, 175, 80, 0.2)',
              backdropFilter: 'blur(8px)',
              textAlign: 'center'
            }}>
              <h3 style={{
                color: '#2e7d32',
                fontSize: '1.5rem',
                fontWeight: '700',
                marginBottom: '20px',
                textShadow: '1px 1px 3px rgba(0,0,0,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px'
              }}>
                🌳 Eggs from Shade Areas
              </h3>
              <div className="input-section" style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '15px'
              }}>
                <label style={{
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  color: '#388e3c',
                  marginBottom: '8px'
                }}>
                  Number of eggs collected from shade:
                </label>
                <input
                  type="number"
                  value={shadeEggs}
                  onChange={(e) => setShadeEggs(e.target.value)}
                  min="0"
                  placeholder="Enter eggs from shade"
                  className="input-cage-number"
                  style={{
                    padding: '12px 16px',
                    borderRadius: '12px',
                    border: '2px solid #4caf50',
                    fontSize: '1.1rem',
                    fontWeight: '500',
                    textAlign: 'center',
                    width: '200px',
                    backgroundColor: 'white',
                    boxShadow: '0 2px 8px rgba(76, 175, 80, 0.15)',
                    transition: 'all 0.3s ease',
                    outline: 'none'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#2e7d32';
                    e.target.style.boxShadow = '0 4px 12px rgba(76, 175, 80, 0.3)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#4caf50';
                    e.target.style.boxShadow = '0 2px 8px rgba(76, 175, 80, 0.15)';
                  }}
                />
                <button
                  onClick={handleSubmitAllData}
                  className="btn-submit-all"
                  style={{
                    background: 'linear-gradient(135deg, #4caf50 0%, #388e3c 100%)',
                    color: 'white',
                    border: 'none',
                    padding: '14px 32px',
                    borderRadius: '25px',
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    boxShadow: '0 4px 15px rgba(76, 175, 80, 0.3)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    textTransform: 'none',
                    marginTop: '10px'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.boxShadow = '0 6px 20px rgba(76, 175, 80, 0.4)';
                    e.target.style.transform = 'translateY(-2px) scale(1.02)';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.boxShadow = '0 4px 15px rgba(76, 175, 80, 0.3)';
                    e.target.style.transform = 'translateY(0) scale(1)';
                  }}
                >
                  ✅ Submit All Data
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Workers get the egg collection interface
  return (
    <div className="eggventory-app">
      <div className="header">
        <h1 className="companyname">Joe Farm</h1>
        <button onClick={handleLogout} className="btn-logout">Logout</button>
      </div>
      <div className="date-section">
        <label>Date: </label>
        <input
          type="date"
          value={date}
          onChange={handleDateChange}
          className="input-date"
        />
      </div>
      <div className="input-section">
        {!isCagesAdded && (
          <>
            <button onClick={addCages} className="btn-add-cages">Start Egg Collection</button>
          </>
        )}
        {error && <p className="error-message">{error}</p>}
        <div className="view-data-section">
          <button onClick={viewRecordedData} className="btn-view-data">View Recorded Data</button>
        </div>
      </div>
      {isCagesAdded && cages.map((cage) => <Cage key={cage.id} cage={cage} onEggDataChange={setCageEggData} />)}

      {/* Shade eggs section */}
      {isCagesAdded && (
        <div className="shade-section" style={{
          marginTop: '30px',
          padding: '25px',
          background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.08) 0%, rgba(139, 195, 74, 0.08) 100%)',
          border: '2px solid #4caf50',
          borderRadius: '16px',
          boxShadow: '0 6px 20px rgba(76, 175, 80, 0.2)',
          backdropFilter: 'blur(8px)',
          textAlign: 'center'
        }}>
          <h3 style={{
            color: '#2e7d32',
            fontSize: '1.5rem',
            fontWeight: '700',
            marginBottom: '20px',
            textShadow: '1px 1px 3px rgba(0,0,0,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px'
          }}>
            🌳 Shade Eggs Collection
          </h3>
          <div className="input-section" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '15px'
          }}>
            <label style={{
              fontSize: '1.1rem',
              fontWeight: '600',
              color: '#388e3c',
              marginBottom: '8px'
            }}>
              Number of eggs collected from shade:
            </label>
            <input
              type="number"
              value={shadeEggs}
              onChange={(e) => setShadeEggs(e.target.value)}
              min="0"
              placeholder="Enter eggs from shade"
              className="input-cage-number"
              style={{
                padding: '12px 16px',
                borderRadius: '12px',
                border: '2px solid #4caf50',
                fontSize: '1.1rem',
                fontWeight: '500',
                textAlign: 'center',
                width: '200px',
                backgroundColor: 'white',
                boxShadow: '0 2px 8px rgba(76, 175, 80, 0.15)',
                transition: 'all 0.3s ease',
                outline: 'none'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#2e7d32';
                e.target.style.boxShadow = '0 4px 12px rgba(76, 175, 80, 0.3)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#4caf50';
                e.target.style.boxShadow = '0 2px 8px rgba(76, 175, 80, 0.15)';
              }}
            />
            <button
              onClick={handleSubmitAllData}
              className="btn-submit-all"
              style={{
                background: 'linear-gradient(135deg, #4caf50 0%, #388e3c 100%)',
                color: 'white',
                border: 'none',
                padding: '14px 32px',
                borderRadius: '25px',
                fontSize: '1.1rem',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(76, 175, 80, 0.3)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                textTransform: 'none',
                marginTop: '10px'
              }}
              onMouseOver={(e) => {
                e.target.style.boxShadow = '0 6px 20px rgba(76, 175, 80, 0.4)';
                e.target.style.transform = 'translateY(-2px) scale(1.02)';
              }}
              onMouseOut={(e) => {
                e.target.style.boxShadow = '0 4px 15px rgba(76, 175, 80, 0.3)';
                e.target.style.transform = 'translateY(0) scale(1)';
              }}
            >
              ✅ Submit All Data
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
