export interface FreeResource {
  id: string;
  order: number;
  category: string;
  title: string;
  description: string;
  detailDescription: string;
  images: string[];
  driveUrl: string;
}

export const RESOURCE_CATEGORIES = [
  "Brush",
  "Font",
  "Procreate",
  "Template",
  "Texture",
  "Khác",
] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

export function createEmptyResource(): FreeResource {
  return {
    id: crypto.randomUUID(),
    order: 0,
    category: "Khác",
    title: "",
    description: "",
    detailDescription: "",
    images: [],
    driveUrl: "",
  };
}

export function normalizeResources(input: unknown): FreeResource[] {
  if (!Array.isArray(input)) return [];

  const normalized = input
    .map((item, index): FreeResource | null => {
      if (!isRecord(item)) return null;

      const order =
        typeof item.order === "number" && Number.isFinite(item.order)
          ? item.order
          : index;
      const category =
        typeof item.category === "string" && item.category.trim().length > 0
          ? item.category
          : "Khác";
      const title = typeof item.title === "string" ? item.title : "";
      const description = typeof item.description === "string" ? item.description : "";
      const detailDescription =
        typeof item.detailDescription === "string"
          ? item.detailDescription
          : description;
      const images = Array.isArray(item.images)
        ? item.images.filter((image): image is string => typeof image === "string" && image.trim().length > 0)
        : [];
      const fallbackImage =
        typeof item.image === "string"
          ? item.image
          : typeof item.previewImage === "string"
            ? item.previewImage
            : "";
      const driveUrl =
        typeof item.driveUrl === "string"
          ? item.driveUrl
          : typeof item.url === "string"
            ? item.url
            : "";
      const id =
        typeof item.id === "string" && item.id.trim().length > 0
          ? item.id
          : `resource-${index}`;
      const normalizedImages = images.length > 0 ? images : fallbackImage ? [fallbackImage] : [];

      if (!title && !description && !driveUrl && normalizedImages.length === 0) {
        return null;
      }

      return {
        id,
        order,
        category,
        title,
        description,
        detailDescription,
        images: normalizedImages,
        driveUrl,
      };
    })
    .filter((item): item is FreeResource => item !== null);

  return normalized
    .sort((a, b) => a.order - b.order)
    .map((resource, index) => ({
      ...resource,
      order: index,
    }));
}

export function reindexResources(resources: FreeResource[]): FreeResource[] {
  return resources.map((resource, index) => ({
    ...resource,
    order: index,
  }));
}
