const mongoose = require("mongoose");

/**
 * Roles:
 * - viewer: GET-only globally (except own transaction writes)
 * - analyst: GET + summaries
 * - admin: full access + user management
 */
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["viewer", "analyst", "admin"],
      default: "viewer",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(_doc, ret) {
        ret.id = ret._id.toString();
        delete ret.password;
        delete ret.__v;
        return ret;
      },
    },
  }
);

userSchema.virtual("id").get(function getId() {
  return this._id.toString();
});

module.exports = mongoose.model("User", userSchema);
