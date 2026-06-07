import type { QuoteResult, PlacedComponent, QuoteItem } from '@/types';
import { getMaterialById, getDoorStyleById } from '@/data/materials';
import { allComponents } from '@/data/components';

export const calculateQuote = (components: PlacedComponent[]): QuoteResult => {
  let boardArea = 0;
  let boardPrice = 0;
  let doorPrice = 0;
  let shelfPrice = 0;
  const hardwareItems: QuoteItem[] = [];
  let hardwareTotal = 0;

  const hardwareMap = new Map<string, { name: string; count: number; price: number }>();

  components.forEach((comp) => {
    const template = allComponents.find((c) => c.id === comp.componentId);
    if (!template) return;

    const width = template.width * comp.scale.x;
    const height = template.height * comp.scale.y;
    const depth = template.depth * comp.scale.z;

    if (template.category === 'cabinet') {
      const sideArea = (depth * height * 2) / 1e6;
      const topBottomArea = (width * depth * 2) / 1e6;
      const backArea = (width * height) / 1e6;
      const shelfArea = (width * depth * Math.max(1, Math.floor(height / 400) - 1)) / 1e6;
      const area = sideArea + topBottomArea + backArea + shelfArea;
      boardArea += area;

      const material = getMaterialById(comp.materialId);
      const pricePerSqm = material?.pricePerSqm || 200;
      boardPrice += area * pricePerSqm;

      if (comp.doorStyleId && template.type !== 'corner') {
        const doorArea = (width * height) / 1e6;
        const doorStyle = getDoorStyleById(comp.doorStyleId);
        const multiplier = doorStyle?.priceMultiplier || 1.0;
        const doorMaterialPrice = doorArea * pricePerSqm * multiplier;
        doorPrice += doorMaterialPrice;
      }

      const railCount = Math.floor(height / 800);
      addHardware(hardwareMap, '挂衣杆', railCount, 60);

      const shelfCount = Math.floor(height / 400) - 1;
      if (shelfCount > 0) {
        shelfPrice += shelfCount * 80;
      }

      if (template.type !== 'corner') {
        const doorCount = Math.ceil(width / 400);
        addHardware(hardwareMap, '铰链', doorCount * 2, 35);
        addHardware(hardwareMap, '拉手', doorCount, 45);
      }
    }

    if (template.category === 'door') {
      const area = (width * height) / 1e6;
      const material = getMaterialById(comp.materialId);
      const basePrice = area * (material?.pricePerSqm || 300);

      const doorStyle = comp.doorStyleId ? getDoorStyleById(comp.doorStyleId) : null;
      const multiplier = doorStyle?.priceMultiplier || 1.0;
      doorPrice += basePrice * multiplier;
    }

    if (template.category === 'hardware') {
      addHardware(hardwareMap, template.name, 1, template.price);
    }

    if (template.category === 'shelf') {
      shelfPrice += template.price;
    }
  });

  hardwareMap.forEach((item) => {
    const total = item.count * item.price;
    hardwareItems.push({
      name: item.name,
      quantity: item.count,
      unit: '个',
      unitPrice: item.price,
      totalPrice: total,
    });
    hardwareTotal += total;
  });

  const materialCost = boardPrice + doorPrice + shelfPrice + hardwareTotal;
  const laborPrice = materialCost * 0.25;
  const totalPrice = materialCost + laborPrice;

  return {
    boardArea: Math.round(boardArea * 100) / 100,
    boardPrice: Math.round(boardPrice),
    doorPrice: Math.round(doorPrice),
    hardwareItems,
    hardwareTotal: Math.round(hardwareTotal),
    shelfPrice: Math.round(shelfPrice),
    laborPrice: Math.round(laborPrice),
    totalPrice: Math.round(totalPrice),
  };
};

const addHardware = (
  map: Map<string, { name: string; count: number; price: number }>,
  name: string,
  count: number,
  price: number
) => {
  if (count <= 0) return;
  const existing = map.get(name);
  if (existing) {
    existing.count += count;
  } else {
    map.set(name, { name, count, price });
  }
};

export const formatPrice = (price: number): string => {
  return `¥${price.toLocaleString('zh-CN')}`;
};
