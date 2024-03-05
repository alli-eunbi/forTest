import { Instance } from "./model";

export class InstanceService {
  static async create(instance: any) {
    return await Instance.create(instance);
  }

  static async findInstanceByInstanceId(instanceId: any) {
    return await Instance.findOne({ instanceId: instanceId });
  }
}
