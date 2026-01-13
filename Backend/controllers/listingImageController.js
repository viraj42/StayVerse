const Listing = require("../models/Listing");

//HOST —Upload images for own listing

module.exports.uploadListingImages = async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ error: "Listing not found" });
    }
    if (String(listing.hostId) !== req.user.userId) {
      return res.status(403).json({ error: "Forbidden" });
    }
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No images uploaded" });
    }
    const imageUrls = req.files.map((file) => file.path);
    listing.images.push(...imageUrls);
    await listing.save();
    return res.json({
      message: "Images uploaded successfully",
      images: listing.images,
    });
  } catch (err) {
    return res.status(500).json({ error: "Image upload failed" });
  }
};
