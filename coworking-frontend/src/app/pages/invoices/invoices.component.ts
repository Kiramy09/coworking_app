import { Component, OnInit } from '@angular/core';
import { CoworkingService } from '../../services/coworking.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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
      error: (err) => console.error('Erreur lors du chargement des paiements :', err)
    });
  }

  downloadPDF(payment: any): void {
    const doc = new jsPDF();
    const booking = payment.booking;
    const date = new Date(payment.payment_date).toLocaleString();
    const start = new Date(booking.start_time).toLocaleString();
    const end = new Date(booking.end_time).toLocaleString();

    // Titre
    doc.setFontSize(18);
    doc.setTextColor(33, 37, 41);
    doc.text('FACTURE COWO', 20, 20);

    // Info date et ID
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Date : ${date}`, 20, 30);
    doc.text(`Facture ID : #${payment.id}`, 20, 37);

    // Tableau détails
    autoTable(doc, {
      startY: 45,
      theme: 'grid',
      headStyles: { fillColor: [13, 110, 253] },
      styles: { fontSize: 11 },
      head: [['Détail', 'Information']],
      body: [
        ['Client', booking.customer_name],
        ['Espace coworking', booking.coworking_space_info.name],
        ['Adresse', booking.coworking_space_info.address || 'Non précisée'],
        ['Début', start],
        ['Fin', end],
        ['Méthode de paiement', payment.payment_method]
      ]
    });

    const finalY = (doc as any).lastAutoTable.finalY || 100;

    // Total
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text(`Total payé : €${payment.amount}`, 20, finalY + 15);

    // Footer
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('Merci pour votre confiance. À très bientôt sur COWO.', 20, finalY + 30);

    // Télécharger le PDF
    doc.save(`facture_${payment.id}.pdf`);
  }
}