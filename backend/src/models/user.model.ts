export interface User {
id: number;
email: string;
password: string;
role: "AGENT" | "MANAGER";
created_at: Date;
}
