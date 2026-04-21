import { addMonths, isBefore } from "date-fns";

export function getServiceStatus(lastServiceDate: Date | undefined) {
  if (!lastServiceDate) return { isOverdue: false, nextDate: null };

  const nextServiceDate = addMonths(new Date(lastServiceDate), 6);
  const isOverdue = isBefore(nextServiceDate, new Date());

  return {
    isOverdue,
    nextDate: nextServiceDate,
  };
}
