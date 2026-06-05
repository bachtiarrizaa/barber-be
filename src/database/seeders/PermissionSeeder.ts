import type { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import { Permission } from '../../modules/permissions/entities/permission.entity';

interface PermissionChild {
  name: string;
  actionCode: string;
  description?: string;
}

interface PermissionGroup {
  name: string;
  description?: string;
  children: PermissionChild[];
}

const permissionGroups: PermissionGroup[] = [
  {
    name: 'Products Menu',
    description: 'Akses menu manajemen produk',
    children: [
      {
        name: 'Lihat Produk',
        actionCode: 'products:read',
        description: 'Melihat daftar dan detail produk',
      },
      {
        name: 'Tambah Produk',
        actionCode: 'products:create',
        description: 'Menambahkan produk baru',
      },
      {
        name: 'Edit Produk',
        actionCode: 'products:update',
        description: 'Mengubah data produk',
      },
      {
        name: 'Hapus Produk',
        actionCode: 'products:delete',
        description: 'Menghapus produk',
      },
    ],
  },

  {
    name: 'Treatments Menu',
    description: 'Akses menu manajemen treatment / layanan',
    children: [
      {
        name: 'Lihat Treatment',
        actionCode: 'treatments:read',
        description: 'Melihat daftar dan detail treatment',
      },
      {
        name: 'Tambah Treatment',
        actionCode: 'treatments:create',
        description: 'Menambahkan treatment baru',
      },
      {
        name: 'Edit Treatment',
        actionCode: 'treatments:update',
        description: 'Mengubah data treatment',
      },
      {
        name: 'Hapus Treatment',
        actionCode: 'treatments:delete',
        description: 'Menghapus treatment',
      },
    ],
  },

  {
    name: 'Vouchers Menu',
    description: 'Akses menu manajemen voucher',
    children: [
      {
        name: 'Lihat Voucher',
        actionCode: 'vouchers:read',
        description: 'Melihat daftar dan detail voucher',
      },
      {
        name: 'Tambah Voucher',
        actionCode: 'vouchers:create',
        description: 'Menambahkan voucher baru',
      },
      {
        name: 'Edit Voucher',
        actionCode: 'vouchers:update',
        description: 'Mengubah data voucher',
      },
      {
        name: 'Hapus Voucher',
        actionCode: 'vouchers:delete',
        description: 'Menghapus voucher',
      },
    ],
  },
];

export class PermissionSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    for (const group of permissionGroups) {
      let parent = await em.findOne(Permission, { name: group.name });
      if (!parent) {
        parent = em.create(Permission, {
          name: group.name,
          description: group.description ?? null,
          actionCode: null,
          parent: null,
        });
        await em.flush();
      }

      for (const child of group.children) {
        const exists = await em.findOne(Permission, {
          actionCode: child.actionCode,
        });

        if (!exists) {
          em.create(Permission, {
            name: child.name,
            actionCode: child.actionCode,
            description: child.description ?? null,
            parent,
          });
        }
      }
      await em.flush();
    }
  }
}
