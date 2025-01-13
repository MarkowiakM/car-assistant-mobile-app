export const readBlobAsBase64 = async (blob: Blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    console.log("Blob: ", blob);
    reader.readAsDataURL(blob);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};