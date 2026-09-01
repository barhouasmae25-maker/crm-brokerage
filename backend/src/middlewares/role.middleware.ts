export const isManager = (req: any, res: any, next: any) => {
  if (req.user.role !== "MANAGER") {
    return res.status(403).json({ message: "MANAGER only" });
  }
  next();
};