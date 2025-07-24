import { z } from "zod";
import { components } from "@/schema";

type LoginRequest = components["schemas"]["LoginRequest"];

export const loginFormSchema: z.ZodType<LoginRequest> = z.object({
  username: z.string()
    .min(3, { message: "아이디는 3자 이상이어야 합니다." })
    .max(50, { message: "아이디는 50자 이하여야 합니다." })
    .nonempty({ message: "아이디를 입력하세요." }),
  password: z.string()
    .min(8, { message: "비밀번호는 8자 이상이어야 합니다." })
    .max(30, { message: "비밀번호는 30자 이하여야 합니다." })
    .nonempty({ message: "비밀번호를 입력하세요." })
});