const router = require("express").Router();
const { authenticateToken } = require("./userauth");
const Book = require("../models/book");
const Order = require("../models/order");
const User = require("../models/user");

//place order
router.post("/place-order", authenticateToken, async (req, res) => {
  try {
    const { id } = req.headers;
    const { order } = req.body;
    for (const orderdata of order) {
      const neworder = new Order({ user: id, book: orderdata._id });
      const orderdatafromdb = await neworder.save();

      //saving order in user model
      await User.findByIdAndUpdate(id, {
        $push: { orders: orderdatafromdb._id },
      });

      //clearing cart
      await User.findByIdAndUpdate(id, {
        $pull: { cart: orderdata._id },
      });
    }
    return res.json({
      status: "Success",
      message: "Order placed sucessfully",
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error", error });
  }
});

//get order history of particular user
router.get("/get-order-history", authenticateToken, async (req, res) => {
  try {
    const { id } = req.headers;
    const userData = await User.findById(id).populate({
      path: "orders",
      populate: { path: "book" },
    });
    const orderdata = userData.orders.reverse();
    return res.json({
      status: "Success",
      data: orderdata,
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error", error });
  }
});

//get-all-orders ---admin

router.get("/get-all-orders", authenticateToken, async (req, res) => {
  try {
    const userData = await Order.find()
      .populate({
        path: "book",
      })
      .populate({
        path: "user",
      })
      .sort({ createdAt: -1 });
    return res.json({
      status: "Success",
      data: userData,
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error", error });
  }
});

//update order --admin
router.put("/update-status/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await Order.findByIdAndUpdate(id, { status: req.body.status });
    return res.json({
      status: "Success",
      message: "Status Updated Successfully",
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error", error });
  }
});

module.exports = router;
