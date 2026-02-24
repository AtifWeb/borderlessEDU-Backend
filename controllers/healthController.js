import { Response } from "../utils/Response.js";

export class HealthController {
  health(_, res) {
    Response.success(res, {
      status: "ok",
    });
  }
}
