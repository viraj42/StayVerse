const SearchHistory = require("../models/SearchHistory");

//Searched byy guest
module.exports.saveSearchHistory = async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    if (req.user.role !== "guest") {
      return res.status(403).json({ error: "Only guests can perform searches" });
    }

    const { query, filters } = req.body;
    // At least one must be present
    if (!query && (!filters || Object.keys(filters).length === 0)) {
      return res.status(400).json({ error: "Search query or filters required" });
    }
    const search = await SearchHistory.create({
      userId: req.user.userId,
      query: query || "",
      filters: filters || {},
    });
    return res.status(201).json(search);
  } catch (error) {
    return res.status(500).json({ error: "Failed to save search history" });
  }
};

//Recent search of Gest
module.exports.getSearchHistory = async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (req.user.role !== "guest") {
      return res.status(403).json({ error: "Only guests can view search history" });
    }

    const searches = await SearchHistory.find({
      userId: req.user.userId,
    })
      .sort({ timestamp: -1 })
      .limit(10)
      .select("query filters timestamp");

    return res.status(200).json(searches);
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch search history" });
  }
};
