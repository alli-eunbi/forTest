import * as k8s from "@kubernetes/client-node";
import { getEniInfo } from "../aws-sdk/get-eni";
import { refinePodInfo } from "./refine-info";

const kc = new k8s.KubeConfig();

kc.loadFromFile("src/kubeconfig");

const k8sApi = kc.makeApiClient(k8s.CoreV1Api);

const getAllPods = async () => {
  try {
    const podsRes = await k8sApi.listPodForAllNamespaces();
    const items = podsRes.body.items;
    items.forEach((item) => {
      refinePodInfo(item);
      const hostIp = item.status?.hostIP;
      if (hostIp) {
        getEniInfo(hostIp);
      }
    });
  } catch (e) {
    console.error(e);
  }
};
