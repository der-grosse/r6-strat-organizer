import fs from "fs";
import path from "path";

class StratsDBClass {
  private path: string;
  private data: Strat[] = [];

  constructor() {
    this.path = path.join(process.cwd(), "data", "strats.json");

    // Ensure directory exists
    const dir = path.dirname(this.path);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    if (!fs.existsSync(this.path)) {
      fs.writeFileSync(this.path, JSON.stringify([]));
    }
    this.readData();
  }

  private readData() {
    this.data = JSON.parse(fs.readFileSync(this.path, "utf-8"));
  }

  private writeData(): void {
    fs.writeFileSync(this.path, JSON.stringify(this.data, null, 2));
  }

  create(strat: Strat): void {
    this.data.push(strat);
    this.writeData();
  }

  list(): Strat[] {
    return this.data;
  }

  get(id: Strat["id"]): Strat | null {
    return this.data.find((strat) => strat.id === id) || null;
  }

  update(updatedStrat: Partial<Strat> & Pick<Strat, "id">): void {
    const index = this.data.findIndex((strat) => strat.id === updatedStrat.id);
    if (index === -1) throw new Error("Strat not found");
    this.data[index] = { ...this.data[index], ...updatedStrat };
    this.writeData();
  }

  delete(id: Strat["id"]): void {
    this.data = this.data.filter((strat) => strat.id !== id);
    this.writeData();
  }
}

const StratsDB = new StratsDBClass();

export default StratsDB;
