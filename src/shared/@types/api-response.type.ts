export interface IServiceHelper<T = any> {
  status: "successful" | "created" | "conflict" | "bad-request";
  message: string;
  meta?: any;
  data?: T;
}
