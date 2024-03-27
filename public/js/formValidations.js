function validateForm() {
    // Get form elements
    var email = document.getElementById("SignUpEmailAddress");
    var username = document.getElementById("SignUpUsername");
    var firstname = document.getElementById("Firstname");
    var lastname = document.getElementById("Lastname");
    var password = document.getElementById("SignUpPassword");
    var confirmPassword = document.getElementById("ConfirmSignUpPassword");
  
    // Clear existing error messages
    clearErrorMessages();
  
    // Validate email format
    var emailRegex =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (!emailRegex.test(email.value)) {
      displayErrorMessage("email-error", "Please enter a valid email address.");
      displayCriticalError("Please fix the errors in the form.");
      return false;
    }
  
    // Validate username format
    var usernameRegex = /^[a-zA-Z0-9._-]{3,}$/;
    if (isEmpty(username) || !usernameRegex.test(username.value)) {
      displayErrorMessage("username-error", "Username is required and must be at least 3 characters.");
      displayCriticalError("Please fix the errors in the form.");
      return false;
    }
  
    // Validate firstname format
    var firstnameRegex = /^[a-zA-Z]{3,}$/;
    if (isEmpty(firstname) || !firstnameRegex.test(firstname.value)) {
      displayErrorMessage("firstname-error", "Firstname is required and must be at least 3 characters.");
      displayCriticalError("Please fix the errors in the form.");
      return false;
    }
  
    // Validate lastname format
    var lastnameRegex = /^[a-zA-Z]{3,}$/;
    if (isEmpty(lastname) || !lastnameRegex.test(lastname.value)) {
      displayErrorMessage("lastname-error", "Lastname is required and must be at least 3 characters.");
      displayCriticalError("Please fix the errors in the form.");
      return false;
    }
  
    // Validate password strength
    var passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,}$/;
    if (!passwordRegex.test(password.value)) {
      displayErrorMessage(
        "password-error",
        "Password must contain at least one number, one uppercase letter, one lowercase letter, and one special character, and be at least 8 characters long."
      );
      displayCriticalError("Please fix the errors in the form.");
      return false;
    }
  
    // Confirm password match
    if (password.value !== confirmPassword.value) {
      displayErrorMessage("cpassword-error", "Passwords do not match.");
      displayCriticalError("Please fix the errors in the form.");
      return false;
    }
  
    // Use AJAX to send form data to the server
    var formData = {
      email: email.value,
      username: username.value,
      firstname: firstname.value,
      lastname: lastname.value,
      password: password.value,
      confirmPassword: confirmPassword.value,
    };
  
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "auth/signup", true);
    xhr.setRequestHeader("Content-Type", "application/json");
  
    xhr.onload = function () {
      if (xhr.status === 200) {
        // Form submission successful
        document.forms[0].submit();
      } else {
        // Form submission failed, display error
        var response = JSON.parse(xhr.responseText);
        displayCriticalError(response.message);
      }
    };
  
    // Convert formData object to JSON and send it
    xhr.send(JSON.stringify(formData));
  
    return false; // Prevent default form submission
  }
  
  function isEmpty(field) {
    return field.value.trim() === "";
  }
  
  function displayErrorMessage(id, message) {
    var errorMessage = document.getElementById(id);
    errorMessage.textContent = message;
  }
  
  function displayCriticalError(message) {
    var criticalError = document.getElementById("critical-error");
    criticalError.textContent = message;
  }
  
  function clearErrorMessages() {
    var errorMessages = document.querySelectorAll(".text-red-500");
    errorMessages.forEach(function (errorMessage) {
      errorMessage.textContent = "";
    });
  }
  