import {
  customers,
  invoices,
  revenue,
} from './placeholder-data';
import {
  CustomerField,
  CustomersTableType,
  InvoiceForm,
  InvoicesTable,
  LatestInvoiceRaw,
  Revenue,
} from './definitions';
import { formatCurrency } from './utils';

export async function fetchRevenue() {
  try {
    // We artificially delay a response for demo purposes.
    // Don't do this in production :)
    console.log('Fetching revenue data...');
    await new Promise((resolve) => setTimeout(resolve, 3000));

    console.log('Data fetch completed after 3 seconds.');

    return revenue;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch revenue data.');
  }
}

export async function fetchLatestInvoices() {
  try {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    // Sort by date desc and take top 5
    const data = [...invoices]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);

    const latestInvoices = data.map((invoice) => {
      const customer = customers.find((c) => c.id === invoice.customer_id);
      return {
        id: invoice.id,
        name: customer?.name || '',
        image_url: customer?.image_url || '',
        email: customer?.email || '',
        amount: formatCurrency(invoice.amount),
      };
    });
    return latestInvoices;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch the latest invoices.');
  }
}

export async function fetchCardData() {
  try {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const numberOfInvoices = invoices.length;
    const numberOfCustomers = customers.length;
    
    const totalPaidInvoices = formatCurrency(
      invoices
        .filter((i) => i.status === 'paid')
        .reduce((acc, curr) => acc + curr.amount, 0)
    );
    const totalPendingInvoices = formatCurrency(
      invoices
        .filter((i) => i.status === 'pending')
        .reduce((acc, curr) => acc + curr.amount, 0)
    );

    return {
      numberOfCustomers,
      numberOfInvoices,
      totalPaidInvoices,
      totalPendingInvoices,
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch card data.');
  }
}

const ITEMS_PER_PAGE = 6;
export async function fetchFilteredInvoices(
  query: string,
  currentPage: number,
) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const filteredInvoices = invoices
      .filter((invoice) => {
        const customer = customers.find((c) => c.id === invoice.customer_id);
        const searchStr = `${customer?.name} ${customer?.email} ${invoice.amount} ${invoice.date} ${invoice.status}`.toLowerCase();
        return searchStr.includes(query.toLowerCase());
      })
      .map((invoice): InvoicesTable => {
        const customer = customers.find((c) => c.id === invoice.customer_id);
        return {
          id: invoice.id,
          customer_id: invoice.customer_id,
          name: customer?.name || '',
          email: customer?.email || '',
          image_url: customer?.image_url || '',
          date: invoice.date,
          amount: invoice.amount,
          status: invoice.status as 'pending' | 'paid',
        };
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(offset, offset + ITEMS_PER_PAGE);

    return filteredInvoices;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoices.');
  }
}

export async function fetchInvoicesPages(query: string) {
  try {
    const totalInvoices = invoices.filter((invoice) => {
      const customer = customers.find((c) => c.id === invoice.customer_id);
      const searchStr = `${customer?.name} ${customer?.email} ${invoice.amount} ${invoice.date} ${invoice.status}`.toLowerCase();
      return searchStr.includes(query.toLowerCase());
    }).length;

    const totalPages = Math.ceil(totalInvoices / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch total number of invoices.');
  }
}

export async function fetchInvoiceById(id: string) {
  try {
    const invoice = invoices.find((i) => i.id === id);
    if (!invoice) return undefined;

    return {
      id: invoice.id,
      customer_id: invoice.customer_id,
      amount: invoice.amount / 100,
      status: invoice.status as 'pending' | 'paid',
    } as InvoiceForm;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoice.');
  }
}

export async function fetchCustomers() {
  try {
    return customers.map((c) => ({ id: c.id, name: c.name })) as CustomerField[];
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch all customers.');
  }
}

export async function fetchFilteredCustomers(query: string) {
  try {
    const filteredCustomers = customers
      .filter((c) => {
        return c.name.toLowerCase().includes(query.toLowerCase()) || 
               c.email.toLowerCase().includes(query.toLowerCase());
      })
      .map((customer): CustomersTableType => {
        const customerInvoices = invoices.filter((i) => i.customer_id === customer.id);
        const total_pending = customerInvoices
          .filter((i) => i.status === 'pending')
          .reduce((acc, curr) => acc + curr.amount, 0);
        const total_paid = customerInvoices
          .filter((i) => i.status === 'paid')
          .reduce((acc, curr) => acc + curr.amount, 0);

        return {
          id: customer.id,
          name: customer.name,
          email: customer.email,
          image_url: customer.image_url,
          total_invoices: customerInvoices.length,
          total_pending: total_pending,
          total_paid: total_paid,
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name));

    return filteredCustomers;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch customer table.');
  }
}
