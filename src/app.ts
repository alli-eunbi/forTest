import { watchEvent } from "./kubernetes-client/watch-event";
import { connectToDatabase } from "./mongoose/db";
import express, { Request, Response } from "express";
import { PodService } from "./mongoose/pods/pod-service";
import { EniService } from "./mongoose/eni/eni-service";
import { InstanceService } from "./mongoose/instance/instance-service";
const app = express();
const port = 3000;

// kubernetes api-watch
connectToDatabase();
watchEvent();

app.get("/pod", async (req: Request, res: Response) => {
  const ip = req.query?.ip as string;
  const pod = await PodService.findPodByIp(ip);
  const eni = await EniService.findByInstanceIp(pod?.hostIp);
  const instance = await InstanceService.findInstanceByInstanceId(
    eni[0]?.instanceId
  );
  res.send({ pod, eni, instance });
});

app.get("/pod/:podName", async (req: Request, res: Response) => {
  const podName = req.params.podName as string;
  const pod = await PodService.findPodByPodName(podName);
  const eni = await EniService.findByInstanceIp(pod?.hostIp);
  const instance = await InstanceService.findInstanceByInstanceId(
    eni[0]?.instanceId
  );
  res.send({ pod, eni, instance });
});

app.get("/pod/ip", (req, res) => {
  const start = req.query.start;
  const end = req.query.end;
  // TODO: 주어진 기간(start 및 end) 내에서 IP 주소를 기반으로 pod을 검색하고 결과를 반환하는 로직을 구현
  res.send(`Searching for pods with IP between ${start} and ${end}`);
});
app.get("/health", (req: any, res: any) => {
  res.send("healthy");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
