import { describe, it, expect, beforeEach } from "vitest";
import { list, add } from "./resumeStore.js";

beforeEach(() => localStorage.clear());

describe("resumeStore", () => {
  it("空時回傳空陣列", () => {
    expect(list()).toEqual([]);
  });

  it("add 後 list 讀得到，最新在最前面", () => {
    add({ resumeId: "r1", filename: "a.pdf" });
    add({ resumeId: "r2", filename: "b.pdf" });
    const rows = list();
    expect(rows.map((r) => r.resumeId)).toEqual(["r2", "r1"]);
    expect(rows[0].uploadedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it("相同 resumeId 去重（保留最新一筆在前）", () => {
    add({ resumeId: "r1", filename: "a.pdf" });
    add({ resumeId: "r2", filename: "b.pdf" });
    add({ resumeId: "r1", filename: "a.pdf" });
    expect(list().map((r) => r.resumeId)).toEqual(["r1", "r2"]);
  });

  it("localStorage 內容毀損時 list 不丟例外", () => {
    localStorage.setItem("hr.uploadedResumes", "{ not json");
    expect(list()).toEqual([]);
  });
});
