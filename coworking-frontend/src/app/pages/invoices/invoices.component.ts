import { Component, OnInit } from '@angular/core';
import { CoworkingService } from '../../services/coworking.service';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-invoices',
  templateUrl: './invoices.component.html',
  styleUrls: ['./invoices.component.scss']
})
export class InvoicesComponent implements OnInit {
  payments: any[] = [];

  constructor(private coworkingService: CoworkingService) {}

  ngOnInit(): void {
    this.coworkingService.getMyPayments().subscribe({
      next: (data) => this.payments = data,
      error: (err) => console.error('Failed to load invoices:', err)
    });
  }

  downloadPDF(payment: any): void {
    const doc = new jsPDF();
    const booking = payment.booking;
    const date = new Date(payment.payment_date).toLocaleString();
    const start = new Date(booking.start_time).toLocaleString();
    const end = new Date(booking.end_time).toLocaleString();

    doc.setFontSize(16);
    doc.text('INVOICE', 20, 20);
    doc.setFontSize(12);
    doc.text(`Date: ${date}`, 20, 30);
    doc.text(`Customer: ${booking.customer_name}`, 20, 40);
    doc.text(`Coworking Space: ${booking.coworking_space_info.name}`, 20, 50);
    doc.text(`Start: ${start}`, 20, 60);
    doc.text(`End: ${end}`, 20, 70);
    doc.text(`Total Paid: €${payment.amount}`, 20, 80);
    doc.text(`Payment Method: ${payment.payment_method}`, 20, 90);

    doc.setFontSize(10);
    doc.text('Thank you for using our service!', 20, 110);

    doc.save(`invoice_${payment.id}.pdf`);
  }
}
