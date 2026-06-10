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
  createdAt: string;
  updatedAt: string;
}
