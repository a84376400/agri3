// import * as https from "https";
import { RequestUtils } from "../utils/requestutils";
import { REQUEST_TYPE } from "../const/requesttype";

export class WeatherService {
  static async getPrecipitation2h(lon: number, lat: number, interval: number): Promise<number[]> {
    const data = await RequestUtils.request(REQUEST_TYPE.GET, `https://api.caiyunapp.com/v2/KG9fO5n2am8=faPl/${lon},${lat}/forecast.json`, {}, {});

    const precipitations = [];
    for (let i = 0; i <= data.result.minutely.precipitation_2h.length; i += interval) {
      let index = i - 1;
      if (i === 0) {
        index = i;
      }
      precipitations.push(data.result.minutely.precipitation_2h[index]);
    }

    return precipitations;
  }
}
