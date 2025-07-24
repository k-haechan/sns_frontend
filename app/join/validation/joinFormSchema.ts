import { z } from "zod";
import { components } from "@/schema";

type JoinRequest = components["schemas"]["JoinRequest"];

export const joinFormSchema: z.ZodType<JoinRequest> = z.object({
  username: z.string()
    .min(3, { message: "아이디는 3자 이상이어야 합니다." })
    .max(50, { message: "아이디는 50자 이하여야 합니다." })
    .nonempty({ message: "아이디를 입력하세요." }),
  password: z.string()
    .min(8, { message: "비밀번호는 8자 이상이어야 합니다." })
    .max(30, { message: "비밀번호는 30자 이하여야 합니다." })
    .nonempty({ message: "비밀번호를 입력하세요." }),
  "real-name": z.string()
    .max(50, { message: "이름은 50자 이하여야 합니다." })
    .nonempty({ message: "이름을 입력하세요." }),
  email: z.string()
    .max(100, { message: "이메일은 100자 이하여야 합니다." })
    .nonempty({ message: "이메일을 입력하세요." })
    .email({ message: "올바른 이메일 형식이 아닙니다." })
});