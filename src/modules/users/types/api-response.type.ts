export interface ApiResponse<T> {
  success: boolean;
  status: 'success' | 'error';
  message: string;
  data: T | null;
  meta: any;
  status_code: number;
}
