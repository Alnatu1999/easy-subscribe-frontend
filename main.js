// main.js - Main JavaScript file for EasySubscribe website
// API Configuration - UPDATED FOR PRODUCTION
const API_BASE = window.location.hostname === 'localhost' 
  ? 'http://localhost:5001'  // Changed from 5000 to 5001 to match server
  : 'https://easy-subscribe-backend.onrender.com'; // Updated with actual backend URL
// DOM Elements
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const desktopNav = document.querySelector('.desktop-nav');
const menuToggle = document.querySelector('.menu-toggle');
const sidebar = document.querySelector('.sidebar');
// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  initializeApp();
  checkServerConnection();
});
// Check server connection
async function checkServerConnection() {
  try {
    const response = await fetch(`${API_BASE}/health`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (response.ok) {
      console.log('Server is running and accessible');
    } else {
      console.error('Server responded with status:', response.status);
    }
  } catch (error) {
    console.error('Cannot connect to server:', error.message);
    // Show a user-friendly message if on a page that requires server connection
    if (document.querySelector('.auth-page') || document.querySelector('.dashboard-page')) {
      showAlert('Unable to connect to the server. Please make sure the server is running.', 'error');
    }
  }
}
function initializeApp() {
  setupMobileMenu();
  setupSidebarToggle();
  setupFormHandlers();
  setupPasswordToggles();
  setupQuickAmountButtons();
  setupPlanSelection();
  setupProviderSelection();
  setupFAQToggle();
  setupServiceNavigation();
  checkAuthentication();
  loadUserData();
  loadWalletBalance();
  setupNotificationBell();
  setupProfileManagement();
  setupPasswordReset();
  setupModals();
  setupTransactionsPage();
  setupNotificationsPage();
}
// Mobile Menu Toggle
function setupMobileMenu() {
  if (mobileMenuBtn && desktopNav) {
    mobileMenuBtn.addEventListener('click', () => {
      desktopNav.classList.toggle('active');
    });
  }
}
// Sidebar Toggle for Dashboard
function setupSidebarToggle() {
  if (menuToggle && sidebar) {
    menuToggle.addEventListener('click', () => {
      sidebar.classList.toggle('active');
    });
  }
}
// Form Handlers
function setupFormHandlers() {
  // Login Form
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }
  
  // Signup Form
  const signupForm = document.getElementById('signupForm');
  if (signupForm) {
    signupForm.addEventListener('submit', handleSignup);
  }
  
  // Forgot Password Form
  const forgotPasswordForm = document.getElementById('forgotPasswordForm');
  if (forgotPasswordForm) {
    forgotPasswordForm.addEventListener('submit', handleForgotPassword);
  }
  
  // Reset Password Form
  const resetPasswordForm = document.getElementById('resetPasswordForm');
  if (resetPasswordForm) {
    resetPasswordForm.addEventListener('submit', handleResetPassword);
  }
  
  // Update Profile Form
  const updateProfileForm = document.getElementById('updateProfileForm');
  if (updateProfileForm) {
    updateProfileForm.addEventListener('submit', handleUpdateProfile);
  }
  
  // Change Password Form
  const changePasswordForm = document.getElementById('changePasswordForm');
  if (changePasswordForm) {
    changePasswordForm.addEventListener('submit', handleChangePassword);
  }
  
  // Airtime Form
  const airtimeForm = document.getElementById('airtimeForm');
  if (airtimeForm) {
    airtimeForm.addEventListener('submit', (e) => handleServiceForm(e, 'airtime'));
  }
  
  // Data Form
  const dataForm = document.getElementById('dataForm');
  if (dataForm) {
    dataForm.addEventListener('submit', (e) => handleServiceForm(e, 'data'));
  }
  
  // Electricity Form
  const electricityForm = document.getElementById('electricityForm');
  if (electricityForm) {
    electricityForm.addEventListener('submit', (e) => handleServiceForm(e, 'electricity'));
  }
  
  // TV Form
  const tvForm = document.getElementById('tvForm');
  if (tvForm) {
    tvForm.addEventListener('submit', (e) => handleServiceForm(e, 'tv'));
  }
}
// Password Visibility Toggle
function setupPasswordToggles() {
  const toggleButtons = document.querySelectorAll('.toggle-password');
  toggleButtons.forEach(button => {
    button.addEventListener('click', () => {
      const passwordInput = button.previousElementSibling;
      const icon = button.querySelector('i');
      
      if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
      } else {
        passwordInput.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
      }
    });
  });
}
// Quick Amount Buttons for Airtime
function setupQuickAmountButtons() {
  const amountButtons = document.querySelectorAll('.amount-btn');
  const amountInput = document.getElementById('amount');
  
  if (amountButtons.length > 0 && amountInput) {
    amountButtons.forEach(button => {
      button.addEventListener('click', () => {
        amountInput.value = button.textContent;
      });
    });
  }
}
// Plan Selection for Data
function setupPlanSelection() {
  const planOptions = document.querySelectorAll('.plan-option input[type="radio"]');
  
  planOptions.forEach(option => {
    option.addEventListener('change', () => {
      // Update UI to show selected plan
      const allPlans = document.querySelectorAll('.plan-option');
      allPlans.forEach(plan => {
        plan.classList.remove('selected');
      });
      
      if (option.checked) {
        option.closest('.plan-option').classList.add('selected');
      }
    });
  });
}
// Provider Selection for TV
function setupProviderSelection() {
  const tvProvider = document.getElementById('tv');
  const dstvPlans = document.getElementById('dstv-plans');
  const gotvPlans = document.getElementById('gotv-plans');
  const startimesPlans = document.getElementById('startimes-plans');
  
  if (tvProvider) {
    tvProvider.addEventListener('change', () => {
      // Hide all plan sections
      if (dstvPlans) dstvPlans.style.display = 'none';
      if (gotvPlans) gotvPlans.style.display = 'none';
      if (startimesPlans) startimesPlans.style.display = 'none';
      
      // Show selected provider's plans
      switch (tvProvider.value) {
        case 'dstv':
          if (dstvPlans) dstvPlans.style.display = 'grid';
          break;
        case 'gotv':
          if (gotvPlans) gotvPlans.style.display = 'grid';
          break;
        case 'startimes':
          if (startimesPlans) startimesPlans.style.display = 'grid';
          break;
      }
    });
  }
}
// FAQ Toggle
function setupFAQToggle() {
  const faqQuestions = document.querySelectorAll('.faq-question');
  
  faqQuestions.forEach(question => {
    question.addEventListener('click', () => {
      const answer = question.nextElementSibling;
      const icon = question.querySelector('i');
      
      answer.classList.toggle('active');
      icon.classList.toggle('fa-chevron-down');
      icon.classList.toggle('fa-chevron-up');
    });
  });
}
// Service Navigation
function setupServiceNavigation() {
  const viewAllButtons = document.querySelectorAll('.view-all');
  
  viewAllButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      // In a real app, this would navigate to a full transactions page
      window.location.href = 'transactions.html';
    });
  });
}
// Notification Bell
function setupNotificationBell() {
  const notificationBell = document.querySelector('.notification-bell');
  if (notificationBell) {
    notificationBell.addEventListener('click', () => {
      window.location.href = 'notifications.html';
    });
  }
}
// Profile Management
function setupProfileManagement() {
  const editProfileBtn = document.querySelector('.edit-profile-btn');
  if (editProfileBtn) {
    editProfileBtn.addEventListener('click', () => {
      window.location.href = 'profile.html';
    });
  }
}
// Password Reset
function setupPasswordReset() {
  const forgotPasswordLink = document.querySelector('.forgot-password');
  if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.href = 'forgot-password.html';
    });
  }
}
// Modals Setup
function setupModals() {
  // Close modal when clicking on close button
  const closeButtons = document.querySelectorAll('.close-modal');
  closeButtons.forEach(button => {
    button.addEventListener('click', () => {
      const modal = button.closest('.modal');
      if (modal) {
        modal.style.display = 'none';
      }
    });
  });
  
  // Close modal when clicking outside of it
  window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
      e.target.style.display = 'none';
    }
  });
}
// Transactions Page Setup
function setupTransactionsPage() {
  if (!document.querySelector('.transactions-page')) return;
  
  loadTransactions();
  
  // Setup filter buttons
  const filterButtons = document.querySelectorAll('.filter-btn');
  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Remove active class from all buttons
      filterButtons.forEach(btn => btn.classList.remove('active'));
      // Add active class to clicked button
      button.classList.add('active');
      
      // Reload transactions with filter
      loadTransactions(button.dataset.type);
    });
  });
}
// Notifications Page Setup
function setupNotificationsPage() {
  if (!document.querySelector('.notifications-page')) return;
  
  loadNotificationsList();
  
  // Setup mark all as read button
  const markAllReadBtn = document.getElementById('markAllRead');
  if (markAllReadBtn) {
    markAllReadBtn.addEventListener('click', markAllNotificationsAsRead);
  }
}
// Authentication Check
function checkAuthentication() {
  const token = localStorage.getItem('accessToken');
  
  // If not logged in and not on login/signup page, redirect to login
  if (!token && 
      !window.location.pathname.includes('login.html') && 
      !window.location.pathname.includes('signup.html') &&
      !window.location.pathname.includes('index.html') &&
      !window.location.pathname.includes('forgot-password.html') &&
      !window.location.pathname.includes('reset-password.html')) {
    window.location.href = 'login.html';
  }
}
// Load User Data
function loadUserData() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  // Update UI with user data
  const userNameElements = document.querySelectorAll('.user-name');
  userNameElements.forEach(element => {
    if (user.name) {
      element.textContent = user.name;
    }
  });
  
  const userEmailElements = document.querySelectorAll('.user-email');
  userEmailElements.forEach(element => {
    if (user.email) {
      element.textContent = user.email;
    }
  });
}
// Load Wallet Balance
async function loadWalletBalance() {
  const token = localStorage.getItem('accessToken');
  if (!token) return;
  
  try {
    const response = await fetch(`${API_BASE}/api/wallet/balance`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.success) {
        const balanceElements = document.querySelectorAll('.wallet-balance');
        balanceElements.forEach(element => {
          element.textContent = `₦${Number(data.data.balance).toLocaleString()}`;
        });
      }
    } else if (response.status === 401) {
      // Token expired, try to refresh
      const refreshSuccess = await refreshToken();
      if (refreshSuccess) {
        // Retry after refresh
        loadWalletBalance();
      } else {
        // If refresh fails, redirect to login
        window.location.href = 'login.html';
      }
    }
  } catch (error) {
    console.error('Error loading wallet balance:', error);
    // Show user-friendly error message
    const balanceElements = document.querySelectorAll('.wallet-balance');
    balanceElements.forEach(element => {
      element.textContent = '₦0.00';
    });
  }
}
// Load Notifications
async function loadNotifications() {
  const token = localStorage.getItem('accessToken');
  if (!token) return;
  
  try {
    const response = await fetch(`${API_BASE}/api/notifications?unreadOnly=true`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.success) {
        // Update notification badge
        const notificationBadge = document.querySelector('.notification-badge');
        if (notificationBadge) {
          notificationBadge.textContent = data.data.unreadCount;
          notificationBadge.style.display = data.data.unreadCount > 0 ? 'block' : 'none';
        }
      }
    } else if (response.status === 401) {
      // Token expired, try to refresh
      const refreshSuccess = await refreshToken();
      if (refreshSuccess) {
        // Retry after refresh
        loadNotifications();
      } else {
        // If refresh fails, redirect to login
        window.location.href = 'login.html';
      }
    }
  } catch (error) {
    console.error('Error loading notifications:', error);
  }
}
// Load Notifications List
async function loadNotificationsList() {
  const token = localStorage.getItem('accessToken');
  if (!token) return;
  
  const notificationsContainer = document.getElementById('notificationsList');
  if (!notificationsContainer) return;
  
  try {
    const response = await fetch(`${API_BASE}/api/notifications`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.success) {
        // Clear existing notifications
        notificationsContainer.innerHTML = '';
        
        if (data.data.notifications.length === 0) {
          notificationsContainer.innerHTML = '<div class="no-notifications">No notifications found</div>';
          return;
        }
        
        // Add notifications to the list
        data.data.notifications.forEach(notification => {
          const notificationElement = document.createElement('div');
          notificationElement.className = `notification-item ${notification.isRead ? 'read' : 'unread'}`;
          notificationElement.innerHTML = `
            <div class="notification-header">
              <h3>${notification.title}</h3>
              <span class="notification-date">${formatDate(notification.createdAt)}</span>
            </div>
            <p>${notification.message}</p>
            ${!notification.isRead ? `<button class="btn btn-sm mark-read" data-id="${notification._id}">Mark as Read</button>` : ''}
          `;
          
          notificationsContainer.appendChild(notificationElement);
        });
        
        // Add event listeners to mark as read buttons
        const markReadButtons = notificationsContainer.querySelectorAll('.mark-read');
        markReadButtons.forEach(button => {
          button.addEventListener('click', () => {
            markNotificationAsRead(button.dataset.id);
          });
        });
      }
    } else if (response.status === 401) {
      // Token expired, try to refresh
      const refreshSuccess = await refreshToken();
      if (refreshSuccess) {
        // Retry after refresh
        loadNotificationsList();
      } else {
        // If refresh fails, redirect to login
        window.location.href = 'login.html';
      }
    }
  } catch (error) {
    console.error('Error loading notifications list:', error);
    notificationsContainer.innerHTML = '<div class="error">Failed to load notifications</div>';
  }
}
// Mark Notification as Read
async function markNotificationAsRead(notificationId) {
  const token = localStorage.getItem('accessToken');
  if (!token) return;
  
  try {
    const response = await fetch(`${API_BASE}/api/notifications/${notificationId}/read`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.ok) {
      // Reload notifications list
      loadNotificationsList();
      // Update notification badge
      loadNotifications();
    } else if (response.status === 401) {
      // Token expired, try to refresh
      const refreshSuccess = await refreshToken();
      if (refreshSuccess) {
        // Retry after refresh
        markNotificationAsRead(notificationId);
      } else {
        // If refresh fails, redirect to login
        window.location.href = 'login.html';
      }
    }
  } catch (error) {
    console.error('Error marking notification as read:', error);
    showAlert('Failed to mark notification as read');
  }
}
// Mark All Notifications as Read
async function markAllNotificationsAsRead() {
  const token = localStorage.getItem('accessToken');
  if (!token) return;
  
  try {
    const response = await fetch(`${API_BASE}/api/notifications/read-all`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.ok) {
      // Reload notifications list
      loadNotificationsList();
      // Update notification badge
      loadNotifications();
      showAlert('All notifications marked as read', 'success');
    } else if (response.status === 401) {
      // Token expired, try to refresh
      const refreshSuccess = await refreshToken();
      if (refreshSuccess) {
        // Retry after refresh
        markAllNotificationsAsRead();
      } else {
        // If refresh fails, redirect to login
        window.location.href = 'login.html';
      }
    }
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    showAlert('Failed to mark notifications as read');
  }
}
// Load Transactions
async function loadTransactions(type = '') {
  const token = localStorage.getItem('accessToken');
  if (!token) return;
  
  const transactionsContainer = document.getElementById('transactionsList');
  if (!transactionsContainer) return;
  
  try {
    let url = `${API_BASE}/api/transactions`;
    if (type) {
      url += `?type=${type}`;
    }
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.success) {
        // Clear existing transactions
        transactionsContainer.innerHTML = '';
        
        if (data.data.transactions.length === 0) {
          transactionsContainer.innerHTML = '<div class="no-transactions">No transactions found</div>';
          return;
        }
        
        // Add transactions to the list
        data.data.transactions.forEach(transaction => {
          const transactionElement = document.createElement('div');
          transactionElement.className = `transaction-item ${transaction.status}`;
          transactionElement.innerHTML = `
            <div class="transaction-info">
              <div class="transaction-type">${transaction.type}</div>
              <div class="transaction-reference">${transaction.reference}</div>
              <div class="transaction-date">${formatDate(transaction.createdAt)}</div>
            </div>
            <div class="transaction-amount">₦${Number(transaction.amount).toLocaleString()}</div>
            <div class="transaction-status ${transaction.status}">${transaction.status}</div>
          `;
          
          transactionsContainer.appendChild(transactionElement);
        });
      }
    } else if (response.status === 401) {
      // Token expired, try to refresh
      const refreshSuccess = await refreshToken();
      if (refreshSuccess) {
        // Retry after refresh
        loadTransactions(type);
      } else {
        // If refresh fails, redirect to login
        window.location.href = 'login.html';
      }
    }
  } catch (error) {
    console.error('Error loading transactions:', error);
    transactionsContainer.innerHTML = '<div class="error">Failed to load transactions</div>';
  }
}
// Refresh Token
async function refreshToken() {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) {
    logout();
    return false;
  }
  
  try {
    const response = await fetch(`${API_BASE}/api/auth/refresh-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken })
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      localStorage.setItem('accessToken', data.data.accessToken);
      return true;
    } else {
      // Refresh token failed, logout user
      logout();
      return false;
    }
  } catch (error) {
    console.error('Error refreshing token:', error);
    logout();
    return false;
  }
}
// Show Alert Function
function showAlert(message, type = 'error') {
  const alertContainer = document.getElementById('alert-container');
  if (!alertContainer) return;
  
  alertContainer.innerHTML = `
    <div class="alert alert-${type}">
      <i class="fas fa-${type === 'error' ? 'exclamation-circle' : 'check-circle'}"></i>
      <span>${message}</span>
      <button class="close-alert">&times;</button>
    </div>
  `;
  
  // Add event listener to close button
  const closeBtn = alertContainer.querySelector('.close-alert');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      alertContainer.innerHTML = '';
    });
  }
  
  // Auto-hide after 5 seconds
  setTimeout(() => {
    alertContainer.innerHTML = '';
  }, 5000);
}
// Validate Signup Form
function validateSignupForm() {
  let isValid = true;
  
  // Clear previous errors
  document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
  
  // Validate name
  const name = document.getElementById('name').value.trim();
  if (!name) {
    document.getElementById('name-error').textContent = 'Name is required';
    isValid = false;
  }
  
  // Validate email
  const email = document.getElementById('email').value.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) {
    document.getElementById('email-error').textContent = 'Email is required';
    isValid = false;
  } else if (!emailRegex.test(email)) {
    document.getElementById('email-error').textContent = 'Please enter a valid email';
    isValid = false;
  }
  
  // Validate phone
  const phone = document.getElementById('phone').value.trim();
  const phoneRegex = /^(0|234)(7|8|9)[01]\d{8}$/;
  if (!phone) {
    document.getElementById('phone-error').textContent = 'Phone number is required';
    isValid = false;
  } else if (!phoneRegex.test(phone)) {
    document.getElementById('phone-error').textContent = 'Please enter a valid Nigerian phone number';
    isValid = false;
  }
  
  // Validate password
  const password = document.getElementById('password').value;
  if (!password) {
    document.getElementById('password-error').textContent = 'Password is required';
    isValid = false;
  } else if (password.length < 8) {
    document.getElementById('password-error').textContent = 'Password must be at least 8 characters';
    isValid = false;
  }
  
  // Validate confirm password
  const confirmPassword = document.getElementById('confirmPassword').value;
  if (!confirmPassword) {
    document.getElementById('confirmPassword-error').textContent = 'Please confirm your password';
    isValid = false;
  } else if (password !== confirmPassword) {
    document.getElementById('confirmPassword-error').textContent = 'Passwords do not match';
    isValid = false;
  }
  
  // Validate terms
  const terms = document.getElementById('terms').checked;
  if (!terms) {
    document.getElementById('terms-error').textContent = 'You must accept the terms and conditions';
    isValid = false;
  }
  
  return isValid;
}
// Signup Handler - FIXED FIELD REFERENCES
async function handleSignup(e) {
  e.preventDefault();
  
  // Client-side validation
  if (!validateSignupForm()) {
    return;
  }
  
  const name = document.getElementById('name').value; // FIXED: Changed from fullName
  const email = document.getElementById('email').value;
  const phone = document.getElementById('phone').value;
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  const termsAccepted = document.getElementById('terms')?.checked || false;
  
  // Validate passwords match
  if (password !== confirmPassword) {
    showAlert('Passwords do not match!');
    return;
  }
  
  if (!termsAccepted) {
    showAlert('You must accept the terms and conditions!');
    return;
  }
  
  try {
    // Show loading state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating Account...';
    
    // API call
    const response = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, phone })
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      // Save tokens and user data
      localStorage.setItem('accessToken', data.data.accessToken);
      localStorage.setItem('refreshToken', data.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.data.user));
      
      showAlert('Account created successfully! Redirecting to dashboard...', 'success');
      
      // Redirect to dashboard
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 2000);
    } else {
      // Show error message
      showAlert(data.message || 'Signup failed. Please try again.');
    }
    
  } catch (error) {
    console.error('Signup error:', error);
    
    // More specific error message for network issues
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      showAlert('Unable to connect to the server. Please check your internet connection.');
    } else {
      showAlert('Signup failed. Please check your connection and try again.');
    }
  } finally {
    // Reset button state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Create Account';
    }
  }
}
// Validate Login Form
function validateLoginForm() {
  let isValid = true;
  
  // Clear previous errors
  document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
  
  // Validate email
  const email = document.getElementById('email').value.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) {
    document.getElementById('email-error').textContent = 'Email is required';
    isValid = false;
  } else if (!emailRegex.test(email)) {
    document.getElementById('email-error').textContent = 'Please enter a valid email';
    isValid = false;
  }
  
  // Validate password
  const password = document.getElementById('password').value;
  if (!password) {
    document.getElementById('password-error').textContent = 'Password is required';
    isValid = false;
  }
  
  return isValid;
}
// Login Handler
async function handleLogin(e) {
  e.preventDefault();
  
  // Client-side validation
  if (!validateLoginForm()) {
    return;
  }
  
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  
  try {
    // Show loading state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Logging in...';
    
    // API call
    const response = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      // Save tokens and user data
      localStorage.setItem('accessToken', data.data.accessToken);
      localStorage.setItem('refreshToken', data.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.data.user));
      
      // Check if "Remember me" is checked
      const rememberMe = document.getElementById('remember').checked;
      if (rememberMe) {
        // Set tokens to expire in 30 days
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 30);
        document.cookie = `refreshToken=${data.data.refreshToken}; expires=${expiryDate.toUTCString()}; path=/`;
      }
      
      showAlert('Login successful! Redirecting to dashboard...', 'success');
      
      // Redirect to dashboard
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 2000);
    } else {
      // Show error message
      showAlert(data.message || 'Login failed. Please check your credentials and try again.');
    }
    
  } catch (error) {
    console.error('Login error:', error);
    
    // More specific error message for network issues
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      showAlert('Unable to connect to the server. Please check your internet connection.');
    } else {
      showAlert('Login failed. Please check your connection and try again.');
    }
  } finally {
    // Reset button state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Login';
    }
  }
}
// Forgot Password Handler
async function handleForgotPassword(e) {
  e.preventDefault();
  
  const email = document.getElementById('email').value;
  
  try {
    // Show loading state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';
    
    // API call
    const response = await fetch(`${API_BASE}/api/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      showAlert(data.message, 'success');
      // Redirect to login page
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 2000);
    } else {
      // Show error message
      showAlert(data.message || 'Failed to process request. Please try again.');
    }
    
  } catch (error) {
    console.error('Forgot password error:', error);
    
    // More specific error message for network issues
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      showAlert('Unable to connect to the server. Please check your internet connection.');
    } else {
      showAlert('Failed to process request. Please check your connection and try again.');
    }
  } finally {
    // Reset button state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Reset Password';
    }
  }
}
// Reset Password Handler
async function handleResetPassword(e) {
  e.preventDefault();
  
  const token = new URLSearchParams(window.location.search).get('token');
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  
  // Validate passwords match
  if (password !== confirmPassword) {
    showAlert('Passwords do not match!');
    return;
  }
  
  try {
    // Show loading state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Resetting...';
    
    // API call
    const response = await fetch(`${API_BASE}/api/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      showAlert(data.message, 'success');
      // Redirect to login page
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 2000);
    } else {
      // Show error message
      showAlert(data.message || 'Failed to reset password. Please try again.');
    }
    
  } catch (error) {
    console.error('Reset password error:', error);
    
    // More specific error message for network issues
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      showAlert('Unable to connect to the server. Please check your internet connection.');
    } else {
      showAlert('Failed to reset password. Please check your connection and try again.');
    }
  } finally {
    // Reset button state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Reset Password';
    }
  }
}
// Update Profile Handler
async function handleUpdateProfile(e) {
  e.preventDefault();
  
  const token = localStorage.getItem('accessToken');
  if (!token) {
    showAlert('Please login to update your profile');
    return;
  }
  
  const name = document.getElementById('name').value;
  const phone = document.getElementById('phone').value;
  
  try {
    // Show loading state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Updating...';
    
    // API call
    const response = await fetch(`${API_BASE}/api/user/profile`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ name, phone })
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      // Update user data in localStorage
      localStorage.setItem('user', JSON.stringify(data.data.user));
      
      showAlert(data.message, 'success');
      // Redirect to dashboard
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 2000);
    } else {
      // Show error message
      showAlert(data.message || 'Failed to update profile. Please try again.');
    }
    
  } catch (error) {
    console.error('Update profile error:', error);
    
    // More specific error message for network issues
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      showAlert('Unable to connect to the server. Please check your internet connection.');
    } else {
      showAlert('Failed to update profile. Please check your connection and try again.');
    }
  } finally {
    // Reset button state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Update Profile';
    }
  }
}
// Change Password Handler
async function handleChangePassword(e) {
  e.preventDefault();
  
  const token = localStorage.getItem('accessToken');
  if (!token) {
    showAlert('Please login to change your password');
    return;
  }
  
  const currentPassword = document.getElementById('currentPassword').value;
  const newPassword = document.getElementById('newPassword').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  
  // Validate passwords match
  if (newPassword !== confirmPassword) {
    showAlert('New passwords do not match!');
    return;
  }
  
  try {
    // Show loading state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Changing...';
    
    // API call
    const response = await fetch(`${API_BASE}/api/user/change-password`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ currentPassword, newPassword })
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      showAlert(data.message, 'success');
      // Redirect to dashboard
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 2000);
    } else {
      // Show error message
      showAlert(data.message || 'Failed to change password. Please try again.');
    }
    
  } catch (error) {
    console.error('Change password error:', error);
    
    // More specific error message for network issues
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      showAlert('Unable to connect to the server. Please check your internet connection.');
    } else {
      showAlert('Failed to change password. Please check your connection and try again.');
    }
  } finally {
    // Reset button state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Change Password';
    }
  }
}
// Service Form Handler (Airtime, Data, Electricity, TV) - UPDATED TO REMOVE PAYSTACK
async function handleServiceForm(e, serviceType) {
  e.preventDefault();
  
  const token = localStorage.getItem('accessToken');
  if (!token) {
    showAlert('Please login to use this service');
    return;
  }
  
  // Get form data based on service type
  let formData = {};
  
  switch (serviceType) {
    case 'airtime':
      formData = {
        network: document.getElementById('network').value,
        phone: document.getElementById('phone').value,
        amount: document.getElementById('amount').value
      };
      break;
      
    case 'data':
      formData = {
        network: document.getElementById('network').value,
        phone: document.getElementById('phone').value,
        plan: document.querySelector('input[name="plan"]:checked').value
      };
      break;
      
    case 'electricity':
      formData = {
        disco: document.getElementById('disco').value,
        meter: document.getElementById('meter').value,
        meterType: document.querySelector('input[name="meterType"]:checked').value,
        amount: document.getElementById('amount').value,
        phone: document.getElementById('phone').value,
        email: document.getElementById('email').value
      };
      break;
      
    case 'tv':
      formData = {
        provider: document.getElementById('tv').value,
        smartcard: document.getElementById('smartcard').value,
        plan: document.querySelector('input[name="plan"]:checked').value,
        phone: document.getElementById('phone').value,
        email: document.getElementById('email').value
      };
      break;
  }
  
  try {
    // Show loading state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Processing...';
    
    // API call
    const response = await fetch(`${API_BASE}/api/services/${serviceType}`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(formData)
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      // For electricity, show token if available
      if (serviceType === 'electricity' && data.data.token) {
        showAlert(`${serviceType.charAt(0).toUpperCase() + serviceType.slice(1)} payment successful! Token: ${data.data.token}`, 'success');
      } else {
        showAlert(`${serviceType.charAt(0).toUpperCase() + serviceType.slice(1)} purchase successful!`, 'success');
      }
      // Redirect to dashboard
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 2000);
    } else {
      // Show error message
      showAlert(data.message || `${serviceType.charAt(0).toUpperCase() + serviceType.slice(1)} purchase failed. Please try again.`);
    }
    
  } catch (error) {
    console.error(`${serviceType} purchase error:`, error);
    
    // More specific error message for network issues
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      showAlert('Unable to connect to the server. Please check your internet connection.');
    } else {
      showAlert(`${serviceType.charAt(0).toUpperCase() + serviceType.slice(1)} purchase failed. Please check your connection and try again.`);
    }
  } finally {
    // Reset button state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText || 'Submit';
    }
  }
}
// Password Strength Meter
function setupPasswordStrength() {
  const passwordInput = document.getElementById('password');
  const strengthFill = document.querySelector('.strength-meter-fill');
  const strengthText = document.querySelector('.strength-text');
  
  if (passwordInput && strengthFill && strengthText) {
    passwordInput.addEventListener('input', () => {
      const password = passwordInput.value;
      let strength = 0;
      
      // Check password strength
      if (password.length >= 8) strength += 25;
      if (password.match(/[a-z]+/)) strength += 25;
      if (password.match(/[A-Z]+/)) strength += 25;
      if (password.match(/[0-9]+/)) strength += 25;
      
      // Update strength meter
      strengthFill.style.width = strength + '%';
      
      // Update strength text and color
      if (strength <= 25) {
        strengthText.textContent = 'Weak';
        strengthFill.style.backgroundColor = '#ff4d4d';
      } else if (strength <= 50) {
        strengthText.textContent = 'Fair';
        strengthFill.style.backgroundColor = '#ffa64d';
      } else if (strength <= 75) {
        strengthText.textContent = 'Good';
        strengthFill.style.backgroundColor = '#ffff4d';
      } else {
        strengthText.textContent = 'Strong';
        strengthFill.style.backgroundColor = '#4dff4d';
      }
    });
  }
}
// Initialize password strength meter if on signup page
if (document.getElementById('signupForm')) {
  setupPasswordStrength();
}
// Load notifications if on dashboard
if (document.querySelector('.notification-badge')) {
  loadNotifications();
}
// Utility function to format currency
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 2
  }).format(amount);
}
// Utility function to format date
function formatDate(dateString) {
  const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return new Date(dateString).toLocaleDateString('en-NG', options);
}
// Logout function
function logout() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  window.location.href = 'index.html';
}
// Add logout event listener to logout button
const logoutBtn = document.querySelector('.logout-btn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', (e) => {
    e.preventDefault();
    logout();
  });
}
// Download statement function
async function downloadStatement() {
  const token = localStorage.getItem('accessToken');
  if (!token) {
    showAlert('Please login to download your statement');
    return;
  }
  
  try {
    const response = await fetch(`${API_BASE}/api/wallet/transactions`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.success) {
        // Create CSV content
        let csvContent = "Reference,Type,Amount,Status,Date\n";
        
        data.data.transactions.forEach(transaction => {
          csvContent += `${transaction.reference},${transaction.type},${transaction.amount},${transaction.status},${new Date(transaction.createdAt).toLocaleString()}\n`;
        });
        
        // Create download link
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `wallet-statement-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } else if (response.status === 401) {
      // Token expired, try to refresh
      const refreshSuccess = await refreshToken();
      if (refreshSuccess) {
        // Retry after refresh
        downloadStatement();
      } else {
        // If refresh fails, redirect to login
        window.location.href = 'login.html';
      }
    }
  } catch (error) {
    console.error('Error downloading statement:', error);
    
    // More specific error message for network issues
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      showAlert('Unable to connect to the server. Please check your internet connection.');
    } else {
      showAlert('Failed to download statement. Please try again.');
    }
  }
}
// Add event listener to download statement button
const downloadStatementBtn = document.querySelector('.wallet-buttons .btn.secondary');
if (downloadStatementBtn) {
  downloadStatementBtn.addEventListener('click', downloadStatement);
}
// Referral program function
function startReferring() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (user.email) {
    // In a real app, this would open a referral modal or navigate to a referral page
    showAlert(`Your referral code is: ${user.email}\nShare this code with friends to earn rewards!`, 'success');
  } else {
    showAlert('Please login to access the referral program');
  }
}
// Add event listener to referral button
const referralBtn = document.querySelector('.promo-section .btn');
if (referralBtn) {
  referralBtn.addEventListener('click', startReferring);
}