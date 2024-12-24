import PromotionModel from "../models/PromotionsModel.mjs";

const PromotionsControllers = {
  applyPromoCode: async (req, res) => {
    try {
      const data = await PromotionModel.findOne({ code: req.body.code });
      console.log(data);
      if (data?.length) {
        res.status(200).json({
          message: "Apply Promo Successfully",
          data: data,
        });
      } else {
        res.status(400).json({
          message: "Promo Not available",
          data: data,
        });
      }
    } catch (error) {
      return res.status(500).json({
        message: "Internal Server Error",
        error: error.message,
      });
    }
  },
};

export default PromotionsControllers;
