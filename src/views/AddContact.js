import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useContact } from "../context/ContactContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faCamera,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";

const AddContact = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { contacts, createContact, updateContact } = useContact();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    photo: "",
  });
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoError, setPhotoError] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load saved form data or existing contact data
  useEffect(() => {
    if (id) {
      const contact = contacts.find((c) => c.id === parseInt(id));
      if (contact) {
        setFormData({
          name: contact.name,
          email: contact.email || "",
          phone: contact.phone || "",
          address: contact.address || "",
          photo: contact.photo || "",
        });
        setPhotoPreview(contact.photo || null);
      }
    } else {
      // Load saved draft if exists
      const savedForm = localStorage.getItem("contactFormDraft");
      if (savedForm) {
        try {
          const parsedForm = JSON.parse(savedForm);
          setFormData(parsedForm);
          if (parsedForm.photo) {
            setPhotoPreview(parsedForm.photo);
          }
        } catch (error) {
          console.error("Error loading saved form:", error);
        }
      }
    }
  }, [id, contacts]);

  // Save form data as draft
  useEffect(() => {
    if (!id) {
      try {
        localStorage.setItem("contactFormDraft", JSON.stringify(formData));
      } catch (error) {
        console.error("Error saving form draft:", error);
      }
    }
  }, [formData, id]);

  // Clear draft when component unmounts
  useEffect(() => {
    return () => {
      if (!id) {
        localStorage.removeItem("contactFormDraft");
      }
    };
  }, [id]);

  // Validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^\+?[\d\s-()]{10,}$/;
    return phoneRegex.test(phone);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const errors = {};

    // Name validation
    if (!formData.name.trim()) {
      errors.name = "Name is required";
    } else if (formData.name.length > 50) {
      errors.name = "Name must be less than 50 characters";
    }

    // Email validation
    if (formData.email && !validateEmail(formData.email)) {
      errors.email = "Please enter a valid email address";
    }

    // Phone validation
    if (formData.phone && !validatePhone(formData.phone)) {
      errors.phone = "Please enter a valid phone number";
    }

    // Address validation
    if (formData.address.length > 200) {
      errors.address = "Address must be less than 200 characters";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setPhotoError("Please select an image file");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setPhotoError("Image size should be less than 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        // Ensure the base64 string is properly formatted
        if (!base64String.startsWith("data:image")) {
          setPhotoError("Invalid image format");
          return;
        }
        setPhotoPreview(base64String);
        setFormData((prev) => ({
          ...prev,
          photo: base64String,
        }));
        setPhotoError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setPhotoPreview(null);
    setFormData((prev) => ({
      ...prev,
      photo: "",
    }));
    setPhotoError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      if (id) {
        await updateContact(parseInt(id), formData);
      } else {
        await createContact(formData);
      }
      navigate("/");
    } catch (error) {
      console.error("Error saving contact:", error);
      setFormErrors({
        submit: "Failed to save contact. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container">
      <div className="header">
        <button
          className="btn btn-link"
          onClick={() => navigate("/")}
          aria-label="Go back to contacts list"
        >
          <FontAwesomeIcon icon={faArrowLeft} />
        </button>
        <h1>{id ? "Edit Contact" : "Add New Contact"}</h1>
      </div>
      <form onSubmit={handleSubmit} className="form-container">
        <div className="photo-upload-container">
          <div
            className="photo-preview"
            onClick={() => document.getElementById("photo-input").click()}
            role="button"
            tabIndex={0}
            onKeyPress={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                document.getElementById("photo-input").click();
              }
            }}
            aria-label="Click to upload photo"
          >
            {photoPreview ? (
              <img src={photoPreview} alt="Contact" className="contact-photo" />
            ) : (
              <div className="photo-placeholder">
                <FontAwesomeIcon icon={faCamera} className="placeholder-icon" />
                <span>Add Photo</span>
              </div>
            )}
            <div className="photo-overlay">
              <FontAwesomeIcon icon={faCamera} className="camera-icon" />
            </div>
          </div>
          {photoPreview && (
            <button
              type="button"
              className="remove-photo-btn"
              onClick={(e) => {
                e.stopPropagation();
                handleRemovePhoto();
              }}
              aria-label="Remove photo"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          )}
          <input
            type="file"
            id="photo-input"
            className="photo-input"
            accept="image/*"
            onChange={handlePhotoChange}
            aria-label="Upload contact photo"
          />
          {photoError && <div className="alert alert-danger">{photoError}</div>}
        </div>
        <div className="form-group">
          <label htmlFor="name" className="form-label">
            Name <span className="required">*</span>
          </label>
          <input
            type="text"
            className={`form-control ${formErrors.name ? "is-invalid" : ""}`}
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="Enter contact name"
            maxLength={50}
            aria-invalid={!!formErrors.name}
            aria-describedby={formErrors.name ? "name-error" : undefined}
          />
          {formErrors.name && (
            <div className="invalid-feedback" id="name-error">
              {formErrors.name}
            </div>
          )}
        </div>
        <div className="form-group">
          <label htmlFor="email" className="form-label">
            Email
          </label>
          <input
            type="email"
            className={`form-control ${formErrors.email ? "is-invalid" : ""}`}
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter email address"
            aria-invalid={!!formErrors.email}
            aria-describedby={formErrors.email ? "email-error" : undefined}
          />
          {formErrors.email && (
            <div className="invalid-feedback" id="email-error">
              {formErrors.email}
            </div>
          )}
        </div>
        <div className="form-group">
          <label htmlFor="phone" className="form-label">
            Phone
          </label>
          <input
            type="tel"
            className={`form-control ${formErrors.phone ? "is-invalid" : ""}`}
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Enter phone number"
            aria-invalid={!!formErrors.phone}
            aria-describedby={formErrors.phone ? "phone-error" : undefined}
          />
          {formErrors.phone && (
            <div className="invalid-feedback" id="phone-error">
              {formErrors.phone}
            </div>
          )}
        </div>
        <div className="form-group">
          <label htmlFor="address" className="form-label">
            Address
          </label>
          <textarea
            className={`form-control ${formErrors.address ? "is-invalid" : ""}`}
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            rows="3"
            placeholder="Enter address"
            maxLength={200}
            aria-invalid={!!formErrors.address}
            aria-describedby={formErrors.address ? "address-error" : undefined}
          />
          {formErrors.address && (
            <div className="invalid-feedback" id="address-error">
              {formErrors.address}
            </div>
          )}
        </div>
        {formErrors.submit && (
          <div className="alert alert-danger">{formErrors.submit}</div>
        )}
        <div className="d-flex justify-content-end">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span
                className="spinner-border spinner-border-sm me-2"
                role="status"
                aria-hidden="true"
              ></span>
            ) : null}
            {id ? "Update Contact" : "Add Contact"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddContact;
