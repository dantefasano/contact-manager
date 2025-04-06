import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from "react";
import { uploadPhoto, deletePhoto } from "../services/photoService";

const ContactContext = createContext();

export const useContact = () => {
  return useContext(ContactContext);
};

export const ContactProvider = ({ children }) => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = process.env.REACT_APP_API_URL;
  const AGENDA_SLUG = process.env.REACT_APP_AGENDA_SLUG;

  // Create or get agenda
  const ensureAgenda = useCallback(async () => {
    try {
      // First try to get the agenda
      const response = await fetch(`${API_URL}/agendas/${AGENDA_SLUG}`);
      if (response.ok) {
        return true;
      }

      // If not found, create it
      const createResponse = await fetch(`${API_URL}/agendas/${AGENDA_SLUG}`, {
        method: "POST",
      });
      return createResponse.ok;
    } catch (err) {
      console.error("Agenda error:", err);
      return false;
    }
  }, [API_URL, AGENDA_SLUG]);

  // Fetch all contacts
  const fetchContacts = useCallback(async () => {
    try {
      // First ensure we have an agenda
      const hasAgenda = await ensureAgenda();
      if (!hasAgenda) {
        throw new Error("Failed to create or access agenda");
      }

      console.log(
        "Attempting to fetch contacts from:",
        `${API_URL}/agendas/${AGENDA_SLUG}/contacts`
      );
      const response = await fetch(`${API_URL}/agendas/${AGENDA_SLUG}/contacts`);
      console.log("Response status:", response.status);
      console.log(
        "Response headers:",
        Object.fromEntries(response.headers.entries())
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error response:", errorData);
        throw new Error(
          `Failed to fetch contacts: ${response.status} ${
            errorData.detail || response.statusText
          }`
        );
      }

      const data = await response.json();
      console.log("Raw API response:", data);
      console.log("Contacts array:", data.contacts);

      // Process contacts to ensure all fields are properly handled
      const processedContacts = (data.contacts || []).map((contact) => {
        console.log("Processing contact:", contact);
        const processed = {
          id: contact.id || "",
          name: contact.name || "",
          email: contact.email || "",
          phone: contact.phone || "",
          address: contact.address || "",
          photo: contact.photo || ""
        };
        console.log("Processed contact:", processed);
        return processed;
      });

      console.log("Final processed contacts:", processedContacts);
      setContacts(processedContacts);
      setError(null);
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.message);
      setContacts([]);
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
