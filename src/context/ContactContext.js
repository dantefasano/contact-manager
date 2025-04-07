import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from "react";
import { uploadPhoto, deletePhoto } from "../services/photoService";

const ContactContext = createContext();

// Default values if environment variables are not set
const DEFAULT_API_URL = "https://playground.4geeks.com/contact";
const DEFAULT_AGENDA_SLUG = "default-agenda";

export const useContact = () => {
  return useContext(ContactContext);
};

export const ContactProvider = ({ children }) => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Use environment variables if available, otherwise use defaults
  const API_URL = process.env.REACT_APP_API_URL || DEFAULT_API_URL;
  const AGENDA_SLUG = process.env.REACT_APP_AGENDA_SLUG || DEFAULT_AGENDA_SLUG;

  // Create or get agenda
  const ensureAgenda = useCallback(async () => {
    try {
      // First try to get the agenda
      const response = await fetch(`${API_URL}/agendas/${AGENDA_SLUG}`);
      
      // If agenda exists, return true
      if (response.ok) {
        return true;
      }

      // If agenda doesn't exist (404) or any other error, try to create it
      const createResponse = await fetch(`${API_URL}/agendas/${AGENDA_SLUG}`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // If creation was successful or agenda already exists
      if (createResponse.ok || createResponse.status === 400) {
        return true;
      }

      // If creation failed for other reasons
      const errorData = await createResponse.json();
      throw new Error(errorData.detail || 'Failed to create agenda');
    } catch (err) {
      console.error("Agenda error:", err);
      setError(err.message);
      return false;
    }
  }, [API_URL, AGENDA_SLUG]);

  // Fetch all contacts
  const fetchContacts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // First ensure we have an agenda
      const hasAgenda = await ensureAgenda();
      if (!hasAgenda) {
        throw new Error("Failed to create or access agenda. Please check your agenda slug in the .env file.");
      }

      // Now fetch contacts
      const response = await fetch(`${API_URL}/agendas/${AGENDA_SLUG}/contacts`);
      if (!response.ok) {
        throw new Error("Failed to fetch contacts");
      }
      
      const data = await response.json();
      // The API returns an object with a contacts array
      setContacts(data.contacts || []);
    } catch (err) {
      console.error("Fetch contacts error:", err);
      setError(err.message);
      setContacts([]); // Ensure contacts is always an array
    } finally {
      setLoading(false);
    }
  }, [API_URL, AGENDA_SLUG, ensureAgenda]);

  // Create a new contact
  const createContact = async (contactData) => {
    try {
      let processedData = { ...contactData };
      console.log("Initial contact data:", contactData);

      // Handle photo upload if exists
      if (contactData.photo) {
        console.log("Photo exists, attempting upload:", contactData.photo.substring(0, 50) + "...");
        try {
          const photoUrl = await uploadPhoto(contactData.photo);
          console.log("Photo uploaded successfully, URL:", photoUrl);
          processedData.photo = photoUrl;
        } catch (err) {
          console.error("Error uploading photo:", err);
          throw new Error("Failed to upload contact photo");
        }
      }

      // Create the contact
      console.log("Sending contact data to API:", processedData);
      const response = await fetch(`${API_URL}/agendas/${AGENDA_SLUG}/contacts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(processedData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Failed to create contact: ${response.status} ${
            errorData.detail || response.statusText
          }`
        );
      }

      const data = await response.json();
      console.log("Contact created successfully:", data);
      setContacts((prev) => [...prev, data]);
      return data;
    } catch (err) {
      console.error("Create error:", err);
      setError(err.message);
      throw err;
    }
  };

  // Update a contact
  const updateContact = async (id, contactData) => {
    try {
      let processedData = { ...contactData };
      console.log("Initial update data:", contactData);

      // Handle photo upload if exists and is new
      if (contactData.photo && contactData.photo.startsWith("data:")) {
        console.log("New photo detected, attempting upload:", contactData.photo.substring(0, 50) + "...");
        try {
          const photoUrl = await uploadPhoto(contactData.photo);
          console.log("Photo uploaded successfully, URL:", photoUrl);
          processedData.photo = photoUrl;
        } catch (err) {
          console.error("Error uploading photo:", err);
          throw new Error("Failed to upload contact photo");
        }
      }

      // Update the contact
      console.log("Sending update data to API:", processedData);
      const response = await fetch(
        `${API_URL}/agendas/${AGENDA_SLUG}/contacts/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(processedData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Failed to update contact: ${response.status} ${
            errorData.detail || response.statusText
          }`
        );
      }

      const data = await response.json();
      console.log("Contact updated successfully:", data);
      
      // Create the updated contact with all fields including the photo
      const updatedContact = {
        ...data,
        photo: processedData.photo || data.photo || "",
        name: processedData.name || data.name || "",
        email: processedData.email || data.email || "",
        phone: processedData.phone || data.phone || "",
        address: processedData.address || data.address || ""
      };
      
      // Update the contacts state with the complete contact data
      setContacts((prev) =>
        prev.map((contact) => (contact.id === id ? updatedContact : contact))
      );
      
      return updatedContact;
    } catch (err) {
      console.error("Update error:", err);
      setError(err.message);
      throw err;
    }
  };

  // Delete a contact
  const deleteContact = async (id) => {
    try {
      // Get the contact to find the photo URL
      const contact = contacts.find((c) => c.id === id);

      // Delete photo from Cloudinary if exists
      if (contact?.photo) {
        try {
          await deletePhoto(contact.photo);
        } catch (err) {
          console.error("Error deleting photo:", err);
          // Continue with contact deletion even if photo deletion fails
        }
      }

      console.log("Attempting to delete contact:", id);
      const response = await fetch(`${API_URL}/agendas/${AGENDA_SLUG}/contacts/${id}`, {
        method: "DELETE",
      });
      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error response:", errorData);
        throw new Error(
          `Failed to delete contact: ${response.status} ${
            errorData.detail || response.statusText
          }`
        );
      }

      setContacts((prev) => prev.filter((contact) => contact.id !== id));
    } catch (err) {
      console.error("Delete error:", err);
      setError(err.message);
      throw err;
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const value = {
    contacts,
    loading,
    error,
    createContact,
    updateContact,
    deleteContact,
    fetchContacts,
  };

  return (
    <ContactContext.Provider value={value}>{children}</ContactContext.Provider>
  );
};
