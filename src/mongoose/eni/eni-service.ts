import { Eni } from "./model";

export class EniService {
  static async create(eniInfo: any) {
    const result = await Eni.find({ eniId: eniInfo.eniId });
    if (result) {
      return;
    }
    return await Eni.create(eniInfo);
  }
  static async findByInstanceId(instanceId: any) {
    return await Eni.find({ instanceId: instanceId });
  }
  static async findByInstanceIp(privateIp: any) {
    return await Eni.find({ privateIp: privateIp });
  }
}
