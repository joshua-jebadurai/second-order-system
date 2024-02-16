export class SecondOrderDynamics {
  private xp: number; // previous input
  private y: number; // position
  private yd: number; // velocity
  private k1: number; // dynamics constant
  private k2: number; // dynamics constant
  private k3: number; // dynamics constant

  constructor(f: number, z: number, r: number, x0: number) {
    // compute constants
    this.k1 = z / (Math.PI * f);
    this.k2 = 1 / (2 * Math.PI * f * (2 * Math.PI * f));
    this.k3 = (r * z) / (2 * Math.PI * f);

    // initialize variables
    this.xp = x0;
    this.y = x0;
    this.yd = 0;
  }

  setup(f: number, z: number, r: number) {
    this.k1 = z / (Math.PI * f);
    this.k2 = 1 / (2 * Math.PI * f * (2 * Math.PI * f));
    this.k3 = (r * z) / (2 * Math.PI * f);
  }

  public update(T: number, x: number, xd?: number): number {
    if (xd === undefined) {
      // estimate velocity
      xd = (x - this.xp) / T;
      this.xp = x;
    }

    const k2_stable = Math.max(
      this.k2,
      (T * T) / 2 + (T * this.k1) / 2,
      T * this.k1
    ); // clamp k2 to guarantee stability

    this.y = this.y + T * this.yd; // integrate position by velocity
    this.yd =
      this.yd +
      (T * (x + this.k3 * xd - this.y - this.k1 * this.yd)) / k2_stable; // integrate velocity by acceleration

    return this.y;
  }
}
