export interface IRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface IRectScaledByWidth {
  x: number;
  y: number;
  width: number;
}

export class Rect implements Rect {
  public x: number;
  public y: number
  public width: number;
  public height: number;

  constructor(x: number, y: number, width: number, height: number) {
    this.x = x;
    this.y = y;
    this.width = width
    this.height = height;
  }
}

// Please note that it will have height after scaling
export class RectScaledByWidth {
  public x: number;
  public y: number
  public width: number;
  public height: number = 0;

  constructor(x: number, y: number, width: number) {
    this.x = x;
    this.y = y;
    this.width = width;
  }
}