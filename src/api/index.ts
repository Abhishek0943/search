import { API_URL } from '../constants/values';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ApiResponse<T> = T | ErrorResponse

export async function postApiCall<T>(
  url: string,
  body: object | FormData,
  opts: { as?: 'json' | 'form'; timeoutMs?: number } = {}
): Promise<ApiResponse<T>> {
  const { as = 'json', timeoutMs = 30000 } = opts;
  const token = await AsyncStorage.getItem("token")

  const isForm = as === 'form';
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const headers: Record<string, string> = {
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),

    };

    if (!isForm) {
      headers['Content-Type'] = 'application/json';
    }
    console.log(`${API_URL}${url}`)
    const res = await fetch(`${API_URL}${url}`, {
      method: 'POST',
      headers,
      body: isForm ? (body as FormData) : JSON.stringify(body),
      signal: controller.signal,
    });
    const text = await res.text(); // <-- better than res.json() first
    console.log(text)
    let data: any = null;
    try { data = text ? JSON.parse(text) : null; } catch { data = text; }

    if (!res.ok) {
      console.log('API ERROR:', res.status, data);
      return { success: false, message: data?.message ?? res.statusText,  };
    }

    return data;
  } catch (err: any) {
    console.log(err)

    return {
      success: false,
      message: err?.message ?? 'Network Error',
    } as ErrorResponse;
  }
}
export async function putApiCall<T>(
  url: string,
  body: object | FormData,
  opts: { as?: 'json' | 'form' } = {}
): Promise<ApiResponse<T>> {
  const { as = 'json' } = opts;
  const token = await AsyncStorage.getItem("token")

  const isForm = as === 'form';

  try {
    const headers: Record<string, string> = {
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),

    };

    if (!isForm) {
      headers['Content-Type'] = 'application/json';
    }

    const res = await fetch(`${API_URL}${url}`, {
      method: 'PUT',
      headers,
      body: isForm ? (body as FormData) : JSON.stringify(body),
    });

    const data = await res.json().catch(() => null);
    if (!res.ok) {
      const message = (data as any)?.message ?? res.statusText;
      return { success: false, message } as ErrorResponse;
    }
    return data as T;
  } catch (err: any) {
    return {
      success: false,
      message: err?.message ?? 'Network Error',
    } as ErrorResponse;
  }
}
export async function patchApiCall<T>(
  url: string,
  body: object,
): Promise<ApiResponse<T>> {
  try {
    const token = await AsyncStorage.getItem("token")

    const res = await fetch(`${API_URL}${url}`, {
      method: 'PATCH',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),

      },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      const message = (data as any)?.message ?? res.statusText;
      return { success: false, message } as ErrorResponse;
    }
    return data as T;
  } catch (err: any) {
    return {
      success: false,
      message: err?.message ?? 'Network Error',
    } as ErrorResponse;
  }
}
export async function getApiCall<T>(url: string): Promise<ApiResponse<T>> {
  try {
    const token = await AsyncStorage.getItem("token")
    const res = await fetch(`${API_URL}${url}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        Authorization: `Bearer ${token}`
      },
    })
    const data = await res.json().catch(() => null)
    if (!res.ok) {
      const msg = data?.message ?? res.statusText
      return { success: false, message: msg }
    }
    return data as T
  } catch (err: any) {
    return {
      success: false,
      message: err?.message ?? 'Network Error',
    }
  }
}
export async function deleteApiCall<T>(url: string): Promise<ApiResponse<T>> {
  try {
    const token = await AsyncStorage.getItem("token")
    const res = await fetch(`${API_URL}${url}`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
        Authorization: `Bearer ${token}`
      },
    })
    const data = await res.json().catch(() => null)
    if (!res.ok) {
      const msg = data?.message ?? res.statusText
      return { success: false, message: msg }
    }
    return data as T
  } catch (err: any) {
    return {
      success: false,
      message: err?.message ?? 'Network Error',
    }
  }
}
