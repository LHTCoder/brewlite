# Quy ước đóng góp – BrewLite

## 1. Chiến lược branch (Git Flow rút gọn)

```
main  ──●──────●──────●──── (được bảo vệ, chỉ merge qua PR, CI phải xanh; mỗi merge = deploy production)
         \    /  \    /
feat/menu-page  fix/payment-retry   docs/srs-v1.1   chore/ci-cache
```

| Nhánh | Mục đích | Quy tắc |
|---|---|---|
| `main` | Mã nguồn sẵn sàng production | Protected: bắt buộc PR, status check `API`, `Web`, `E2E` pass, không push trực tiếp; thành viên khác review trước khi merge |
| `feat/<ten-ngan>` | Tính năng (kèm số issue nếu có: `feat/12-payment-idempotency`) | Tạo từ `main`, xóa sau merge |
| `fix/<ten>` | Sửa lỗi | như trên |
| `docs/<ten>` | Tài liệu/sơ đồ | như trên; mô tả PR nêu **lý do thay đổi** |
| `chore/<ten>` | CI, cấu hình, dependency | như trên |
| `release/vX.Y.Z` (tùy chọn) | Chuẩn bị release notes | tag `vX.Y.Z` trên `main` sau merge |

## 2. Pull Request

- Một PR = một issue, nhỏ (< 400 dòng thay đổi nếu có thể).
- Tiêu đề theo Conventional Commits (mục 3). Mô tả theo template `.github/pull_request_template.md`: **What / Why / How to test / Yêu cầu liên quan (FR-xx) / Tài liệu cập nhật**.
- CI tự chạy; **không merge khi lint/test/build đỏ** (branch protection chặn).
- Reviewer kiểm tra theo [Definition of Done](./docs/sprints/definition-of-done.md).
- Merge bằng *Create a merge commit* để giữ nguyên lịch sử commit của từng nhánh.

## 3. Quy ước commit (Conventional Commits)

```
<type>(<scope>): <mô tả ngắn, thì hiện tại, ≤ 72 ký tự>

[body – giải thích lý do, tham chiếu FR/NFR/ADR]
[footer – Closes #12]
```

| type | Dùng khi |
|---|---|
| `feat` | thêm tính năng (`feat(api): add POST /payments with idempotency key`) |
| `fix` | sửa lỗi |
| `docs` | tài liệu, sơ đồ, ADR |
| `test` | thêm/sửa test |
| `refactor` | đổi cấu trúc code không đổi hành vi |
| `chore` | CI/CD, Docker, dependency |
| `perf`, `style` | hiệu năng, format |

Scope: `api`, `web`, `docs`, `ci`, `db`, `e2e`.

## 4. Quy ước code

- TypeScript strict; ESLint + Prettier (`npm run lint`, `npm run format`).
- API: module theo domain, DTO có class-validator, không trả `passwordHash`, lỗi qua `HttpException`.
- Migration chỉ **additive**; tên `TIMESTAMP-MoTa.ts`; không sửa migration đã merge.
- Web: component nhỏ, logic tính tiền trong `lib/pricing.ts`, không gọi `fetch` ngoài `lib/api.ts`.
- Thêm `data-testid` cho phần tử E2E dùng.

## 5. Thay đổi yêu cầu / sơ đồ / kiến trúc

Mọi thay đổi trong `docs/` đi qua PR với nhãn `docs`, mô tả **lý do**; nếu đổi quyết định kiến trúc → thêm ADR mới (đánh dấu ADR cũ *Superseded*). Cập nhật `traceability-matrix.md` khi thêm FR/test.

## 6. Issue board

GitHub Projects (Kanban): Backlog → Sprint N → In progress → In review → Done. Nhãn: `sprint-1`, `sprint-2`, `type:feature|bug|docs|infra|test`, `priority:must|should|could`.
