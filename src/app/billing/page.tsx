"use client";

import { useEffect, useState } from "react";
import { Receipt, Plus, Search, Printer, DollarSign, CheckCircle2, Clock, CreditCard, Download, Eye } from "lucide-react";
import Modal from "@/components/ui/Modal";
import { formatCurrency, formatDate, getStatusBadgeClass } from "@/lib/utils";

interface Invoice {
  id: string;
  invoiceNumber: string;
  subtotal: number;
  taxAmount: number;
  discount: number;
  grandTotal: number;
  status: string;
  createdAt: string;
  customer: { id: string; name: string; phone: string; email: string; address?: string };
  jobCard?: { jobNumber: string; vehicle: { make: string; model: string; plateNumber: string } };
  items: any[];
  payments: any[];
}

export default function BillingPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [paymentNotes, setPaymentNotes] = useState("");

  const fetchInvoices = () => {
    setLoading(true);
    fetch("/api/billing")
      .then((res) => res.json())
      .then((data) => {
        setInvoices(Array.isArray(data) ? data : []);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleOpenPayment = (inv: Invoice) => {
    setSelectedInvoice(inv);
    const totalPaid = inv.payments.reduce((acc: number, p: any) => acc + p.amount, 0);
    const remaining = Math.max(0, inv.grandTotal - totalPaid);
    setPaymentAmount(String(remaining));
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;

    const res = await fetch("/api/billing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "RECORD_PAYMENT",
        invoiceId: selectedInvoice.id,
        paymentAmount: parseFloat(paymentAmount),
        paymentMethod,
        notes: paymentNotes,
      }),
    });

    if (res.ok) {
      setIsPaymentModalOpen(false);
      fetchInvoices();
    } else {
      const err = await res.json();
      alert(err.error || "Failed to record payment");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-on-surface tracking-tight">
            Billing & Invoices Management
          </h1>
          <p className="text-sm text-on-surface-variant">
            Generate GST invoices, record payment transactions, and print customer bills.
          </p>
        </div>
      </div>

      {/* Invoices List */}
      <div className="p-6 bg-surface-container-low border border-outline-variant/40 rounded-2xl shadow-lg">
        {loading ? (
          <div className="py-12 text-center text-on-surface-variant text-sm animate-pulse">
            Loading billing records...
          </div>
        ) : invoices.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <Receipt className="w-12 h-12 mx-auto text-on-surface-variant/50" />
            <p className="text-sm font-semibold text-on-surface">No invoices found</p>
            <p className="text-xs text-on-surface-variant">Generate an invoice directly from completed Job Cards.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-outline-variant/40 text-on-surface-variant uppercase text-[10px] tracking-wider bg-surface-container/60">
                  <th className="p-3.5 rounded-l-xl">Invoice #</th>
                  <th className="p-3.5">Customer Name</th>
                  <th className="p-3.5">Job Card & Vehicle</th>
                  <th className="p-3.5">Subtotal & Tax</th>
                  <th className="p-3.5">Grand Total</th>
                  <th className="p-3.5">Payment Status</th>
                  <th className="p-3.5 rounded-r-xl text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-surface-container-high/40 transition-colors">
                    <td className="p-3.5 font-bold text-primary">{inv.invoiceNumber}</td>
                    <td className="p-3.5 font-medium text-on-surface">{inv.customer?.name}</td>
                    <td className="p-3.5 text-on-surface-variant">
                      {inv.jobCard ? (
                        <span>
                          {inv.jobCard.jobNumber} ({inv.jobCard.vehicle.make} {inv.jobCard.vehicle.model})
                        </span>
                      ) : (
                        "Direct Billing"
                      )}
                    </td>
                    <td className="p-3.5 text-on-surface-variant">
                      Sub: ₹{inv.subtotal} | GST: ₹{inv.taxAmount}
                    </td>
                    <td className="p-3.5 font-black text-emerald-400 text-sm">
                      {formatCurrency(inv.grandTotal)}
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${getStatusBadgeClass(inv.status)}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right space-x-2">
                      {inv.status !== "PAID" && (
                        <button
                          onClick={() => handleOpenPayment(inv)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 font-semibold"
                        >
                          Record Payment
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setSelectedInvoice(inv);
                          setIsPrintModalOpen(true);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-surface-container-high border border-outline-variant/40 text-on-surface hover:text-primary font-semibold"
                      >
                        <Printer className="w-4 h-4 inline mr-1" /> View/Print
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Record Payment Modal */}
      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        title={`Record Payment for ${selectedInvoice?.invoiceNumber}`}
      >
        <form onSubmit={handlePaymentSubmit} className="space-y-4">
          <div className="p-3 rounded-xl bg-surface-container/60 border border-outline-variant/30 text-xs flex justify-between">
            <span className="text-on-surface-variant">Invoice Grand Total:</span>
            <strong className="text-emerald-400 font-bold">{formatCurrency(selectedInvoice?.grandTotal || 0)}</strong>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-on-surface-variant">Payment Amount (₹) *</label>
            <input
              type="number"
              required
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              className="w-full bg-surface-container-highest/60 border border-outline-variant/60 rounded-xl px-3 py-2 text-xs text-on-surface focus:outline-none focus:border-primary"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-on-surface-variant">Payment Method *</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full bg-surface-container-highest/60 border border-outline-variant/60 rounded-xl px-3 py-2 text-xs text-on-surface focus:outline-none focus:border-primary"
            >
              <option value="UPI" className="bg-surface-container-low">UPI / GooglePay / PhonePe</option>
              <option value="CASH" className="bg-surface-container-low">CASH</option>
              <option value="CARD" className="bg-surface-container-low">CREDIT / DEBIT CARD</option>
              <option value="BANK_TRANSFER" className="bg-surface-container-low">NET BANKING / NEFT</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-on-surface-variant">Transaction Ref / Notes</label>
            <input
              type="text"
              value={paymentNotes}
              onChange={(e) => setPaymentNotes(e.target.value)}
              placeholder="UPI Ref ID: 8931023912..."
              className="w-full bg-surface-container-highest/60 border border-outline-variant/60 rounded-xl px-3 py-2 text-xs text-on-surface focus:outline-none focus:border-primary"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsPaymentModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-surface-container-high text-on-surface text-xs font-semibold hover:bg-surface-bright"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-bold shadow-glow hover:opacity-95"
            >
              Confirm Payment Receipt
            </button>
          </div>
        </form>
      </Modal>

      {/* Printable PDF Invoice View Modal */}
      <Modal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        title="Official Invoice Preview"
        maxWidth="2xl"
      >
        {selectedInvoice && (
          <div className="space-y-6 bg-white text-gray-900 p-8 rounded-xl shadow-2xl font-sans" id="printable-invoice">
            {/* Header branding */}
            <div className="flex justify-between items-start border-b border-gray-200 pb-6">
              <div>
                <h1 className="text-2xl font-black text-gray-900 tracking-wider">SK CAR GARAGE</h1>
                <p className="text-xs text-gray-600">Plot 45, Auto Tech Park, Phase II, Mumbai</p>
                <p className="text-xs text-gray-600">Phone: +91 98765 43210 | GSTIN: 27AAACS1234F1Z5</p>
              </div>
              <div className="text-right">
                <h2 className="text-xl font-bold text-blue-600">TAX INVOICE</h2>
                <p className="text-xs font-mono font-bold text-gray-800">{selectedInvoice.invoiceNumber}</p>
                <p className="text-xs text-gray-500">Date: {formatDate(selectedInvoice.createdAt)}</p>
              </div>
            </div>

            {/* Customer & Vehicle Info */}
            <div className="grid grid-cols-2 gap-4 text-xs bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div>
                <p className="font-bold text-gray-500 uppercase tracking-wider text-[10px]">Billed To:</p>
                <p className="font-bold text-gray-900 text-sm">{selectedInvoice.customer?.name}</p>
                <p className="text-gray-600">{selectedInvoice.customer?.phone}</p>
                <p className="text-gray-600">{selectedInvoice.customer?.email}</p>
              </div>
              <div>
                <p className="font-bold text-gray-500 uppercase tracking-wider text-[10px]">Vehicle Details:</p>
                {selectedInvoice.jobCard ? (
                  <>
                    <p className="font-bold text-gray-900 text-sm">
                      {selectedInvoice.jobCard.vehicle.make} {selectedInvoice.jobCard.vehicle.model}
                    </p>
                    <p className="font-mono text-blue-600 font-bold">Plate: {selectedInvoice.jobCard.vehicle.plateNumber}</p>
                    <p className="text-gray-600">Job Card: {selectedInvoice.jobCard.jobNumber}</p>
                  </>
                ) : (
                  <p className="text-gray-600">Counter Sale</p>
                )}
              </div>
            </div>

            {/* Line Items Table */}
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-300 bg-gray-100 text-gray-700 font-bold uppercase text-[10px]">
                  <th className="py-2 px-3">Item Description</th>
                  <th className="py-2 px-3 text-center">Type</th>
                  <th className="py-2 px-3 text-center">Qty</th>
                  <th className="py-2 px-3 text-right">Unit Price</th>
                  <th className="py-2 px-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {selectedInvoice.items.map((item: any, idx: number) => (
                  <tr key={idx}>
                    <td className="py-2.5 px-3 font-semibold text-gray-900">{item.description}</td>
                    <td className="py-2.5 px-3 text-center text-gray-600">{item.type}</td>
                    <td className="py-2.5 px-3 text-center font-bold text-gray-800">{item.quantity}</td>
                    <td className="py-2.5 px-3 text-right text-gray-700">₹{item.unitPrice}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-gray-900">₹{item.totalPrice}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals Summary */}
            <div className="flex justify-end pt-4 border-t border-gray-200">
              <div className="w-64 space-y-2 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal:</span>
                  <span>₹{selectedInvoice.subtotal}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>GST (18%):</span>
                  <span>₹{selectedInvoice.taxAmount}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Discount:</span>
                  <span>-₹{selectedInvoice.discount}</span>
                </div>
                <div className="flex justify-between text-base font-black text-gray-900 pt-2 border-t border-gray-300">
                  <span>Grand Total:</span>
                  <span className="text-blue-600">₹{selectedInvoice.grandTotal}</span>
                </div>
              </div>
            </div>

            {/* Print Action Bar */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={handlePrint}
                className="px-5 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 shadow-md"
              >
                <Printer className="w-4 h-4 inline mr-1.5" /> Print Official PDF Invoice
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
