import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useContact } from "../context/ContactContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faTrash,
  faPhone,
  faEnvelope,
  faMapMarkerAlt,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import "../styles/ContactCard.css";

const ContactCard = ({ contact }) => {
  const { deleteContact } = useContact();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [photoLoading, setPhotoLoading] = useState(true);
  const [photoError, setPhotoError] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteContact(contact.id);
      setShowDeleteModal(false);
    } catch (error) {
      console.error("Error deleting contact:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const getInitial = (name) => {
    return name.charAt(0).toUpperCase();
  };

  const handlePhotoLoad = () => {
    setPhotoLoading(false);
    setPhotoError(false);
  };

  const handlePhotoError = (e) => {
    setPhotoLoading(false);
    setPhotoError(true);
    e.target.onerror = null;
    e.target.src = "";
    e.target.parentElement.innerHTML = `<div class="contact-initial" aria-hidden="true">${getInitial(
      contact.name
    )}</div>`;
  };

  return (
    <li className="contact-card">
      <div className="contact-photo-container">
        {contact.photo ? (
          <>
            {photoLoading && (
              <div className="photo-loading-spinner">
                <FontAwesomeIcon icon={faSpinner} spin />
              </div>
            )}
            <img
              src={contact.photo}
              alt={contact.name}
              className={`contact-photo ${photoLoading ? "loading" : ""} ${
                photoError ? "error" : ""
              }`}
              onLoad={handlePhotoLoad}
              onError={handlePhotoError}
            />
          </>
        ) : (
          <div className="contact-initial" aria-hidden="true">
            {getInitial(contact.name)}
          </div>
        )}
      </div>
      <div className="contact-info">
        <h2 className="contact-name">{contact.name}</h2>
        {contact.email && (
          <div className="contact-detail">
            <FontAwesomeIcon icon={faEnvelope} className="contact-icon" />
            <a
              href={`mailto:${contact.email}`}
              className="contact-link"
              aria-label={`Email ${contact.name}`}
            >
              {contact.email}
            </a>
          </div>
        )}
        {contact.phone && (
          <div className="contact-detail">
            <FontAwesomeIcon icon={faPhone} className="contact-icon" />
            <a
              href={`tel:${contact.phone}`}
              className="contact-link"
              aria-label={`Call ${contact.name}`}
            >
              {contact.phone}
            </a>
          </div>
        )}
        {contact.address && (
          <div className="contact-detail">
            <FontAwesomeIcon icon={faMapMarkerAlt} className="contact-icon" />
            <span className="contact-text">{contact.address}</span>
          </div>
        )}
      </div>
      <div className="contact-actions">
        <Link
          to={`/edit/${contact.id}`}
          className="btn btn-primary"
          aria-label={`Edit ${contact.name}`}
        >
          <FontAwesomeIcon icon={faEdit} />
        </Link>
        <button
          className="btn btn-danger"
          onClick={() => setShowDeleteModal(true)}
          aria-label={`Delete ${contact.name}`}
        >
          <FontAwesomeIcon icon={faTrash} />
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div
          className="modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-modal-title"
        >
          <div className="modal-content">
            <h2 id="delete-modal-title">Delete Contact</h2>
            <p>Are you sure you want to delete {contact.name}?</p>
            <div className="modal-actions">
              <button
                className="btn btn-secondary"
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                className="btn btn-danger"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </li>
  );
};

export default ContactCard;
