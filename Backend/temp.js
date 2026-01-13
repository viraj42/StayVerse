const mongoose = require("mongoose");
const Listing = require("./models/Listing"); 
const { FACILITY_MAP } = require("./utils/facilityConstant");

// 🔹 Put your Mongo connection string here
const MONGO_URI = "mongodb://127.0.0.1:27017/your_database_name";

async function migrateFacilities() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB connected");

    const listings = await Listing.find();

    for (const doc of listings) {
      if (
        doc.facilities.length &&
        typeof doc.facilities[0] === "string"
      ) {
        const newFacilities = doc.facilities
          .filter(label => FACILITY_MAP[label])
          .map(label => ({
            label,
            icon: FACILITY_MAP[label]
          }));

        await Listing.updateOne(
          { _id: doc._id },
          { $set: { facilities: newFacilities } }
        );

        console.log(`Updated listing: ${doc._id}`);
      }
    }

    console.log("Migration complete");
    process.exit(0);

  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  }
}

migrateFacilities();
