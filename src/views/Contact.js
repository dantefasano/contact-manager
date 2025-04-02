import React from "react";
import { Link } from "react-router-dom";
import { useContact } from "../context/ContactContext";
import ContactCard from "../components/ContactCard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";

const Contact = () => {
  const { contacts, loading, error } = useContact();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      </div>
    );
  }

  return (
    <>
      <header className="page-header">
        <h1>Contacts</h1>
      </header>
      <div className="container">
        <ul className="contact-list" aria-label="Contact list">
          {contacts.map((contact) => (
            <ContactCard key={contact.id} contact={contact} />
          ))}
        </ul>
      </div>
      <Link to="/add" className="add-contact-btn" aria-label="Add new contact">
        <FontAwesomeIcon icon={faPlus} aria-hidden="true" />
      </Link>
    </>
  );
};

export default Contact;
