// Notification helper functions for OwnerDashboard

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://joe-farm-backend.onrender.com';

// Fetch notifications from the server
export const fetchNotifications = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/api/cages/notifications/`, {
      headers: {
        'Authorization': `Token ${token}`,
      },
    });
    
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.error('Error fetching notifications:', error);
  }
  return { notifications: [], unread_count: 0 };
};

// Mark a notification as read
export const markNotificationRead = async (notificationId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/api/cages/notifications/mark-read/${notificationId}/`, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${token}`,
      },
    });
    return response.ok;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return false;
  }
};

// Mark all notifications as read
export const markAllNotificationsRead = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/api/cages/notifications/mark-all-read/`, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${token}`,
      },
    });
    return response.ok;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return false;
  }
};
