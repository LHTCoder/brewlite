# Definition of Done (DoD) & Quy ước làm việc

## DoD cho một Issue / Pull Request
1. Code hoàn thành đúng tiêu chí chấp nhận (AC) của yêu cầu liên quan (ghi mã FR/NFR trong mô tả PR).
2. Có test: unit cho nghiệp vụ, integration cho API thay đổi, cập nhật E2E nếu đổi luồng UI.
3. `npm run lint`, `npm test`, `npm run build` pass ở local **và** CI xanh trên PR.
4. Không có secret, file `.env`, `node_modules`, `dist` trong commit.
5. Tài liệu được cập nhật cùng PR nếu thay đổi yêu cầu/sơ đồ/kiến trúc (SRS, `.puml` + `.svg`, ADR, traceability matrix) và nêu **lý do** trong mô tả PR.
6. Được ít nhất **1 thành viên khác review**; mọi comment đã xử lý.
7. Merge bằng **Create a merge commit** vào `main`; branch được xóa.

## DoD cho Sprint
- Sprint Goal đạt; tất cả issue trong Sprint ở cột Done hoặc được chuyển sang Sprint sau có lý do.
- Demo được trên môi trường chạy thật (Sprint 1: docker compose; Sprint 2: production URL).
- Sprint Review + Retrospective được ghi trong `docs/sprints/`.

## DoD cho Release (v1.0.0)
- CD pipeline xanh, smoke test production pass, tag `vX.Y.Z` + GitHub Release + release notes.
- README cho phép người ngoài nhóm chạy local, test, build, deploy, rollback.
- Video demo luồng end-to-end.
