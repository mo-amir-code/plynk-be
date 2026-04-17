import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Response } from 'express';
import { AssetController } from '../../modules/asset/asset.controller';
import prisma from '../../config/prisma';
import { OwnerType } from '../../generated/client/client';
import { AuthRequest } from '../../common/middleware/auth.middleware';

const createMockResponse = () => {
  const res = {} as any;
  res.wait = new Promise((resolve) => {
    res._resolve = resolve;
  });

  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockImplementation((data) => {
    res._resolve(data);
    return res;
  });
  return res;
};

const createMockNext = (res: any) => {
  return vi.fn().mockImplementation((err) => {
    res._resolve({ error: err });
  });
};

const createMockRequest = (overrides: Partial<AuthRequest>) => {
  return {
    params: {},
    query: {},
    body: {},
    ...overrides,
  } as AuthRequest;
};

describe('AssetController (Logic & DB Integration)', () => {
  let testUser: any;
  let testAdmin: any;

  beforeEach(async () => {
    testUser = await prisma.user.create({
      data: { email: `user-${Date.now()}@test.com`, passwordHash: 'pwd', role: 'USER', fullName: 'User' },
    });
    testAdmin = await prisma.user.create({
      data: { email: `admin-${Date.now()}@test.com`, passwordHash: 'pwd', role: 'ADMIN', fullName: 'Admin' },
    });
  });

  describe('uploadAsset()', () => {
    it('SUCCESS: should upload a file and create a DB record for USER', async () => {
      const req = createMockRequest({
        user: { id: testUser.id, role: OwnerType.USER } as any,
        file: { originalname: 'test.png', mimetype: 'image/png', buffer: Buffer.from('data') } as any,
      });
      const res = createMockResponse();
      const next = createMockNext(res);

      await AssetController.uploadAsset(req, res, next);
      await res.wait;

      if (next.mock.calls.length > 0) {
        console.error('Controller Error:', next.mock.calls[0][0]);
      }

      expect(res.status).toHaveBeenCalledWith(201);
      const asset = await prisma.asset.findFirst({ where: { uploadedBy: testUser.id } });
      expect(asset).toBeDefined();
    });

    it('ERROR: should return 400 if file is missing in request', async () => {
      const req = createMockRequest({ 
        user: { id: testUser.id, role: OwnerType.USER } as any,
        file: undefined 
      });
      const res = createMockResponse();
      const next = createMockNext(res);

      await AssetController.uploadAsset(req, res, next);
      await res.wait;

      expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400 }));
    });
  });

  describe('getDefaultAssets()', () => {
    it('SUCCESS: should return only assets where ownerType is ADMIN', async () => {
      await prisma.asset.create({ data: { url: 'sys.png', ownerType: OwnerType.ADMIN } });
      await prisma.asset.create({ data: { url: 'usr.png', ownerType: OwnerType.USER, uploadedBy: testUser.id } });

      const req = createMockRequest({ user: { id: testUser.id } as any });
      const res = createMockResponse();
      const next = createMockNext(res);

      await AssetController.getDefaultAssets(req, res, next);
      await res.wait;

      const result = (res.json as any).mock.calls[0][0].result;
      expect(res.status).toHaveBeenCalledWith(200);
      expect(result.every((a: any) => a.ownerType === 'ADMIN')).toBe(true);
    });
  });

  describe('deleteAsset()', () => {
    it('SUCCESS: should allow OWNER to delete their own asset', async () => {
      const asset = await prisma.asset.create({
        data: { url: 'del.png', ownerType: OwnerType.USER, uploadedBy: testUser.id }
      });
      const req = createMockRequest({ params: { id: asset.id }, user: { id: testUser.id, role: OwnerType.USER } as any });
      const res = createMockResponse();
      const next = createMockNext(res);

      await AssetController.deleteAsset(req, res, next);
      await res.wait;

      expect(res.status).toHaveBeenCalledWith(200);
      const exists = await prisma.asset.findUnique({ where: { id: asset.id } });
      expect(exists).toBeNull();
    });

    it('SUCCESS: should allow ADMIN to delete any user asset', async () => {
      const asset = await prisma.asset.create({
        data: { url: 'usr.png', ownerType: OwnerType.USER, uploadedBy: testUser.id }
      });
      const req = createMockRequest({ params: { id: asset.id }, user: { id: testAdmin.id, role: OwnerType.ADMIN } as any });
      const res = createMockResponse();
      const next = createMockNext(res);

      await AssetController.deleteAsset(req, res, next);
      await res.wait;

      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('SECURITY: should block USER from deleting someone elses asset', async () => {
      const otherUser = await prisma.user.create({
        data: { email: 'other@test.com', passwordHash: 'pwd', role: 'USER', fullName: 'Other' }
      });

      const asset = await prisma.asset.create({
        data: { url: 'other.png', ownerType: OwnerType.USER, uploadedBy: otherUser.id }
      });

      const req = createMockRequest({ 
        params: { id: asset.id }, 
        user: { id: testUser.id, role: OwnerType.USER } as any 
      });
      const res = createMockResponse();
      const next = createMockNext(res);

      await AssetController.deleteAsset(req, res, next);
      await res.wait;

      expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 403 }));
    });

    it('ERROR: should return 404 if asset ID does not exist', async () => {
      const req = createMockRequest({ 
        params: { id: '00000000-0000-0000-0000-000000000000' },
        user: { id: testUser.id } as any 
      });
      const res = createMockResponse();
      const next = createMockNext(res);

      await AssetController.deleteAsset(req, res, next);
      await res.wait;

      expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 404 }));
    });
  });
});
