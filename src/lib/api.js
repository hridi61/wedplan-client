"use client";
import { authClient } from "./auth-client";

export const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/$/, "");

export class ApiError extends Error {
  constructor(message, status, code) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

let cache = { token: null, exp: 0 };
export const clearToken = () => (cache = { token: null, exp: 0 });

async function getToken(force) {
  if (!force && cache.token && Date.now() < cache.exp) return cache.token;
  const { data, error } = await authClient.token();
  if (error || !data?.token) throw new ApiError("Your session has expired. Please sign in again.", 401);
  cache = { token: data.token, exp: Date.now() + 10 * 60 * 1000 };
  return cache.token;
}

export async function api(path, { method = "GET", body, auth = true } = {}, retried = false) {
  const headers = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (auth) headers.Authorization = `Bearer ${await getToken(retried)}`;

  let res;
  try {
    res = await fetch(`${API_URL}${path}`, { method, headers, body: body !== undefined ? JSON.stringify(body) : undefined });
  } catch {
    throw new ApiError("Cannot reach the server. Check your connection and try again.", 0);
  }
  const json = await res.json().catch(() => ({}));
  if (res.status === 401 && auth && !retried) return api(path, { method, body, auth }, true);
  if (!res.ok) throw new ApiError(json.message || "Request failed", res.status, json.code);
  return json;
}

export async function uploadImage(file) {
  if (!file.type.startsWith("image/")) throw new Error("Only image files are allowed");
  if (file.size > 5 * 1024 * 1024) throw new Error("Image must be smaller than 5MB");
  const form = new FormData();
  form.append("image", file);
  const res = await fetch("/api/upload", { method: "POST", body: form });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.message || "Image upload failed");
  return json.url;
}
