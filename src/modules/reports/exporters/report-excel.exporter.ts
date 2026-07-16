import * as ExcelJS from 'exceljs';
import { RevenueReportRow } from '../interfaces/revenue-report.interfaces';
import { BarberPerformanceRow } from '../interfaces/barber-performance-report.interfaces';
import { TopItemsRow } from '../interfaces/top-items-report.interfaces';
import { ITransaction } from '../../transactions/entities/transaction.entity';

export function generateReportExcel(params: {
  timezone: string;
  revenueRows: RevenueReportRow[];
  barberRows: BarberPerformanceRow[];
  topItemsRows: TopItemsRow[];
  transactions: ITransaction[];
}): ExcelJS.Workbook {
  const { timezone, revenueRows, barberRows, topItemsRows, transactions } = params;

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Barbershop Report System';
  workbook.created = new Date();

  // ── Sheet 1: Revenue ──────────────────────────────────────────────────
  const revenueSheet = workbook.addWorksheet('Revenue');
  revenueSheet.columns = [
    { header: 'Periode', key: 'period', width: 15 },
    { header: 'Total Revenue', key: 'totalRevenue', width: 20 },
    { header: 'Total Service', key: 'totalServiceAmount', width: 20 },
    { header: 'Total Produk', key: 'totalProductAmount', width: 20 },
    { header: 'Jumlah Transaksi', key: 'transactionCount', width: 18 },
  ];
  styleHeaderRow(revenueSheet);
  revenueRows.forEach((row) => revenueSheet.addRow(row));

  // ── Sheet 2: Barber Performance ───────────────────────────────────────
  const barberSheet = workbook.addWorksheet('Barber Performance');
  barberSheet.columns = [
    { header: 'Barber ID', key: 'barberId', width: 38 },
    { header: 'Nama Barber', key: 'barberName', width: 25 },
    { header: 'Total Revenue', key: 'totalRevenue', width: 20 },
    { header: 'Jumlah Transaksi', key: 'transactionCount', width: 18 },
    {
      header: 'Komisi Service',
      key: 'serviceCommissionAmount',
      width: 20,
    },
    {
      header: 'Komisi Produk',
      key: 'productCommissionAmount',
      width: 20,
    },
    {
      header: 'Total Komisi',
      key: 'totalCommissionAmount',
      width: 20,
    },
  ];
  styleHeaderRow(barberSheet);
  barberRows.forEach((row) => barberSheet.addRow(row));

  // ── Sheet 3: Top Items ────────────────────────────────────────────────
  const topItemsSheet = workbook.addWorksheet('Top Items');
  topItemsSheet.columns = [
    { header: 'Item ID', key: 'itemId', width: 38 },
    { header: 'Nama Item', key: 'itemName', width: 30 },
    { header: 'Tipe Item', key: 'itemType', width: 15 },
    { header: 'Total Qty Terjual', key: 'totalQuantity', width: 18 },
    { header: 'Total Revenue', key: 'totalRevenue', width: 20 },
    { header: 'Jumlah Transaksi', key: 'transactionCount', width: 18 },
  ];
  styleHeaderRow(topItemsSheet);
  topItemsRows.forEach((row) => topItemsSheet.addRow(row));

  // ── Sheet 4: Transactions ─────────────────────────────────────────────
  const txSheet = workbook.addWorksheet('Transactions');
  txSheet.columns = [
    { header: 'ID Transaksi', key: 'id', width: 38 },
    { header: 'Tanggal Bayar', key: 'paidAt', width: 22 },
    { header: 'Barber', key: 'barberName', width: 25 },
    { header: 'Kasir', key: 'cashierName', width: 25 },
    { header: 'Customer', key: 'customerName', width: 25 },
    { header: 'Subtotal', key: 'subtotal', width: 18 },
    { header: 'Diskon', key: 'discountAmount', width: 15 },
    { header: 'Total', key: 'total', width: 18 },
    { header: 'Metode Bayar', key: 'paymentMethod', width: 18 },
    { header: 'Status', key: 'status', width: 18 },
  ];
  styleHeaderRow(txSheet);
  transactions.forEach((tx) => {
    txSheet.addRow({
      id: tx.id,
      paidAt: tx.paidAt
        ? new Date(tx.paidAt).toLocaleString('id-ID', {
            timeZone: timezone,
          })
        : '-',
      barberName: tx.barber?.name ?? '-',
      cashierName: tx.cashier?.name ?? '-',
      customerName: tx.customer?.name ?? '-',
      subtotal: tx.subtotal,
      discountAmount: tx.discountAmount,
      total: tx.total,
      paymentMethod: tx.paymentMethod,
      status: tx.status,
    });
  });

  return workbook;
}

function styleHeaderRow(sheet: ExcelJS.Worksheet): void {
  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1F4E79' },
  };
  headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
  headerRow.height = 18;
  headerRow.commit();
}
