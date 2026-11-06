# ADR-004: TypeORM với migration thủ công, không synchronize

- **Trạng thái:** Accepted
- **Bối cảnh:** Cần schema tái tạo được (đề bài §7.2), chạy an toàn trong pipeline CD (§7.3), và entity khớp class diagram (Task 2.3).
- **Quyết định:** Dùng **TypeORM 0.3** với entity decorator; `synchronize: false`; schema chỉ đổi qua file migration SQL trong `src/database/migrations` (review trong PR). Migration được biên dịch cùng app và chạy bởi `dist/database/migrate.js` trong `docker-entrypoint.sh` **trước** khi API start; mỗi migration trong transaction riêng; thất bại → container exit ≠ 0 → Render không chuyển traffic sang bản mới (deploy fail, bản cũ vẫn chạy). Seed tách riêng, idempotent.
- **Phương án đã cân nhắc:** Prisma (schema-first, DX tốt nhưng cần tải engine binary và mapping entity ↔ class diagram gián tiếp); `synchronize: true` (nhanh nhưng nguy hiểm ở production).
- **Hệ quả:** (+) Lịch sử schema rõ ràng, rollback bằng `migration:revert`. (−) Phải viết migration tay khi đổi entity (có `migration:generate` hỗ trợ).
