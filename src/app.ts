import * as k8s from "@kubernetes/client-node";
require("dotenv").config();

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const kc = new k8s.KubeConfig();

kc.loadFromFile("src/kubeconfig");

const k8sApi = kc.makeApiClient(k8s.CoreV1Api);

const main = async () => {
  try {
    const podsRes = await k8sApi.listNamespacedPod("default");
    console.log(podsRes.body);
    const items = podsRes.body.items;
    items.forEach((item) => console.log(item.status));
  } catch (err) {
    console.error(err);
  }
};

main();
