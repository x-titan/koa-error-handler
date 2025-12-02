export type ErrorEvent<
  Err = any
> = {
  error: Err;
  status: number;
  body: any;
  type: string;

  meta: {
    accepts: string[];
    method: string;
    path: string;
  };
};

export type ErrorEventListener<Err = any> = (errorResponse: ErrorEvent<Err>) => void;

export interface ErrorHandlerOptions {
  /**
   * Format or normalize Error
   */
  prepare?: (error: any) => any;
  onerror?: ErrorEventListener;
  finalize?: ErrorEventListener;
  debug?: boolean;
}
