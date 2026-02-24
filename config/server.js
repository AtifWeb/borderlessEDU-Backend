import { Message } from "../utils/Message.js";
import { SERVER } from "./constants.js";

export class Server {
  static start(app, dbConnector = null) {
    return app.listen(process.env.PORT || 3000, () => {
      Message.log(SERVER.listen, process.env.PORT || 3000);
      dbConnector & dbConnector();
    });
  }
}
