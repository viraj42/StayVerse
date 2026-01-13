// constants/facilities.constants.js

module.exports.FACILITY_MAP = Object.freeze({
  "Indoor swimming pool": "waves",
  "Free parking": "parking-circle",
  "Room service": "bell",
  "Restaurant": "utensils",
  "Non-smoking rooms": "ban",
  "Free Wifi": "wifi",
  "Family rooms": "users",
  "24-hour front desk": "clock",
  "Fitness center": "dumbbell",
  "Garden": "tree-pine",
  "Terrace": "sun",
  "Private parking": "parking-square",
  "Swimming Pool":"waves-ladder",
  "Air Conditioning":"fan"
});

// Optional: Array for sending to frontend host UI
module.exports.FACILITY_LIST = Object.freeze(
  Object.keys(module.exports.FACILITY_MAP)
);
