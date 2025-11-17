// @ts-ignore
/* eslint-disable */
import { request } from "@umijs/max";

/** 此处后端没有提供注释 POST /auth/sign-in */
export async function signIn(
  body: API.SignInDto,
  options?: { [key: string]: any }
) {
  return request<any>("/auth/sign-in", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /auth/sign-out */
export async function signOut(options?: { [key: string]: any }) {
  return request<any>("/auth/sign-out", {
    method: "POST",
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /auth/sign-up */
export async function signUp(
  body: API.SignUpDto,
  options?: { [key: string]: any }
) {
  return request<any>("/auth/sign-up", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}
