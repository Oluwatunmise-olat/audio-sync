export interface IServiceHelper<T = any> {
  status: "successful" | "created" | "bad_request";
  message: string;
  meta?: any;
  data?: T;
}
