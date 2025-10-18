import React, { useState, useEffect, useRef } from "react";
import { useSpeechRecognition } from "../hooks/useSpeechRecognition";
import { ConfirmationDialog } from "./ConfirmationDialog";

type FormFields = "name" | "email" | "username";

export const InteractiveDemo: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    username: "",
  });
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});
  const [activeField, setActiveField] = useState<FormFields | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const nameInputRef = useRef<HTMLInputElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const usernameInputRef = useRef<HTMLInputElement>(null);

  const inputRefs: Record<FormFields, React.RefObject<HTMLInputElement>> = {
    name: nameInputRef,
    email: emailInputRef,
    username: usernameInputRef,
  };

  const formFields: FormFields[] = ["name", "email", "username"];

  const {
    isListening,
    transcript,
    startListening,
    stopListening,
    error,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  const handleMicClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { name?: string; email?: string } = {};
    let isValid = true;

    if (!formData.name.trim()) {
      newErrors.name = "Full Name is required.";
      isValid = false;
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email Address is required.";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address.";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmitClick = () => {
    if (validateForm()) {
      setShowConfirmDialog(true);
      if (isListening) stopListening();
    }
  };

  const handleConfirmSubmit = () => {
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
    setShowConfirmDialog(false);
  };

  const handleCancelSubmit = () => {
    setShowConfirmDialog(false);
  };

  useEffect(() => {
    if (!transcript) return;

    const command = transcript.toLowerCase().trim().replace(".", "");

    if (command.includes("focus name") || command.includes("go to name")) {
      setActiveField("name");
    } else if (
      command.includes("focus email") ||
      command.includes("go to email")
    ) {
      setActiveField("email");
    } else if (
      command.includes("focus username") ||
      command.includes("go to username")
    ) {
      setActiveField("username");
    } else if (command.includes("next field") || command.includes("next")) {
      const currentIndex = activeField ? formFields.indexOf(activeField) : -1;
      const nextIndex = (currentIndex + 1) % formFields.length;
      setActiveField(formFields[nextIndex]);
    } else if (
      command.includes("previous field") ||
      command.includes("go back")
    ) {
      const currentIndex = activeField
        ? formFields.indexOf(activeField)
        : formFields.length;
      const prevIndex =
        (currentIndex - 1 + formFields.length) % formFields.length;
      setActiveField(formFields[prevIndex]);
    } else if (command.includes("submit")) {
      handleSubmitClick();
    } else if (command.includes("reset") || command.includes("clear form")) {
      setFormData({ name: "", email: "", username: "" });
      setActiveField(null);
      setErrors({});
    } else {
      if (activeField) {
        let value = transcript;
        if (activeField === "email") {
          value = transcript.toLowerCase().replace(/\s/g, "");
        }
        setFormData((prev) => ({ ...prev, [activeField]: value }));
        if (errors[activeField as keyof typeof errors]) {
          setErrors((prev) => ({ ...prev, [activeField]: undefined }));
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transcript]);

  useEffect(() => {
    if (isListening && !activeField) {
      setActiveField("name");
    }
    if (!isListening) {
      setActiveField(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isListening]);

  useEffect(() => {
    document
      .querySelectorAll(".form-input")
      .forEach((el) => el.classList.remove("highlight-field"));
    if (activeField && inputRefs[activeField]?.current) {
      inputRefs[activeField].current?.focus();
      inputRefs[activeField].current?.classList.add("highlight-field");
    }
  }, [activeField, inputRefs]);

  const getStatusText = () => {
    if (!browserSupportsSpeechRecognition)
      return "Sorry, your browser doesn't support speech recognition.";
    if (error) return `Error: ${error}`;
    if (isListening) return "Listening...";
    return "Click the microphone to start.";
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const isFormFilled = formData.name && formData.email && formData.username;

  return (
    <section id="interactive-demo" className="mb-20">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-teal-800">
          Speech Form Filling Demo
        </h1>
        <h2 className="text-3xl font-bold text-teal-800">
          How It Works: An Interactive Demo
        </h2>
        <p className="mt-2 text-slate-600 max-w-2xl mx-auto">
          This section provides a hands-on simulation of the voice-activated
          form-filling process. Click through the steps to see how the
          application responds to voice commands and populates the form,
          bringing the core functionality to life.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6 md:p-10 max-w-4xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Registration Form</h3>
              <button
                id="mic-control"
                onClick={handleMicClick}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 ${
                  isListening ? "bg-teal-500 text-white pulse" : "bg-gray-200"
                }`}
                aria-label={
                  isListening ? "Stop voice input" : "Start voice input"
                }
                disabled={!browserSupportsSpeechRecognition}
              >
                <span className="text-2xl">🎤</span>
              </button>
            </div>
            <form
              id="real-form"
              className="space-y-4"
              onSubmit={(e) => e.preventDefault()}
            >
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Full Name
                </label>
                <input
                  ref={nameInputRef}
                  type="text"
                  id="name-input"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  onFocus={() => setActiveField("name")}
                  className={`form-input mt-1 block w-full px-3 py-2 bg-gray-50 border rounded-md shadow-sm focus:outline-none sm:text-sm transition-all duration-300 ${
                    errors.name ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Your name..."
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email Address
                </label>
                <input
                  ref={emailInputRef}
                  type="email"
                  id="email-input"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  onFocus={() => setActiveField("email")}
                  className={`form-input mt-1 block w-full px-3 py-2 bg-gray-50 border rounded-md shadow-sm focus:outline-none sm:text-sm transition-all duration-300 ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Your email..."
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>
              <div>
                <label
                  htmlFor="text"
                  className="block text-sm font-medium text-gray-700"
                >
                  User Name
                </label>
                <input
                  ref={usernameInputRef}
                  type="text"
                  id="username-input"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  onFocus={() => setActiveField("username")}
                  className="form-input mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none sm:text-sm transition-all duration-300"
                  placeholder="Create a username..."
                />
              </div>
              {isFormFilled && (
                <div>
                  <button
                    type="button"
                    onClick={handleSubmitClick}
                    className="w-full bg-teal-600 text-white font-semibold py-3 rounded-md hover:bg-teal-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 shadow-sm"
                  >
                    Submit
                  </button>
                </div>
              )}
            </form>
          </div>

          <div className="bg-amber-50/50 rounded-lg p-6 text-center">
            <h4 className="font-semibold text-lg mb-2 text-teal-800">
              Application Status
            </h4>
            <p
              id="status-display"
              className="text-slate-600 min-h-[40px] text-lg transition-opacity duration-300"
            >
              {getStatusText()}
            </p>
            <div className="mt-4 text-xs text-slate-500">
              <p className="font-semibold">Try saying:</p>
              <p>"Focus name", "Next field", "Submit", "Reset"</p>
            </div>
          </div>
        </div>
        <div
          id="success-message"
          className={`mt-6 text-center text-xl font-semibold text-green-600 transition-opacity duration-500 ${
            showSuccess ? "opacity-100" : "opacity-0"
          }`}
        >
          ✓ Form submitted successfully!
        </div>
      </div>
      <ConfirmationDialog
        isOpen={showConfirmDialog}
        onConfirm={handleConfirmSubmit}
        onCancel={handleCancelSubmit}
      />
    </section>
  );
};
