import * as k8s from "@kubernetes/client-node";
import { refinePodInfo } from "./refine-info";
import { PodService } from "../mongoose/pods/pod-service";
import { getEniInfo } from "../aws-sdk/get-eni";
require("dotenv").config();

const kc = new k8s.KubeConfig();

kc.loadFromFile("src/kubeconfig");

const watch = new k8s.Watch(kc);

export const watchEvent = async () => {
  try {
    const req = await watch.watch(
      "/api/v1/pods",
      // optional query parameters can go here.
      {
        allowWatchBookmarks: true,
      },
      // callback is called for each received object.
      async (type, apiObj, watchObj) => {
        if (type === "ADDED") {
          const pod = refinePodInfo(apiObj);
          await PodService.createPod(pod);
          //빠른 개발을 위해 아래 getEniInfo에 db 저장함수 일단 포함시킴.
          await getEniInfo(pod.hostIp);
        } else if (type === "MODIFIED") {
          const pod = refinePodInfo(apiObj);
          await PodService.createPod(pod);
          await getEniInfo(pod.hostIp);
        } else if (type === "DELETED") {
          // TODO: pod가 사라질때 해당 정보도 지울지?
        } else if (type === "BOOKMARK") {
          console.log(`bookmark: ${watchObj.metadata.resourceVersion}`);
        } else {
          console.log("unknown type: " + type);
        }
      },
      // done callback is called if the watch terminates normally
      (err) => console.error(err)
    );
  } catch (err) {
    console.error(err);
  }
};
