/**
 * Converts an uploaded file into a Base64 string.
 *
 * Used when uploading images so they can be sent
 * directly in JSON payloads to the backend.
 *
 * Returns a Promise that resolves with the Base64 data URL.
 */
export const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;

    reader.readAsDataURL(file);
  });
