import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const AUTH_COOKIE_NAME = "hanoi_session";
const protectedRoutes = ["/dashboard", "/levels", "/tournaments", "/profile"];
const adminRoutes = ["/admin"];
const authRoutes = ["/login", "/register"];

function base64UrlToUint8Array(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding = normalized.length % 4 === 0 ? "" : "=".repeat(4 - (normalized.length % 4));
  const binary = atob(normalized + padding);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

async function decodeSessionToken(token: string) {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    return null;
  }

  const [headerSegment, payloadSegment, signatureSegment] = token.split(".");
  if (!headerSegment || !payloadSegment || !signatureSegment) {
    return null;
  }

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"],
  );

  const valid = await crypto.subtle.verify(
    "HMAC",
    key,
    base64UrlToUint8Array(signatureSegment),
    encoder.encode(`${headerSegment}.${payloadSegment}`),
  );

  if (!valid) {
    return null;
  }

  const payload = JSON.parse(new TextDecoder().decode(base64UrlToUint8Array(payloadSegment))) as {
    exp?: number;
    role?: string;
  };

  if (payload.exp && payload.exp * 1000 < Date.now()) {
    return null;
  }

  return payload;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const session = token ? await decodeSessionToken(token) : null;

  const isProtected = protectedRoutes.some((route) => pathname.startsWith(route));
  const isAdmin = adminRoutes.some((route) => pathname.startsWith(route));
  const isAuthPage = authRoutes.some((route) => pathname.startsWith(route));

  if ((isProtected || isAdmin) && !session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAdmin && session?.role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (isAuthPage && session) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/levels/:path*", "/tournaments/:path*", "/profile/:path*", "/admin/:path*", "/login", "/register"],
};
