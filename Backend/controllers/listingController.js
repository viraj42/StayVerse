const Listing = require("../models/Listing");
const User = require("../models/User");

const formatListingCard = require("../utils/cardHelper");
const { processFacilities } = require("../config/facilities.service");
const {PROPERTY_TYPES} = require("../utils/propertyConstant");

//create a list-host
module.exports.createListing = async (req, res) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const {
      title,
      description,
      location,
      images,
      pricePerNight,
      category,
      propertyType,
      facilities,
      highlights,
      isHotDeal,
      totalRooms ,
      discountPercentage,
      dealExpiry,
      addonPrices
    } = req.body;

    // Field validation
    if (
      !title ||
      !description ||
      !location?.address ||
      location.lat === undefined ||
      location.lng === undefined ||
      pricePerNight === undefined
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    if (category && !["stay", "experience"].includes(category)) {
      return res.status(400).json({ error: "Invalid category" });
    }

    let processedFacilities = [];
    if (facilities) {
      processedFacilities = facilities;
    }
    const listing = await Listing.create({
      hostId: req.user.userId,
      title,
      description,
      location,
      images,
      pricePerNight,
      category,
      propertyType,
      facilities: processedFacilities,
      highlights,
      isHotDeal,
      discountPercentage,
      dealExpiry,
      totalRooms,
      addonPrices: {
        breakfast: addonPrices?.breakfast || 0,
        lunch: addonPrices?.lunch || 0,
        dinner: addonPrices?.dinner || 0
      }
    });
    return res.status(201).json(listing);
  } catch (err) {
    return res.status(500).json({ error: "Failed to create listing" });
  }
};

//update existing listing-host
module.exports.updateListing = async (req, res) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ error: "Listing not found" });
    }
    if (String(listing.hostId) !== req.user.userId) {
      return res.status(403).json({ error: "Forbidden" });
    }
    const allowedUpdates = [
      "title",
      "description",
      "pricePerNight",
      "category",
      "images",
      "propertyType",
      "facilities",
      "highlights",
      "isHotDeal",
      "totalRooms",
      "discountPercentage",
      "dealExpiry",
      "addonPrices"
    ];
    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        listing[field] = req.body[field];
      }
    });
    if (req.body.location) {
      const { address, lat, lng, city, state, country } = req.body.location;
      if (!address || lat === undefined || lng === undefined) {
        return res.status(400).json({ error: "Invalid location format" });
      }
      listing.location = { address, lat, lng, city, state, country };
    }

    if (listing.category && !["stay", "experience"].includes(listing.category)) {
      return res.status(400).json({ error: "Invalid category" });
    }
    await listing.save();
    return res.status(200).json(listing);
  } catch (err) {
    console.error("Update Listing Error:", err);
    return res.status(500).json({ error: "Failed to update listing" });
  }
};

//host— Delete listing
module.exports.deleteListing = async (req, res) => {
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
    await listing.deleteOne();
    return res.json({ message: "Listing deleted successfully" });
  } catch (err) {
    return res.status(500).json({ error: "Failed to delete listing" });
  }
};
//HOST — Get all listings created
module.exports.getHostListings = async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const listings = await Listing.find({
      hostId: req.user.userId,
    }).sort({ createdAt: -1 });
    //
    const cards = listings.map(formatListingCard);
    return res.status(200).json(cards);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch host listings" });
  }
};

//Public view
module.exports.getAllListings = async (req, res) => {
  try {
    const listings = await Listing.find()
      .sort({ createdAt: -1 })
      .select("-__v");
    const cards = listings.map(formatListingCard);
    return res.status(200).json(cards);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch listings" });
  }
};

// view each listing in Detail
module.exports.getListingById = async (req, res) => {
  try {
    const listing = await Listing.findByIdAndUpdate(
      req.params.id,
      { $inc: { viewsCount: 1 } },
      { new: true }
    ).select("-__v");

    if (!listing) {
      return res.status(404).json({ error: "Listing not found" });
    }

    const host = await User.findById(listing.hostId).select("name createdAt");
    const response = {
      ...listing.toObject(),
      hostName: host?.name,
      hostJoined: host?.createdAt
    };
    console.log(response);
    return res.status(200).json(response);
  } catch (err) {
    console.error("VIEW COUNT ERROR:", err);
    return res.status(500).json({ error: "Failed to fetch listing" });
  }
};

//find by property type
module.exports.browseByPropertyType = async (req, res) => {
  try {
    const { propertyType } = req.params;
    console.log(propertyType);
    const isValidType = PROPERTY_TYPES.some(
      (item) => item.type === propertyType
    );
    if (!isValidType) {
      return res.status(400).json({ error: "Invalid property type" });
    }
    const listings = await Listing.find({ propertyType })
      .sort({ avgRating: -1, createdAt: -1 })
      .limit(20)
      .lean();
    if (listings.length === 0) {
      return res.status(404).json({ error: "Listing not found" });
    }
    const cards = listings.map(formatListingCard);
    return res.status(200).json(cards);
  } catch (error) {
    return res.status(500).json({ error: "Failed to browse listing" });
  }
};

// Trending listings
module.exports.getTrendingListings = async (req, res) => {
  try {
    const listings = await Listing.find({
      $or: [
        { viewsCount: { $gte: 0 } },
        { bookingCount: { $gte: 0 } },
      ],
    })
      .sort({ bookingCount: -1, viewsCount: -1 })
      .limit(20)
      .lean();

    const cards = listings.map(formatListingCard);
    console.log(cards);
    
    return res.status(200).json(cards);
  } catch (error) {
    console.error("Trending error:", error);
    return res.status(500).json({ error: "Failed to fetch trending listings" });
  }
};


//hot lists
// hot lists
module.exports.getHotDeals = async (req, res) => {
  try {
    const listings = await Listing.find({
      isHotDeal: true,
      discountPercentage: { $gt: 0 }
    })
      .sort({ discountPercentage: -1 })
      .limit(20)
      .lean();

    const cards = listings.map(formatListingCard);
    console.log(cards);
    
    return res.status(200).json(cards);
  } catch (error) {
    return res.status(500).json({ error: "Failed to find Hot deals" });
  }
};


//reated lists
module.exports.getRelatedListings=async(req,res)=>{
  try {
  const {id} =req.params;
  const baseList=await Listing.findById(id);
  if(!baseList){    //optional
    return res.status(404).json({ error: "Invalid Base List" });
  }
  let relatedlistings=await Listing.find({
    "location.city":baseList.location.city,
    propertyType:baseList.propertyType,
    avgRating: {
        $gte: baseList.avgRating - 0.5,
        $lte: baseList.avgRating + 0.5,
      },
    _id:{$ne:baseList._id}
  })
  .limit(7)
  .lean();
  if(relatedlistings.length==0){
    relatedlistings=await Listing.find({
    "location.city": baseList.location.city,
    _id:{$ne:baseList._id}
  })
  .limit(7)
  .lean();
  }
  const cards = relatedlistings.map(formatListingCard);
  return res.status(200).json(cards)
  } catch (error) {
      return res.status(500).json({ error: "Failed to find related deals" });
  }
}

//ocation autocomplete was here
module.exports.exploreByLocation = async (req, res) => {
  try {
    const { country, state, city } = req.query;
    if (!country && !state && !city) {
      return res.status(400).json({ error: "No filter provided" });
    }
    let filter = {};
    if (city) {
      filter = { "location.city": city };
    } else if (state) {
      filter = { "location.state": state };
    } else if (country) {
      filter = { "location.country": country };
    }
    const listings = await Listing.find(filter)
      .sort({ bookingCount: -1, avgRating: -1 })
      .limit(20)
      .lean();
    if (listings.length === 0) {
      return res.status(200).json([]);
    }
    const cards = listings.map(formatListingCard);
    return res.status(200).json(cards);
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Failed to explore listings by location" });
  }
};

//highly rated listings:
module.exports.gethighlyRatedListings=async(req,res)=>{
  try {
    const listings=await Listing.find()
    .sort({avgRating:-1})
    .limit(10)
    .lean();

    if(listings.length===0){
      return res.status(404).json({error:"Listing Not Found!!"})
    }

    const card=await listings.map(formatListingCard);
    console.log(card);
    res.status(200).json(card);
  } catch (error) {
    return res.status(500).json({ error: "Failed to find Rated Listings" });
  }
}