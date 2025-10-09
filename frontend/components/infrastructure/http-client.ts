// Infrastructure Layer - HTTP Client with Interceptors

/**
 * HTTP Client
 * Wrapper attorno a fetch con gestione errori, retry logic, interceptors
 */
export class HttpClient {
    private baseUrl: string
    private defaultHeaders: Record<string, string>
    private requestInterceptors: RequestInterceptor[] = []
    private responseInterceptors: ResponseInterceptor[] = []
    private defaultRetry: number

    constructor(baseUrl: string = '', defaultRetry: number = 3) {
        this.baseUrl = baseUrl
        this.defaultRetry = defaultRetry
        this.defaultHeaders = {
            'Content-Type': 'application/json',
        }
    }

    /**
     * GET request
     */
    async get<T>(url: string, options?: RequestOptions): Promise<T> {
        return this.request<T>('GET', url, undefined, options)
    }

    /**
     * POST request
     */
    async post<T>(url: string, data?: any, options?: RequestOptions): Promise<T> {
        return this.request<T>('POST', url, data, options)
    }

    /**
     * PUT request
     */
    async put<T>(url: string, data?: any, options?: RequestOptions): Promise<T> {
        return this.request<T>('PUT', url, data, options)
    }

    /**
     * DELETE request
     */
    async delete<T>(url: string, options?: RequestOptions): Promise<T> {
        return this.request<T>('DELETE', url, undefined, options)
    }

    /**
     * Core request method con retry logic
     */
    private async request<T>(
        method: string,
        url: string,
        data?: any,
        options?: RequestOptions
    ): Promise<T> {
        const fullUrl = url.startsWith('http') ? url : `${this.baseUrl}${url}`
        
        let config: RequestInit = {
            method,
            headers: {
                ...this.defaultHeaders,
                ...options?.headers,
            },
            credentials: 'include', // Include cookies for CSRF
        }

        if (data) {
            config.body = JSON.stringify(data)
        }

        // Apply request interceptors
        for (const interceptor of this.requestInterceptors) {
            config = await interceptor(config)
        }

        // Retry logic - at least 1 attempt, then retry based on config
        const maxRetries = options?.retry ?? this.defaultRetry
        const totalAttempts = Math.max(1, maxRetries + 1) // +1 because first attempt is not a retry
        let lastError: Error | null = null

        for (let attempt = 0; attempt < totalAttempts; attempt++) {
            try {
                const response = await fetch(fullUrl, config)

                // Apply response interceptors
                let processedResponse = response
                for (const interceptor of this.responseInterceptors) {
                    processedResponse = await interceptor(processedResponse)
                }

                if (!processedResponse.ok) {
                    const errorData = await processedResponse.json().catch(() => ({}))
                    throw new HttpError(
                        errorData.message || `HTTP Error ${processedResponse.status}`,
                        processedResponse.status,
                        errorData
                    )
                }

                // Handle empty responses
                const contentType = processedResponse.headers.get('content-type')
                if (contentType && contentType.includes('application/json')) {
                    return await processedResponse.json()
                }

                return await processedResponse.text() as unknown as T
            } catch (error: any) {
                lastError = error

                // Don't retry on client errors (4xx)
                if (error instanceof HttpError && error.status >= 400 && error.status < 500) {
                    throw error
                }

                // Exponential backoff (only if we have more attempts left)
                if (attempt < totalAttempts - 1) {
                    await this.delay(Math.pow(2, attempt) * 1000)
                }
            }
        }

        throw lastError || new Error('Request failed after retries')
    }

    /**
     * Add request interceptor
     */
    addRequestInterceptor(interceptor: RequestInterceptor) {
        this.requestInterceptors.push(interceptor)
    }

    /**
     * Add response interceptor
     */
    addResponseInterceptor(interceptor: ResponseInterceptor) {
        this.responseInterceptors.push(interceptor)
    }

    /**
     * Delay helper for retry logic
     */
    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms))
    }
}

/**
 * HTTP Error Class
 */
export class HttpError extends Error {
    constructor(
        message: string,
        public readonly status: number,
        public readonly data?: any
    ) {
        super(message)
        this.name = 'HttpError'
    }
}

/**
 * Types
 */
export interface RequestOptions {
    headers?: Record<string, string>
    retry?: number
}

export type RequestInterceptor = (config: RequestInit) => Promise<RequestInit> | RequestInit
export type ResponseInterceptor = (response: Response) => Promise<Response> | Response
