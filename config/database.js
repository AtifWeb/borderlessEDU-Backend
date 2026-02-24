import mongoose from "mongoose";
import { Message } from "../utils/Message.js";
import { MONGO_DB } from "./constants.js";
export class DB {
  static async connect() {
    try {
      const dbObject = await mongoose.connect(process.env.MONGODB_URI);

      Message.log(MONGO_DB.connected, dbObject.connection.host);
    } catch (error) {
      Message.log(MONGO_DB.connectionError, error.message);
    }
  }
}
