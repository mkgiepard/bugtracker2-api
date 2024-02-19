const mongoose = require("mongoose");

main().catch((err) => console.log(err));

async function main() {
  await mongoose.connect(`mongodb://${process.env.LOCAL_DB}`);
}
