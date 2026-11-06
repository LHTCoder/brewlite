import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../users/user.entity';
import { AuthService } from './auth.service';

/** API-T03: unit test xác thực */
describe('AuthService', () => {
  let service: AuthService;
  const qb = {
    addSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    getOne: jest.fn(),
  };
  const repo = {
    findOne: jest.fn(),
    create: jest.fn((x) => x),
    save: jest.fn(async (x) => ({ id: 'u1', loyaltyPoints: 0, ...x })),
    createQueryBuilder: jest.fn(() => qb),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useValue: repo },
        { provide: JwtService, useValue: { sign: jest.fn(() => 'signed-token') } },
      ],
    }).compile();
    service = module.get(AuthService);
  });

  it('register tạo user mới với mật khẩu đã hash và trả token', async () => {
    repo.findOne.mockResolvedValue(null);
    const res = await service.register({
      email: 'An@Example.com',
      password: 'Secret@123',
      fullName: 'An',
    });
    expect(res.accessToken).toBe('signed-token');
    expect(res.user.email).toBe('an@example.com');
    const saved = repo.save.mock.calls[0][0];
    expect(saved.passwordHash).not.toBe('Secret@123');
    expect(await bcrypt.compare('Secret@123', saved.passwordHash)).toBe(true);
  });

  it('register từ chối email trùng', async () => {
    repo.findOne.mockResolvedValue({ id: 'exists' });
    await expect(
      service.register({ email: 'a@b.com', password: 'Secret@123', fullName: 'A' }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('login thành công với mật khẩu đúng', async () => {
    qb.getOne.mockResolvedValue({
      id: 'u1',
      email: 'a@b.com',
      role: 'CUSTOMER',
      fullName: 'A',
      loyaltyPoints: 5,
      passwordHash: await bcrypt.hash('Secret@123', 4),
    });
    const res = await service.login({ email: 'a@b.com', password: 'Secret@123' });
    expect(res.accessToken).toBe('signed-token');
    expect(res.user.loyaltyPoints).toBe(5);
  });

  it('login thất bại với mật khẩu sai hoặc email không tồn tại', async () => {
    qb.getOne.mockResolvedValue({ passwordHash: await bcrypt.hash('other', 4) });
    await expect(service.login({ email: 'a@b.com', password: 'wrong' })).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    qb.getOne.mockResolvedValue(null);
    await expect(service.login({ email: 'x@b.com', password: 'wrong' })).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });
});
