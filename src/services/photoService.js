export const uploadPhoto = async (photo) => {
  try {
    console.log("Starting photo upload process...");
    const UPLOAD_PRESET = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET;
    const CLOUD_NAME = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;

    if (!UPLOAD_PRESET || !CLOUD_NAME) {
      console.error("Missing Cloudinary configuration:", { UPLOAD_PRESET, CLOUD_NAME });
      throw new Error("Missing Cloudinary configuration");
    }

    let file;
    if (typeof photo === "string" && photo.startsWith("data:")) {
      console.log("Converting base64 to file...");
      const response = await fetch(photo);
      const blob = await response.blob();
      file = new File([blob], "photo.jpg", { type: "image/jpeg" });
    } else if (photo instanceof File) {
      console.log("Using provided File object...");
      file = photo;
    } else {
      console.error("Invalid photo format:", photo);
      throw new Error("Invalid photo format");
    }

    console.log("Preparing FormData for upload...");
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);

    console.log("Uploading to Cloudinary...");
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Cloudinary upload failed:", errorData);
      throw new Error(`Failed to upload photo: ${errorData.error?.message || "Unknown error"}`);
    }

    const data = await response.json();
    console.log("Cloudinary upload response:", data);

    if (!data.secure_url) {
      console.error("No secure URL in Cloudinary response:", data);
      throw new Error("No secure URL returned from Cloudinary");
    }

    console.log("Upload successful, returning URL:", data.secure_url);
    return data.secure_url;
  } catch (err) {
    console.error("Error in uploadPhoto:", err);
    throw err;
  }
};

export const deletePhoto = async (photoUrl) => {
  if (!photoUrl) return;

  try {
    const CLOUD_NAME = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
    if (!CLOUD_NAME) {
      throw new Error("Missing Cloudinary configuration");
    }

    // Extract public_id from URL
    const publicId = photoUrl.split("/").slice(-1)[0].split(".")[0];

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/destroy`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          public_id: publicId,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Failed to delete photo: ${errorData.error?.message || response.statusText}`
      );
    }
  } catch (error) {
    console.error("Error deleting photo:", error);
    throw error;
  }
};
