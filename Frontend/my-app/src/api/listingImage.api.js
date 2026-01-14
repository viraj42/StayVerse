const BASE_URL = import.meta.env.VITE_API_BASE_URL + "/api";


export const uploadListingImages = async (listingId, images) => {
  const token = localStorage.getItem("token");
  const formData = new FormData();

  images.forEach((img) => formData.append("images", img));

  const res = await fetch(
    `${BASE_URL}/listings/${listingId}/images`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData
    }
  );

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Image upload failed");
  }

  return res.json();
};
