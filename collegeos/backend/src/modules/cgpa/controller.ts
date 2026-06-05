import type { Request, Response } from "express";
import { CgpaService } from "./service.js";

const service = new CgpaService();

export function getCgpaController(_req: Request, res: Response) {
  void service;
  res.status(200).json({ message: "cgpa placeholder" });
}
