import { Pod } from "./model";

export class PodService {
  static async createPod(podInfo: any) {
    return await Pod.create(podInfo);
  }

  static async findPodByIp(ip: string) {
    const result = await Pod.findOne({ podIp: ip });
    return result;
  }

  static async findPodByPodName(podName: string) {
    return await Pod.findOne({ podName: podName });
  }
}
