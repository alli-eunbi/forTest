export interface ENIInfo {
  eniId: string;
  privateIp: string;
  primaryIp?: string;
  publicIp?: string;
}

export interface ENIResult {
  ENIInfo;
  instanceId: string;
}

export interface Instance {
  instanceId: string;
  eniInfo: ENIInfo;
}
