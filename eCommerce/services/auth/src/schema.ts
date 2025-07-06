import { z } from "zod";

export const UserCreateDTOSchema = z.object({
  name: z.string().min(3).max(255),
  email: z.string().email(),
  password: z.string().min(6).max(255),
});

export const UserLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).max(255),
});


export const AccessTokenSchema = z.object({ accessToken: z.string() });