// main.js - Main JavaScript file for EasySubscribe website (UPDATED)
// API Configuration
if (typeof window.API_BASE === 'undefined') {
  const isLocalhost = window.location.hostname === 'localhost' || 
                     window.location.hostname === '127.0.0.1';
  
  window.API_BASE = isLocalhost 
    ? 'http://localhost:5001'  
    : 'https://easy-subscribe-backend.onrender.com';
}
const API_BASE = window.API_BASE;
// NEW: Global loading state and request cancellation
let loadingIndicator = null;
let activeRequests = {};
// DOM Elements
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const desktopNav = document.querySelector('.desktop-nav');
const menuToggle = document.querySelector('.menu-toggle');
const sidebar = document.querySelector('.sidebar');
// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  initializeApp();
  checkServerConnection();
  
  // Clear TV data if returning to TV form page
  if (window.location.pathname.includes('tv.html')) {
    sessionStorage.removeItem('tvData');
  }
  
  // Handle TV confirmation page
  if (window.location.pathname.includes('tvconfirm.html')) {
    setupTvConfirmationPage();
  }
  
  // Handle admin dashboard
  if (window.location.pathname.includes('admin-dashboard.html')) {
    setupAdminDashboard();
  }
  
  // Add beforeunload event listener to warn about pending TV subscription
  window.addEventListener('beforeunload', handleBeforeUnload);
});
// NEW: Handle beforeunload to warn about pending TV subscription
function handleBeforeUnload(e) {
  const tvData = JSON.parse(sessionStorage.getItem('tvData') || '{}');
  if (tvData.provider && tvData.smartcard && tvData.plan) {
    const message = 'You have a pending TV subscription. Are you sure you want to leave?';
    e.returnValue = message;
    return message;
  }
}
// Check server connection with fallback
async function checkServerConnection() {
  try {
    console.log(`Checking server connection at: ${API_BASE}/health`);
    const response = await fetch(`${API_BASE}/health`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (response.ok) {
      console.log('Server is running and accessible');
    } else {
      console.error('Server responded with status:', response.status);
      tryFallbackServer();
    }
  } catch (error) {
    console.error('Cannot connect to server:', error.message);
    tryFallbackServer();
  }
}
// Try fallback server
function tryFallbackServer() {
  const currentApiBase = API_BASE;
  const fallbackApiBase = currentApiBase.includes('localhost') 
    ? 'https://easy-subscribe-backend.onrender.com' 
    : 'http://localhost:5001';
  
  if (currentApiBase !== fallbackApiBase) {
    console.log(`Trying fallback server at: ${fallbackApiBase}/health`);
    
    fetch(`${fallbackApiBase}/health`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    })
    .then(response => {
      if (response.ok) {
        console.log('Fallback server is accessible');
        window.API_BASE = fallbackApiBase;
        showAlert('Using backup server. Some features may be limited.', 'warning');
      } else {
        console.error('Fallback server responded with status:', response.status);
        showAlert('Unable to connect to the server. Please check your internet connection.', 'error');
      }
    })
    .catch(error => {
      console.error('Cannot connect to fallback server:', error.message);
      showAlert('Unable to connect to the server. Please check your internet connection.', 'error');
    });
  } else {
    showAlert('Unable to connect to the server. Please check your internet connection.', 'error');
  }
}
// NEW: Show loading indicator
function showLoading(message = 'Loading...') {
  if (!loadingIndicator) {
    loadingIndicator = document.createElement('div');
    loadingIndicator.className = 'loading-indicator';
    loadingIndicator.innerHTML = `
      <div class="loading-spinner"></div>
      <div class="loading-message">${message}</div>
    `;
    document.body.appendChild(loadingIndicator);
  } else {
    const messageElement = loadingIndicator.querySelector('.loading-message');
    if (messageElement) {
      messageElement.textContent = message;
    }
    loadingIndicator.style.display = 'flex';
  }
}
// NEW: Hide loading indicator
function hideLoading() {
  if (loadingIndicator) {
    loadingIndicator.style.display = 'none';
  }
}
// NEW: AbortController for request cancellation
function createAbortController(key) {
  if (activeRequests[key]) {
    activeRequests[key].abort();
  }
  const controller = new AbortController();
  activeRequests[key] = controller;
  return controller;
}
// NEW: Clean up abort controller
function cleanupAbortController(key) {
  if (activeRequests[key]) {
    delete activeRequests[key];
  }
}
// Initialize app
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
  setupTvVariations();
  setupWalletFunding();
  setupSmartcardValidation();
  setupPagination(); // NEW: Setup pagination
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
    tvForm.addEventListener('submit', (e) => {
      e.preventDefault();
      handleServiceForm(e, 'tv');
    });
  }
  
  // Wallet Funding Request Form
  const fundRequestForm = document.getElementById('fundRequestForm');
  if (fundRequestForm) {
    fundRequestForm.addEventListener('submit', handleFundRequest);
  }
  
  // Admin Fund Wallet Form
  const adminFundWalletForm = document.getElementById('adminFundWalletForm');
  if (adminFundWalletForm) {
    adminFundWalletForm.addEventListener('submit', handleAdminFundWallet);
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
// Provider Selection for TV with VTU integration
function setupProviderSelection() {
  const tvProvider = document.getElementById('tv');
  if (tvProvider) {
    tvProvider.addEventListener('change', () => {
      const dstvPlans = document.getElementById('dstv-plans');
      const gotvPlans = document.getElementById('gotv-plans');
      const startimesPlans = document.getElementById('startimes-plans');
      
      if (dstvPlans) dstvPlans.style.display = 'none';
      if (gotvPlans) gotvPlans.style.display = 'none';
      if (startimesPlans) startimesPlans.style.display = 'none';
      
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
      
      loadTvVariations();
      validateSmartcardOnInput();
    });
  }
}
// Setup TV variations
function setupTvVariations() {
  const tvProvider = document.getElementById('tv');
  if (tvProvider && tvProvider.value) {
    loadTvVariations();
  }
}
// Load TV variations from API with caching
async function loadTvVariations() {
  const provider = document.getElementById('tv')?.value;
  if (!provider) return;
  
  // Check cache first
  const cacheKey = `tvVariations_${provider}`;
  const cachedData = sessionStorage.getItem(cacheKey);
  
  if (cachedData) {
    const parsedData = JSON.parse(cachedData);
    const now = new Date().getTime();
    
    // Check if cache is still valid (1 hour)
    if (now - parsedData.timestamp < 3600000) {
      console.log(`Using cached TV variations for ${provider}`);
      displayTvVariations(parsedData.data, provider);
      return;
    }
  }
  
  try {
    console.log(`Loading TV variations for provider: ${provider} from: ${API_BASE}/api/services/tv-variations?provider=${provider}`);
    
    const controller = createAbortController('tvVariations');
    const response = await fetch(`${API_BASE}/api/services/tv-variations?provider=${provider}`, {
      signal: controller.signal
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('TV variations response:', data);
    
    if (data.success) {
      // Cache the response
      sessionStorage.setItem(cacheKey, JSON.stringify({
        data: data.data,
        timestamp: new Date().getTime()
      }));
      
      displayTvVariations(data.data, provider);
    } else {
      console.error('Failed to load TV variations:', data.message);
      displayTvVariationsError(provider, data.message);
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log('TV variations request was aborted');
      return;
    }
    
    console.error('Error loading TV variations:', error);
    
    // Try fallback API if available
    const fallbackApiBase = API_BASE.includes('localhost') 
      ? 'https://easy-subscribe-backend.onrender.com' 
      : 'http://localhost:5001';
    
    if (API_BASE !== fallbackApiBase) {
      console.log(`Trying fallback API at: ${fallbackApiBase}/api/services/tv-variations?provider=${provider}`);
      
      try {
        const fallbackResponse = await fetch(`${fallbackApiBase}/api/services/tv-variations?provider=${provider}`);
        
        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json();
          console.log('Fallback TV variations response:', fallbackData);
          
          if (fallbackData.success) {
            sessionStorage.setItem(cacheKey, JSON.stringify({
              data: fallbackData.data,
              timestamp: new Date().getTime()
            }));
            
            displayTvVariations(fallbackData.data, provider);
            showAlert('Using backup server. Some features may be limited.', 'warning');
            return;
          }
        }
      } catch (fallbackError) {
        console.error('Fallback API also failed:', fallbackError);
      }
    }
    
    displayTvVariationsError(provider, 'Failed to load TV variations. Please check your connection.');
  } finally {
    cleanupAbortController('tvVariations');
  }
}
// NEW: Display TV variations
function displayTvVariations(data, provider) {
  const plansContainer = document.getElementById(`${provider}-plans`);
  if (plansContainer) {
    plansContainer.innerHTML = '';
    
    if (data.length === 0) {
      plansContainer.innerHTML = '<p>No plans available for this provider</p>';
      return;
    }
    
    data.forEach(plan => {
      const planElement = document.createElement('div');
      planElement.className = 'plan-option';
      planElement.innerHTML = `
        <input type="radio" id="plan-${plan.variation_id}" name="plan" value="${plan.variation_id}" required>
        <label for="plan-${plan.variation_id}">
          <div class="plan-name">${plan.package_bouquet}</div>
          <div class="plan-price">₦${Number(plan.price).toLocaleString()}</div>
        </label>
      `;
      plansContainer.appendChild(planElement);
    });
  }
}
// NEW: Display TV variations error
function displayTvVariationsError(provider, message) {
  const plansContainer = document.getElementById(`${provider}-plans`);
  if (plansContainer) {
    plansContainer.innerHTML = `
      <div class="error-message">
        <i class="fas fa-exclamation-circle"></i>
        <p>${message}</p>
      </div>
    `;
  }
}
// Setup Smartcard Validation
function setupSmartcardValidation() {
  const smartcardInput = document.getElementById('smartcard');
  const tvProvider = document.getElementById('tv');
  
  if (smartcardInput && tvProvider) {
    let debounceTimer;
    let isRequestInProgress = false;
    
    const handleValidation = () => {
      clearTimeout(debounceTimer);
      
      if (isRequestInProgress) {
        return;
      }
      
      debounceTimer = setTimeout(async () => {
        isRequestInProgress = true;
        try {
          validateSmartcardOnInput();
          await loadCustomerDetails();
        } finally {
          isRequestInProgress = false;
        }
      }, 800); // Increased debounce time
    };
    
    smartcardInput.addEventListener('input', handleValidation);
    smartcardInput.addEventListener('blur', handleValidation);
    
    tvProvider.addEventListener('change', () => {
      validateSmartcardOnInput();
      handleValidation();
    });
  }
}
// Validate smartcard format on input
function validateSmartcardOnInput() {
  const smartcardInput = document.getElementById('smartcard');
  const tvProvider = document.getElementById('tv');
  const smartcardError = document.getElementById('smartcard-error');
  
  if (!smartcardInput || !tvProvider) return;
  
  const smartcard = smartcardInput.value.trim();
  const provider = tvProvider.value;
  
  if (smartcardError) {
    smartcardError.textContent = '';
  }
  
  if (smartcard && provider) {
    const validation = validateSmartcardFormat(smartcard, provider);
    
    if (!validation.valid) {
      if (smartcardError) {
        smartcardError.textContent = validation.message;
      }
      
      smartcardInput.classList.add('input-error');
      smartcardInput.classList.remove('input-success');
    } else {
      if (smartcardError) {
        smartcardError.textContent = '';
      }
      
      smartcardInput.classList.add('input-success');
      smartcardInput.classList.remove('input-error');
    }
  }
}
// Validate smartcard format on blur
function validateSmartcardOnBlur() {
  const smartcardInput = document.getElementById('smartcard');
  const tvProvider = document.getElementById('tv');
  const smartcardError = document.getElementById('smartcard-error');
  
  if (!smartcardInput || !tvProvider) return;
  
  const smartcard = smartcardInput.value.trim();
  const provider = tvProvider.value;
  
  if (smartcard) {
    if (!provider) {
      if (smartcardError) {
        smartcardError.textContent = 'Please select a TV provider first';
      }
      smartcardInput.classList.add('input-error');
      smartcardInput.classList.remove('input-success');
      return;
    }
    
    const validation = validateSmartcardFormat(smartcard, provider);
    
    if (!validation.valid) {
      if (smartcardError) {
        smartcardError.textContent = validation.message;
      }
      
      smartcardInput.classList.add('input-error');
      smartcardInput.classList.remove('input-success');
    } else {
      if (smartcardError) {
        smartcardError.textContent = '';
      }
      
      smartcardInput.classList.add('input-success');
      smartcardInput.classList.remove('input-error');
    }
  }
}
// Load customer details from API with caching
async function loadCustomerDetails() {
  const smartcardInput = document.getElementById('smartcard');
  const tvProvider = document.getElementById('tv');
  const customerNameElement = document.getElementById('customerName');
  const customerPlanElement = document.getElementById('customerPlan');
  const customerDetailsElement = document.getElementById('customerDetails');
  const smartcardValidationError = document.getElementById('smartcard-error');
  const validationStatus = document.getElementById('smartcard-validation');
  
  if (!smartcardInput || !tvProvider) return;
  
  const smartcard = smartcardInput.value.trim();
  const provider = tvProvider.value;
  
  // Hide customer details initially
  if (customerDetailsElement) {
    customerDetailsElement.style.display = 'none';
  }
  
  // Hide error messages initially
  if (smartcardValidationError) {
    smartcardValidationError.style.display = 'none';
  }
  
  // Hide validation status
  if (validationStatus) {
    validationStatus.style.display = 'none';
  }
  
  if (provider && smartcard) {
    // First validate the format locally
    const validation = validateSmartcardFormat(smartcard, provider);
    
    if (!validation.valid) {
      if (smartcardValidationError) {
        smartcardValidationError.style.display = 'flex';
        smartcardValidationError.querySelector('span').textContent = validation.message;
      }
      smartcardInput.classList.add('input-error');
      smartcardInput.classList.remove('input-success');
      return;
    }
    
    // Show validation in progress
    if (validationStatus) {
      validationStatus.style.display = 'flex';
      validationStatus.className = 'validation-status loading';
      validationStatus.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Validating smartcard...</span>';
    }
    
    // Check cache first
    const cacheKey = `customerDetails_${provider}_${smartcard}`;
    const cachedData = sessionStorage.getItem(cacheKey);
    
    if (cachedData) {
      const parsedData = JSON.parse(cachedData);
      const now = new Date().getTime();
      
      // Check if cache is still valid (30 minutes)
      if (now - parsedData.timestamp < 1800000) {
        console.log(`Using cached customer details for ${smartcard}`);
        displayCustomerDetails(parsedData.data);
        if (validationStatus) {
          validationStatus.style.display = 'none';
        }
        return;
      }
    }
    
    try {
      // Clean up any existing request
      if (activeRequests.customerDetails) {
        activeRequests.customerDetails.abort();
      }
      
      const controller = new AbortController();
      activeRequests.customerDetails = controller;
      
      console.log(`Loading customer details for provider: ${provider}, smartcard: ${smartcard} from: ${API_BASE}/api/services/tv-customer`);
      
      const response = await fetch(`${API_BASE}/api/services/tv-customer?provider=${provider}&smartcard=${smartcard}`, {
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Customer details response:', data);
      
      if (data.success) {
        // Cache the response
        sessionStorage.setItem(cacheKey, JSON.stringify({
          data: data.data,
          timestamp: new Date().getTime()
        }));
        
        displayCustomerDetails(data.data);
        
        // Show success validation status
        if (validationStatus) {
          validationStatus.className = 'validation-status success';
          validationStatus.innerHTML = '<i class="fas fa-check-circle"></i><span>Smartcard validated successfully</span>';
          // Hide success message after 3 seconds
          setTimeout(() => {
            if (validationStatus) {
              validationStatus.style.display = 'none';
            }
          }, 3000);
        }
      } else {
        throw new Error(data.message || 'Failed to verify customer details');
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Customer details request was aborted');
        return;
      }
      
      console.error('Error loading customer details:', error);
      
      // Show error validation status
      if (validationStatus) {
        validationStatus.className = 'validation-status error';
        validationStatus.innerHTML = `<i class="fas fa-exclamation-circle"></i><span>${error.message || 'Failed to validate smartcard'}</span>`;
      }
      
      // Try fallback API if available
      const fallbackApiBase = API_BASE.includes('localhost') 
        ? 'https://easy-subscribe-backend.onrender.com' 
        : 'http://localhost:5001';
      
      if (API_BASE !== fallbackApiBase) {
        console.log(`Trying fallback API at: ${fallbackApiBase}/api/services/tv-customer`);
        
        try {
          const fallbackResponse = await fetch(`${fallbackApiBase}/api/services/tv-customer?provider=${provider}&smartcard=${smartcard}`, {
            signal: controller.signal
          });
          
          if (fallbackResponse.ok) {
            const fallbackData = await fallbackResponse.json();
            console.log('Fallback customer details response:', fallbackData);
            
            if (fallbackData.success) {
              sessionStorage.setItem(cacheKey, JSON.stringify({
                data: fallbackData.data,
                timestamp: new Date().getTime()
              }));
              
              displayCustomerDetails(fallbackData.data);
              
              if (validationStatus) {
                validationStatus.className = 'validation-status success';
                validationStatus.innerHTML = '<i class="fas fa-check-circle"></i><span>Smartcard validated successfully</span>';
                setTimeout(() => {
                  if (validationStatus) {
                    validationStatus.style.display = 'none';
                  }
                }, 3000);
              }
              
              showAlert('Using backup server. Some features may be limited.', 'warning');
              return;
            }
          }
        } catch (fallbackError) {
          console.error('Fallback API also failed:', fallbackError);
        }
      }
      
      // If all attempts fail, show error
      if (smartcardValidationError) {
        smartcardValidationError.style.display = 'flex';
        smartcardValidationError.querySelector('span').textContent = error.message || 'Failed to validate smartcard. Please check the number and try again.';
      }
    } finally {
      // Clean up the request controller
      delete activeRequests.customerDetails;
    }
  } else {
    if (!provider && smartcard) {
      if (smartcardValidationError) {
        smartcardValidationError.style.display = 'flex';
        smartcardValidationError.querySelector('span').textContent = 'Please select a TV provider first';
      }
    }
  }
}
// NEW: Display customer details
function displayCustomerDetails(data) {
  const customerNameElement = document.getElementById('customerName');
  const customerPlanElement = document.getElementById('customerPlan');
  const customerDetailsElement = document.getElementById('customerDetails');
  const proceedBtn = document.getElementById('proceedBtn');
  
  if (customerNameElement) {
    customerNameElement.textContent = data.customerName || data.Customer_Name || 'Not available';
  }
  if (customerPlanElement) {
    customerPlanElement.textContent = data.currentPlan || data.Current_Package || 'Not available';
  }
  
  if (customerDetailsElement) {
    customerDetailsElement.style.display = 'block';
  }
  
  // Enable the proceed button if customer details are shown
  if (proceedBtn && document.querySelector('input[name="plan"]:checked')) {
    proceedBtn.disabled = false;
  }
}
// Validate smartcard format based on provider
function validateSmartcardFormat(smartcard, provider) {
  if (!smartcard || typeof smartcard !== 'string') {
    return { valid: false, message: 'Smartcard number is required' };
  }
  
  // Remove any spaces or dashes
  const cleanCard = smartcard.replace(/[\s-]/g, '');
  
  switch (provider.toLowerCase()) {
    case 'dstv':
      // DStv smartcards can be 10-11 digits, but some might be different
      if (!/^\d{8,12}$/.test(cleanCard)) {
        return { valid: false, message: 'DStv smartcard must be 8-12 digits' };
      }
      break;
    case 'gotv':
      // GOtv smartcards are typically 10 digits
      if (!/^\d{8,11}$/.test(cleanCard)) {
        return { valid: false, message: 'GOtv smartcard must be 8-11 digits' };
      }
      break;
    case 'startimes':
      // StarTimes smartcards can vary
      if (!/^\d{8,12}$/.test(cleanCard)) {
        return { valid: false, message: 'StarTimes smartcard must be 8-12 digits' };
      }
      break;
    default:
      // Generic validation for unknown providers
      if (!/^\d{8,15}$/.test(cleanCard)) {
        return { valid: false, message: 'Invalid smartcard number format' };
      }
  }
  
  return { valid: true, message: 'Valid format' };
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
  const closeButtons = document.querySelectorAll('.close-modal');
  closeButtons.forEach(button => {
    button.addEventListener('click', () => {
      const modal = button.closest('.modal');
      if (modal) {
        modal.style.display = 'none';
      }
    });
  });
  
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
  
  const filterButtons = document.querySelectorAll('.filter-btn');
  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      filterButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      loadTransactions(button.dataset.type);
    });
  });
}
// Notifications Page Setup
function setupNotificationsPage() {
  if (!document.querySelector('.notifications-page')) return;
  
  loadNotificationsList();
  
  const markAllReadBtn = document.getElementById('markAllRead');
  if (markAllReadBtn) {
    markAllReadBtn.addEventListener('click', markAllNotificationsAsRead);
  }
}
// Wallet Funding Setup
function setupWalletFunding() {
  const fundWalletBtn = document.getElementById('fundWalletBtn');
  if (fundWalletBtn) {
    fundWalletBtn.addEventListener('click', () => {
      window.location.href = 'fund-wallet.html';
    });
  }
  
  if (document.querySelector('.fund-requests-page')) {
    loadFundRequests();
  }
  
  if (document.querySelector('.admin-fund-requests-page')) {
    loadAdminFundRequests();
    setupAdminFundRequestActions();
  }
  
  const adminFundWalletForm = document.getElementById('adminFundWalletForm');
  if (adminFundWalletForm) {
    setupUserSearch();
  }
}
// Authentication Check
function checkAuthentication() {
  const token = localStorage.getItem('accessToken');
  const user = localStorage.getItem('user');
  
  if (!token || !user) {
    // Clear any partial auth data
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    
    // Only redirect if not on an auth-related page
    if (!window.location.pathname.includes('login.html') && 
        !window.location.pathname.includes('signup.html') &&
        !window.location.pathname.includes('index.html') &&
        !window.location.pathname.includes('forgot-password.html') &&
        !window.location.pathname.includes('reset-password.html')) {
      window.location.href = 'login.html';
    }
    return;
  }
  
  // Verify user object is valid
  try {
    const parsedUser = JSON.parse(user);
    if (!parsedUser.id || !parsedUser.email) {
      throw new Error('Invalid user data');
    }
  } catch (e) {
    console.error('Invalid user data in localStorage:', e);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
  }
}
// Load User Data
function loadUserData() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
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
// Load Wallet Balance with better error handling
async function loadWalletBalance() {
  const token = localStorage.getItem('accessToken');
  if (!token) {
    // If no token, redirect to login
    window.location.href = 'login.html';
    return;
  }
  
  try {
    console.log(`Loading wallet balance from: ${API_BASE}/api/wallet/balance`);
    
    const controller = createAbortController('walletBalance');
    const response = await fetch(`${API_BASE}/api/wallet/balance`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      signal: controller.signal
    });
    
    // Handle 401 Unauthorized - try to refresh token
    if (response.status === 401) {
      console.log('Token expired, attempting refresh...');
      const refreshSuccess = await refreshToken();
      if (refreshSuccess) {
        // Retry with new token
        return loadWalletBalance();
      } else {
        // If refresh fails, redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = 'login.html';
        return;
      }
    }
    
    // Handle 403 Forbidden - token might be invalid or user lacks permissions
    if (response.status === 403) {
      console.error('Access forbidden. Token may be invalid or user lacks permissions.');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      showAlert('Your session has expired. Please login again.', 'error');
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 2000);
      return;
    }
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Wallet balance response:', data);
    
    if (data.success) {
      const balanceElements = document.querySelectorAll('.wallet-balance');
      balanceElements.forEach(element => {
        element.textContent = `₦${Number(data.data.balance).toLocaleString()}`;
      });
    } else {
      throw new Error(data.message || 'Failed to load wallet balance');
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log('Wallet balance request was aborted');
      return;
    }
    
    console.error('Error loading wallet balance:', error);
    
    const balanceElements = document.querySelectorAll('.wallet-balance');
    balanceElements.forEach(element => {
      element.textContent = '₦0.00';
    });
    
    // Show more specific error message based on the error
    let errorMessage = 'Unable to load wallet balance. Please try again later.';
    
    if (error.message.includes('Failed to fetch')) {
      errorMessage = 'Unable to connect to the server. Please check your internet connection.';
    } else if (error.message.includes('403')) {
      errorMessage = 'Access denied. Please login again.';
      // Clear invalid tokens
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 2000);
    }
    
    if (document.querySelector('.auth-page') || document.querySelector('.dashboard-page')) {
      showAlert(errorMessage, 'error');
    }
  } finally {
    cleanupAbortController('walletBalance');
  }
}
// Load Notifications
async function loadNotifications() {
  const token = localStorage.getItem('accessToken');
  if (!token) return;
  
  try {
    console.log(`Loading notifications from: ${API_BASE}/api/notifications?unreadOnly=true`);
    
    const controller = createAbortController('notifications');
    const response = await fetch(`${API_BASE}/api/notifications?unreadOnly=true`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      signal: controller.signal
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Notifications response:', data);
    
    if (data.success) {
      const notificationBadge = document.querySelector('.notification-badge');
      if (notificationBadge) {
        notificationBadge.textContent = data.data.unreadCount;
        notificationBadge.style.display = data.data.unreadCount > 0 ? 'block' : 'none';
      }
    } else if (response.status === 401) {
      const refreshSuccess = await refreshToken();
      if (refreshSuccess) {
        loadNotifications();
      } else {
        window.location.href = 'login.html';
      }
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log('Notifications request was aborted');
      return;
    }
    
    console.error('Error loading notifications:', error);
  } finally {
    cleanupAbortController('notifications');
  }
}
// Load Notifications List
async function loadNotificationsList() {
  const token = localStorage.getItem('accessToken');
  if (!token) return;
  
  const notificationsContainer = document.getElementById('notificationsList');
  if (!notificationsContainer) return;
  
  try {
    console.log(`Loading notifications list from: ${API_BASE}/api/notifications`);
    
    const controller = createAbortController('notificationsList');
    const response = await fetch(`${API_BASE}/api/notifications`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      signal: controller.signal
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Notifications list response:', data);
    
    if (data.success) {
      notificationsContainer.innerHTML = '';
      
      if (data.data.notifications.length === 0) {
        notificationsContainer.innerHTML = '<div class="no-notifications">No notifications found</div>';
        return;
      }
      
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
      
      const markReadButtons = notificationsContainer.querySelectorAll('.mark-read');
      markReadButtons.forEach(button => {
        button.addEventListener('click', () => {
          markNotificationAsRead(button.dataset.id);
        });
      });
    } else if (response.status === 401) {
      const refreshSuccess = await refreshToken();
      if (refreshSuccess) {
        loadNotificationsList();
      } else {
        window.location.href = 'login.html';
      }
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log('Notifications list request was aborted');
      return;
    }
    
    console.error('Error loading notifications list:', error);
    notificationsContainer.innerHTML = '<div class="error">Failed to load notifications</div>';
  } finally {
    cleanupAbortController('notificationsList');
  }
}
// Mark Notification as Read
async function markNotificationAsRead(notificationId) {
  const token = localStorage.getItem('accessToken');
  if (!token) return;
  
  try {
    console.log(`Marking notification as read: ${notificationId} from: ${API_BASE}/api/notifications/${notificationId}/read`);
    
    const controller = createAbortController('markNotificationRead');
    const response = await fetch(`${API_BASE}/api/notifications/${notificationId}/read`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      signal: controller.signal
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    if (response.ok) {
      loadNotificationsList();
      loadNotifications();
    } else if (response.status === 401) {
      const refreshSuccess = await refreshToken();
      if (refreshSuccess) {
        markNotificationAsRead(notificationId);
      } else {
        window.location.href = 'login.html';
      }
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log('Mark notification read request was aborted');
      return;
    }
    
    console.error('Error marking notification as read:', error);
    showAlert('Failed to mark notification as read');
  } finally {
    cleanupAbortController('markNotificationRead');
  }
}
// Mark All Notifications as Read
async function markAllNotificationsAsRead() {
  const token = localStorage.getItem('accessToken');
  if (!token) return;
  
  try {
    console.log(`Marking all notifications as read from: ${API_BASE}/api/notifications/read-all`);
    
    const controller = createAbortController('markAllNotificationsRead');
    const response = await fetch(`${API_BASE}/api/notifications/read-all`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      signal: controller.signal
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    if (response.ok) {
      loadNotificationsList();
      loadNotifications();
      showAlert('All notifications marked as read', 'success');
    } else if (response.status === 401) {
      const refreshSuccess = await refreshToken();
      if (refreshSuccess) {
        markAllNotificationsAsRead();
      } else {
        window.location.href = 'login.html';
      }
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log('Mark all notifications read request was aborted');
      return;
    }
    
    console.error('Error marking all notifications as read:', error);
    showAlert('Failed to mark notifications as read');
  } finally {
    cleanupAbortController('markAllNotificationsRead');
  }
}
// Load Transactions
async function loadTransactions(type = '', page = 1) {
  const token = localStorage.getItem('accessToken');
  if (!token) return;
  
  const transactionsContainer = document.getElementById('transactionsList');
  if (!transactionsContainer) return;
  
  try {
    let url = `${API_BASE}/api/transactions?page=${page}`;
    if (type) {
      url += `&type=${type}`;
    }
    
    console.log(`Loading transactions from: ${url}`);
    
    const controller = createAbortController('transactions');
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      signal: controller.signal
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Transactions response:', data);
    
    if (data.success) {
      transactionsContainer.innerHTML = '';
      
      if (data.data.transactions.length === 0) {
        transactionsContainer.innerHTML = '<div class="no-transactions">No transactions found</div>';
        return;
      }
      
      data.data.transactions.forEach(transaction => {
        const transactionElement = document.createElement('div');
        transactionElement.className = `transaction-item ${transaction.status}`;
        
        let transactionInfo = `
          <div class="transaction-info">
            <div class="transaction-type">${transaction.type}</div>
            <div class="transaction-reference">${transaction.reference}</div>
            <div class="transaction-date">${formatDate(transaction.createdAt)}</div>
          </div>
          <div class="transaction-amount ${transaction.type === 'funding' ? 'positive' : ''}">₦${Number(transaction.amount).toLocaleString()}</div>
          <div class="transaction-status ${transaction.status}">${transaction.status}</div>
        `;
        
        if (transaction.type === 'funding' && transaction.metadata && transaction.metadata.paymentMethod) {
          transactionInfo = `
            <div class="transaction-info">
              <div class="transaction-type">${transaction.type} (${transaction.metadata.paymentMethod})</div>
              <div class="transaction-reference">${transaction.reference}</div>
              <div class="transaction-date">${formatDate(transaction.createdAt)}</div>
            </div>
            <div class="transaction-amount positive">₦${Number(transaction.amount).toLocaleString()}</div>
            <div class="transaction-status ${transaction.status}">${transaction.status}</div>
          `;
        }
        
        transactionElement.innerHTML = transactionInfo;
        transactionsContainer.appendChild(transactionElement);
      });
      
      // Setup pagination
      setupPaginationControls('transactions', data.data.pagination, type, loadTransactions);
    } else if (response.status === 401) {
      const refreshSuccess = await refreshToken();
      if (refreshSuccess) {
        loadTransactions(type, page);
      } else {
        window.location.href = 'login.html';
      }
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log('Transactions request was aborted');
      return;
    }
    
    console.error('Error loading transactions:', error);
    transactionsContainer.innerHTML = '<div class="error">Failed to load transactions</div>';
  } finally {
    cleanupAbortController('transactions');
  }
}
// Load User Funding Requests
async function loadFundRequests(status = '', page = 1) {
  const token = localStorage.getItem('accessToken');
  if (!token) return;
  
  const fundRequestsContainer = document.getElementById('fundRequestsList');
  if (!fundRequestsContainer) return;
  
  try {
    let url = `${API_BASE}/api/user/fund-requests?page=${page}`;
    if (status) {
      url += `&status=${status}`;
    }
    
    console.log(`Loading fund requests from: ${url}`);
    
    const controller = createAbortController('fundRequests');
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      signal: controller.signal
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Fund requests response:', data);
    
    if (data.success) {
      fundRequestsContainer.innerHTML = '';
      
      if (data.data.transactions.length === 0) {
        fundRequestsContainer.innerHTML = '<div class="no-fund-requests">No funding requests found</div>';
        return;
      }
      
      data.data.transactions.forEach(transaction => {
        const requestElement = document.createElement('div');
        requestElement.className = `fund-request-item ${transaction.status}`;
        requestElement.innerHTML = `
          <div class="fund-request-info">
            <div class="fund-request-amount">₦${Number(transaction.amount).toLocaleString()}</div>
            <div class="fund-request-method">${transaction.metadata.paymentMethod}</div>
            <div class="fund-request-reference">${transaction.reference}</div>
            <div class="fund-request-date">${formatDate(transaction.createdAt)}</div>
          </div>
          <div class="fund-request-status ${transaction.status}">${transaction.status}</div>
        `;
        
        fundRequestsContainer.appendChild(requestElement);
      });
      
      // Setup pagination
      setupPaginationControls('fundRequests', data.data.pagination, status, loadFundRequests);
    } else if (response.status === 401) {
      const refreshSuccess = await refreshToken();
      if (refreshSuccess) {
        loadFundRequests(status, page);
      } else {
        window.location.href = 'login.html';
      }
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log('Fund requests request was aborted');
      return;
    }
    
    console.error('Error loading fund requests:', error);
    fundRequestsContainer.innerHTML = '<div class="error">Failed to load funding requests</div>';
  } finally {
    cleanupAbortController('fundRequests');
  }
}
// Load Admin Funding Requests
async function loadAdminFundRequests(status = '', page = 1) {
  const token = localStorage.getItem('accessToken');
  if (!token) return;
  
  const adminFundRequestsContainer = document.getElementById('adminFundRequestsList');
  if (!adminFundRequestsContainer) return;
  
  try {
    let url = `${API_BASE}/api/admin/fund-requests?page=${page}`;
    if (status) {
      url += `&status=${status}`;
    }
    
    console.log(`Loading admin fund requests from: ${url}`);
    
    const controller = createAbortController('adminFundRequests');
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      signal: controller.signal
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Admin fund requests response:', data);
    
    if (data.success) {
      adminFundRequestsContainer.innerHTML = '';
      
      if (data.data.transactions.length === 0) {
        adminFundRequestsContainer.innerHTML = '<div class="no-fund-requests">No funding requests found</div>';
        return;
      }
      
      data.data.transactions.forEach(transaction => {
        const requestElement = document.createElement('div');
        requestElement.className = `admin-fund-request-item ${transaction.status}`;
        
        const userName = transaction.userId ? transaction.userId.name : 'Unknown';
        const userEmail = transaction.userId ? transaction.userId.email : 'Unknown';
        
        requestElement.innerHTML = `
          <div class="admin-fund-request-info">
            <div class="admin-fund-request-user">${userName} (${userEmail})</div>
            <div class="admin-fund-request-amount">₦${Number(transaction.amount).toLocaleString()}</div>
            <div class="admin-fund-request-method">${transaction.metadata.paymentMethod}</div>
            <div class="admin-fund-request-reference">${transaction.reference}</div>
            <div class="admin-fund-request-date">${formatDate(transaction.createdAt)}</div>
          </div>
          <div class="admin-fund-request-actions">
            <div class="admin-fund-request-status ${transaction.status}">${transaction.status}</div>
            ${transaction.status === 'pending' ? `
              <button class="btn btn-sm approve-btn" data-id="${transaction._id}">Approve</button>
              <button class="btn btn-sm reject-btn" data-id="${transaction._id}">Reject</button>
            ` : ''}
          </div>
        `;
        
        adminFundRequestsContainer.appendChild(requestElement);
      });
      
      const approveButtons = adminFundRequestsContainer.querySelectorAll('.approve-btn');
      approveButtons.forEach(button => {
        button.addEventListener('click', () => {
          approveFundRequest(button.dataset.id);
        });
      });
      
      const rejectButtons = adminFundRequestsContainer.querySelectorAll('.reject-btn');
      rejectButtons.forEach(button => {
        button.addEventListener('click', () => {
          rejectFundRequest(button.dataset.id);
        });
      });
      
      // Setup pagination
      setupPaginationControls('adminFundRequests', data.data.pagination, status, loadAdminFundRequests);
    } else if (response.status === 401) {
      const refreshSuccess = await refreshToken();
      if (refreshSuccess) {
        loadAdminFundRequests(status, page);
      } else {
        window.location.href = 'login.html';
      }
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log('Admin fund requests request was aborted');
      return;
    }
    
    console.error('Error loading admin fund requests:', error);
    adminFundRequestsContainer.innerHTML = '<div class="error">Failed to load funding requests</div>';
  } finally {
    cleanupAbortController('adminFundRequests');
  }
}
// Setup Admin Fund Request Actions
function setupAdminFundRequestActions() {
  const filterButtons = document.querySelectorAll('.admin-filter-btn');
  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      filterButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      loadAdminFundRequests(button.dataset.status);
    });
  });
}
// Setup User Search for Admin Fund Wallet
function setupUserSearch() {
  const userSearch = document.getElementById('userSearch');
  if (userSearch) {
    let debounceTimeout;
    
    userSearch.addEventListener('input', (e) => {
      clearTimeout(debounceTimeout);
      
      debounceTimeout = setTimeout(() => {
        const searchTerm = e.target.value.trim();
        if (searchTerm.length >= 3) {
          searchUsers(searchTerm);
        } else {
          const searchResults = document.getElementById('userSearchResults');
          if (searchResults) {
            searchResults.innerHTML = '';
            searchResults.style.display = 'none';
          }
        }
      }, 300);
    });
  }
}
// Search Users for Admin Fund Wallet
async function searchUsers(searchTerm) {
  const token = localStorage.getItem('accessToken');
  if (!token) return;
  
  const searchResults = document.getElementById('userSearchResults');
  if (!searchResults) return;
  
  try {
    console.log(`Searching users from: ${API_BASE}/api/admin/users?search=${searchTerm}`);
    
    const controller = createAbortController('searchUsers');
    const response = await fetch(`${API_BASE}/api/admin/users?search=${searchTerm}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      signal: controller.signal
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Search users response:', data);
    
    if (data.success) {
      searchResults.innerHTML = '';
      
      if (data.data.users.length === 0) {
        searchResults.innerHTML = '<div class="no-users">No users found</div>';
      } else {
        data.data.users.forEach(user => {
          const userElement = document.createElement('div');
          userElement.className = 'user-search-result';
          userElement.innerHTML = `
            <div class="user-info">
              <div class="user-name">${user.name}</div>
              <div class="user-email">${user.email}</div>
              <div class="user-balance">Balance: ₦${Number(user.walletBalance).toLocaleString()}</div>
            </div>
            <button class="btn btn-sm select-user" data-id="${user._id}">Select</button>
          `;
          
          searchResults.appendChild(userElement);
        });
        
        const selectButtons = searchResults.querySelectorAll('.select-user');
        selectButtons.forEach(button => {
          button.addEventListener('click', () => {
            selectUserForFunding(button.dataset.id);
          });
        });
      }
      
      searchResults.style.display = 'block';
    } else if (response.status === 401) {
      const refreshSuccess = await refreshToken();
      if (refreshSuccess) {
        searchUsers(searchTerm);
      } else {
        window.location.href = 'login.html';
      }
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log('Search users request was aborted');
      return;
    }
    
    console.error('Error searching users:', error);
    searchResults.innerHTML = '<div class="error">Failed to search users</div>';
    searchResults.style.display = 'block';
  } finally {
    cleanupAbortController('searchUsers');
  }
}
// Select User for Funding
function selectUserForFunding(userId) {
  const userIdInput = document.getElementById('userId');
  const selectedUserInfo = document.getElementById('selectedUserInfo');
  const userSearchResults = document.getElementById('userSearchResults');
  
  if (userIdInput) {
    userIdInput.value = userId;
  }
  
  if (userSearchResults) {
    userSearchResults.style.display = 'none';
  }
  
  if (selectedUserInfo) {
    selectedUserInfo.innerHTML = '<div class="loading">Loading user information...</div>';
    selectedUserInfo.style.display = 'block';
    
    fetchUserDetails(userId);
  }
}
// Fetch User Details
async function fetchUserDetails(userId) {
  const token = localStorage.getItem('accessToken');
  if (!token) return;
  
  const selectedUserInfo = document.getElementById('selectedUserInfo');
  if (!selectedUserInfo) return;
  
  try {
    console.log(`Fetching user details from: ${API_BASE}/api/user/profile`);
    
    const controller = createAbortController('fetchUserDetails');
    const response = await fetch(`${API_BASE}/api/user/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      signal: controller.signal
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('User details response:', data);
    
    if (data.success) {
      const user = data.data.user;
      selectedUserInfo.innerHTML = `
        <div class="selected-user-info">
          <div class="user-name">${user.name}</div>
          <div class="user-email">${user.email}</div>
          <div class="user-balance">Current Balance: ₦${Number(user.walletBalance).toLocaleString()}</div>
        </div>
      `;
    } else if (response.status === 401) {
      const refreshSuccess = await refreshToken();
      if (refreshSuccess) {
        fetchUserDetails(userId);
      } else {
        window.location.href = 'login.html';
      }
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log('Fetch user details request was aborted');
      return;
    }
    
    console.error('Error fetching user details:', error);
    selectedUserInfo.innerHTML = '<div class="error">Failed to load user information</div>';
  } finally {
    cleanupAbortController('fetchUserDetails');
  }
}
// Handle Fund Request
async function handleFundRequest(e) {
  e.preventDefault();
  
  const token = localStorage.getItem('accessToken');
  if (!token) {
    showAlert('Please login to request funding');
    return;
  }
  
  const amount = document.getElementById('amount').value;
  const paymentMethod = document.getElementById('paymentMethod').value;
  const reference = document.getElementById('reference').value;
  
  try {
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';
    
    showLoading('Submitting funding request...');
    
    console.log(`Submitting fund request to: ${API_BASE}/api/user/fund-request`);
    
    const controller = createAbortController('fundRequest');
    const response = await fetch(`${API_BASE}/api/user/fund-request`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ amount, paymentMethod, reference }),
      signal: controller.signal
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Fund request response:', data);
    
    if (response.ok && data.success) {
      showAlert('Funding request submitted successfully!', 'success');
      e.target.reset();
      loadFundRequests();
    } else {
      showAlert(data.message || 'Failed to submit funding request. Please try again.');
    }
    
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log('Fund request was aborted');
      return;
    }
    
    console.error('Fund request error:', error);
    
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      showAlert('Unable to connect to the server. Please check your internet connection.');
    } else {
      showAlert('Failed to submit funding request. Please check your connection and try again.');
    }
  } finally {
    hideLoading();
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText || 'Submit Request';
    }
    
    cleanupAbortController('fundRequest');
  }
}
// Handle Admin Fund Wallet
async function handleAdminFundWallet(e) {
  e.preventDefault();
  
  const token = localStorage.getItem('accessToken');
  if (!token) {
    showAlert('Please login to fund wallet');
    return;
  }
  
  const userId = document.getElementById('userId').value;
  const amount = document.getElementById('amount').value;
  const note = document.getElementById('note').value;
  
  try {
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Processing...';
    
    showLoading('Funding wallet...');
    
    console.log(`Admin funding wallet to: ${API_BASE}/api/admin/fund-wallet`);
    
    const controller = createAbortController('adminFundWallet');
    const response = await fetch(`${API_BASE}/api/admin/fund-wallet`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ userId, amount, note }),
      signal: controller.signal
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Admin fund wallet response:', data);
    
    if (response.ok && data.success) {
      showAlert('Wallet funded successfully!', 'success');
      e.target.reset();
      document.getElementById('selectedUserInfo').style.display = 'none';
      loadAdminFundRequests();
    } else {
      showAlert(data.message || 'Failed to fund wallet. Please try again.');
    }
    
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log('Admin fund wallet was aborted');
      return;
    }
    
    console.error('Admin fund wallet error:', error);
    
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      showAlert('Unable to connect to the server. Please check your internet connection.');
    } else {
      showAlert('Failed to fund wallet. Please check your connection and try again.');
    }
  } finally {
    hideLoading();
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText || 'Fund Wallet';
    }
    
    cleanupAbortController('adminFundWallet');
  }
}
// Approve Fund Request
async function approveFundRequest(requestId) {
  const token = localStorage.getItem('accessToken');
  if (!token) {
    showAlert('Please login to approve funding requests');
    return;
  }
  
  try {
    const note = prompt('Enter a note for this approval (optional):');
    
    showLoading('Approving funding request...');
    
    console.log(`Approving fund request: ${requestId} from: ${API_BASE}/api/admin/fund-request/${requestId}/approve`);
    
    const controller = createAbortController('approveFundRequest');
    const response = await fetch(`${API_BASE}/api/admin/fund-request/${requestId}/approve`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ note: note || '' }),
      signal: controller.signal
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Approve fund request response:', data);
    
    if (response.ok && data.success) {
      showAlert('Funding request approved successfully!', 'success');
      loadAdminFundRequests();
    } else {
      showAlert(data.message || 'Failed to approve funding request. Please try again.');
    }
    
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log('Approve fund request was aborted');
      return;
    }
    
    console.error('Approve fund request error:', error);
    
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      showAlert('Unable to connect to the server. Please check your internet connection.');
    } else {
      showAlert('Failed to approve funding request. Please check your connection and try again.');
    }
  } finally {
    hideLoading();
    cleanupAbortController('approveFundRequest');
  }
}
// Reject Fund Request
async function rejectFundRequest(requestId) {
  const token = localStorage.getItem('accessToken');
  if (!token) {
    showAlert('Please login to reject funding requests');
    return;
  }
  
  try {
    const reason = prompt('Enter a reason for rejection:');
    if (!reason) {
      showAlert('Reason is required to reject a funding request');
      return;
    }
    
    showLoading('Rejecting funding request...');
    
    console.log(`Rejecting fund request: ${requestId} from: ${API_BASE}/api/admin/fund-request/${requestId}/reject`);
    
    const controller = createAbortController('rejectFundRequest');
    const response = await fetch(`${API_BASE}/api/admin/fund-request/${requestId}/reject`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ reason }),
      signal: controller.signal
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Reject fund request response:', data);
    
    if (response.ok && data.success) {
      showAlert('Funding request rejected successfully!', 'success');
      loadAdminFundRequests();
    } else {
      showAlert(data.message || 'Failed to reject funding request. Please try again.');
    }
    
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log('Reject fund request was aborted');
      return;
    }
    
    console.error('Reject fund request error:', error);
    
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      showAlert('Unable to connect to the server. Please check your internet connection.');
    } else {
      showAlert('Failed to reject funding request. Please check your connection and try again.');
    }
  } finally {
    hideLoading();
    cleanupAbortController('rejectFundRequest');
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
    console.log(`Refreshing token from: ${API_BASE}/api/auth/refresh-token`);
    
    const controller = createAbortController('refreshToken');
    const response = await fetch(`${API_BASE}/api/auth/refresh-token`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ refreshToken }),
      signal: controller.signal
    });
    
    // Handle 403 Forbidden
    if (response.status === 403) {
      console.error('Refresh token forbidden. User may need to login again.');
      logout();
      return false;
    }
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Refresh token response:', data);
    
    if (data.success) {
      localStorage.setItem('accessToken', data.data.accessToken);
      return true;
    } else {
      logout();
      return false;
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log('Refresh token request was aborted');
      return false;
    }
    
    console.error('Error refreshing token:', error);
    logout();
    return false;
  } finally {
    cleanupAbortController('refreshToken');
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
  
  const closeBtn = alertContainer.querySelector('.close-alert');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      alertContainer.innerHTML = '';
    });
  }
  
  setTimeout(() => {
    alertContainer.innerHTML = '';
  }, 5000);
}
// Validate Signup Form
function validateSignupForm() {
  let isValid = true;
  
  document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
  
  const name = document.getElementById('name').value.trim();
  if (!name) {
    document.getElementById('name-error').textContent = 'Name is required';
    isValid = false;
  }
  
  const email = document.getElementById('email').value.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) {
    document.getElementById('email-error').textContent = 'Email is required';
    isValid = false;
  } else if (!emailRegex.test(email)) {
    document.getElementById('email-error').textContent = 'Please enter a valid email';
    isValid = false;
  }
  
  const phone = document.getElementById('phone').value.trim();
  const phoneRegex = /^(0|234)(7|8|9)[01]\d{8}$/;
  if (!phone) {
    document.getElementById('phone-error').textContent = 'Phone number is required';
    isValid = false;
  } else if (!phoneRegex.test(phone)) {
    document.getElementById('phone-error').textContent = 'Please enter a valid Nigerian phone number';
    isValid = false;
  }
  
  const password = document.getElementById('password').value;
  if (!password) {
    document.getElementById('password-error').textContent = 'Password is required';
    isValid = false;
  } else if (password.length < 8) {
    document.getElementById('password-error').textContent = 'Password must be at least 8 characters';
    isValid = false;
  }
  
  const confirmPassword = document.getElementById('confirmPassword').value;
  if (!confirmPassword) {
    document.getElementById('confirmPassword-error').textContent = 'Please confirm your password';
    isValid = false;
  } else if (password !== confirmPassword) {
    document.getElementById('confirmPassword-error').textContent = 'Passwords do not match';
    isValid = false;
  }
  
  const terms = document.getElementById('terms').checked;
  if (!terms) {
    document.getElementById('terms-error').textContent = 'You must accept the terms and conditions';
    isValid = false;
  }
  
  return isValid;
}
// Signup Handler
async function handleSignup(e) {
  e.preventDefault();
  
  if (!validateSignupForm()) {
    return;
  }
  
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const phone = document.getElementById('phone').value;
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  const termsAccepted = document.getElementById('terms')?.checked || false;
  
  if (password !== confirmPassword) {
    showAlert('Passwords do not match!');
    return;
  }
  
  if (!termsAccepted) {
    showAlert('You must accept the terms and conditions!');
    return;
  }
  
  try {
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating Account...';
    
    showLoading('Creating account...');
    
    console.log(`Signing up from: ${API_BASE}/api/auth/register`);
    
    const controller = createAbortController('signup');
    const response = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, phone }),
      signal: controller.signal
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Signup response:', data);
    
    if (response.ok && data.success) {
      localStorage.setItem('accessToken', data.data.accessToken);
      localStorage.setItem('refreshToken', data.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.data.user));
      
      showAlert('Account created successfully! Redirecting to dashboard...', 'success');
      
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 2000);
    } else {
      showAlert(data.message || 'Signup failed. Please try again.');
    }
    
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log('Signup request was aborted');
      return;
    }
    
    console.error('Signup error:', error);
    
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      showAlert('Unable to connect to the server. Please check your internet connection.');
    } else {
      showAlert('Signup failed. Please check your connection and try again.');
    }
  } finally {
    hideLoading();
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Create Account';
    }
    
    cleanupAbortController('signup');
  }
}
// Validate Login Form
function validateLoginForm() {
  let isValid = true;
  
  document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
  
  const email = document.getElementById('email').value.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) {
    document.getElementById('email-error').textContent = 'Email is required';
    isValid = false;
  } else if (!emailRegex.test(email)) {
    document.getElementById('email-error').textContent = 'Please enter a valid email';
    isValid = false;
  }
  
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
  
  if (!validateLoginForm()) {
    return;
  }
  
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  
  try {
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Logging in...';
    
    showLoading('Logging in...');
    
    console.log(`Logging in from: ${API_BASE}/api/auth/login`);
    
    const controller = createAbortController('login');
    const response = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      signal: controller.signal
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Login response:', data);
    
    if (response.ok && data.success) {
      localStorage.setItem('accessToken', data.data.accessToken);
      localStorage.setItem('refreshToken', data.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.data.user));
      
      const rememberMe = document.getElementById('remember').checked;
      if (rememberMe) {
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 30);
        document.cookie = `refreshToken=${data.data.refreshToken}; expires=${expiryDate.toUTCString()}; path=/`;
      }
      
      showAlert('Login successful! Redirecting to dashboard...', 'success');
      
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 2000);
    } else {
      showAlert(data.message || 'Login failed. Please check your credentials and try again.');
    }
    
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log('Login request was aborted');
      return;
    }
    
    console.error('Login error:', error);
    
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      showAlert('Unable to connect to the server. Please check your internet connection.');
    } else {
      showAlert('Login failed. Please check your connection and try again.');
    }
  } finally {
    hideLoading();
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Login';
    }
    
    cleanupAbortController('login');
  }
}
// Forgot Password Handler
async function handleForgotPassword(e) {
  e.preventDefault();
  
  const email = document.getElementById('email').value;
  
  try {
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';
    
    showLoading('Sending reset link...');
    
    console.log(`Forgot password from: ${API_BASE}/api/auth/forgot-password`);
    
    const controller = createAbortController('forgotPassword');
    const response = await fetch(`${API_BASE}/api/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
      signal: controller.signal
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Forgot password response:', data);
    
    if (response.ok) {
      showAlert(data.message, 'success');
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 2000);
    } else {
      showAlert(data.message || 'Failed to process request. Please try again.');
    }
    
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log('Forgot password request was aborted');
      return;
    }
    
    console.error('Forgot password error:', error);
    
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      showAlert('Unable to connect to the server. Please check your internet connection.');
    } else {
      showAlert('Failed to process request. Please check your connection and try again.');
    }
  } finally {
    hideLoading();
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Reset Password';
    }
    
    cleanupAbortController('forgotPassword');
  }
}
// Reset Password Handler
async function handleResetPassword(e) {
  e.preventDefault();
  
  const token = new URLSearchParams(window.location.search).get('token');
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  
  if (password !== confirmPassword) {
    showAlert('Passwords do not match!');
    return;
  }
  
  try {
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Resetting...';
    
    showLoading('Resetting password...');
    
    console.log(`Reset password from: ${API_BASE}/api/auth/reset-password`);
    
    const controller = createAbortController('resetPassword');
    const response = await fetch(`${API_BASE}/api/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password }),
      signal: controller.signal
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Reset password response:', data);
    
    if (response.ok) {
      showAlert(data.message, 'success');
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 2000);
    } else {
      showAlert(data.message || 'Failed to reset password. Please try again.');
    }
    
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log('Reset password request was aborted');
      return;
    }
    
    console.error('Reset password error:', error);
    
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      showAlert('Unable to connect to the server. Please check your internet connection.');
    } else {
      showAlert('Failed to reset password. Please check your connection and try again.');
    }
  } finally {
    hideLoading();
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Reset Password';
    }
    
    cleanupAbortController('resetPassword');
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
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Updating...';
    
    showLoading('Updating profile...');
    
    console.log(`Updating profile from: ${API_BASE}/api/user/profile`);
    
    const controller = createAbortController('updateProfile');
    const response = await fetch(`${API_BASE}/api/user/profile`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ name, phone }),
      signal: controller.signal
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Update profile response:', data);
    
    if (response.ok && data.success) {
      localStorage.setItem('user', JSON.stringify(data.data.user));
      
      showAlert(data.message, 'success');
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 2000);
    } else {
      showAlert(data.message || 'Failed to update profile. Please try again.');
    }
    
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log('Update profile request was aborted');
      return;
    }
    
    console.error('Update profile error:', error);
    
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      showAlert('Unable to connect to the server. Please check your internet connection.');
    } else {
      showAlert('Failed to update profile. Please check your connection and try again.');
    }
  } finally {
    hideLoading();
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Update Profile';
    }
    
    cleanupAbortController('updateProfile');
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
  
  if (newPassword !== confirmPassword) {
    showAlert('New passwords do not match!');
    return;
  }
  
  try {
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Changing...';
    
    showLoading('Changing password...');
    
    console.log(`Changing password from: ${API_BASE}/api/user/change-password`);
    
    const controller = createAbortController('changePassword');
    const response = await fetch(`${API_BASE}/api/user/change-password`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ currentPassword, newPassword }),
      signal: controller.signal
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Change password response:', data);
    
    if (response.ok && data.success) {
      showAlert(data.message, 'success');
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 2000);
    } else {
      showAlert(data.message || 'Failed to change password. Please try again.');
    }
    
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log('Change password request was aborted');
      return;
    }
    
    console.error('Change password error:', error);
    
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      showAlert('Unable to connect to the server. Please check your internet connection.');
    } else {
      showAlert('Failed to change password. Please check your connection and try again.');
    }
  } finally {
    hideLoading();
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Change Password';
    }
    
    cleanupAbortController('changePassword');
  }
}
// Service Form Handler
async function handleServiceForm(e, serviceType) {
  e.preventDefault();
  
  const token = localStorage.getItem('accessToken');
  if (!token) {
    showAlert('Please login to use this service');
    return;
  }
  
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
      const smartcardInput = document.getElementById('smartcard');
      const tvProvider = document.getElementById('tv');
      const smartcardError = document.getElementById('smartcard-error');
      
      if (!smartcardInput || !tvProvider) {
        showAlert('Missing required fields for TV subscription', 'error');
        return;
      }
      
      const smartcard = smartcardInput.value.trim();
      const provider = tvProvider.value;
      
      if (!smartcard) {
        if (smartcardError) {
          smartcardError.style.display = 'flex';
          smartcardError.querySelector('span').textContent = 'Smartcard number is required';
        }
        showAlert('Please enter a smartcard number', 'error');
        return;
      }
      
      if (!provider) {
        if (smartcardError) {
          smartcardError.style.display = 'flex';
          smartcardError.querySelector('span').textContent = 'Please select a TV provider';
        }
        showAlert('Please select a TV provider', 'error');
        return;
      }
      
      // Validate smartcard format
      const validation = validateSmartcardFormat(smartcard, provider);
      if (!validation.valid) {
        if (smartcardError) {
          smartcardError.style.display = 'flex';
          smartcardError.querySelector('span').textContent = validation.message;
        }
        showAlert(validation.message, 'error');
        return;
      }
      
      // Check if customer details are available
      const customerDetailsElement = document.getElementById('customerDetails');
      if (customerDetailsElement && customerDetailsElement.style.display === 'none') {
        showAlert('Please validate your smartcard first', 'error');
        return;
      }
      
      const plan = document.querySelector('input[name="plan"]:checked')?.value;
      if (!plan) {
        showAlert('Please select a subscription plan', 'error');
        return;
      }
      
      const phone = document.getElementById('phone').value.trim();
      const email = document.getElementById('email').value.trim();
      
      if (!phone) {
        showAlert('Phone number is required', 'error');
        return;
      }
      
      if (!email) {
        showAlert('Email address is required', 'error');
        return;
      }
      
      const paymentMethod = document.querySelector('input[name="payment"]:checked')?.value || 'wallet';
      
      const tvData = {
        provider,
        smartcard,
        plan,
        phone,
        email,
        paymentMethod
      };
      
      sessionStorage.setItem('tvData', JSON.stringify(tvData));
      
      window.location.href = 'tvconfirm.html';
      return;
  }
  
  try {
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Processing...';
    
    showLoading(`Processing ${serviceType}...`);
    
    console.log(`Processing ${serviceType} service from: ${API_BASE}/api/services/${serviceType}`);
    
    const controller = createAbortController(serviceType);
    const response = await fetch(`${API_BASE}/api/services/${serviceType}`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(formData),
      signal: controller.signal
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`${serviceType} service response:`, data);
    
    if (response.ok && data.success) {
      if (serviceType === 'electricity' && data.data.token) {
        showAlert(`${serviceType.charAt(0).toUpperCase() + serviceType.slice(1)} payment successful! Token: ${data.data.token}`, 'success');
      } else {
        showAlert(`${serviceType.charAt(0).toUpperCase() + serviceType.slice(1)} purchase successful!`, 'success');
      }
      
      if (data.data.reference) {
        sessionStorage.setItem('tvTransactionRef', data.data.reference);
      }
      
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 2000);
    } else {
      showAlert(data.message || `${serviceType.charAt(0).toUpperCase() + serviceType.slice(1)} purchase failed. Please try again.`);
    }
    
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log(`${serviceType} request was aborted`);
      return;
    }
    
    console.error(`${serviceType} purchase error:`, error);
    
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      showAlert('Unable to connect to the server. Please check your internet connection.');
    } else {
      showAlert(`${serviceType.charAt(0).toUpperCase() + serviceType.slice(1)} purchase failed. Please check your connection and try again.`);
    }
  } finally {
    hideLoading();
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText || 'Submit';
    }
    
    cleanupAbortController(serviceType);
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
      
      if (password.length >= 8) strength += 25;
      if (password.match(/[a-z]+/)) strength += 25;
      if (password.match(/[A-Z]+/)) strength += 25;
      if (password.match(/[0-9]+/)) strength += 25;
      
      strengthFill.style.width = strength + '%';
      
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
if (document.getElementById('signupForm')) {
  setupPasswordStrength();
}
if (document.querySelector('.notification-badge')) {
  loadNotifications();
}
// Utility functions
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 2
  }).format(amount);
}
function formatDate(dateString) {
  const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return new Date(dateString).toLocaleDateString('en-NG', options);
}
function logout() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  window.location.href = 'index.html';
}
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
    console.log(`Downloading statement from: ${API_BASE}/api/wallet/transactions`);
    
    const controller = createAbortController('downloadStatement');
    const response = await fetch(`${API_BASE}/api/wallet/transactions`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      signal: controller.signal
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Download statement response:', data);
    
    if (data.success) {
      let csvContent = "Reference,Type,Amount,Status,Date\n";
      
      data.data.transactions.forEach(transaction => {
        csvContent += `${transaction.reference},${transaction.type},${transaction.amount},${transaction.status},${new Date(transaction.createdAt).toLocaleString()}\n`;
      });
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `wallet-statement-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (response.status === 401) {
      const refreshSuccess = await refreshToken();
      if (refreshSuccess) {
        downloadStatement();
      } else {
        window.location.href = 'login.html';
      }
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log('Download statement request was aborted');
      return;
    }
    
    console.error('Error downloading statement:', error);
    
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      showAlert('Unable to connect to the server. Please check your internet connection.');
    } else {
      showAlert('Failed to download statement. Please try again.');
    }
  } finally {
    cleanupAbortController('downloadStatement');
  }
}
const downloadStatementBtn = document.querySelector('.wallet-buttons .btn.secondary');
if (downloadStatementBtn) {
  downloadStatementBtn.addEventListener('click', downloadStatement);
}
// Referral program function
function startReferring() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (user.email) {
    showAlert(`Your referral code is: ${user.email}\nShare this code with friends to earn rewards!`, 'success');
  } else {
    showAlert('Please login to access the referral program');
  }
}
const referralBtn = document.querySelector('.promo-section .btn');
if (referralBtn) {
  referralBtn.addEventListener('click', startReferring);
}
// Setup TV Confirmation Page
function setupTvConfirmationPage() {
  const tvData = JSON.parse(sessionStorage.getItem('tvData') || '{}');
  
  if (!tvData.provider || !tvData.smartcard || !tvData.plan) {
    showAlert('Invalid TV subscription data. Please start over.', 'error');
    setTimeout(() => {
      window.location.href = 'tv.html';
    }, 2000);
    return;
  }
  
  const providerElement = document.getElementById('confirmProvider');
  const smartcardElement = document.getElementById('confirmSmartcard');
  const planElement = document.getElementById('confirmPlan');
  const amountElement = document.getElementById('confirmAmount');
  const phoneElement = document.getElementById('confirmPhone');
  const emailElement = document.getElementById('confirmEmail');
  const paymentMethodElement = document.getElementById('confirmPaymentMethod');
  
  if (providerElement) providerElement.textContent = tvData.provider;
  if (smartcardElement) smartcardElement.textContent = tvData.smartcard;
  if (planElement) planElement.textContent = tvData.plan;
  if (phoneElement) phoneElement.textContent = tvData.phone;
  if (emailElement) emailElement.textContent = tvData.email;
  if (paymentMethodElement) paymentMethodElement.textContent = tvData.paymentMethod;
  
  const planOptions = document.querySelectorAll(`#${tvData.provider}-plans .plan-option input`);
  let planPrice = 0;
  let planName = '';
  
  planOptions.forEach(option => {
    if (option.value === tvData.plan) {
      const planLabel = option.nextElementSibling;
      planName = planLabel.querySelector('.plan-name').textContent;
      planPrice = parseFloat(planLabel.querySelector('.plan-price').textContent.replace('₦', '').replace(',', ''));
    }
  });
  
  if (amountElement) amountElement.textContent = `₦${planPrice.toLocaleString()}`;
  
  const confirmBtn = document.getElementById('confirmTvSubscription');
  if (confirmBtn) {
    confirmBtn.addEventListener('click', () => {
      confirmTvSubscription(tvData, planPrice);
    });
  }
  
  const cancelBtn = document.getElementById('cancelTvSubscription');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      sessionStorage.removeItem('tvData');
      window.location.href = 'tv.html';
    });
  }
}
// Confirm TV Subscription
async function confirmTvSubscription(tvData, amount) {
  const token = localStorage.getItem('accessToken');
  if (!token) {
    showAlert('Please login to confirm your subscription', 'error');
    return;
  }
  
  try {
    const confirmBtn = document.getElementById('confirmTvSubscription');
    const originalText = confirmBtn.textContent;
    confirmBtn.disabled = true;
    confirmBtn.textContent = 'Processing...';
    
    showLoading('Confirming subscription...');
    
    console.log(`Confirming TV subscription to: ${API_BASE}/api/services/tv`);
    
    const controller = createAbortController('confirmTvSubscription');
    const response = await fetch(`${API_BASE}/api/services/tv`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        provider: tvData.provider,
        smartcard: tvData.smartcard,
        plan: tvData.plan,
        phone: tvData.phone,
        email: tvData.email
      }),
      signal: controller.signal
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('TV subscription response:', data);
    
    if (response.ok && data.success) {
      sessionStorage.removeItem('tvData');
      
      if (data.data.reference) {
        sessionStorage.setItem('tvTransactionRef', data.data.reference);
      }
      
      showAlert('TV subscription successful!', 'success');
      
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 2000);
    } else {
      showAlert(data.message || 'TV subscription failed. Please try again.', 'error');
    }
    
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log('TV subscription confirmation was aborted');
      return;
    }
    
    console.error('TV subscription error:', error);
    
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      showAlert('Unable to connect to the server. Please check your internet connection.', 'error');
    } else {
      showAlert('TV subscription failed. Please check your connection and try again.', 'error');
    }
  } finally {
    hideLoading();
    
    const confirmBtn = document.getElementById('confirmTvSubscription');
    if (confirmBtn) {
      confirmBtn.disabled = false;
      confirmBtn.textContent = originalText || 'Confirm Subscription';
    }
    
    cleanupAbortController('confirmTvSubscription');
  }
}
// Setup Admin Dashboard
function setupAdminDashboard() {
  loadAdminStats();
  
  const adminNavItems = document.querySelectorAll('.admin-nav-item');
  adminNavItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const page = item.dataset.page;
      if (page) {
        window.location.href = `${page}.html`;
      }
    });
  });
}
// Load Admin Stats
async function loadAdminStats() {
  const token = localStorage.getItem('accessToken');
  if (!token) return;
  
  try {
    console.log(`Loading admin stats from: ${API_BASE}/api/admin/stats`);
    
    const controller = createAbortController('adminStats');
    const response = await fetch(`${API_BASE}/api/admin/stats`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      signal: controller.signal
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Admin stats response:', data);
    
    if (data.success) {
      const totalUsersElement = document.getElementById('totalUsers');
      const totalTransactionsElement = document.getElementById('totalTransactions');
      const totalVolumeElement = document.getElementById('totalVolume');
      const verificationRateElement = document.getElementById('verificationRate');
      
      if (totalUsersElement) totalUsersElement.textContent = data.data.totalUsers.toLocaleString();
      if (totalTransactionsElement) totalTransactionsElement.textContent = data.data.totalTransactions.toLocaleString();
      if (totalVolumeElement) totalVolumeElement.textContent = `₦${Number(data.data.totalVolume).toLocaleString()}`;
      if (verificationRateElement) verificationRateElement.textContent = `${data.data.verificationRate}%`;
    } else if (response.status === 401) {
      const refreshSuccess = await refreshToken();
      if (refreshSuccess) {
        loadAdminStats();
      } else {
        window.location.href = 'login.html';
      }
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log('Admin stats request was aborted');
      return;
    }
    
    console.error('Error loading admin stats:', error);
    
    const fallbackApiBase = API_BASE.includes('localhost') 
      ? 'https://easy-subscribe-backend.onrender.com' 
      : 'http://localhost:5001';
    
    if (API_BASE !== fallbackApiBase) {
      console.log(`Trying fallback API at: ${fallbackApiBase}/api/admin/stats`);
      
      try {
        const fallbackResponse = await fetch(`${fallbackApiBase}/api/admin/stats`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json();
          console.log('Fallback admin stats response:', fallbackData);
           
          if (fallbackData.success) {
            const totalUsersElement = document.getElementById('totalUsers');
            const totalTransactionsElement = document.getElementById('totalTransactions');
            const totalVolumeElement = document.getElementById('totalVolume');
            const verificationRateElement = document.getElementById('verificationRate');
            
            if (totalUsersElement) totalUsersElement.textContent = fallbackData.data.totalUsers.toLocaleString();
            if (totalTransactionsElement) totalTransactionsElement.textContent = fallbackData.data.totalTransactions.toLocaleString();
            if (totalVolumeElement) totalVolumeElement.textContent = `₦${Number(fallbackData.data.totalVolume).toLocaleString()}`;
            if (verificationRateElement) verificationRateElement.textContent = `${fallbackData.data.verificationRate}%`;
            
            showAlert('Using backup server. Some features may be limited.', 'warning');
            return;
          }
        }
      } catch (fallbackError) {
        console.error('Fallback API also failed:', fallbackError);
      }
    }
    
    const statsContainer = document.querySelector('.admin-stats-container');
    if (statsContainer) {
      statsContainer.innerHTML = '<div class="error">Failed to load admin statistics</div>';
    }
  } finally {
    cleanupAbortController('adminStats');
  }
}
// NEW: Setup pagination
function setupPagination() {
  // Pagination will be set up individually for each list view
}
// NEW: Setup pagination controls
function setupPaginationControls(containerId, paginationData, filter, loadFunction) {
  const container = document.getElementById(containerId);
  if (!container || !paginationData) return;
  
  // Check if pagination controls already exist
  let paginationControls = container.querySelector('.pagination-controls');
  
  if (!paginationControls) {
    paginationControls = document.createElement('div');
    paginationControls.className = 'pagination-controls';
    container.appendChild(paginationControls);
  } else {
    paginationControls.innerHTML = '';
  }
  
  const { page, limit, pages, total } = paginationData;
  
  if (pages <= 1) {
    paginationControls.style.display = 'none';
    return;
  }
  
  paginationControls.style.display = 'flex';
  
  // Previous button
  const prevButton = document.createElement('button');
  prevButton.className = 'pagination-btn prev';
  prevButton.textContent = 'Previous';
  prevButton.disabled = page <= 1;
  prevButton.addEventListener('click', () => {
    loadFunction(filter, page - 1);
  });
  
  // Next button
  const nextButton = document.createElement('button');
  nextButton.className = 'pagination-btn next';
  nextButton.textContent = 'Next';
  nextButton.disabled = page >= pages;
  nextButton.addEventListener('click', () => {
    loadFunction(filter, page + 1);
  });
  
  // Page info
  const pageInfo = document.createElement('div');
  pageInfo.className = 'pagination-info';
  pageInfo.textContent = `Page ${page} of ${pages} (${total} items)`;
  
  paginationControls.appendChild(prevButton);
  paginationControls.appendChild(pageInfo);
  paginationControls.appendChild(nextButton);
}