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

  const API_URL = "https://playground.4geeks.com/contact";

  // Create or get agenda
  const ensureAgenda = async () => {
    try {
      // First try to get the agenda
      const response = await fetch(`${API_URL}/agendas/fasan`);
      if (response.ok) {
        return true;
      }

      // If not found, create it
      const createResponse = await fetch(`${API_URL}/agendas/fasan`, {
        method: "POST",
      });
      return createResponse.ok;
    } catch (err) {
      console.error("Agenda error:", err);
      return false;
    }
  };

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
        `${API_URL}/agendas/fasan/contacts`
      );
      const response = await fetch(`${API_URL}/agendas/fasan/contacts`);
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
      console.log("Success response:", data);

      // Process contacts to ensure photo URLs are properly handled
      const processedContacts = (data.contacts || []).map((contact) => ({
        ...contact,
        photo: contact.photo || "", // Use API photo or empty string
      }));

      setContacts(processedContacts);
      setError(null);
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.message);
      setContacts([]);
    } finally {
      setLoading(false);
    }
  }, []); // Now we can safely remove contacts from dependencies

  // Create a new contact
  const createContact = async (contactData) => {
    try {
      let processedData = { ...contactData };

      // Handle photo upload if exists
      if (contactData.photo && contactData.photo.startsWith("data:")) {
        try {
          // Convert base64 to file
          const response = await fetch(contactData.photo);
          const blob = await response.blob();
          const file = new File([blob], "photo.jpg", { type: "image/jpeg" });

          // Upload to Cloudinary
          const photoUrl = await uploadPhoto(file);
          processedData.photo = photoUrl;
        } catch (err) {
          console.error("Error uploading photo:", err);
          // If upload fails, continue without photo
        }
      }

      // Create the contact
      console.log("Attempting to create contact:", processedData);
      const response = await fetch(`${API_URL}/agendas/fasan/contacts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: processedData.name,
          email: processedData.email,
          phone: processedData.phone,
          address: processedData.address,
          photo: processedData.photo || "",
        }),
      });
      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error response:", errorData);
        throw new Error(
          `Failed to create contact: ${response.status} ${
            errorData.detail || response.statusText
          }`
        );
      }

      const data = await response.json();
      console.log("Success response:", data);

      // Add the photo URL to the contact data before adding to state
      const contactWithPhoto = {
        ...data,
        photo: processedData.photo || "",
      };

      setContacts((prev) => [...prev, contactWithPhoto]);
      return contactWithPhoto;
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

      // Handle photo upload if exists
      if (contactData.photo && contactData.photo.startsWith("data:")) {
        try {
          // Convert base64 to file
          const response = await fetch(contactData.photo);
          const blob = await response.blob();
          const file = new File([blob], "photo.jpg", { type: "image/jpeg" });

          // Upload to Cloudinary
          const photoUrl = await uploadPhoto(file);
          processedData.photo = photoUrl;
        } catch (err) {
          console.error("Error uploading photo:", err);
          // If upload fails, keep existing photo
        }
      }

      // Update the contact
      console.log("Attempting to update contact:", id, processedData);
      const response = await fetch(`${API_URL}/agendas/fasan/contacts/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: processedData.name,
          email: processedData.email,
          phone: processedData.phone,
          address: processedData.address,
          photo: processedData.photo || "",
        }),
      });
      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error response:", errorData);
        throw new Error(
          `Failed to update contact: ${response.status} ${
            errorData.detail || response.statusText
          }`
        );
      }

      const data = await response.json();
      console.log("Success response:", data);

      // Update the contact with the photo URL
      const updatedContact = {
        ...data,
        photo: processedData.photo || "",
      };

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
      const response = await fetch(`${API_URL}/agendas/fasan/contacts/${id}`, {
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
