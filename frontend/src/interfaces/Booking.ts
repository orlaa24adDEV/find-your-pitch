import { Field } from "./Field";

export interface Booking {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  userId: number;
  fieldId: number;
  field?: Field;
  user?: { id: number; name: string; email: string };
  createdAt: string;
  updatedAt: string;
}
