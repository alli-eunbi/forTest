import * as k8s from "@kubernetes/client-node";
import { EC2 } from "aws-sdk";
require("dotenv").config();

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const kc = new k8s.KubeConfig();

kc.loadFromFile("src/kubeconfig");

const k8sApi = kc.makeApiClient(k8s.CoreV1Api);
const watch = new k8s.Watch(kc);

const main = async () => {
  try {
    const podsRes = await k8sApi.listNamespacedPod("default");
    // console.log(podsRes.body.items[0].status);s
    const items = podsRes.body.items;
    items.forEach((item) => {
      const podName = item.metadata?.name;
      const nameSpace = item.metadata?.namespace;
      const podIp = item.status?.podIP;
      const hostIp = item.status?.hostIP;
      // 여러 컨테이너가 파드에 속해있는 경우(배열 출력)
      const container = item.status?.containerStatuses;
      const nodeName = item.spec?.nodeName;
      console.log(container);
      if (hostIp) {
        eniInfo(hostIp);
      }
    });
  } catch (err) {
    console.error(err);
  }
};

async function eniInfo(nodeName: string): Promise<void> {
  const ec2 = new EC2({ region: "ap-northeast-2" });

  try {
    const params = {
      Filters: [
        {
          Name: "private-ip-address",
          Values: [nodeName],
        },
      ],
    };

    const data = await ec2.describeInstances(params).promise();

    if (!data.Reservations || data.Reservations.length === 0) {
      console.log("해당 인스턴스를 찾을 수 없습니다.");
      return;
    }

    const instanceList = data.Reservations[0].Instances;

    instanceList?.forEach((instance) => {
      console.log("instance Id:", instance.InstanceId);
      // 인스턴스의 네트워크 인터페이스 정보(ENI)를 가져옴
      const networkInterfaces = instance.NetworkInterfaces;
      if (networkInterfaces && networkInterfaces.length > 0) {
        // ENI ID와 프라이빗 IP 출력
        for (const eni of networkInterfaces) {
          console.log("ENI ID:", eni.NetworkInterfaceId);
          console.log("Private IP:", eni.PrivateIpAddress);
          console.log(
            "Primary IP:",
            eni.PrivateIpAddresses?.find((ip) => ip.Primary)?.PrivateIpAddress
          );
          console.log("Public IP:", eni.Association?.PublicIp);
        }
      }
    });
  } catch (err) {
    console.error("인스턴스 정보를 가져오는 중 오류 발생:", err);
  }
}

const watchEvent = async () => {
  try {
    const req = await watch.watch(
      "/api/v1/namespaces/default/pods",
      // optional query parameters can go here.
      {
        allowWatchBookmarks: true,
      },
      // callback is called for each received object.
      (type, apiObj, watchObj) => {
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
        console.log(apiObj);
      },
      // done callback is called if the watch terminates normally
      (err) => console.error(err)
    );
    await delay(5000);

    // // watch returns a request object which you can use to abort the watch.
    // req.abort();
  } catch (err) {
    console.error(err);
  }
};
main();

watchEvent();
