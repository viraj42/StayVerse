const Listing = require('../models/Listing');
const WishList=require('../models/WishList');


//add listing to wishlist
module.exports.addToWishlist=async(req,res)=>{
    try {
        if(!req.user || !req.user.userId){
            return res.status(401).json({ error: "Unauthorized" });
        }
        //If user is Host=>cant book ticket
       if (req.user.role !== "guest"){
            return res.status(403).json({error: "Only guests can book listings" });
        }

        const {listingId}=req.params;
        console.log(listingId);
        const listing=await Listing.findById(listingId);
        if(!listing) return res.status(400).json({error: "Listing Not Found!!"});

        let wishlist=await WishList.findOne({
            userId:req.user.userId
        })
        if(!wishlist) {
            wishlist=await WishList.create({
                userId:req.user.userId,
                listingIds:[]
            })
        }
        if (wishlist.listingIds.includes(listingId)) {
         return res.status(400).json({ error: "Listing already in wishlist" });
        }
        wishlist.listingIds.push(listingId);
        await wishlist.save();
        return res.status(200).json(wishlist)
    } catch (error) {
        return res.status(500).json({error: "Failed to add in WishList" });
    }
}
//Remove list from wishlist
module.exports.removeFromWishlist=async(req,res)=>{
    try {
        if(!req.user || !req.user.userId){
            return res.status(401).json({ error: "Unauthorized" });
        }
        //If user is Host=>cant book ticket
       if (req.user.role !== "guest"){
            return res.status(403).json({error: "Only guests can book listings" });
        }
         const {listingId}=req.params;
        //Find Wishlist
        let wishlist=await WishList.findOne({
            userId:req.user.userId
        })
        if(!wishlist) {
            return res.status(404).json({"error":"Wishlist Not Found!!"})
        }
        //Check If Listing Exists in Wishlist
        if(!(wishlist.listingIds.includes(listingId))){
            return res.status(404).json({"error":"Listing Not Found in WishList!!"})
        }
        wishlist.listingIds = wishlist.listingIds.filter(
         (id) => id.toString() !== listingId
        );
        await wishlist.save();
        return res.status(200).json(wishlist)
    } catch (error) {
        return res.status(500).json({error: "Failed to remove from WishList" });
    }
}

//get wishlist-Guest
module.exports.getWishlist = async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    if (req.user.role !== "guest") {
      return res.status(403).json({ error: "Only guests can view wishlist" });
    }
    const wishlist = await WishList.findOne({
      userId: req.user.userId,
    }).populate(
      "listingIds",
      "title images pricePerNight location avgRating category"
    );
    // No wishlist yet → return empty list (NOT an error)
    if (!wishlist) {
      return res.status(200).json({ items: [] });
    }

    return res.status(200).json({
      items: wishlist.listingIds,
    });
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch wishlist" });
  }
};