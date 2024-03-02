import * as k8s from "@kubernetes/client-node";
require("dotenv").config();

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const kc = new k8s.KubeConfig();

kc.loadFromFile("src/kubeconfig.yaml");

const k8sApi = kc.makeApiClient(k8s.CoreV1Api);

// async function watchPods() {
//   const response = await k8sApi.listNamespacedPod("default");
//   const pods = response.body.items;

//   // 기존에 존재하는 Pod 목록 출력
//   console.log("Existing Pods:");
//   pods.forEach((pod) => {
//     console.log(pod.metadata?.name);
//   });

const watch = new k8s.Watch(kc);

const main = async () => {
  try {
    const req = await watch.watch(
      "/api/v1/namespaces",
      // optional query parameters can go here.
      {
        allowWatchBookmarks: true,
      },
      // callback is called for each received object.
      (type, apiObj, watchObj) => {
        console.log("=========== start ==========");

        console.log(type);
        if (type === "ADDED") {
          console.log("new object:");
        } else if (type === "MODIFIED") {
          console.log("changed object:");
        } else if (type === "DELETED") {
          console.log("deleted object:");
        } else if (type === "BOOKMARK") {
          console.log(`bookmark: ${watchObj.metadata.resourceVersion}`);
        } else {
          console.log("unknown type: " + type);
        }
        console.log("=========== end ==========");
      },
      // done callback is called if the watch terminates normally
      (err) => console.error(err)
    );
    await delay(5000);

    // watch returns a request object which you can use to abort the watch.
    req.abort();
  } catch (err) {
    console.error(err);
  }
};

main();
