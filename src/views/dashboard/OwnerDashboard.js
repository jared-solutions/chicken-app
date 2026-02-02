import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  CircularProgress,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tabs,
  Tab,
  IconButton,
  Badge,
  Tooltip,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
// import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// Backend API URL - Update this when deploying to production
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://joe-farm-backend.onrender.com';

const OwnerDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    password: '',
    role: 'worker',
    phone: '',
    farm_name: '',
    first_name: '',
    last_name: ''
  });
  const [chickenCount, setChickenCount] = useState('');
  // Get user from localStorage for welcome message
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [feedConsumptionKg, setFeedConsumptionKg] = useState('');
  const [saleData, setSaleData] = useState({ trays_sold: '', price_per_tray: '', date: new Date().toISOString().split('T')[0] });
  // eslint-disable-next-line no-unused-vars
  const [feedPurchaseData, setFeedPurchaseData] = useState({ sacks: '', quantity_kg: '', total_cost: '', feed_type: '', date: new Date().toISOString().split('T')[0] });
  // eslint-disable-next-line no-unused-vars
  const [feedConsumptionData, setFeedConsumptionData] = useState({ quantity_used_kg: '', date: new Date().toISOString().split('T')[0] });
  const [expenseData, setExpenseData] = useState({ expense_type: '', amount: '', description: '', date: new Date().toISOString().split('T')[0], sacks: '', kg_per_sack: '70' });
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  const [profileData, setProfileData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    currentPassword: ''
  });
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportContent, setReportContent] = useState('');
  const [reportTitle, setReportTitle] = useState('');
  const [eggCollectionDialogOpen, setEggCollectionDialogOpen] = useState(false);
  const [salesDialogOpen, setSalesDialogOpen] = useState(false);
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);
  const [medicalDialogOpen, setMedicalDialogOpen] = useState(false);
  const [feedDialogOpen, setFeedDialogOpen] = useState(false);
  const [feedConsumptionDialogOpen, setFeedConsumptionDialogOpen] = useState(false);
  const [chickenCountDialogOpen, setChickenCountDialogOpen] = useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [settingsTabValue, setSettingsTabValue] = useState(0);
  const [users, setUsers] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUsersDialog, setShowUsersDialog] = useState(false);
  const [feedPerChicken, setFeedPerChicken] = useState('');
  const [totalDailyFeed, setTotalDailyFeed] = useState('');
  const [totalFeedManuallySet, setTotalFeedManuallySet] = useState(false);
  const [eggTableDialogOpen, setEggTableDialogOpen] = useState(false);
  const [eggTableData, setEggTableData] = useState(null);
  const [selectedTableDate, setSelectedTableDate] = useState(new Date().toISOString().split('T')[0]);

  // Load current user data when profile settings opens
  useEffect(() => {
    if (showProfileSettings) {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        try {
          const userData = JSON.parse(savedUser);
          setProfileData({
            username: userData.username || '',
            email: userData.email || '',
            password: '',
            confirmPassword: '',
            currentPassword: ''
          });
        } catch (error) {
          console.error('Error loading user data:', error);
        }
      }
    }
  }, [showProfileSettings]);

  useEffect(() => {
    // Clear any cached data on component mount
    setDashboardData(null);
    setLoading(true);
    fetchDashboardData();
  }, []);

  // Load feed settings when dashboard data loads
  useEffect(() => {
    if (dashboardData?.total_chickens && !totalFeedManuallySet) {
      const perChickenRate = parseFloat(feedPerChicken) || 0.12;
      const totalFeed = perChickenRate * dashboardData.total_chickens;
      setTotalDailyFeed(totalFeed.toFixed(1));
    }
  }, [dashboardData, feedPerChicken, totalFeedManuallySet]);

  // Fetch users when user management tab opens
  useEffect(() => {
    if (settingsTabValue === 3 && showProfileSettings) {
      fetchUsers();
    }
  }, [settingsTabValue, showProfileSettings]);

  // Periodically check for pending users (every 30 seconds)
  useEffect(() => {
    fetchPendingUsers();
    const interval = setInterval(fetchPendingUsers, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in to view dashboard');
        setLoading(false);
        return;
      }
      const response = await fetch(`${API_BASE_URL}/api/cages/dashboard/overview/`, {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Dashboard data received:', data);
        setDashboardData(data);
      } else if (response.status === 401) {
        // Token expired or invalid
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setError('Session expired. Please log in again.');
      } else {
        console.error('Dashboard API error:', response.status, response.statusText);
        setError('Failed to load dashboard data');
      }
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError('Error fetching dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!dashboardData) {
    return (
      <Box p={3}>
        <Alert severity="info">No data available</Alert>
      </Box>
    );
  }

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleCreateUser = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/auth/register/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`,
        },
        body: JSON.stringify({
          username: newUser.username,
          email: newUser.email,
          password: newUser.password,
          role: newUser.role
        }),
      });

      if (response.ok) {
        alert('User created successfully!');
        setUserDialogOpen(false);
        setNewUser({
          username: '',
          email: '',
          password: '',
          role: 'worker'
        });
      } else {
        const data = await response.json();
        // Handle specific error messages from Django REST framework
        let errorMessage = 'Failed to create user: ';
        if (data.username && data.username[0]) {
          errorMessage += `Username: ${data.username[0]}`;
        } else if (data.email && data.email[0]) {
          errorMessage += `Email: ${data.email[0]}`;
        } else if (data.password && data.password[0]) {
          errorMessage += `Password: ${data.password[0]}`;
        } else if (data.detail) {
          errorMessage += data.detail;
        } else if (data.non_field_errors && data.non_field_errors[0]) {
          errorMessage += data.non_field_errors[0];
        } else {
          errorMessage += 'Unknown error. Check console for details.';
          console.error('User creation error:', data);
        }
        alert(errorMessage);
      }
    } catch (error) {
      alert('Error creating user');
    }
  };

  const handleUpdateChickenCount = async () => {
    if (!chickenCount || chickenCount < 0) {
      alert('Please enter a valid chicken count');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/cages/chicken-count/', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`,
        },
        body: JSON.stringify({ total_chickens: parseInt(chickenCount) }),
      });

      if (response.ok) {
        alert('Chicken count updated successfully!');
        setChickenCount('');
        fetchDashboardData(); // Refresh data
      } else {
        const data = await response.json();
        alert(`Failed to update chicken count: ${data.detail || 'Unknown error'}`);
      }
    } catch (error) {
      alert('Error updating chicken count');
    }
  };

  const handleRecordSale = async () => {
    if (!saleData.trays_sold || !saleData.price_per_tray) {
      alert('Please fill in all sale fields');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/cages/sales/record/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`,
        },
        body: JSON.stringify(saleData),
      });

      if (response.ok) {
        alert('Sale recorded successfully!');
        setSaleData({ trays_sold: '', price_per_tray: '', date: new Date().toISOString().split('T')[0] });
        fetchDashboardData(); // Refresh data
      } else {
        const data = await response.json();
        alert(`Failed to record sale: ${data.detail || 'Unknown error'}`);
      }
    } catch (error) {
      alert('Error recording sale');
    }
  };

  const handleRecordExpense = async () => {
    if (!expenseData.amount || !expenseData.expense_type) {
      alert('Please fill in expense type and amount');
      return;
    }

    // Prepare data for submission
    let submissionData = { ...expenseData };

    // Handle feed purchases specially
    if (expenseData.expense_type === 'feed') {
      // Also record in feed purchase table
      const feedPurchaseData = {
        quantity_kg: expenseData.quantity_kg || (parseInt(expenseData.sacks || 0) * 70),
        total_cost: expenseData.amount,
        feed_type: 'general', // Default feed type
        date: expenseData.date,
        sacks: expenseData.sacks
      };

      try {
        const token = localStorage.getItem('token');
        await fetch(`${API_BASE_URL}/api/cages/feed/purchase/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${token}`,
          },
          body: JSON.stringify(feedPurchaseData),
        });
      } catch (error) {
        console.error('Error recording feed purchase:', error);
      }
    }

    // Handle medical treatments specially
    if (expenseData.expense_type === 'medicine') {
      // Also record in medical records table
      const medicalData = {
        treatment_type: expenseData.treatment_type || 'general',
        description: expenseData.description,
        cost: expenseData.amount,
        date: expenseData.date,
      };

      try {
        const token = localStorage.getItem('token');
        await fetch(`${API_BASE_URL}/api/cages/medical/record/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${token}`,
          },
          body: JSON.stringify(medicalData),
        });
      } catch (error) {
        console.error('Error recording medical treatment:', error);
      }
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/cages/expenses/record/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`,
        },
        body: JSON.stringify(submissionData),
      });

      if (response.ok) {
        alert('Expense recorded successfully!');
        setExpenseData({ expense_type: 'medicine', amount: '', description: '', date: new Date().toISOString().split('T')[0], sacks: '', quantity_kg: '', treatment_type: '' });
        fetchDashboardData(); // Refresh data
      } else {
        const data = await response.json();
        alert(`Failed to record expense: ${data.detail || 'Unknown error'}`);
      }
    } catch (error) {
      alert('Error recording expense');
    }
  };

  const handleRecordMedical = async () => {
    if (!expenseData.expense_type || !expenseData.description) {
      alert('Please fill in treatment type and description');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const medicalData = {
        treatment_type: expenseData.expense_type,
        description: expenseData.description,
        cost: expenseData.amount || 0,
        date: expenseData.date,
      };

      const response = await fetch(`${API_BASE_URL}/api/cages/medical/record/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`,
        },
        body: JSON.stringify(medicalData),
      });

      if (response.ok) {
        alert('Medical record created successfully!');
        setExpenseData({ expense_type: 'vaccination', amount: '', description: '', date: new Date().toISOString().split('T')[0] });
        fetchDashboardData(); // Refresh data
      } else {
        const data = await response.json();
        alert(`Failed to record medical treatment: ${data.detail || 'Unknown error'}`);
      }
    } catch (error) {
      alert('Error recording medical treatment');
    }
  };

  const handleRecordFeedPurchase = async () => {
    if (!feedPurchaseData.quantity_kg || !feedPurchaseData.total_cost || !feedPurchaseData.feed_type) {
      alert('Please fill in quantity, total cost, and feed type');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/cages/feed/purchase/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`,
        },
        body: JSON.stringify(feedPurchaseData),
      });

      if (response.ok) {
        alert('Feed purchase recorded successfully!');
        setFeedPurchaseData({ sacks: '', quantity_kg: '', total_cost: '', feed_type: '', date: new Date().toISOString().split('T')[0] });
        fetchDashboardData(); // Refresh data
      } else {
        const data = await response.json();
        alert(`Failed to record feed purchase: ${data.detail || 'Unknown error'}`);
      }
    } catch (error) {
      alert('Error recording feed purchase');
    }
  };

  const handleRecordFeedConsumption = async () => {
    if (!feedConsumptionData.quantity_used_kg) {
      alert('Please enter the amount of feed consumed');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/cages/feed/consumption/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`,
        },
        body: JSON.stringify(feedConsumptionData),
      });

      if (response.ok) {
        alert('Feed consumption recorded successfully!');
        setFeedConsumptionData({ quantity_used_kg: '', date: new Date().toISOString().split('T')[0] });
        fetchDashboardData(); // Refresh data
      } else {
        const data = await response.json();
        alert(`Failed to record feed consumption: ${data.detail || 'Unknown error'}`);
      }
    } catch (error) {
      alert('Error recording feed consumption');
    }
  };

  const handleUpdateSettings = async () => {
    if (!feedPerChicken || parseFloat(feedPerChicken) <= 0) {
      alert('Please enter a valid feed amount per chicken');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/cages/chicken-count/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`,
        },
        body: JSON.stringify({
          key: 'feed_per_chicken_daily_kg',
          value: feedPerChicken
        }),
      });

      if (response.ok) {
        alert('Settings updated successfully!');
        fetchDashboardData(); // Refresh data
      } else {
        const data = await response.json();
        alert(`Failed to update settings: ${data.detail || 'Unknown error'}`);
      }
    } catch (error) {
      alert('Error updating settings');
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/auth/users/', {
        headers: {
          'Authorization': `Token ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data);
        fetchPendingUsers(); // Also fetch pending users
      } else {
        alert('Failed to fetch users');
      }
    } catch (error) {
      alert('Error fetching users');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to remove this user? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/auth/users/${userId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Token ${token}`,
        },
      });

      if (response.ok) {
        alert('User removed successfully!');
        fetchUsers(); // Refresh the list
      } else {
        alert('Failed to remove user');
      }
    } catch (error) {
      alert('Error removing user');
    }
  };

  const fetchPendingUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/auth/pending-users/`, {
        headers: {
          'Authorization': `Token ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPendingUsers(data);
        
        // Create notifications for pending users
        const newNotifications = data.map(user => ({
          id: user.id,
          type: 'pending_user',
          message: `New user signup: ${user.username || user.email} is waiting for approval`,
          user: user,
          timestamp: new Date()
        }));
        
        // Only add new notifications (avoid duplicates)
        setNotifications(prev => {
          const existingIds = prev.map(n => n.id);
          const uniqueNew = newNotifications.filter(n => !existingIds.includes(n.id));
          return [...uniqueNew, ...prev];
        });
      } else {
        console.log('Failed to fetch pending users');
      }
    } catch (error) {
      console.log('Error fetching pending users');
    }
  };

  const handleApproveUser = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/auth/users/${userId}/approve/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
        },
      });

      if (response.ok) {
        alert('User approved successfully!');
        fetchPendingUsers(); // Refresh the list
        fetchUsers(); // Also refresh approved users list
      } else {
        const data = await response.json();
        alert(`Failed to approve user: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      alert('Error approving user');
    }
  };

  const handleViewTodaysEggTable = async () => {
    try {
      const token = localStorage.getItem('token');
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch(`${API_BASE_URL}/api/cages/reports/egg-collection-table/?date=${today}`, {
        headers: {
          'Authorization': 'Token ' + token,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setEggTableData(data);
        setEggTableDialogOpen(true);
      } else {
        alert('No egg collection data found for today');
      }
    } catch (error) {
      alert('Error loading egg collection table');
    }
  };

  const handleViewEggTable = async (date = null) => {
    try {
      const token = localStorage.getItem('token');
      const selectedDate = date || selectedTableDate;
      const response = await fetch(`${API_BASE_URL}/api/cages/reports/egg-collection-table/?date=${selectedDate}`, {
        headers: {
          'Authorization': 'Token ' + token,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setEggTableData(data);
      } else {
        alert(`No egg collection data found for ${selectedDate}`);
      }
    } catch (error) {
      alert('Error loading egg collection table');
    }
  };

  const handleUpdateProfile = async () => {
    if (profileData.password && profileData.password !== profileData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    if (profileData.password && !profileData.currentPassword) {
      alert('Current password is required to change password');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const updateData = {
        username: profileData.username,
        email: profileData.email,
      };

      if (profileData.password) {
        updateData.password = profileData.password;
        updateData.current_password = profileData.currentPassword;
      }

      const response = await fetch(`${API_BASE_URL}/api/auth/profile/update/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Token ' + token,
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Profile updated successfully!');
        setShowProfileSettings(false);

        // Update localStorage with new user data
        localStorage.setItem('user', JSON.stringify(data.user));
      } else {
        // Handle specific error messages
        let errorMessage = 'Failed to update profile: ';
        if (data.error) {
          errorMessage += data.error;
        } else if (data.detail) {
          errorMessage += data.detail;
        } else if (data.non_field_errors && data.non_field_errors.length > 0) {
          errorMessage += data.non_field_errors[0];
        } else {
          errorMessage += 'Unknown error occurred';
        }
        alert(errorMessage);
      }
    } catch (error) {
      alert('Error updating profile');
    }
  };

  const handleViewRecordHistory = async (recordType) => {
    try {
      const token = localStorage.getItem('token');
      let url = '';
      let title = '';

      switch (recordType) {
        case 'sales':
          url = '/api/cages/sales/history/';
          title = 'Sales History';
          break;
        case 'feed':
          url = '/api/cages/feed/history/';
          title = 'Feed Records';
          break;
        case 'expenses':
          url = '/api/cages/expenses/history/';
          title = 'Expense Records';
          break;
        case 'medical':
          url = '/api/cages/medical/history/';
          title = 'Medical Records';
          break;
        default:
          alert('Unknown record type');
          return;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Token ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        let content = `${title}\nDate Range: ${data.date_range.start_date} to ${data.date_range.end_date}\n\n`;

        if (recordType === 'sales') {
          content += `SUMMARY:\n- Total Sales: ${data.summary.total_sales}\n- Total Trays Sold: ${data.summary.total_trays_sold}\n- Total Revenue: Ksh ${data.summary.total_revenue}\n- Average Price per Tray: Ksh ${data.summary.avg_price_per_tray}\n\n`;
          content += 'SALES RECORDS:\n' + data.sales.map(sale =>
            `${sale.date}: ${sale.trays_sold} trays @ Ksh ${sale.price_per_tray} = Ksh ${sale.total_amount}`
          ).join('\n');
        } else if (recordType === 'feed') {
          content += `SUMMARY:\n- Total Purchases: ${data.summary.total_purchases}\n- Total Feed Bought: ${data.summary.total_feed_bought}kg\n- Total Feed Cost: Ksh ${data.summary.total_feed_cost}\n- Total Feed Used: ${data.summary.total_feed_used}kg\n- Feed Remaining: ${data.summary.feed_remaining}kg\n\n`;
          content += 'FEED PURCHASES:\n' + data.feed_purchases.map(purchase =>
            `${purchase.date}: ${purchase.quantity_kg}kg ${purchase.feed_type} @ Ksh ${purchase.cost_per_kg}/kg = Ksh ${purchase.total_cost}`
          ).join('\n') + '\n\n';
          content += 'FEED CONSUMPTION:\n' + data.feed_consumption.map(consumption =>
            `${consumption.date}: ${consumption.quantity_used_kg}kg used`
          ).join('\n');
        } else if (recordType === 'expenses') {
          content += `SUMMARY:\n- Total Expenses: ${data.summary.total_expenses}\n- Total Amount: Ksh ${data.summary.total_amount}\n- Average Expense: Ksh ${data.summary.avg_expense}\n\n`;
          content += 'EXPENSE RECORDS:\n' + data.expenses.map(expense =>
            `${expense.date}: ${expense.expense_type} - Ksh ${expense.amount} (${expense.description || 'No description'})`
          ).join('\n') + '\n\n';
          content += 'EXPENSE TYPES:\n' + data.expense_types.map(type =>
            `${type.expense_type}: ${type.count} records, Total: Ksh ${type.total_amount}`
          ).join('\n');
        } else if (recordType === 'medical') {
          content += `SUMMARY:\n- Total Records: ${data.summary.total_records}\n- Total Cost: Ksh ${data.summary.total_cost}\n- Average Cost: Ksh ${data.summary.avg_cost}\n\n`;
          content += 'MEDICAL RECORDS:\n' + data.medical_records.map(record =>
            `${record.date}: ${record.chicken__tag_id || 'General'} - ${record.treatment_type} (${record.description}) - Ksh ${record.cost}`
          ).join('\n') + '\n\n';
          content += 'TREATMENT TYPES:\n' + data.treatment_types.map(type =>
            `${type.treatment_type}: ${type.count} records, Total Cost: Ksh ${type.total_cost}`
          ).join('\n');
        }

        // Directly open the PDF in a new tab for viewing
        const today = new Date();
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(today.getDate() - 30);
        const startDate = thirtyDaysAgo.toISOString().split('T')[0];
        const endDate = today.toISOString().split('T')[0];
        const token = localStorage.getItem('token');

        // Use fetch to get the PDF and open it in a new window
        fetch(`/api/cages/reports/download/${recordType}/?start_date=${startDate}&end_date=${endDate}&token=${token}`, {
          headers: {
            'Authorization': `Token ${token}`,
          },
        })
        .then(response => {
          if (response.ok) {
            return response.blob();
          } else {
            throw new Error('Failed to fetch PDF');
          }
        })
        .then(blob => {
          const url = window.URL.createObjectURL(blob);
          window.open(url, '_blank');
        })
        .catch(error => {
          console.error('Error fetching PDF:', error);
          alert('Failed to load PDF report. Please try again.');
        });
      } else {
        alert(`Failed to fetch ${recordType} records`);
      }
    } catch (error) {
      alert(`Error fetching ${recordType} records`);
    }
  };

  const handleViewReport = async (reportType) => {
    try {
      const token = localStorage.getItem('token');
      let url = '/api/cages/reports/detailed/';

      if (reportType === 'feed') {
        // Show feed-related data
        const response = await fetch(url, {
          headers: {
            'Authorization': `Token ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          const feedReport = `
FEED REPORT (${data.date_range.start_date} to ${data.date_range.end_date})

Feed Purchases:
${data.feed_purchase_records.map(record =>
  `${record.date}: ${record.quantity_kg}kg ${record.feed_type} - $${record.total_cost}`
).join('\n')}

Feed Consumption:
${data.feed_consumption_records.map(record =>
  `${record.date}: ${record.quantity_used_kg}kg used`
).join('\n')}

Summary:
- Total feed bought: ${data.summary_totals.total_feed_used}kg
- Feed remaining: ${data.feed_remaining || 0}kg
          `;
          alert(feedReport);
        }
      } else if (reportType === 'performance') {
        const response = await fetch(url, {
          headers: {
            'Authorization': `Token ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          const performanceReport = `
PERFORMANCE DETAILS REPORT (${data.date_range.start_date} to ${data.date_range.end_date})

📊 CAGE-BY-CAGE PERFORMANCE:
${data.egg_collection_records.map(record =>
  `Date: ${record.laid_date}
   Cage ${record.cage_id || 'N/A'}, Partition ${record.partition_index || 'N/A'}
   Eggs: ${record.count}, Recorded by: ${record.recorded_by__username || 'Unknown'}
   Source: ${record.source}
   ─────────────────────────────────`
).join('\n')}

📈 DAILY PERFORMANCE BREAKDOWN:
${data.daily_summaries.map(day =>
  `${day.date}: ${day.eggs_collected} eggs recorded`
).join('\n')}

🎯 TOTAL PERFORMANCE:
- Total Eggs Recorded: ${data.summary_totals.total_eggs}
- Date Range: ${data.date_range.start_date} to ${data.date_range.end_date}
          `;
          alert(performanceReport);
        }
      } else if (reportType === 'table') {
        const response = await fetch(`${API_BASE_URL}/api/cages/reports/egg-collection-table/?date=${selectedDate}`, {
          headers: {
            'Authorization': 'Token ' + token,
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Egg collection table data:', data); // Debug log

          // Create HTML table for display - exact frontend structure matching Cage.js input form
          let tableHtml = '<div style="font-family: Arial, sans-serif; max-width: 100%; overflow-x: auto;"><h2>Egg Collection Table - ' + data.date + '</h2>';

          // Add each cage with front and back partitions - show all cages even with 0 eggs
          // Assume we have cages 1 and 2 as mentioned by user
          const cageIds = [2, 1]; // Cage 2 first (combined), then Cage 1 (standard) to match frontend
          cageIds.forEach(cageId => {
            const cage = data.cages ? data.cages.find(c => c.cage_id === cageId) : null;
            tableHtml += '<h3>Cage ' + cageId + '</h3>';

            // Determine cage type and layout - cage 2 is combined, cage 1 is standard
            const isCombined = cageId === 2; // Cage 2 is combined
            const boxesPerRow = isCombined ? 8 : 4;

            // Front Partition - matching Cage.js structure
            tableHtml += '<div style="margin-bottom: 20px;"><h4>Front Partition</h4>';
            tableHtml += '<table style="border-collapse: collapse; width: 100%; font-size: 12px; margin-bottom: 10px;"><tbody>';

            // Create 4 rows x boxesPerRow columns layout (matching Cage.js)
            for (let row = 0; row < 4; row++) {
              tableHtml += '<tr>';
              for (let col = 0; col < boxesPerRow; col++) {
                const boxIndex = row * boxesPerRow + col;
                const box = cage ? (cage.front_partition[boxIndex] || { eggs: 0 }) : { eggs: 0 };
                const bgColor = box.eggs > 0 ? '#fff3cd' : '#f8f9fa';
                const boxNumber = col + 1; // 1-4 or 1-8 depending on cage type
                tableHtml += '<td style="border: 1px solid #ddd; padding: 8px; text-align: center; background-color: ' + bgColor + '; width: 60px;"><div style="font-size: 10px; margin-bottom: 2px;">' + boxNumber + '</div><div style="font-weight: bold;">' + box.eggs + '</div></td>';
              }
              tableHtml += '</tr>';
            }
            tableHtml += '</tbody></table></div>';

            // Back Partition - matching Cage.js structure
            tableHtml += '<div style="margin-bottom: 20px;"><h4>Back Partition</h4>';
            tableHtml += '<table style="border-collapse: collapse; width: 100%; font-size: 12px; margin-bottom: 10px;"><tbody>';

            // Create 4 rows x boxesPerRow columns layout (matching Cage.js)
            for (let row = 0; row < 4; row++) {
              tableHtml += '<tr>';
              for (let col = 0; col < boxesPerRow; col++) {
                const boxIndex = row * boxesPerRow + col;
                const box = cage ? (cage.back_partition[boxIndex] || { eggs: 0 }) : { eggs: 0 };
                const bgColor = box.eggs > 0 ? '#fff3cd' : '#f8f9fa';
                const boxNumber = col + 1; // 1-4 or 1-8 depending on cage type
                tableHtml += '<td style="border: 1px solid #ddd; padding: 8px; text-align: center; background-color: ' + bgColor + '; width: 60px;"><div style="font-size: 10px; margin-bottom: 2px;">' + boxNumber + '</div><div style="font-weight: bold;">' + box.eggs + '</div></td>';
              }
              tableHtml += '</tr>';
            }
            tableHtml += '</tbody></table></div>';

            // Cage Summary
            const frontTotal = cage ? cage.front_partition.reduce((sum, box) => sum + box.eggs, 0) : 0;
            const backTotal = cage ? cage.back_partition.reduce((sum, box) => sum + box.eggs, 0) : 0;
            const cageTotal = cage ? cage.cage_total : 0;
            tableHtml += '<table style="border-collapse: collapse; width: 100%; font-size: 12px; margin-bottom: 30px;"><thead><tr style="background-color: #e8f5e8;"><th style="border: 1px solid #ddd; padding: 8px; text-align: center;">Summary</th><th style="border: 1px solid #ddd; padding: 8px; text-align: center;">Count</th></tr></thead><tbody>';
            tableHtml += '<tr><td style="border: 1px solid #ddd; padding: 8px; text-align: center; font-weight: bold;">Front Partition</td><td style="border: 1px solid #ddd; padding: 8px; text-align: center;">' + frontTotal + '</td></tr>';
            tableHtml += '<tr><td style="border: 1px solid #ddd; padding: 8px; text-align: center; font-weight: bold;">Back Partition</td><td style="border: 1px solid #ddd; padding: 8px; text-align: center;">' + backTotal + '</td></tr>';
            tableHtml += '<tr style="background-color: #e8f5e8; font-weight: bold;"><td style="border: 1px solid #ddd; padding: 8px; text-align: center;">CAGE TOTAL</td><td style="border: 1px solid #ddd; padding: 8px; text-align: center;">' + cageTotal + '</td></tr></tbody></table>';
          });

          // Add shade section
          tableHtml += '<h3>Shade Eggs</h3><table style="border-collapse: collapse; width: 100%; font-size: 12px; margin-bottom: 20px;"><thead><tr style="background-color: #f0f8ff;"><th style="border: 1px solid #ddd; padding: 8px; text-align: center;">Source</th><th style="border: 1px solid #ddd; padding: 8px; text-align: center; background-color: #e8f5e8;">Total Eggs</th></tr></thead><tbody><tr><td style="border: 1px solid #ddd; padding: 8px; text-align: center; font-weight: bold;">Shade</td><td style="border: 1px solid #ddd; padding: 8px; text-align: center; font-weight: bold; background-color: #e8f5e8;">' + data.shade_total + '</td></tr></tbody></table>';

          // Overall summary
          tableHtml += '<div style="margin-top: 20px; padding: 15px; background-color: #f9f9f9; border-radius: 5px; border: 2px solid #ddd;"><h3 style="margin-top: 0;">Daily Summary</h3><p><strong>Cage Eggs:</strong> ' + data.cage_total + '</p><p><strong>Shade Eggs:</strong> ' + data.shade_total + '</p><p><strong>Grand Total:</strong> ' + data.grand_total + '</p><p><strong>Trays:</strong> ' + Math.floor(data.grand_total / 30) + ' full trays + ' + (data.grand_total % 30) + ' remaining eggs</p><p><strong>Date:</strong> ' + data.date + '</p></div></div>';

          // Open in new window for printing/saving
          const css = 'body { font-family: Arial, sans-serif; margin: 20px; } table { border-collapse: collapse; width: 100%; } th, td { border: 1px solid #ddd; padding: 8px; text-align: center; } th { background-color: #f5f5f5; } .shade-row { background-color: #f0f8ff; } .total-row { background-color: #e8f5e8; font-weight: bold; }';
          const htmlContent = '<html><head><title>Egg Collection Table - ' + data.date + '</title><style>' + css + '</style></head><body><div style="margin-bottom: 20px;"><button onclick="window.location.href=\'/\'" style="padding: 10px 20px; background: #28a745; color: white; border: none; border-radius: 5px; cursor: pointer;">← Back to Dashboard</button></div>' + tableHtml + '<div style="margin-top: 20px; text-align: center;"><button onclick="window.print()" style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">Print Table</button><button onclick="fetch(\'/api/cages/reports/download/sales/?start_date=' + data.date + '&end_date=' + data.date + '&token=' + localStorage.getItem('token') + '\').then(r => r.blob()).then(b => { const u = URL.createObjectURL(b); const a = document.createElement(\'a\'); a.href = u; a.download = \'egg-collection-' + data.date + '.pdf\'; a.click(); })" style="padding: 10px 20px; background: #dc3545; color: white; border: none; border-radius: 5px; cursor: pointer; margin-left: 10px;">📄 Download PDF</button><button onclick="window.close()" style="padding: 10px 20px; background: #6c757d; color: white; border: none; border-radius: 5px; cursor: pointer; margin-left: 10px;">Close</button></div></body></html>';
          const printWindow = window.open('', '_blank');
          printWindow.document.write(htmlContent);
          printWindow.document.close();
        }
      } else if (reportType === 'detailed') {
        // Open detailed report as PDF in new window
        const reportUrl = selectedDate ? `${url}?date=${selectedDate}` : url;
        const token = localStorage.getItem('token');

        // Use fetch to get the PDF and open it in a new window
        fetch(`/api/cages/reports/download/detailed/?start_date=${selectedDate || '2025-10-01'}&end_date=${selectedDate || new Date().toISOString().split('T')[0]}&token=${token}`, {
          headers: {
            'Authorization': `Token ${token}`,
          },
        })
        .then(response => {
          if (response.ok) {
            return response.blob();
          } else {
            throw new Error('Failed to fetch PDF');
          }
        })
        .then(blob => {
          const url = window.URL.createObjectURL(blob);
          window.open(url, '_blank');
        })
        .catch(error => {
          console.error('Error fetching PDF:', error);
          alert('Failed to load detailed report PDF. Please try again.');
        });
      } else if (reportType === 'weekly') {
        // Show weekly egg collection summary
        const today = new Date();
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6); // End of week (Saturday)

        const startDate = weekStart.toISOString().split('T')[0];
        const endDate = weekEnd.toISOString().split('T')[0];

        const response = await fetch(`${url}?start_date=${startDate}&end_date=${endDate}`, {
          headers: {
            'Authorization': 'Token ' + token,
          },
        });

        if (response.ok) {
          const data = await response.json();
          const weeklyReport = `WEEKLY EGG COLLECTION SUMMARY\nFrom ${startDate} to ${endDate}\n\nTOTAL PRODUCTION:\n- Total Eggs: ${data.summary_totals.total_eggs}\n- Total Trays: ${data.summary_totals.total_trays_sold}\n\nDAILY BREAKDOWN:\n${data.daily_summaries.map(day => `${day.date}: ${day.eggs_collected} eggs ${day.status ? '(' + day.status + ')' : ''}`).join('\n')}\n\nSUMMARY:\n- Average daily eggs: ${Math.round(data.summary_totals.total_eggs / 7)}\n- Most productive day: ${data.daily_summaries.reduce((max, day) => day.eggs_collected > max.eggs_collected ? day : max, data.daily_summaries[0]).date} (${data.daily_summaries.reduce((max, day) => day.eggs_collected > max.eggs_collected ? day : max, data.daily_summaries[0]).eggs_collected} eggs)`;
          alert(weeklyReport);
        }
      } else if (reportType === 'monthly') {
        // Show monthly egg collection summary
        const today = new Date();
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

        const startDate = monthStart.toISOString().split('T')[0];
        const endDate = monthEnd.toISOString().split('T')[0];

        const response = await fetch(`${url}?start_date=${startDate}&end_date=${endDate}`, {
          headers: {
            'Authorization': 'Token ' + token,
          },
        });

        if (response.ok) {
          const data = await response.json();
          const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
          const monthlyReport = `MONTHLY EGG COLLECTION SUMMARY\n${monthStart.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}\n\nTOTAL PRODUCTION:\n- Total Eggs: ${data.summary_totals.total_eggs}\n- Total Trays: ${data.summary_totals.total_trays_sold}\n- Average daily: ${Math.round(data.summary_totals.total_eggs / daysInMonth)} eggs\n\nPRODUCTION STATUS:\n${data.daily_summaries.filter(day => day.has_data).length} days recorded\n${data.daily_summaries.filter(day => !day.has_data).length} days not recorded\n\nBEST PERFORMING WEEK:\n${(() => {
            const weeklyTotals = [];
            for (let i = 0; i < data.daily_summaries.length; i += 7) {
              const week = data.daily_summaries.slice(i, i + 7);
              const weekTotal = week.reduce((sum, day) => sum + day.eggs_collected, 0);
              weeklyTotals.push({ week: Math.floor(i / 7) + 1, total: weekTotal, startDate: week[0]?.date });
            }
            const bestWeek = weeklyTotals.reduce((max, week) => week.total > max.total ? week : max, weeklyTotals[0]);
            return `Week ${bestWeek.week} (${bestWeek.startDate}): ${bestWeek.total} eggs`;
          })()}`;
          alert(monthlyReport);
        }
      } else if (reportType === 'efficiency') {
        alert('Feed efficiency report coming soon!');
      } else {
        alert('Report type not implemented yet');
      }
    } catch (error) {
      alert('Error fetching report data');
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      backgroundColor: 'rgba(248, 249, 250, 0.95)',
      backdropFilter: 'blur(10px)',
      borderRadius: '20px',
      margin: '20px',
      padding: '20px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
      border: '1px solid rgba(255,255,255,0.2)'
    }}>
      {/* Header Section */}
      <Box sx={{
        background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.9) 0%, rgba(118, 75, 162, 0.9) 100%)',
        color: 'white',
        p: 3,
        mb: 3,
        borderRadius: '0 0 20px 20px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.2)'
      }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h5" sx={{
              fontWeight: 'bold',
              mb: 1,
              fontSize: '1.2rem',
              textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
              color: '#90EE90'
            }}>
              Welcome back{currentUser ? `, ${currentUser.username || currentUser.first_name || currentUser.email.split('@')[0]}` : ''}!
            </Typography>
            <Typography variant="h4" sx={{
              fontWeight: 'bold',
              mb: 1,
              fontSize: '2.5rem',
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
              letterSpacing: '2px',
              color: '#ff6b35'
            }}>
              Date: {new Date().toLocaleDateString('en-GB', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
              })}
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
              🏠 Joe Farm Dashboard
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              Welcome back! Manage your chicken farm operations efficiently
            </Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={2}>
            {/* Notification Bell */}
            <Tooltip title="Notifications">
              <IconButton
                onClick={() => setShowNotifications(!showNotifications)}
                sx={{ color: 'white' }}
              >
                <Badge badgeContent={pendingUsers.length} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>
            {showNotifications && (
              <Box sx={{
                position: 'absolute',
                top: '80px',
                right: '20px',
                width: '350px',
                maxHeight: '400px',
                overflow: 'auto',
                bgcolor: 'white',
                borderRadius: 2,
                boxShadow: 3,
                zIndex: 1000,
                p: 2
              }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#333' }}>
                  Notifications
                </Typography>
                {pendingUsers.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No pending notifications
                  </Typography>
                ) : (
                  pendingUsers.map(user => (
                    <Box key={user.id} sx={{ 
                      p: 2, 
                      mb: 1, 
                      bgcolor: '#fff3cd', 
                      borderRadius: 1,
                      border: '1px solid #ffc107'
                    }}>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#856404' }}>
                        New User Signup
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {user.username || user.email} wants to join
                      </Typography>
                      <Button
                        size="small"
                        variant="contained"
                        color="success"
                        sx={{ mt: 1 }}
                        onClick={() => handleApproveUser(user.id)}
                      >
                        Approve Now
                      </Button>
                    </Box>
                  ))
                )}
              </Box>
            )}
            <Button
              variant="outlined"
              sx={{
                color: 'white',
                borderColor: 'rgba(255,255,255,0.5)',
                borderRadius: '25px',
                padding: '8px 20px',
                backdropFilter: 'blur(10px)',
                '&:hover': {
                  borderColor: 'white',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  transform: 'translateY(-2px) scale(1.05)',
                  boxShadow: '0 8px 25px rgba(255,255,255,0.2)'
                },
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
              onClick={() => setShowProfileSettings(true)}
              startIcon={<span>⚙️</span>}
            >
              Settings
            </Button>
            <Button
              variant="outlined"
              sx={{
                color: 'white',
                borderColor: 'rgba(255,255,255,0.5)',
                borderRadius: '25px',
                padding: '8px 20px',
                backdropFilter: 'blur(10px)',
                '&:hover': {
                  borderColor: '#ff4757',
                  backgroundColor: 'rgba(255,71,87,0.1)',
                  transform: 'translateY(-2px) scale(1.05)',
                  boxShadow: '0 8px 25px rgba(255,71,87,0.3)'
                },
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
              onClick={() => {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/signin';
              }}
              startIcon={<span>🚪</span>}
            >
              Logout
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Navigation Tabs */}
      <Box sx={{ px: 3, mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          sx={{
            backgroundColor: 'rgba(255,255,255,0.9)',
            borderRadius: '25px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            backdropFilter: 'blur(15px)',
            border: '1px solid rgba(255,255,255,0.3)',
            padding: '8px',
            '& .MuiTab-root': {
              fontWeight: '600',
              fontSize: '1rem',
              minHeight: '60px',
              textTransform: 'none',
              borderRadius: '20px',
              margin: '4px',
              padding: '12px 24px',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                transform: 'translateY(-2px) scale(1.02)',
                boxShadow: '0 6px 20px rgba(0,0,0,0.15)'
              },
              '&.Mui-selected': {
                backgroundColor: 'rgba(102,126,234,0.9)',
                color: 'white',
                boxShadow: '0 8px 25px rgba(102,126,234,0.4)',
                backdropFilter: 'blur(15px)',
                transform: 'scale(1.05)',
                '&:hover': {
                  transform: 'translateY(-2px) scale(1.07)',
                  boxShadow: '0 10px 30px rgba(102,126,234,0.5)'
                }
              }
            }
          }}
        >
          <Tab label="📊 Overview" />
          <Tab label="📝 Daily Tasks" />
          <Tab label="📋 Reports" />
        </Tabs>
      </Box>

      {/* Main Content */}
      <Box sx={{ px: 3, pb: 3 }}>

      {tabValue === 0 && (
        <Box>
          {/* Welcome Section */}
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#2c3e50' }}>
              🏠 Joe Farm Overview
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Real-time insights into your farm's performance and operations
            </Typography>
          </Box>

          {/* Key Metrics Section */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: '600', color: '#34495e', borderBottom: '2px solid #3498db', pb: 1 }}>
              📊 Key Performance Indicators
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
              Essential metrics for monitoring your farm's daily operations
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6} lg={3}>
                <Card sx={{
                  height: '100%',
                  border: '1px solid rgba(232, 245, 232, 0.8)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  backgroundColor: 'rgba(255,255,255,0.9)',
                  backdropFilter: 'blur(10px)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
                    transform: 'translateY(-2px)',
                    backgroundColor: 'rgba(255,255,255,0.95)'
                  }
                }}
                onClick={handleViewTodaysEggTable}
                >
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h2" sx={{ mb: 1 }}>🥚</Typography>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: '600' }}>
                      Today's Production
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#27ae60', mb: 1 }}>
                      {dashboardData.eggs_today || 0}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                      {(() => {
                        const cages = dashboardData.egg_production?.today_breakdown?.cages || {};
                        const shade = dashboardData.egg_production?.today_breakdown?.shade_eggs || 0;
                        let breakdown = [];

                        // Always show both cages, even with 0 eggs
                        breakdown.push(`Cage1: ${cages[1]?.total || 0} (Front: ${cages[1]?.front || 0}, Back: ${cages[1]?.back || 0})`);
                        breakdown.push(`Cage2: ${cages[2]?.total || 0} (Front: ${cages[2]?.front || 0}, Back: ${cages[2]?.back || 0})`);

                        if (shade > 0 || true) { // Always show shade, even if 0
                          breakdown.push(`Shade: ${shade}`);
                        }

                        return breakdown.join(' | ');
                      })()}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                      <strong>Laying Percentage: {dashboardData.egg_production?.laying_percentage || 0}%</strong>
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {Math.floor((dashboardData.eggs_today || 0) / 30)} trays + {((dashboardData.eggs_today || 0) % 30)} eggs
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6} lg={3}>
                <Card sx={{
                  height: '100%',
                  border: '1px solid rgba(255, 243, 205, 0.8)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  backgroundColor: 'rgba(255,255,255,0.9)',
                  backdropFilter: 'blur(10px)',
                  '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }
                }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h2" sx={{ mb: 1 }}>📦</Typography>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: '600' }}>
                      Store Inventory
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#f39c12', mb: 1 }}>
                      {dashboardData.trays_in_store || 0}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Trays ready for sale
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6} lg={3}>
                <Card sx={{
                  height: '100%',
                  border: '1px solid rgba(209, 236, 241, 0.8)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  backgroundColor: 'rgba(255,255,255,0.9)',
                  backdropFilter: 'blur(10px)',
                  '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }
                }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h2" sx={{ mb: 1 }}>🐔</Typography>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: '600' }}>
                      Flock Size
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#3498db', mb: 1 }}>
                      {dashboardData.total_chickens || 0}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Active birds
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6} lg={3}>
                <Card sx={{
                  height: '100%',
                  border: '1px solid rgba(255, 193, 7, 0.8)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  backgroundColor: 'rgba(255,255,255,0.9)',
                  backdropFilter: 'blur(10px)',
                  '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }
                }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h2" sx={{ mb: 1 }}>🌾</Typography>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: '600' }}>
                      Feed Required
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#f39c12', mb: 1 }}>
                      {dashboardData.feed_requirements?.daily_kg || 0} kg
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Daily / {dashboardData.total_chickens || 0} chickens
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6} lg={3}>
                <Card sx={{
                  height: '100%',
                  border: '1px solid rgba(248, 215, 218, 0.8)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  backgroundColor: 'rgba(255,255,255,0.9)',
                  backdropFilter: 'blur(10px)',
                  '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }
                }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: '600' }}>
                      Expenses
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#e74c3c', mb: 1 }}>
                      {dashboardData.expenses_today || 0}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Today's expenses (feed + manual)
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>

        </Box>
      )}
      {tabValue === 1 && (
        <Box>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#2c3e50' }}>
            📝 Joe Farm - Daily Tasks
          </Typography>
          <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
            Manage your daily farm operations
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card sx={{
                p: 3,
                border: '1px solid rgba(232, 245, 232, 0.8)',
                boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                backgroundColor: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(15px)',
                borderRadius: '16px',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer',
                '&:hover': {
                  boxShadow: '0 12px 32px rgba(0,0,0,0.15)',
                  transform: 'translateY(-4px) scale(1.02)',
                  backgroundColor: 'rgba(255,255,255,0.98)'
                }
              }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: 1 }}>
                  🥚 Egg Collection
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                  Record today's egg collection from all cages
                </Typography>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => {
                    // Scroll to the egg collection section and auto-start
                    const eggCollectionSection = document.querySelector('.worker-interface-section');
                    if (eggCollectionSection) {
                      eggCollectionSection.scrollIntoView({ behavior: 'smooth' });
                      // Auto-click the Start Egg Collection button after scroll
                      setTimeout(() => {
                        const startButton = eggCollectionSection.querySelector('.btn-add-cages');
                        if (startButton) {
                          startButton.click();
                        }
                      }, 800); // Longer delay for smooth scroll
                    }
                  }}
                  sx={{
                    borderRadius: '12px',
                    padding: '12px',
                    fontWeight: '600',
                    textTransform: 'none',
                    fontSize: '1rem',
                    background: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)',
                    color: 'white',
                    boxShadow: '0 4px 12px rgba(255, 107, 53, 0.3)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      boxShadow: '0 8px 25px rgba(255, 107, 53, 0.4)',
                      transform: 'translateY(-2px) scale(1.02)',
                      background: 'linear-gradient(135deg, #e55a2b 0%, #e8851e 100%)'
                    }
                  }}
                >
                  Record Eggs
                </Button>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card sx={{
                p: 3,
                border: '1px solid rgba(255, 243, 205, 0.8)',
                boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                backgroundColor: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(15px)',
                borderRadius: '16px',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer',
                '&:hover': {
                  boxShadow: '0 12px 32px rgba(0,0,0,0.15)',
                  transform: 'translateY(-4px) scale(1.02)',
                  backgroundColor: 'rgba(255,255,255,0.98)'
                }
              }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: 1 }}>
                  📦 Sales Management
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                  Record egg sales and manage inventory
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  onClick={() => setSalesDialogOpen(true)}
                  sx={{
                    borderRadius: '12px',
                    padding: '12px',
                    fontWeight: '600',
                    textTransform: 'none',
                    fontSize: '1rem',
                    boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      boxShadow: '0 8px 25px rgba(25, 118, 210, 0.4)',
                      transform: 'translateY(-2px) scale(1.02)'
                    }
                  }}
                >
                  Record Sale
                </Button>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card sx={{
                p: 3,
                border: '1px solid rgba(209, 236, 241, 0.8)',
                boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                backgroundColor: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(15px)',
                borderRadius: '16px',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer',
                '&:hover': {
                  boxShadow: '0 12px 32px rgba(0,0,0,0.15)',
                  transform: 'translateY(-4px) scale(1.02)',
                  backgroundColor: 'rgba(255,255,255,0.98)'
                }
              }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: 1 }}>
                  💸 Expense Tracking
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                  Record daily expenses and costs
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  onClick={() => setExpenseDialogOpen(true)}
                  sx={{
                    borderRadius: '12px',
                    padding: '12px',
                    fontWeight: '600',
                    textTransform: 'none',
                    fontSize: '1rem',
                    boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      boxShadow: '0 8px 25px rgba(25, 118, 210, 0.4)',
                      transform: 'translateY(-2px) scale(1.02)'
                    }
                  }}
                >
                  Record Expense
                </Button>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}
      {tabValue === 2 && (
        <Box>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#2c3e50' }}>
            📋 Joe Farm - Reports & Analytics
          </Typography>
          <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
            Generate detailed reports and view analytics
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6} lg={4}>
              <Card sx={{
                p: 3,
                border: '1px solid rgba(232, 245, 232, 0.8)',
                boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                backgroundColor: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(15px)',
                borderRadius: '16px',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer',
                '&:hover': {
                  boxShadow: '0 12px 32px rgba(0,0,0,0.15)',
                  transform: 'translateY(-4px) scale(1.02)',
                  backgroundColor: 'rgba(255,255,255,0.98)'
                }
              }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: 1 }}>
                  📊 Performance Report
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                  Detailed egg collection performance
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  onClick={() => handleViewReport('performance')}
                  sx={{
                    borderRadius: '12px',
                    padding: '12px',
                    fontWeight: '600',
                    textTransform: 'none',
                    fontSize: '1rem',
                    boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      boxShadow: '0 8px 25px rgba(25, 118, 210, 0.4)',
                      transform: 'translateY(-2px) scale(1.02)'
                    }
                  }}
                >
                  View Report
                </Button>
              </Card>
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
              <Card sx={{
                p: 3,
                border: '1px solid rgba(255, 243, 205, 0.8)',
                boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                backgroundColor: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(15px)',
                borderRadius: '16px',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer',
                '&:hover': {
                  boxShadow: '0 12px 32px rgba(0,0,0,0.15)',
                  transform: 'translateY(-4px) scale(1.02)',
                  backgroundColor: 'rgba(255,255,255,0.98)'
                }
              }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: 1 }}>
                  📦 Sales Report
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                  Sales history and revenue analysis
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  onClick={() => handleViewRecordHistory('sales')}
                  sx={{
                    borderRadius: '12px',
                    padding: '12px',
                    fontWeight: '600',
                    textTransform: 'none',
                    fontSize: '1rem',
                    boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      boxShadow: '0 8px 25px rgba(25, 118, 210, 0.4)',
                      transform: 'translateY(-2px) scale(1.02)'
                    }
                  }}
                >
                  View Report
                </Button>
              </Card>
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
              <Card sx={{
                p: 3,
                border: '1px solid rgba(209, 236, 241, 0.8)',
                boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                backgroundColor: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(15px)',
                borderRadius: '16px',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer',
                '&:hover': {
                  boxShadow: '0 12px 32px rgba(0,0,0,0.15)',
                  transform: 'translateY(-4px) scale(1.02)',
                  backgroundColor: 'rgba(255,255,255,0.98)'
                }
              }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: 1 }}>
                  💸 Expense Report
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                  Expense tracking and analysis
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  onClick={() => handleViewRecordHistory('expenses')}
                  sx={{
                    borderRadius: '12px',
                    padding: '12px',
                    fontWeight: '600',
                    textTransform: 'none',
                    fontSize: '1rem',
                    boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      boxShadow: '0 8px 25px rgba(25, 118, 210, 0.4)',
                      transform: 'translateY(-2px) scale(1.02)'
                    }
                  }}
                >
                  View Report
                </Button>
              </Card>
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
              <Card sx={{
                p: 3,
                border: '1px solid rgba(248, 215, 218, 0.8)',
                boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                backgroundColor: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(15px)',
                borderRadius: '16px',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer',
                '&:hover': {
                  boxShadow: '0 12px 32px rgba(0,0,0,0.15)',
                  transform: 'translateY(-4px) scale(1.02)',
                  backgroundColor: 'rgba(255,255,255,0.98)'
                }
              }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: 1 }}>
                  🏥 Medical Report
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                  Health and treatment records
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  onClick={() => handleViewRecordHistory('medical')}
                  sx={{
                    borderRadius: '12px',
                    padding: '12px',
                    fontWeight: '600',
                    textTransform: 'none',
                    fontSize: '1rem',
                    boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      boxShadow: '0 8px 25px rgba(25, 118, 210, 0.4)',
                      transform: 'translateY(-2px) scale(1.02)'
                    }
                  }}
                >
                  View Report
                </Button>
              </Card>
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
              <Card sx={{
                p: 3,
                border: '1px solid rgba(232, 245, 232, 0.8)',
                boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                backgroundColor: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(15px)',
                borderRadius: '16px',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer',
                '&:hover': {
                  boxShadow: '0 12px 32px rgba(0,0,0,0.15)',
                  transform: 'translateY(-4px) scale(1.02)',
                  backgroundColor: 'rgba(255,255,255,0.98)'
                }
              }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: 1 }}>
                  📋 Egg Collection Table
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                  Visual table of egg collection data
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  onClick={() => {
                    setEggTableData(null); // Clear previous data
                    setSelectedTableDate(new Date().toISOString().split('T')[0]); // Reset to today
                    setEggTableDialogOpen(true);
                    handleViewEggTable(); // Load today's data
                  }}
                  sx={{
                    borderRadius: '12px',
                    padding: '12px',
                    fontWeight: '600',
                    textTransform: 'none',
                    fontSize: '1rem',
                    boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      boxShadow: '0 8px 25px rgba(25, 118, 210, 0.4)',
                      transform: 'translateY(-2px) scale(1.02)'
                    }
                  }}
                >
                  View Table
                </Button>
              </Card>
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
              <Card sx={{
                p: 3,
                border: '1px solid rgba(255, 243, 205, 0.8)',
                boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                backgroundColor: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(15px)',
                borderRadius: '16px',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer',
                '&:hover': {
                  boxShadow: '0 12px 32px rgba(0,0,0,0.15)',
                  transform: 'translateY(-4px) scale(1.02)',
                  backgroundColor: 'rgba(255,255,255,0.98)'
                }
              }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: 1 }}>
                  📈 Detailed Report
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                  Comprehensive farm activity report
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  onClick={() => handleViewReport('detailed')}
                  sx={{
                    borderRadius: '12px',
                    padding: '12px',
                    fontWeight: '600',
                    textTransform: 'none',
                    fontSize: '1rem',
                    boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      boxShadow: '0 8px 25px rgba(25, 118, 210, 0.4)',
                      transform: 'translateY(-2px) scale(1.02)'
                    }
                  }}
                >
                  View Report
                </Button>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}
    </Box>
    {/* User Creation Dialog */}
    <Dialog open={userDialogOpen} onClose={() => setUserDialogOpen(false)} maxWidth="sm" fullWidth>
      <DialogTitle>Joe Farm - Create New User</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Username"
          fullWidth
          variant="outlined"
          value={newUser.username}
          onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
        />
        <TextField
          margin="dense"
          label="Email"
          fullWidth
          variant="outlined"
          value={newUser.email}
          onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
        />
        <TextField
          margin="dense"
          label="Password"
          fullWidth
          variant="outlined"
          type="password"
          value={newUser.password}
          onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
        />
        <FormControl fullWidth margin="dense">
          <InputLabel>Role</InputLabel>
          <Select
            value={newUser.role}
            onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
          >
            <MenuItem value="worker">Worker</MenuItem>
            <MenuItem value="owner">Owner</MenuItem>
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setUserDialogOpen(false)}>Cancel</Button>
        <Button onClick={handleCreateUser} variant="contained">Create User</Button>
      </DialogActions>
    </Dialog>
    {/* Profile Settings Dialog */}
    <Dialog open={showProfileSettings} onClose={() => setShowProfileSettings(false)} maxWidth="sm" fullWidth>
      <DialogTitle>Joe Farm - Profile Settings</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Username"
          fullWidth
          variant="outlined"
          value={profileData.username}
          onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
        />
        <TextField
          margin="dense"
          label="Email"
          fullWidth
          variant="outlined"
          value={profileData.email}
          onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
        />
        <TextField
          margin="dense"
          label="New Password"
          fullWidth
          variant="outlined"
          type="password"
          value={profileData.password}
          onChange={(e) => setProfileData({ ...profileData, password: e.target.value })}
        />
        <TextField
          margin="dense"
          label="Confirm Password"
          fullWidth
          variant="outlined"
          type="password"
          value={profileData.confirmPassword}
          onChange={(e) => setProfileData({ ...profileData, confirmPassword: e.target.value })}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setShowProfileSettings(false)}>Cancel</Button>
        <Button onClick={handleUpdateProfile} variant="contained">Update Profile</Button>
      </DialogActions>
    </Dialog>

    {/* Sales Dialog */}
    <Dialog open={salesDialogOpen} onClose={() => setSalesDialogOpen(false)} maxWidth="sm" fullWidth>
      <DialogTitle>Joe Farm - Record Egg Sales</DialogTitle>
      <DialogContent>
        <TextField
          margin="dense"
          label="Trays Sold"
          fullWidth
          variant="outlined"
          type="number"
          value={saleData.trays_sold}
          onChange={(e) => setSaleData({ ...saleData, trays_sold: e.target.value })}
        />
        <TextField
          margin="dense"
          label="Price per Tray (Ksh)"
          fullWidth
          variant="outlined"
          type="number"
          value={saleData.price_per_tray}
          onChange={(e) => setSaleData({ ...saleData, price_per_tray: e.target.value })}
        />
        <TextField
          margin="dense"
          label="Date"
          fullWidth
          variant="outlined"
          type="date"
          value={saleData.date}
          onChange={(e) => setSaleData({ ...saleData, date: e.target.value })}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setSalesDialogOpen(false)}>Cancel</Button>
        <Button onClick={() => {
          handleRecordSale();
          setSalesDialogOpen(false);
        }} variant="contained">Record Sale</Button>
      </DialogActions>
    </Dialog>

    {/* Expense Dialog */}
    <Dialog open={expenseDialogOpen} onClose={() => setExpenseDialogOpen(false)} maxWidth="sm" fullWidth>
      <DialogTitle>Joe Farm - Record Expense</DialogTitle>
      <DialogContent>
        <FormControl fullWidth margin="dense">
          <InputLabel>Expense Type</InputLabel>
          <Select
            value={expenseData.expense_type}
            onChange={(e) => setExpenseData({ ...expenseData, expense_type: e.target.value })}
          >
            <MenuItem value="feed">Feed</MenuItem>
            <MenuItem value="medicine">Medicine</MenuItem>
            <MenuItem value="equipment">Equipment</MenuItem>
            <MenuItem value="labor">Labor</MenuItem>
            <MenuItem value="utilities">Utilities</MenuItem>
            <MenuItem value="vaccination">Vaccination</MenuItem>
            <MenuItem value="other">Other</MenuItem>
          </Select>
        </FormControl>
        {expenseData.expense_type === 'feed' && (
          <>
            <TextField
              margin="dense"
              label="Number of Sacks"
              fullWidth
              variant="outlined"
              type="number"
              value={expenseData.sacks || ''}
              onChange={(e) => setExpenseData({
                ...expenseData,
                sacks: e.target.value,
                description: e.target.value ? `${e.target.value} sacks of feed` : expenseData.description
              })}
            />
            <TextField
              margin="dense"
              label="Quantity (kg)"
              fullWidth
              variant="outlined"
              type="number"
              value={expenseData.quantity_kg || ''}
              onChange={(e) => setExpenseData({ ...expenseData, quantity_kg: e.target.value })}
              helperText="Auto-calculated from sacks (70kg per sack)"
            />
          </>
        )}
        {expenseData.expense_type === 'medicine' && (
          <>
            <TextField
              margin="dense"
              label="Treatment Type"
              fullWidth
              variant="outlined"
              value={expenseData.treatment_type || ''}
              onChange={(e) => setExpenseData({ ...expenseData, treatment_type: e.target.value })}
              placeholder="e.g., vaccination, medication"
            />
            <TextField
              margin="dense"
              label="Description"
              fullWidth
              variant="outlined"
              multiline
              rows={2}
              value={expenseData.description || ''}
              onChange={(e) => setExpenseData({ ...expenseData, description: e.target.value })}
              placeholder="Describe the treatment or medication given"
            />
          </>
        )}
        <TextField
          margin="dense"
          label="Amount (Ksh)"
          fullWidth
          variant="outlined"
          type="number"
          value={expenseData.amount}
          onChange={(e) => setExpenseData({ ...expenseData, amount: e.target.value })}
        />
        <TextField
          margin="dense"
          label="Description"
          fullWidth
          variant="outlined"
          multiline
          rows={2}
          value={expenseData.description}
          onChange={(e) => setExpenseData({ ...expenseData, description: e.target.value })}
        />
        <TextField
          margin="dense"
          label="Date"
          fullWidth
          variant="outlined"
          type="date"
          value={expenseData.date}
          onChange={(e) => setExpenseData({ ...expenseData, date: e.target.value })}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setExpenseDialogOpen(false)}>Cancel</Button>
        <Button onClick={() => {
          handleRecordExpense();
          setExpenseDialogOpen(false);
        }} variant="contained">Record Expense</Button>
      </DialogActions>
    </Dialog>

    {/* Medical Dialog */}
    <Dialog open={medicalDialogOpen} onClose={() => setMedicalDialogOpen(false)} maxWidth="sm" fullWidth>
      <DialogTitle>Joe Farm - Record Medical Treatment</DialogTitle>
      <DialogContent>
        <FormControl fullWidth margin="dense">
          <InputLabel>Treatment Type</InputLabel>
          <Select
            value={expenseData.expense_type}
            onChange={(e) => setExpenseData({ ...expenseData, expense_type: e.target.value })}
          >
            <MenuItem value="vaccination">Vaccination</MenuItem>
            <MenuItem value="medication">Medication</MenuItem>
            <MenuItem value="checkup">Checkup</MenuItem>
            <MenuItem value="surgery">Surgery</MenuItem>
            <MenuItem value="other">Other</MenuItem>
          </Select>
        </FormControl>
        <TextField
          margin="dense"
          label="Cost (Ksh)"
          fullWidth
          variant="outlined"
          type="number"
          value={expenseData.amount}
          onChange={(e) => setExpenseData({ ...expenseData, amount: e.target.value })}
        />
        <TextField
          margin="dense"
          label="Description"
          fullWidth
          variant="outlined"
          multiline
          rows={3}
          value={expenseData.description}
          onChange={(e) => setExpenseData({ ...expenseData, description: e.target.value })}
        />
        <TextField
          margin="dense"
          label="Date"
          fullWidth
          variant="outlined"
          type="date"
          value={expenseData.date}
          onChange={(e) => setExpenseData({ ...expenseData, date: e.target.value })}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setMedicalDialogOpen(false)}>Cancel</Button>
        <Button onClick={() => {
          handleRecordMedical();
          setMedicalDialogOpen(false);
        }} variant="contained">Record Treatment</Button>
      </DialogActions>
    </Dialog>

    {/* Feed Dialog */}
    <Dialog open={feedDialogOpen} onClose={() => setFeedDialogOpen(false)} maxWidth="sm" fullWidth>
      <DialogTitle>Joe Farm - Record Feed Purchase</DialogTitle>
      <DialogContent>
        <TextField
          margin="dense"
          label="Number of Sacks"
          fullWidth
          variant="outlined"
          type="number"
          value={feedPurchaseData.sacks || ''}
          onChange={(e) => setFeedPurchaseData({
            ...feedPurchaseData,
            sacks: e.target.value,
            quantity_kg: e.target.value ? parseInt(e.target.value) * 70 : ''
          })}
        />
        <TextField
          margin="dense"
          label="Quantity (kg)"
          fullWidth
          variant="outlined"
          type="number"
          value={feedPurchaseData.quantity_kg}
          onChange={(e) => setFeedPurchaseData({ ...feedPurchaseData, quantity_kg: e.target.value })}
          helperText="Auto-calculated from sacks (70kg per sack)"
        />
        <TextField
          margin="dense"
          label="Total Cost (Ksh)"
          fullWidth
          variant="outlined"
          type="number"
          value={feedPurchaseData.total_cost}
          onChange={(e) => setFeedPurchaseData({ ...feedPurchaseData, total_cost: e.target.value })}
        />
        <FormControl fullWidth margin="dense">
          <InputLabel>Feed Type</InputLabel>
          <Select
            value={feedPurchaseData.feed_type}
            onChange={(e) => setFeedPurchaseData({ ...feedPurchaseData, feed_type: e.target.value })}
          >
            <MenuItem value="layers_mash">Layers Mash</MenuItem>
            <MenuItem value="broilers_mash">Broilers Mash</MenuItem>
            <MenuItem value="growers_mash">Growers Mash</MenuItem>
            <MenuItem value="starter_mash">Starter Mash</MenuItem>
            <MenuItem value="other">Other</MenuItem>
          </Select>
        </FormControl>
        <TextField
          margin="dense"
          label="Date"
          fullWidth
          variant="outlined"
          type="date"
          value={feedPurchaseData.date}
          onChange={(e) => setFeedPurchaseData({ ...feedPurchaseData, date: e.target.value })}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setFeedDialogOpen(false)}>Cancel</Button>
        <Button onClick={() => {
          handleRecordFeedPurchase();
          setFeedDialogOpen(false);
        }} variant="contained">Record Feed Purchase</Button>
      </DialogActions>
    </Dialog>

    {/* Chicken Count Dialog */}
    <Dialog open={chickenCountDialogOpen} onClose={() => setChickenCountDialogOpen(false)} maxWidth="sm" fullWidth>
      <DialogTitle>Joe Farm - Update Chicken Count</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
          Update the total number of chickens in your flock. This affects feed calculations and production metrics.
        </Typography>
        <TextField
          margin="dense"
          label="Current Chicken Count"
          fullWidth
          variant="outlined"
          type="number"
          value={chickenCount}
          onChange={(e) => setChickenCount(e.target.value)}
          helperText={`Previous count: ${dashboardData?.total_chickens || 0} chickens`}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setChickenCountDialogOpen(false)}>Cancel</Button>
        <Button onClick={() => {
          handleUpdateChickenCount();
          setChickenCountDialogOpen(false);
        }} variant="contained">Update Count</Button>
      </DialogActions>
    </Dialog>

    {/* Feed Consumption Dialog */}
    <Dialog open={feedConsumptionDialogOpen} onClose={() => setFeedConsumptionDialogOpen(false)} maxWidth="sm" fullWidth>
      <DialogTitle>Joe Farm - Record Today's Feed Consumption</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
          How much feed did your chickens eat today? This helps track feed efficiency.
        </Typography>
        <TextField
          margin="dense"
          label="Feed Consumed Today (kg)"
          fullWidth
          variant="outlined"
          type="number"
          step="0.1"
          value={feedConsumptionData.quantity_used_kg}
          onChange={(e) => setFeedConsumptionData({ ...feedConsumptionData, quantity_used_kg: e.target.value })}
        />
        <TextField
          margin="dense"
          label="Date"
          fullWidth
          variant="outlined"
          type="date"
          value={feedConsumptionData.date}
          onChange={(e) => setFeedConsumptionData({ ...feedConsumptionData, date: e.target.value })}
        />
        {dashboardData && dashboardData.total_chickens && feedConsumptionData.quantity_used_kg && (
          <Box sx={{ mt: 2, p: 2, bgcolor: '#e8f5e8', borderRadius: 1, border: '1px solid #d4edda' }}>
            <Typography variant="body2" color="success.main" sx={{ fontWeight: 'bold' }}>
              📊 Feed Efficiency
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {parseFloat(feedConsumptionData.quantity_used_kg).toFixed(1)} kg feed for {dashboardData.total_chickens} chickens
            </Typography>
            <Typography variant="body2" color="text.secondary">
              = {(parseFloat(feedConsumptionData.quantity_used_kg) / dashboardData.total_chickens).toFixed(3)} kg per chicken
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setFeedConsumptionDialogOpen(false)}>Cancel</Button>
        <Button onClick={() => {
          handleRecordFeedConsumption();
          setFeedConsumptionDialogOpen(false);
        }} variant="contained">Record Feed Consumption</Button>
      </DialogActions>
    </Dialog>

    {/* Settings Dialog */}
    <Dialog open={showProfileSettings} onClose={() => setShowProfileSettings(false)} maxWidth="md" fullWidth>
      <DialogTitle>Joe Farm - Settings</DialogTitle>
      <DialogContent>
        <Tabs value={settingsTabValue} onChange={(event, newValue) => setSettingsTabValue(newValue)} sx={{ mb: 3 }}>
          <Tab label="👤 Profile" />
          <Tab label="🐔 Chicken Count" />
          <Tab label="🌾 Feed Settings" />
          <Tab label="👥 User Management" />
        </Tabs>

        {settingsTabValue === 0 && (
          <Box>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              Update your profile information. For security, you must enter your current password when changing to a new password.
            </Typography>
            <TextField
              autoFocus
              margin="dense"
              label="Username"
              fullWidth
              variant="outlined"
              value={profileData.username}
              onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
            />
            <TextField
              margin="dense"
              label="Email"
              fullWidth
              variant="outlined"
              value={profileData.email}
              onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
            />
            <TextField
              margin="dense"
              label="Current Password"
              fullWidth
              variant="outlined"
              type="password"
              value={profileData.currentPassword}
              onChange={(e) => setProfileData({ ...profileData, currentPassword: e.target.value })}
              helperText="Required when changing password"
            />
            <TextField
              margin="dense"
              label="New Password (leave blank to keep current)"
              fullWidth
              variant="outlined"
              type="password"
              value={profileData.password}
              onChange={(e) => setProfileData({ ...profileData, password: e.target.value })}
              helperText="Enter a new password only if you want to change it"
            />
            <TextField
              margin="dense"
              label="Confirm New Password"
              fullWidth
              variant="outlined"
              type="password"
              value={profileData.confirmPassword}
              onChange={(e) => setProfileData({ ...profileData, confirmPassword: e.target.value })}
            />
          </Box>
        )}

        {settingsTabValue === 1 && (
          <Box>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              Update your chicken count when birds die, are sold, or new ones are added.
            </Typography>
            <Box sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: 1, mb: 2, border: '1px solid #dee2e6' }}>
              <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#2c3e50', fontSize: '1.1rem' }}>
                Current Flock Size: {dashboardData?.total_chickens || 0} birds
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Last updated: {new Date().toLocaleDateString()}
              </Typography>
            </Box>
            <TextField
              margin="dense"
              label="New Chicken Count"
              fullWidth
              variant="outlined"
              type="number"
              value={chickenCount}
              onChange={(e) => setChickenCount(e.target.value)}
              helperText="Enter the updated number of chickens in your flock"
            />
            <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
              This affects feed calculations and production metrics.
            </Typography>
          </Box>
        )}

        {settingsTabValue === 2 && (
          <Box>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              How many kg of feed do all your chickens consume per day? The system will divide this by your chicken count to calculate per-chicken consumption.
            </Typography>
            <TextField
              margin="dense"
              label="Total Daily Feed Consumption (kg)"
              fullWidth
              variant="outlined"
              type="number"
              step="0.1"
              value={totalDailyFeed}
              onChange={(e) => {
                const totalFeed = parseFloat(e.target.value) || 0;
                setTotalDailyFeed(e.target.value);
                setTotalFeedManuallySet(true);
                const chickenCount = dashboardData?.total_chickens || 1;
                setFeedPerChicken((totalFeed / chickenCount).toFixed(3));
              }}
              helperText={`For ${dashboardData?.total_chickens || 0} chickens`}
            />
            <TextField
              margin="dense"
              label="Feed per Chicken per Day (kg)"
              fullWidth
              variant="outlined"
              type="number"
              step="0.01"
              value={feedPerChicken}
              onChange={(e) => {
                setFeedPerChicken(e.target.value);
                setTotalFeedManuallySet(false);
                const perChickenRate = parseFloat(e.target.value) || 0;
                const chickenCount = dashboardData?.total_chickens || 1;
                setTotalDailyFeed((perChickenRate * chickenCount).toFixed(1));
              }}
              helperText="Auto-calculated from total feed above"
            />
            <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
              How many kg of feed do all your chickens consume per day? The system will divide this by your chicken count to calculate per-chicken consumption.
            </Typography>
            <TextField
              margin="dense"
              label="Total Daily Feed Consumption (kg)"
              fullWidth
              variant="outlined"
              type="number"
              step="0.1"
              value={totalDailyFeed}
              onChange={(e) => {
                const totalFeed = parseFloat(e.target.value) || 0;
                setTotalDailyFeed(e.target.value);
                setTotalFeedManuallySet(true);
                const chickenCount = dashboardData?.total_chickens || 1;
                setFeedPerChicken((totalFeed / chickenCount).toFixed(3));
              }}
              helperText={`For ${dashboardData?.total_chickens || 0} chickens = ${totalDailyFeed} kg total`}
            />
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              This setting helps the system calculate if you're over or under feeding your flock.
            </Typography>
          </Box>
        )}

        {settingsTabValue === 3 && (
          <Box>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
              Manage users registered on the system. You can view their registration dates, approve pending users, and remove users if needed.
            </Typography>

            {/* Pending Users Section */}
            {pendingUsers.length > 0 && (
              <Box sx={{ mb: 4, p: 3, bgcolor: '#fff3cd', borderRadius: 2, border: '1px solid #ffc107' }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#856404', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  ⏳ Pending Approvals ({pendingUsers.length})
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                  These users have registered but need your approval before they can log in.
                </Typography>
                <Box sx={{ display: 'grid', gap: 2 }}>
                  {pendingUsers.map((user) => (
                    <Card key={user.id} sx={{ p: 2, bgcolor: 'white' }}>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                            {user.username}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            📧 {user.email}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            🏷️ Role: {user.role || 'worker'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            📅 Registered: {new Date(user.created_at || user.date_joined).toLocaleDateString()}
                          </Typography>
                        </Box>
                        <Button
                          variant="contained"
                          color="success"
                          onClick={() => handleApproveUser(user.id)}
                          startIcon={<span>✓</span>}
                        >
                          Approve
                        </Button>
                      </Box>
                    </Card>
                  ))}
                </Box>
              </Box>
            )}

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => setUserDialogOpen(true)}
                startIcon={<span>👤</span>}
                sx={{ minWidth: '140px' }}
              >
                Add User
              </Button>
              <Button
                variant="outlined"
                color="primary"
                onClick={fetchUsers}
                startIcon={<span>🔄</span>}
                sx={{ minWidth: '140px' }}
              >
                Refresh List
              </Button>
            </Box>

            {/* Users Summary */}
            {users.length > 0 && (
              <Box sx={{ mb: 3, p: 2, bgcolor: '#f8f9fa', borderRadius: 2, border: '1px solid #dee2e6' }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#2c3e50', mb: 1 }}>
                  👥 User Summary
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Users: <strong>{users.length}</strong> |
                  Owners: <strong>{users.filter(u => u.role === 'owner').length}</strong> |
                  Workers: <strong>{users.filter(u => u.role === 'worker').length}</strong>
                </Typography>
              </Box>
            )}

            {/* Users List */}
            {users.length > 0 ? (
              <Box>
                <Typography variant="h6" sx={{ fontWeight: '600', color: '#34495e', mb: 2, borderBottom: '2px solid #3498db', pb: 1 }}>
                  📋 Registered Users
                </Typography>
                <Box sx={{ maxHeight: '500px', overflowY: 'auto', pr: 1 }}>
                  <Grid container spacing={3}>
                    {users.map((user) => (
                      <Grid item xs={12} lg={6} key={user.id}>
                        <Card sx={{
                          p: 3,
                          border: '1px solid rgba(0,0,0,0.1)',
                          backgroundColor: 'rgba(255,255,255,0.95)',
                          backdropFilter: 'blur(10px)',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                            transform: 'translateY(-2px)'
                          }
                        }}>
                          <Box display="flex" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#2c3e50', mb: 1 }}>
                                {user.username}
                              </Typography>
                              <Box sx={{ display: 'grid', gap: 0.5 }}>
                                <Typography variant="body2" color="text.secondary">
                                  📧 <strong>Email:</strong> {user.email}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  🏷️ <strong>Role:</strong> {user.role || 'worker'}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  📅 <strong>Registered:</strong> {new Date(user.date_joined).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                  })}
                                </Typography>
                                {user.farm_name && (
                                  <Typography variant="body2" color="text.secondary">
                                    🏡 <strong>Farm:</strong> {user.farm_name}
                                  </Typography>
                                )}
                              </Box>
                            </Box>
                            <Button
                              variant="outlined"
                              color="error"
                              size="small"
                              onClick={() => handleDeleteUser(user.id)}
                              sx={{
                                minWidth: 'auto',
                                ml: 2,
                                '&:hover': {
                                  backgroundColor: 'rgba(220, 53, 69, 0.1)',
                                  borderColor: '#dc3545'
                                }
                              }}
                            >
                              🗑️ Delete
                            </Button>
                          </Box>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', py: 6, px: 3 }}>
                <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                  👤 No Users Found
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  No users are currently registered in the system.
                </Typography>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={fetchUsers}
                  startIcon={<span>🔄</span>}
                >
                  Refresh Users List
                </Button>
              </Box>
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setShowProfileSettings(false)}>Cancel</Button>
        <Button onClick={() => {
          if (settingsTabValue === 0) {
            handleUpdateProfile();
          } else if (settingsTabValue === 1) {
            handleUpdateChickenCount();
          } else if (settingsTabValue === 2) {
            handleUpdateSettings();
          } else if (settingsTabValue === 3) {
            // User management doesn't need save action
          }
        }}
        variant="contained">
          {settingsTabValue === 0 ? 'Update Profile' : settingsTabValue === 1 ? 'Update Count' : settingsTabValue === 2 ? 'Save Settings' : 'Close'}
        </Button>
      </DialogActions>
    </Dialog>

    {/* Egg Table Dialog */}
    <Dialog open={eggTableDialogOpen} onClose={() => setEggTableDialogOpen(false)} maxWidth="lg" fullWidth>
      <DialogTitle>Joe Farm - Today's Egg Collection Table</DialogTitle>
      <DialogContent>
        {/* Date Selection */}
        <Box sx={{ mb: 3, p: 2, bgcolor: '#f8f9fa', borderRadius: 1 }}>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Select date to view detailed egg collection table:
          </Typography>
          <TextField
            type="date"
            value={selectedTableDate}
            onChange={(e) => setSelectedTableDate(e.target.value)}
            sx={{ mr: 2 }}
          />
          <Button variant="contained" onClick={() => handleViewEggTable()}>
            Load Table
          </Button>
        </Box>
        {eggTableData ? (
          <Box>
            {/* Create HTML table for display - exact frontend structure matching Cage.js input form */}
            <div style={{fontFamily: 'Arial, sans-serif', maxWidth: '100%', overflowX: 'auto'}}>
              <h2>Egg Collection Table - {eggTableData.date}</h2>

              {/* Add each cage with front and back partitions - show all cages even with 0 eggs */}
              {[2, 1].map(cageId => {  // Cage 2 first (combined), then Cage 1 (standard)
                const cage = eggTableData.cages ? eggTableData.cages.find(c => c.cage_id === cageId) : null;
                const isCombined = cageId === 2; // Cage 2 is combined
                const boxesPerRow = isCombined ? 8 : 4;
                return (
                  <div key={cageId}>
                    <h3>Cage {cageId}</h3>

                    {/* Front Partition - matching Cage.js structure */}
                    <div style={{marginBottom: '20px'}}>
                      <h4>Front Partition</h4>
                      <table style={{borderCollapse: 'collapse', width: '100%', fontSize: '12px', marginBottom: '10px'}}>
                        <tbody>
                          {/* Create 4 rows x boxesPerRow columns layout (matching Cage.js) */}
                          {Array.from({length: 4}, (_, row) => (
                            <tr key={row}>
                              {Array.from({length: boxesPerRow}, (_, col) => {
                                const boxIndex = row * boxesPerRow + col;
                                const box = cage ? (cage.front_partition[boxIndex] || { eggs: 0 }) : { eggs: 0 };
                                const bgColor = box.eggs > 0 ? '#fff3cd' : '#f8f9fa';
                                const boxNumber = col + 1; // 1-4 or 1-8 depending on cage type
                                return (
                                  <td key={col} style={{
                                    border: '1px solid #ddd',
                                    padding: '8px',
                                    textAlign: 'center',
                                    backgroundColor: bgColor,
                                    width: '60px'
                                  }}>
                                    <div style={{fontSize: '10px', marginBottom: '2px'}}>{boxNumber}</div>
                                    <div style={{fontWeight: 'bold'}}>{box.eggs}</div>
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Back Partition - matching Cage.js structure */}
                    <div style={{marginBottom: '20px'}}>
                      <h4>Back Partition</h4>
                      <table style={{borderCollapse: 'collapse', width: '100%', fontSize: '12px', marginBottom: '10px'}}>
                        <tbody>
                          {/* Create 4 rows x boxesPerRow columns layout (matching Cage.js) */}
                          {Array.from({length: 4}, (_, row) => (
                            <tr key={row}>
                              {Array.from({length: boxesPerRow}, (_, col) => {
                                const boxIndex = row * boxesPerRow + col;
                                const box = cage ? (cage.back_partition[boxIndex] || { eggs: 0 }) : { eggs: 0 };
                                const bgColor = box.eggs > 0 ? '#fff3cd' : '#f8f9fa';
                                const boxNumber = col + 1; // 1-4 or 1-8 depending on cage type
                                return (
                                  <td key={col} style={{
                                    border: '1px solid #ddd',
                                    padding: '8px',
                                    textAlign: 'center',
                                    backgroundColor: bgColor,
                                    width: '60px'
                                  }}>
                                    <div style={{fontSize: '10px', marginBottom: '2px'}}>{boxNumber}</div>
                                    <div style={{fontWeight: 'bold'}}>{box.eggs}</div>
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Cage Summary */}
                    {(() => {
                      const frontTotal = cage ? cage.front_partition.reduce((sum, box) => sum + box.eggs, 0) : 0;
                      const backTotal = cage ? cage.back_partition.reduce((sum, box) => sum + box.eggs, 0) : 0;
                      const cageTotal = cage ? cage.cage_total : 0;
                      return (
                        <table style={{borderCollapse: 'collapse', width: '100%', fontSize: '12px', marginBottom: '30px'}}>
                          <thead>
                            <tr style={{backgroundColor: '#e8f5e8'}}>
                              <th style={{border: '1px solid #ddd', padding: '8px', textAlign: 'center'}}>Summary</th>
                              <th style={{border: '1px solid #ddd', padding: '8px', textAlign: 'center'}}>Count</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td style={{border: '1px solid #ddd', padding: '8px', textAlign: 'center', fontWeight: 'bold'}}>Front Partition</td>
                              <td style={{border: '1px solid #ddd', padding: '8px', textAlign: 'center'}}>{frontTotal}</td>
                            </tr>
                            <tr>
                              <td style={{border: '1px solid #ddd', padding: '8px', textAlign: 'center', fontWeight: 'bold'}}>Back Partition</td>
                              <td style={{border: '1px solid #ddd', padding: '8px', textAlign: 'center'}}>{backTotal}</td>
                            </tr>
                            <tr style={{backgroundColor: '#e8f5e8', fontWeight: 'bold'}}>
                              <td style={{border: '1px solid #ddd', padding: '8px', textAlign: 'center'}}>CAGE TOTAL</td>
                              <td style={{border: '1px solid #ddd', padding: '8px', textAlign: 'center'}}>{cageTotal}</td>
                            </tr>
                          </tbody>
                        </table>
                      );
                    })()}
                  </div>
                );
              })}

              {/* Add shade section */}
              <h3>Shade Eggs</h3>
              <table style={{borderCollapse: 'collapse', width: '100%', fontSize: '12px', marginBottom: '20px'}}>
                <thead>
                  <tr style={{backgroundColor: '#f0f8ff'}}>
                    <th style={{border: '1px solid #ddd', padding: '8px', textAlign: 'center'}}>Source</th>
                    <th style={{border: '1px solid #ddd', padding: '8px', textAlign: 'center', backgroundColor: '#e8f5e8'}}>Total Eggs</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{border: '1px solid #ddd', padding: '8px', textAlign: 'center', fontWeight: 'bold'}}>Shade</td>
                    <td style={{border: '1px solid #ddd', padding: '8px', textAlign: 'center', fontWeight: 'bold', backgroundColor: '#e8f5e8'}}>{eggTableData.shade_total}</td>
                  </tr>
                </tbody>
              </table>

              {/* Overall summary */}
              <div style={{marginTop: '20px', padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '5px', border: '2px solid #ddd'}}>
                <h3 style={{marginTop: '0'}}>Daily Summary</h3>
                <p><strong>Cage Eggs:</strong> {eggTableData.cage_total}</p>
                <p><strong>Shade Eggs:</strong> {eggTableData.shade_total}</p>
                <p><strong>Grand Total:</strong> {eggTableData.grand_total}</p>
                <p><strong>Laying Percentage:</strong> {eggTableData.laying_percentage}%</p>
                <p><strong>Performance:</strong> {eggTableData.performance_comment}</p>
                <p><strong>Trays:</strong> {Math.floor(eggTableData.grand_total / 30)} full trays + {eggTableData.grand_total % 30} remaining eggs</p>
                <p><strong>Date:</strong> {eggTableData.date}</p>
              </div>
            </div>
          </Box>
        ) : (
          <Typography>Loading egg collection data...</Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setEggTableDialogOpen(false)}>Close</Button>
        <Button
          variant="contained"
          color="secondary"
          onClick={() => {
            const token = localStorage.getItem('token');
            const date = selectedTableDate;
            fetch(`/api/cages/reports/download/egg-collection-table/?date=${date}&token=${token}`)
              .then(response => response.blob())
              .then(blob => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `egg_collection_table_${date}.pdf`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
              })
              .catch(error => {
                console.error('Error downloading PDF:', error);
                alert('Failed to download PDF. Please try again.');
              });
          }}
          sx={{ ml: 2 }}
        >
          📄 Download PDF
        </Button>
      </DialogActions>
    </Dialog>

    {/* Report Dialog */}
    <Dialog open={reportDialogOpen} onClose={() => setReportDialogOpen(false)} maxWidth="md" fullWidth>
      <DialogTitle>Joe Farm - {reportTitle}</DialogTitle>
      <DialogContent>
        <TextField
          multiline
          rows={20}
          fullWidth
          variant="outlined"
          value={reportContent}
          InputProps={{
            readOnly: true,
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setReportDialogOpen(false)}>Close</Button>
      </DialogActions>
    </Dialog>
  </Box>
);
};
export default OwnerDashboard;
