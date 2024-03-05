export const refinePodInfo = (pod: any) => {
  const podName = pod.metadata?.name;
  const nameSpace = pod.metadata?.namespace;
  const podIp = pod.status?.podIP;
  const hostIp = pod.status?.hostIP;
  const nodeName = pod.spec?.nodeName;
  // 여러 컨테이너가 파드에 속해있는 경우(배열 출력)
  const containersStatuses = pod.status?.containerStatuses;
  const containers: any = [];
  if (containersStatuses) {
    containersStatuses.forEach((container: any) => {
      containers.push({
        name: container.name,
        image: container.image,
        status: container.started,
      });
    });
  }
  return {
    podName,
    nameSpace,
    podIp,
    hostIp,
    nodeName,
    containers,
  };
};
