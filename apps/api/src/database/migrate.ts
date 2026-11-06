import 'reflect-metadata';
import AppDataSource from './data-source';

/**
 * Chạy migration bằng mã đã biên dịch (dist/database/migrate.js) – dùng trong container
 * production, không cần ts-node. Thoát mã khác 0 nếu lỗi để pipeline/entrypoint dừng lại.
 */
AppDataSource.initialize()
  .then(async (ds) => {
    const executed = await ds.runMigrations({ transaction: 'each' });
    if (executed.length === 0) console.log('✅ Database đã ở phiên bản mới nhất');
    else
      console.log(
        `✅ Đã chạy ${executed.length} migration: ${executed.map((m) => m.name).join(', ')}`,
      );
    await ds.destroy();
  })
  .catch((err) => {
    console.error('❌ Migration thất bại', err);
    process.exit(1);
  });
