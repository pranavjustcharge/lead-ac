import Lead from "../model/lead.model";

export async function generateReferenceNumber(): Promise<string> {
  const today = new Date();
  const dateString = today.toISOString().split('T')[0].replace(/-/g, '');

  const count = await Lead.countDocuments({
    createdAt: {
      $gte: new Date(new Date().setHours(0, 0, 0, 0)),
      $lt: new Date(new Date().setHours(23, 59, 59, 999)),
    }
  });

  const paddedCount = (count + 1).toString().padStart(3, '0');
  return `LEAD-${dateString}-${paddedCount}`;
}
