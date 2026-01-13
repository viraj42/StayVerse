// services/facilities.service.js

const { FACILITY_MAP } = require("../utils/facilityConstant");

function processFacilities(inputFacilities = []) {
  if (!Array.isArray(inputFacilities)) {
    throw new Error("Facilities must be an array");
  }

  // Remove duplicates
  const uniqueFacilities = [...new Set(inputFacilities)];

  const result = [];

  for (const label of uniqueFacilities) {
    const icon = FACILITY_MAP[label];
    if (!icon) {
      throw new Error(`Invalid facility: ${label}`);
    }
    result.push({ label, icon });
  }
  console.log(result);
  
  return result;
}

module.exports = { processFacilities };
