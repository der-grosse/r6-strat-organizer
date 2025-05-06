import fs from "fs";
import path from "path";

class ActiveStratClass {
  private path: string;
  private activeStrat: Strat | null;
  constructor() {
    this.activeStrat = null;
    this.path = path.join(process.cwd(), "data", "activeStrat.json");

    // Ensure directory exists
    const dir = path.dirname(this.path);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    if (!fs.existsSync(this.path)) {
      fs.writeFileSync(this.path, JSON.stringify(null));
    }
    this.readData();
  }

  private readData() {
    this.activeStrat = JSON.parse(fs.readFileSync(this.path, "utf-8"));
  }

  private writeData(): void {
    fs.writeFileSync(this.path, JSON.stringify(this.activeStrat, null, 2));
  }

  setActiveStrat(strat: Strat) {
    this.activeStrat = strat;
    this.writeData();
  }

  getActiveStrat() {
    return this.activeStrat;
  }
}

const ActiveStratDB = new ActiveStratClass();

export default ActiveStratDB;
