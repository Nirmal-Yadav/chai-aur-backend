import mongoose, { Schema } from "mongoose";

const subscriptionModel = new Schema(
  {
    subscriber: {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
    channel: {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
  },
  { timestamps: true }
);

export const subscription = mongoose.model("Subscription", subscriptionModel);
