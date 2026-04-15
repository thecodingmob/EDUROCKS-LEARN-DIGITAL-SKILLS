// Supabase Auth Configuration
const SUPABASE_URL = "https://drrtejisfrvvdbfbirpl.supabase.co"; // Replace with your Supabase project URL
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRycnRlamlzZnJ2dmRiZmJpcnBsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU5ODY5NjAsImV4cCI6MjA5MTU2Mjk2MH0.jDmD3OCvHRfcaVYsYfnRVpFj7z8BRAC-DbYpf5Fd_Rg"; // Replace with your Supabase anon key

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Helper functions for validation and error display
function showError(fieldId, message) {
  let errorSpan;
  if (fieldId === "consent") {
    errorSpan = document.getElementById("consent-error");
  } else {
    errorSpan = document.querySelector(`#${fieldId} + .error`);
  }
  if (errorSpan) {
    errorSpan.textContent = message;
    errorSpan.style.display = "block";
  }
}

function clearError(fieldId) {
  let errorSpan;
  if (fieldId === "consent") {
    errorSpan = document.getElementById("consent-error");
  } else {
    errorSpan = document.querySelector(`#${fieldId} + .error`);
  }
  if (errorSpan) {
    errorSpan.textContent = "";
    errorSpan.style.display = "none";
  }
}

function clearAllErrors() {
  const errorSpans = document.querySelectorAll(".error");
  errorSpans.forEach((span) => {
    span.textContent = "";
    span.style.display = "none";
  });
}

function validateEmail(email) {
  // Not too strict: just check for @ and . with something before and after
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validateName(name) {
  // Allow letters, spaces, hyphens, apostrophes, 2-50 chars
  const nameRegex = /^[a-zA-Z\s\-']{2,50}$/;
  return nameRegex.test(name);
}

function validatePassword(password) {
  // Secure but not too strict: min 8 chars, at least one letter and one number
  return (
    password.length >= 8 && /[a-zA-Z]/.test(password) && /\d/.test(password)
  );
}

// Login function
async function loginUser(email, password) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password,
    });

    if (error) {
      throw error;
    }

    console.log("Login successful:", data);
    // Redirect to dashboard or home page
    window.location.href = "./dashboard.html";
    return { success: true, data };
  } catch (error) {
    console.error("Login error:", error.message);
    return { success: false, error: error.message };
  }
}

// Signup function
async function signupUser(email, password, firstName, lastName) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password: password,
      options: {
        data: {
          first_name: firstName.trim(),
          last_name: lastName.trim(),
        },
      },
    });

    if (error) {
      throw error;
    }

    console.log("Signup successful:", data);
    // Show success message instead of alert
    showSuccessMessage(
      "Signup successful! Please check your email to confirm your account.",
    );
    return { success: true, data };
  } catch (error) {
    console.error("Signup error:", error.message);
    return { success: false, error: error.message };
  }
}

function showSuccessMessage(message) {
  // Create a temporary success message
  const successDiv = document.createElement("div");
  successDiv.textContent = message;
  successDiv.style.cssText =
    "position: fixed; top: 20px; right: 20px; background: #4CAF50; color: white; padding: 10px; border-radius: 5px; z-index: 1000;";
  document.body.appendChild(successDiv);
  setTimeout(() => document.body.removeChild(successDiv), 5000);
}

// Logout function (can be used in dashboard)
async function logoutUser() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
    console.log("Logout successful");
    window.location.href = "./index.html";
  } catch (error) {
    console.error("Logout error:", error.message);
  }
}

// Check if user is authenticated (useful for protected pages)
async function checkAuth() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

// Handle login form submission
function handleLoginForm(event) {
  event.preventDefault();
  clearAllErrors();

  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  let isValid = true;

  // Validate email
  if (!email) {
    showError("email", "Email is required");
    isValid = false;
  } else if (!validateEmail(email)) {
    showError("email", "Please enter a valid email address");
    isValid = false;
  }

  // Validate password
  if (!password) {
    showError("password", "Password is required");
    isValid = false;
  }

  if (!isValid) return;

  loginUser(email, password).then((result) => {
    if (!result.success) {
      // Show general error - could be more specific based on error type
      showError("email", "Invalid email or password");
    }
  });
}

// Handle signup form submission
function handleSignupForm(event) {
  event.preventDefault();
  clearAllErrors();

  const firstName = document.getElementById("fname").value.trim();
  const lastName = document.getElementById("lname").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmpassword").value;
  const consent = document.getElementById("consent").checked;

  let isValid = true;

  // Validate first name
  if (!firstName) {
    showError("fname", "First name is required");
    isValid = false;
  } else if (!validateName(firstName)) {
    showError(
      "fname",
      "First name must be 2-50 characters and contain only letters, spaces, hyphens, or apostrophes",
    );
    isValid = false;
  }

  // Validate last name (optional)
  if (lastName && !validateName(lastName)) {
    showError(
      "lname",
      "Last name must be 2-50 characters and contain only letters, spaces, hyphens, or apostrophes",
    );
    isValid = false;
  }

  // Validate email
  if (!email) {
    showError("email", "Email is required");
    isValid = false;
  } else if (!validateEmail(email)) {
    showError("email", "Please enter a valid email address");
    isValid = false;
  }

  // Validate password
  if (!password) {
    showError("password", "Password is required");
    isValid = false;
  } else if (!validatePassword(password)) {
    showError(
      "password",
      "Password must be at least 8 characters long and contain at least one letter and one number",
    );
    isValid = false;
  }

  // Validate confirm password
  if (!confirmPassword) {
    showError("confirmpassword", "Please confirm your password");
    isValid = false;
  } else if (password !== confirmPassword) {
    showError("confirmpassword", "Passwords do not match");
    isValid = false;
  }

  // Validate consent
  if (!consent) {
    showError("consent", "You must agree to the privacy policy");
    isValid = false;
  }

  if (!isValid) return;

  signupUser(email, password, firstName, lastName).then((result) => {
    if (!result.success) {
      showError("email", result.error);
    }
  });
}

// Initialize forms when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  // Check if we're on login page
  const loginForm = document.querySelector('form[action="#"]');
  if (loginForm && window.location.pathname.includes("log-in.html")) {
    loginForm.addEventListener("submit", handleLoginForm);

    // Clear errors on input
    document
      .getElementById("email")
      .addEventListener("input", () => clearError("email"));
    document
      .getElementById("password")
      .addEventListener("input", () => clearError("password"));
  }

  // Check if we're on signup page
  if (loginForm && window.location.pathname.includes("sign-up.html")) {
    loginForm.addEventListener("submit", handleSignupForm);

    // Clear errors on input
    document
      .getElementById("fname")
      .addEventListener("input", () => clearError("fname"));
    document
      .getElementById("lname")
      .addEventListener("input", () => clearError("lname"));
    document
      .getElementById("email")
      .addEventListener("input", () => clearError("email"));
    document
      .getElementById("password")
      .addEventListener("input", () => clearError("password"));
    document
      .getElementById("confirmpassword")
      .addEventListener("input", () => clearError("confirmpassword"));
    document
      .getElementById("consent")
      .addEventListener("change", () => clearError("consent"));
  }
});
