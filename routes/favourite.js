const router = require("express").Router();
const User = require("../models/user");
const { authenticateToken } = require("./userauth");

//add book to favourite
router.put("/add-book-to-favourite", authenticateToken, async (req, res) => {
  try {
    const { bookid, id } = req.headers;
    const userData = await User.findById(id);
    const isbookfavourite = userData.favourites.includes(bookid);
    if (isbookfavourite) {
      return res.status(200).json({ message: "Book is already in favourites" });
    }
    await User.findByIdAndUpdate(id, { $push: { favourites: bookid } });
    return res.status(200).json({ message: "Book added to favourites" });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error", error });
  }
});

//delete book to favourite
router.put(
  "/remove-book-from-favourite",
  authenticateToken,
  async (req, res) => {
    try {
      const { bookid, id } = req.headers;
      const userData = await User.findById(id);
      const isbookfavourite = userData.favourites.includes(bookid);
      if (isbookfavourite) {
        await User.findByIdAndUpdate(id, { $pull: { favourites: bookid } });
      }
      return res.status(200).json({ message: "Book removed from favourites" });
    } catch (error) {
      return res.status(500).json({ message: "Internal Server Error", error });
    }
  }
);

//get favourites from particular user
router.get("/get-favourite-books", authenticateToken, async (req, res) => {
  try {
    const { id } = req.headers;
    const userData = await User.findById(id).populate("favourites");
    const favouritesbooks = userData.favourites;
    return res.json({
      status: "Success",
      data: favouritesbooks,
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error", error });
  }
});
module.exports = router;
