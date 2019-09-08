import { NextFunction, Request, Response } from "../base/basecontroller";
import { Validator, BadRequestResponse, SuccessResponse } from "sakura-node-3";
import { WeatherService } from "../service/weatherservice";
import { SystemErrorResponse } from "../base/systemerrorresponse";

export class WeatherController {
  static async getPrecipitation2h(req: Request, res: Response, next: NextFunction): Promise<void> {
    const validator: Validator = new Validator();
    const lat: number = validator.toNumber(req.query["lat"]);
    const lon: number = validator.toNumber(req.query["lon"]);
    const interval: number = req.query["interval"] ? validator.toNumber(req.query["interval"]) : 15;

    if (validator.hasErrors()) {
      next(new BadRequestResponse(validator.errors));
      return;
    }

    try {
      const precipitations = await WeatherService.getPrecipitation2h(lon, lat, interval);

      next(new SuccessResponse({ precipitations }));
    } catch (e) {
      next(new SystemErrorResponse());
    }
  }
}
