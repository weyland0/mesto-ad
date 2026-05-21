const getErrorElement = (inputElement, settings) =>
  inputElement.parentElement.querySelector(settings.errorSpanSelector);

const showInputError = (inputElement, errorMessage, settings) => {
  const errorElement = getErrorElement(inputElement, settings);
  if (!errorElement) {
    return;
  }
  errorElement.textContent = errorMessage;
  errorElement.classList.add(settings.errorClass);
  inputElement.classList.add(settings.inputErrorClass);
};

const hideInputError = (inputElement, settings) => {
  const errorElement = getErrorElement(inputElement, settings);
  if (errorElement) {
    errorElement.textContent = "";
    errorElement.classList.remove(settings.errorClass);
  }
  inputElement.classList.remove(settings.inputErrorClass);
};

const getValidationMessage = (inputElement) => {
  if (inputElement.validity.patternMismatch) {
    return inputElement.getAttribute("data-error-message") ?? inputElement.validationMessage;
  }
  return inputElement.validationMessage;
};

const isInputValid = (inputElement) => inputElement.validity.valid;

const checkInputValidity = (inputElement, settings) => {
  if (!inputElement.validity.valid) {
    showInputError(inputElement, getValidationMessage(inputElement), settings);
  } else {
    hideInputError(inputElement, settings);
  }
};

const hasInvalidInput = (inputList) => {
  for (const inputElement of inputList) {
    if (!isInputValid(inputElement)) {
      return true;
    }
  }
  return false;
};

const disableSubmitButton = (buttonElement, settings) => {
  buttonElement.classList.add(settings.inactiveButtonClass);
  buttonElement.disabled = true;
};

const enableSubmitButton = (buttonElement, settings) => {
  buttonElement.classList.remove(settings.inactiveButtonClass);
  buttonElement.disabled = false;
};

const toggleButtonState = (formElement, settings) => {
  const buttonElement = formElement.querySelector(settings.submitButtonSelector);
  const inputList = Array.from(
    formElement.querySelectorAll(settings.inputSelector)
  );
  if (hasInvalidInput(inputList)) {
    disableSubmitButton(buttonElement, settings);
  } else {
    enableSubmitButton(buttonElement, settings);
  }
};

const setEventListeners = (formElement, settings) => {
  const inputList = formElement.querySelectorAll(settings.inputSelector);
  inputList.forEach((inputElement) => {
    inputElement.addEventListener("input", () => {
      checkInputValidity(inputElement, settings);
      toggleButtonState(formElement, settings);
    });
  });
};

export const clearValidation = (formElement, settings) => {
  const inputList = formElement.querySelectorAll(settings.inputSelector);
  inputList.forEach((inputElement) => {
    hideInputError(inputElement, settings);
  });
  const buttonElement = formElement.querySelector(settings.submitButtonSelector);
  disableSubmitButton(buttonElement, settings);
};

export const enableValidation = (settings) => {
  const formList = document.querySelectorAll(settings.formSelector);
  formList.forEach((formElement) => {
    setEventListeners(formElement, settings);
  });
};
