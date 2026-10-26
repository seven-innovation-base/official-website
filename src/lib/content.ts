import { z } from "zod";

import departmentsRaw from "../../content/departments.json";
import membersRaw from "../../content/members.json";
import honorsRaw from "../../content/honors.json";
import siteConfigRaw from "../../content/site-config.json";

/* ---------------- Schema 定义 ---------------- */

const DepartmentSchema = z.object({
  id: z.string(),
  name: z.string(),
  short: z.string(),
  tagline: z.string(),
  image: z.string(),
  branches: z.array(z.string()),
  duty: z.string(),
  learn: z.array(z.string()),
  tools: z.array(z.string()),
  outcome: z.string(),
});

const MemberSchema = z.object({
  name: z.string(),
  role: z.string().optional(),
  description: z.string().optional(),
  avatar: z.string().optional(),
  github: z.string().optional(),
  blog: z.string().optional(),
  email: z.string().optional(),
});

const MembersGroupSchema = z.object({
  classOf: z.string(),
  memberList: z.array(MemberSchema),
});

const HonorSchema = z.object({
  names: z.array(z.string()),
  contest: z.string(),
  tags: z.array(z.string()),
});

const SiteConfigSchema = z.object({
  siteName: z.string(),
  fullName: z.string(),
  tagline: z.string(),
  foundedYear: z.number(),
  siteUrl: z.string(),
  qqGroup: z.string(),
  address: z.array(z.string()),
  video: z.object({
    title: z.string(),
    type: z.enum(["local", "embed"]),
    src: z.string().optional(),
    poster: z.string().optional(),
    platform: z.string().optional(),
    embedUrl: z.string().optional(),
    description: z.string(),
  }),
  oj: z.object({
    name: z.string(),
    url: z.string(),
    campusOnly: z.boolean(),
    problemCount: z.number(),
  }),
  comments: z.object({
    serverUrl: z.string(),
  }),
  analytics: z.object({
    baiduToken: z.string().optional(),
  }),
  ftp: z.object({
    files: z.number(),
    sizeGb: z.number(),
    partitions: z.number(),
  }),
  links: z.object({
    guet: z.string(),
    college: z.string(),
    github: z.string(),
    friends: z.array(z.object({ name: z.string(), url: z.string() })),
  }),
});

/* ---------------- 解析与导出 ---------------- */

export type Department = z.infer<typeof DepartmentSchema>;
export type Member = z.infer<typeof MemberSchema>;
export type MembersGroup = z.infer<typeof MembersGroupSchema>;
export type Honor = z.infer<typeof HonorSchema>;
export type SiteConfig = z.infer<typeof SiteConfigSchema>;

function parseOrThrow<T>(schema: z.ZodType<T>, data: unknown, source: string): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new Error(`content/${source} 数据校验失败: ${result.error.message}`);
  }
  return result.data;
}

export const departments: Department[] = parseOrThrow(
  DepartmentSchema.array(),
  departmentsRaw,
  "departments.json",
);

export const members: MembersGroup[] = parseOrThrow(MembersGroupSchema.array(), membersRaw, "members.json");

export const honors: Honor[] = parseOrThrow(HonorSchema.array(), honorsRaw, "honors.json");

export const siteConfig: SiteConfig = parseOrThrow(SiteConfigSchema, siteConfigRaw, "site-config.json");
