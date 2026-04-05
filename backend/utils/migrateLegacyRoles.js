const mongoose = require("mongoose");

/**
 * Legacy role fixes + ensure isActive exists for older documents.
 */
async function migrateLegacyUserRoles() {
  const coll = mongoose.connection.db.collection("users");
  const r1 = await coll.updateMany(
    { role: "user" },
    { $set: { role: "viewer" } }
  );
  const r2 = await coll.updateMany(
    { $or: [{ role: { $exists: false } }, { role: null }, { role: "" }] },
    { $set: { role: "viewer" } }
  );
  const r3 = await coll.updateMany(
    { isActive: { $exists: false } },
    { $set: { isActive: true } }
  );
  if (r1.modifiedCount || r2.modifiedCount || r3.modifiedCount) {
    console.log(
      `DB migration: user→viewer ${r1.modifiedCount}, default role ${r2.modifiedCount}, isActive ${r3.modifiedCount}`
    );
  }
}

module.exports = { migrateLegacyUserRoles };
