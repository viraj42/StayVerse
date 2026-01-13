const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const uploadProfileImage = async (imageFile) => {
  const token = localStorage.getItem("token");
  const formData = new FormData();
  formData.append("image", imageFile);

  const res = await fetch(`${BASE_URL}/profile/me/upload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: formData
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Upload failed");
  return data;
};
