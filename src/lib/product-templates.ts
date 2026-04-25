export type ContentSectionId = "warranty" | "features" | "instructions";

export interface ProductContentTemplate {
  id: string;
  name: string;
  description: string;
  details: string;
  warranty: string;
  features: string[];
  instructions: string[];
  sectionOrder: ContentSectionId[];
}

export const DEFAULT_CONTENT_ORDER: ContentSectionId[] = ["warranty", "features", "instructions"];

export const CONTENT_SECTION_LABELS: Record<ContentSectionId, string> = {
  warranty: "Bảo hành",
  features: "Tính năng",
  instructions: "Cách thức mua",
};

export const DEFAULT_PRODUCT_CONTENT_TEMPLATES: ProductContentTemplate[] = [
  {
    id: "app-ios",
    name: "App iOS",
    description: "Dùng cho các app cần giữ tài khoản ổn định trên thiết bị cá nhân.",
    details: "Khi mua app sốp sẽ cấp tài khoản để khách đăng nhập và sử dụng theo đúng hướng dẫn.\nKhông tự ý đổi mật khẩu, xóa thiết bị hoặc chia sẻ tài khoản nếu chưa được hỗ trợ.",
    warranty: "Hỗ trợ văng: Khách không dùng thường xuyên có thể bị văng, khi hỗ trợ sẽ tính vào lượt này.\nHỗ trợ lớn: Trường hợp khách xóa app hoặc reset trắng máy làm mất app sẽ dùng lượt hỗ trợ lớn.\nMiễn trừ: Sốp miễn trừ trách nhiệm nếu khách làm sai so với **chính sách đã gửi**.",
    features: [
      "Tài liệu lưu độc lập qua iCloud của khách hoặc trên thiết bị cá nhân",
      "Có thể lưu thêm trên Drive để tăng tính an toàn lưu trữ",
    ],
    instructions: [
      "Sau thanh toán, sốp gửi tài khoản đăng nhập.",
      "Khách đăng nhập tài khoản vào app theo hướng dẫn.",
      "Giữ tài khoản trong máy và không tự ý đổi thông tin.",
    ],
    sectionOrder: ["warranty", "features", "instructions"],
  },
  {
    id: "office",
    name: "Office",
    description: "Phù hợp cho nhu cầu học tập, làm việc và lưu trữ tài liệu hằng ngày.",
    details: "Tài khoản được cấu hình theo gói đã chọn. Khách cần đăng nhập đúng email được cấp và không tự ý thay đổi thông tin bảo mật nếu chưa được hướng dẫn.",
    warranty: "Kích hoạt: Hỗ trợ kích hoạt sau khi đối soát thanh toán.\nĐổi lỗi: Hỗ trợ đổi nếu lỗi phát sinh từ tài khoản hoặc key.\nLưu ý: Các lỗi do khách tự đổi thông tin có thể không nằm trong chính sách bảo hành.",
    features: [
      "Sử dụng được các ứng dụng Office phổ biến",
      "Đồng bộ tài liệu theo chính sách của từng gói",
      "Hỗ trợ xử lý lỗi đăng nhập trong thời gian bảo hành",
    ],
    instructions: [
      "Nhận tài khoản hoặc key sau khi thanh toán.",
      "Đăng nhập đúng ứng dụng và thiết bị theo hướng dẫn.",
      "Liên hệ sốp nếu gặp lỗi, không tự reset hoặc đổi thông tin.",
    ],
    sectionOrder: ["features", "instructions", "warranty"],
  },
  {
    id: "software-key",
    name: "Key phần mềm",
    description: "Dành cho khách cần kích hoạt phần mềm nhanh, rõ điều kiện và dễ kiểm tra.",
    details: "Key chỉ dùng theo đúng phiên bản và khu vực được ghi trong mô tả sản phẩm. Khách nên kiểm tra kỹ thiết bị trước khi kích hoạt.",
    warranty: "Bảo hành key: Hỗ trợ đổi key nếu key lỗi ngay khi kích hoạt đúng hướng dẫn.\nKhông hỗ trợ: Không bảo hành nếu khách kích hoạt sai phần mềm, sai khu vực hoặc dùng lại key sau khi reset.\nBằng chứng: Cần gửi ảnh hoặc video lỗi để được xử lý nhanh.",
    features: [
      "Kích hoạt nhanh sau khi nhận key",
      "Thông tin gói và kỳ hạn được ghi rõ trước khi mua",
      "Hỗ trợ kiểm tra lỗi kích hoạt",
    ],
    instructions: [
      "Kiểm tra đúng phiên bản phần mềm cần kích hoạt.",
      "Nhập key theo hướng dẫn của sốp.",
      "Chụp lỗi và liên hệ ngay nếu kích hoạt không thành công.",
    ],
    sectionOrder: ["instructions", "warranty", "features"],
  },
];

export function normalizeContentOrder(value: unknown): ContentSectionId[] {
  const rawOrder = Array.isArray(value) ? value : DEFAULT_CONTENT_ORDER;
  const validOrder = rawOrder.filter(
    (item): item is ContentSectionId =>
      typeof item === "string" && DEFAULT_CONTENT_ORDER.includes(item as ContentSectionId)
  );

  return [...validOrder, ...DEFAULT_CONTENT_ORDER.filter((item) => !validOrder.includes(item))];
}

export function normalizeProductContentTemplates(value: unknown): ProductContentTemplate[] {
  if (!Array.isArray(value)) return DEFAULT_PRODUCT_CONTENT_TEMPLATES;

  const templates = value
    .map((item, index) => {
      if (!item || typeof item !== "object") return null;
      const raw = item as Record<string, unknown>;
      const name = String(raw.name || "").trim();
      if (!name) return null;

      return {
        id: String(raw.id || `template-${index + 1}`).trim(),
        name,
        description: String(raw.description || "").trim(),
        details: String(raw.details || "").trim(),
        warranty: String(raw.warranty || "").trim(),
        features: Array.isArray(raw.features)
          ? raw.features.filter((entry): entry is string => typeof entry === "string").map((entry) => entry.trim()).filter(Boolean)
          : [],
        instructions: Array.isArray(raw.instructions)
          ? raw.instructions.filter((entry): entry is string => typeof entry === "string").map((entry) => entry.trim()).filter(Boolean)
          : [],
        sectionOrder: normalizeContentOrder(raw.sectionOrder),
      };
    })
    .filter((item): item is ProductContentTemplate => !!item);

  return templates.length > 0 ? templates : DEFAULT_PRODUCT_CONTENT_TEMPLATES;
}
