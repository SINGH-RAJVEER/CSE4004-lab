document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('form');
  if (!form) return;

  const inputs = {
    name: document.getElementById('name'),
    dob: document.getElementById('dob'),
    regno: document.getElementById('regno'),
    phone: document.getElementById('phone'),
    password: document.getElementById('password'),
  };

  const validateField = (input, validator) => {
    if (!input) return false;
    input.setCustomValidity('');
    const message = validator(input.value.trim());
    if (message) {
      input.setCustomValidity(message);
      input.reportValidity();
      return false;
    }
    return true;
  };

  const validators = {
    name: (value) => {
      if (!value) return 'Name is required.';
      return /^[A-Za-z\s]{2,50}$/.test(value)
        ? ''
        : 'Use 2-50 letters only.';
    },
    dob: (value) => {
      if (!value) return 'Date of birth is required.';
      const today = new Date();
      const date = new Date(value);
      return date > today ? 'Date of birth cannot be in the future.' : '';
    },
    regno: (value) => {
      if (!value) return 'Registration number is required.';
      return /^[A-Za-z0-9]{4,12}$/.test(value)
        ? ''
        : 'Use 4-12 letters/numbers only.';
    },
    phone: (value) => {
      if (!value) return 'Phone number is required.';
      return /^\d{10}$/.test(value)
        ? ''
        : 'Enter a 10-digit number.';
    },
    password: (value) => {
      if (!value) return 'Password is required.';
      return value.length >= 8
        ? ''
        : 'Password must be at least 8 characters.';
    },
  };

  form.addEventListener('submit', (event) => {
    const allValid = Object.keys(validators).every((key) =>
      validateField(inputs[key], validators[key])
    );
    if (!allValid) {
      event.preventDefault();
    }
  });
});
