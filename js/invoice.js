import { db, auth } from './firebase-config.js';
import { doc, getDoc } from 'firebase/firestore';
import { formatCurrency, formatDate } from '../utils/helpers.js';

export async function fetchInvoiceData(orderId) {
    try {
        const orderDoc = await getDoc(doc(db, 'orders', orderId));
        const order = orderDoc.data();
        
        const buyerDoc = await getDoc(doc(db, 'users', order.buyerId));
        const sellerDoc = await getDoc(doc(db, 'users', order.sellerId));
        const carDoc = await getDoc(doc(db, 'cars', order.carId));

        return {
            order,
            buyer: buyerDoc.data(),
            seller: sellerDoc.data(),
            car: carDoc.data()
        };
    } catch (error) {
        console.error(error);
        return null;
    }
}

export function downloadPDF(orderId, order, buyer, seller, car) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    doc.setFontSize(22);
    doc.text("CarKart Invoice", 20, 20);
    
    doc.setFontSize(12);
    doc.text(`Invoice ID: ${orderId}`, 20, 35);
    doc.text(`Date: ${formatDate(order.orderDate?.toDate())}`, 20, 42);
    
    doc.text("Buyer:", 20, 60);
    doc.text(buyer.name, 20, 67);
    doc.text(buyer.email, 20, 74);
    
    doc.text("Seller:", 120, 60);
    doc.text(seller.name, 120, 67);
    doc.text(seller.email, 120, 74);
    
    doc.line(20, 85, 190, 85);
    
    doc.text("Vehicle Details:", 20, 95);
    doc.text(car.title, 20, 105);
    doc.text(`${car.brand} ${car.model} (${car.year})`, 20, 112);
    
    doc.setFontSize(16);
    doc.text(`Total Price: ${formatCurrency(order.price)}`, 20, 130);
    
    doc.save(`CarKart_Invoice_${orderId}.pdf`);
}
