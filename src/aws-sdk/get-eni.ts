import { EC2 } from "aws-sdk";
import { EniService } from "../mongoose/eni/eni-service";
import { ENIResult } from "./interface";
import { error } from "console";
import { InstanceService } from "../mongoose/instance/instance-service";

export async function getEniInfo(privateIp: string): Promise<void> {
  const ec2 = new EC2({ region: "ap-northeast-2" });

  try {
    const params = {
      Filters: [
        {
          Name: "private-ip-address",
          Values: [privateIp],
        },
      ],
    };

    const data = await ec2.describeInstances(params).promise();

    if (!data.Reservations || data.Reservations.length === 0) {
      console.log("해당 인스턴스를 찾을 수 없습니다.");
      return;
    }

    const instanceList = data.Reservations[0].Instances;

    instanceList?.forEach(async (instance) => {
      // 인스턴스의 네트워크 인터페이스 정보(ENI)를 가져옴
      const networkInterfaces = instance.NetworkInterfaces;

      if (networkInterfaces && networkInterfaces.length > 0) {
        // ENI ID와 프라이빗 IP 출력
        for (const eni of networkInterfaces) {
          const instanceId = instance.InstanceId;
          const eniId = eni.NetworkInterfaceId;
          const eniInfo = {
            instanceId,
            eniId,
            privateIp: eni.PrivateIpAddress,
            primaryIp: eni.PrivateIpAddresses?.find((ip) => ip.Primary)
              ?.PrivateIpAddress,
            publicIp: eni.Association?.PublicIp,
          };
          await EniService.create(eniInfo);
          await InstanceService.create({ instanceId, eniId });
        }
      }
      return;
    });
  } catch (err) {
    console.error("인스턴스 정보를 가져오는 중 오류 발생:", err);
  }
}
