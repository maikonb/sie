import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios"

export class ApiClient {
  private api: AxiosInstance

  constructor(config?: AxiosRequestConfig) {
    this.api = axios.create({
      baseURL: "/api",
      headers: {
        "Content-Type": "application/json",
      },
      ...config,
    })

    // Add response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        // Handle global errors here if needed
        return Promise.reject(error)
      }
    )
  }

  public async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.api.get(url, config)
    return response.data
  }

  public async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.api.post(url, data, config)
    return response.data
  }

  public async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.api.put(url, data, config)
    return response.data
  }

  public async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.api.patch(url, data, config)
    return response.data
  }

  public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.api.delete(url, config)
    return response.data
  }
}

export const apiClient = new ApiClient()
