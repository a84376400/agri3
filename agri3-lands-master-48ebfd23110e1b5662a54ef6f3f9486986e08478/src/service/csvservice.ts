
export class CSVService {
  static convertObjToCSVBuffer(objs: any[], replaceKeys: any = []): Buffer {
    if (objs.length === 0) {
      throw "NO_ANY_DATA";
    }

    let output: string = "";

    const keys: string[] = replaceKeys.map((ele: any) => ele.oriText);
    const newKeys: string[] = replaceKeys.map((ele: any) => ele.replaceText);
    output = newKeys.map((key: string) => {
      return `"${key}"`;
    }).join(",");

    output += "\n";

    for (let obj of objs) {
      const objTexts: string[] = [];
      for (let key of keys) {
        let val = obj[key];
        if (typeof val === "object") {
          val = JSON.stringify(val).replace(/\",\"|,|\"/g, `"""`);
        }
        objTexts.push(`"${val}"`);
      }
      output += `${objTexts.join(",")}\n`;
    }

    return Buffer.from(output, "utf8");
  }
}