const CLOUDINARY_UPLOAD_PRESET = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET;
const CLOUDINARY_CLOUD_NAME = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;

export const uploadPhoto = async (file) => {
  try {
    console.log("Starting photo upload...");
    console.log("Input type:", typeof file);
    console.log(
      "Is base64:",
      typeof file === "string" && file.startsWith("data:")
    );

    // If the input is a base64 string, convert it to a file
    let fileToUpload = file;
    if (typeof file === "string" && file.startsWith("data:")) {
      try {
        // Remove the data URL prefix to get just the base64 string
        const base64Data = file.split(",")[1];
        // Convert base64 to blob
        const byteCharacters = atob(base64Data);
        const byteArrays = [];

        for (let offset = 0; offset < byteCharacters.length; offset += 1024) {
          const slice = byteCharacters.slice(offset, offset + 1024);
          const byteNumbers = new Array(slice.length);

          for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
          }

          const byteArray = new Uint8Array(byteNumbers);
          byteArrays.push(byteArray);
        }

        const blob = new Blob(byteArrays, { type: "image/jpeg" });
        fileToUpload = new File([blob], "photo.jpg", { type: "image/jpeg" });
        console.log("Successfully converted base64 to File");
      } catch (error) {
        console.error("Error converting base64 to File:", error);
        throw error;
      }
    }

    const formData = new FormData();
    formData.append("file", fileToUpload);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    console.log("Sending request to Cloudinary...");
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Cloudinary error details:", errorData);
      throw new Error(
        `Failed to upload photo: ${
          errorData.error?.message || response.statusText
        }`
      );
    }

    const data = await response.json();
    console.log("Upload successful:", data);
    return data.secure_url;
  } catch (error) {
    console.error("Error uploading photo:", error);
    throw error;
  }
};

export const deletePhoto = async (photoUrl) => {
  try {
    // Extract public_id from URL
    const publicId = photoUrl.split("/").slice(-1)[0].split(".")[0];

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/destroy`,
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
      throw new Error("Failed to delete photo");
    }
  } catch (error) {
    console.error("Error deleting photo:", error);
    throw error;
  }
};
