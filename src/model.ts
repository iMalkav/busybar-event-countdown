import {
  str,
  num,
  duration,
  localDay,
  App,
  MINUTE,
  DAY,
  type Settings,
  type View,
} from "./lib.ts";

export class AppModel extends App {
  target = NaN;
  notified = false;
  constructor(s: Settings, saved: Settings, now: number) {
    super(s, saved, now);
    const date = str(s, "date");
    const time = str(s, "time", "09:00");
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
    if (m) {
      const plain = Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
      if (localDay(plain) === date) {
        const t = time.split(":").map(Number);
        this.target =
          plain +
          (t[0] * 60 + t[1]) * MINUTE +
          (t[2] || 0) * 1000 -
          num(s, "utc_offset") * MINUTE;
      }
    }
    this.notified = saved.target === this.target && saved.notified === true;
    if (this.target <= now) this.notified = true;
  }
  tick(now: number): void {
    if (Number.isFinite(this.target) && now >= this.target && !this.notified) {
      this.notified = true;
      this.notify("chime");
    }
  }
  save(): Settings {
    return {
      target: Number.isFinite(this.target) ? this.target : null,
      notified: this.notified,
    };
  }
  view(now: number): View {
    if (!Number.isFinite(this.target))
      return {
        title: str(this.settings, "title"),
        value: "SET DATE",
        rows: ["Open Setup", "Enter YYYY-MM-DD and time"],
      };
    const remaining = Math.max(0, this.target - now);
    const days = Math.floor(remaining / DAY);
    return {
      title: str(this.settings, "title"),
      value:
        remaining === 0
          ? "ARRIVED"
          : days > 0
            ? days + " DAYS"
            : duration(remaining),
      rows: [
        str(this.settings, "date") + " " + str(this.settings, "time"),
        days > 0 ? duration(remaining % DAY) + " remaining today" : "",
        this.notified ? "Event reached" : "Counting down",
      ],
      color: remaining === 0 ? "#77EE99FF" : "#55CCFFFF",
    };
  }
}
