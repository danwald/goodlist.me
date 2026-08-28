import { describe, expect, it } from "vitest"
import { cn } from "@/lib/utils"

describe("cn", () => {
  it("joins simple class name strings", () => {
    expect(cn("a", "b")).toBe("a b")
  })

  it("drops falsy values", () => {
    expect(cn("a", false && "b", undefined, null, "", "c")).toBe("a c")
  })

  it("merges conflicting tailwind classes, keeping the last one", () => {
    expect(cn("px-2 py-1", "px-4")).toBe("py-1 px-4")
  })

  it("supports conditional object syntax", () => {
    expect(cn("base", { active: true, disabled: false })).toBe("base active")
  })

  it("supports arrays of class values", () => {
    expect(cn(["a", "b"], "c")).toBe("a b c")
  })

  it("returns an empty string when given nothing meaningful", () => {
    expect(cn()).toBe("")
    expect(cn(undefined, null, false)).toBe("")
  })
})
