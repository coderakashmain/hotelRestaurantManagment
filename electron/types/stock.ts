export interface ItemStock {
  id: number;
  name: string;
  sku?: string | null;

  quantity: number;
  reorder_level: number;
  unit_price: number;

  last_updated: string;
}
