import { describe, it, expect, vi, beforeEach } from "vitest";
import { getHealth, getJobs, uploadResume, matchResume, chatAgent, login, logout, getMe } from "./api.js";

const jsonRes = (body, ok = true, status = 200) => ({
  ok,
  status,
  headers: { get: () => "application/json" },
  json: async () => body,
  text: async () => JSON.stringify(body),
});
const textRes = (body, ok = true, status = 200) => ({
  ok,
  status,
  headers: { get: () => "text/plain" },
  json: async () => {
    throw new Error("not json");
  },
  text: async () => body,
});

beforeEach(() => {
  global.fetch = vi.fn();
});

describe("api", () => {
  it("getHealth 打 /health", async () => {
    global.fetch.mockResolvedValue(jsonRes({ status: "UP" }));
    await getHealth();
    expect(global.fetch).toHaveBeenCalledWith("/health");
  });

  it("getJobs 打 /api/jobs 並回傳陣列", async () => {
    global.fetch.mockResolvedValue(jsonRes([{ id: "architect", title: "建築師", description: "x" }]));
    const jobs = await getJobs();
    expect(global.fetch).toHaveBeenCalledWith("/api/jobs");
    expect(jobs[0].id).toBe("architect");
  });

  it("uploadResume 用 POST + FormData 打 /api/resumes", async () => {
    global.fetch.mockResolvedValue(jsonRes({ resumeId: "r1", filename: "a.pdf" }));
    const file = new File(["x"], "a.pdf", { type: "application/pdf" });
    const out = await uploadResume(file);
    const [url, opts] = global.fetch.mock.calls[0];
    expect(url).toBe("/api/resumes");
    expect(opts.method).toBe("POST");
    expect(opts.body).toBeInstanceOf(FormData);
    expect(opts.body.get("file")).toBe(file);
    expect(out.resumeId).toBe("r1");
  });

  it("matchResume 組出正確 URL 與 POST", async () => {
    global.fetch.mockResolvedValue(jsonRes({ score: 78, reason: "ok" }));
    await matchResume("r 1", "architect");
    const [url, opts] = global.fetch.mock.calls[0];
    expect(url).toBe("/api/resumes/r%201/match?jobId=architect");
    expect(opts.method).toBe("POST");
  });

  it("chatAgent encode query 與 conversationId", async () => {
    global.fetch.mockResolvedValue(textRes("你好"));
    const out = await chatAgent("林敬堯的專長?", "c1");
    expect(global.fetch).toHaveBeenCalledWith(
      "/api/ai/rag/agent?query=%E6%9E%97%E6%95%AC%E5%A0%AF%E7%9A%84%E5%B0%88%E9%95%B7%3F&conversationId=c1",
    );
    expect(out).toBe("你好");
  });

  it("非 2xx + JSON body → throw body.error", async () => {
    global.fetch.mockResolvedValue(jsonRes({ error: "PDF 解析失敗" }, false, 500));
    await expect(uploadResume(new File(["x"], "a.pdf", { type: "application/pdf" }))).rejects.toThrow(
      "PDF 解析失敗",
    );
  });

  it("fetch reject（TypeError）→ throw 連線錯誤訊息", async () => {
    global.fetch.mockRejectedValue(new TypeError("Failed to fetch"));
    await expect(getJobs()).rejects.toThrow("無法連線後端 (localhost:8087)");
  });

  it("login 用 POST + URLSearchParams 打 /login", async () => {
    global.fetch.mockResolvedValue({ ok: true, status: 200 });
    await login("hr", "hr1234");
    const [url, opts] = global.fetch.mock.calls[0];
    expect(url).toBe("/login");
    expect(opts.method).toBe("POST");
    expect(opts.body).toBeInstanceOf(URLSearchParams);
    expect(opts.body.get("username")).toBe("hr");
    expect(opts.body.get("password")).toBe("hr1234");
  });

  it("login 帳密錯（res.ok=false）→ reject", async () => {
    global.fetch.mockResolvedValue({ ok: false, status: 401 });
    await expect(login("hr", "bad")).rejects.toThrow("帳號或密碼");
  });

  it("logout 用 POST 打 /logout", async () => {
    global.fetch.mockResolvedValue({ ok: true, status: 200 });
    await logout();
    const [url, opts] = global.fetch.mock.calls[0];
    expect(url).toBe("/logout");
    expect(opts.method).toBe("POST");
  });

  it("getMe 遇 401 → resolve null", async () => {
    global.fetch.mockResolvedValue({ status: 401, ok: false, headers: { get: () => "application/json" } });
    expect(await getMe()).toBeNull();
  });

  it("getMe 遇 200 → resolve { username, role }", async () => {
    global.fetch.mockResolvedValue(jsonRes({ username: "hr", role: "HR" }));
    const me = await getMe();
    expect(global.fetch).toHaveBeenCalledWith("/api/auth/me");
    expect(me).toEqual({ username: "hr", role: "HR" });
  });
});
