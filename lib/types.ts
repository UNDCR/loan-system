export type LoanStatus = "Paid" | "Pending Payment" | "Grace" | "Cancelled" | "Penalty"

export interface LoanFormData {
  fullName: string
  email?: string
  phoneNumber: string
  idNumber: string
  street: string
  town: string
  province: string
  postalCode: string
  country: string
  quoteNumber: string
  loanStartDate: string
  firearmCost: string
  depositAmount: string
  loanAmount: string
  loanDuration: string
  interestRate: string
}

export interface LoanData {
  loanId: string
  customerId: string
  quoteNumber: string
  firearmCost: number
  depositAmount?: number
  loanAmount: number
  remainingAmount: number
  loanDuration: number
  loanCreatedAt: string
  daysActive: number
  loanProgress: number
  fullName: string
  email: string
  phoneNumber: string
  idNumber: string
  interestRate: number
  penaltyAmount?: number
  firearmDetails: FirearmFormData
  status: LoanStatus
}

export interface LoanSubmission extends LoanFormData {
  loanCreatedAt: string
  daysActive: number
  loanProgress: number
  remainingAmount: string
  status: LoanStatus
}

export interface FirearmFormData {
  makeModel: string
  stockNumber: string
  serialNumber: string
}

export interface FirearmData {
  makeModel: string
  stockNumber: string
  serialNumber: string
  dateAdded: string
  customerName: string
  customerId: string
}

export interface EnhancedFirearmData {
  id: string
  makeModel: string
  stockNumber: string
  serialNumber: string
  dateAdded: string
  bookedOut: boolean
  bookedOutDate: string | null
  customers: Array<{
    id: string
    name: string
    idNumber: string
    phoneNumber: string
    email: string
    address?: {
      streetName: string
      town: string
      province: string
      postalCode: string
      country: string
    } | null
  }>
  storage?: {
    id: string
    storageType: string
    credit: string
  } | null
  loans: Array<{
    id: string
    firearmCost: number | null
    quoteNumber: string | null
    loanAmount: number | null
    duration: string | null
    interest: string | null
    remainAmount: number | null
    depositAmount: number | null
    startDate: string
    status: string | null
    completed: boolean | null
    invoiceNumber: string | null
    customer?: {
      id: string
      name: string
      idNumber: string
      phoneNumber: string
      email: string
    } | null
    payment?: {
      id: string
      amount: string | null
      type: string | null
      date: string
    } | null
    penalty?: {
      id: string
      amount: string | null
      dateApplied: string | null
      reason: string | null
    } | null
  }>
}

export interface PaymentFormData {
  searchQuery: string
  paymentType: "EFT" | "Cash" | "Card"
  amount: string
  paymentDate: string
}

export interface PaymentData extends PaymentFormData {
  createdAt: string
}

export interface AddressData {
  id?: string
  streetName: string
  town: string
  province: string
  postalCode: string
  country: string
}

export interface ClientData {
  id?: string // Database UUID
  fullName: string
  email: string
  phoneNumber: string
  idNumber: string
  loansCount: number
  creditAmount?: number
  address?: AddressData
}

export type ClientResponse = {
  id: string;
  full_name: string;
  email: string;
  phone_number: string;
  id_number: string;
  created_at: string;
  firearm_id: string | null;
  customer_address_id: string | null;
  address: {
    id: string;
    street_name: string;
    town: string;
    province: string;
    postal_code: string;
    country: string;
    created_at: string;
  } | null;
};

export type CustomerRow = {
  credit_amount: number
  id: string;
  full_name: string | null;
  email: string | null;
  phone_number: string | null;
  id_number: string | null;
  address?: {
    id: string;
    street_name: string;
    town: string;
    province: string;
    postal_code: string;
    country: string;
    created_at: string;
  } | null;
  customer_address?: {
    id: string;
    street_name: string;
    town: string;
    province: string;
    postal_code: string;
    country: string;
    created_at: string;
  } | null;
};

export type Row = {
  id: string;
  make_model: string | null;
  stock_number: string | null;
  serial_number: string | null;
  created_at: string;
};

export type CreateLoanInput = {
  firearm_cost: number;
  loan_amount: number;
  duration: number;
  interest: number;
  deposit_amount?: number;
  start_date: string;
  customer_id: string;
  quote_number?: string;
  status: "Grace";
};

export type EnrichedLoan = {
  id: string;
  customer_id: string | null;
  quote_number: string | null;
  firearm_cost: number | null;
  deposit_amount: number | null;
  loan_amount: number | null;
  remain_amount: number | null;
  duration: string | null;
  interest: string | null;
  start_date: string;
  status: string | null;
  invoice_number?: string | null;
  customer?: {
    id: string | null;
    full_name: string | null;
    email: string | null;
    phone_number: string | null;
    id_number: string | null;
  } | null;
  customers?: {
    id: string | null;
    full_name: string | null;
    email: string | null;
    phone_number: string | null;
    id_number: string | null;
  } | null;
  firearm?: {
    id: string | null;
    make_model: string | null;
    stock_number: string | null;
    serial_number: string | null;
  } | null;
  firearms?: {
    id: string | null;
    make_model?: string | null;
    model?: string | null;
    stock_number?: string | null;
    serial_number?: string | null;
  } | null;
};

export type CreatePayment = {
  loan_id: string;
  payment_amount: number;
  payment_type: "EFT" | "Cash" | "Card";
  payment_date: string;
};

export type CreateCreditPayment = {
  customers_id: string;
  amount: number;
  payment_type: "EFT" | "Cash" | "Card";
};

export type CreditPaymentResponse = {
  message: string;
  customer_id: string;
  amount_credited: number;
  new_credit_balance: number;
};

export type Customer = ClientResponse;

export type Loan = {
  id: string;
  quote_number: string | null;
  loan_amount: number;
  remain_amount: number;
  duration: string | number | null;
  interest: string | number | null;
  status: string | null;
  completed?: boolean;
};

export type Firearm = {
  id: string;
  make_model: string;
  stock_number: string;
  serial_number: string;
  booked_out?: boolean;
};

export type PaymentListItem = {
  fullName: string;
  amount: number;
  createdAt: string; // ISO string
};

export interface LoanTrendPoint {
  month: string;
  loan_count: number;
  total_loan_value: number;
}

export type PendingItem = {
  fullName: string;
  status: LoanStatus;
  remainingAmount?: number;
};

export type LoanResponse = {
  id: string;
  firearm_cost: number;
  quote_number: string;
  loan_amount: number;
  duration: number;
  interest: number;
  remain_amount: number;
  deposit_amount: number;
  start_date: string;
  customer_id: string | null;
  loan_payment_id: string | null;
  status: string;
  completed: boolean;
  penalties_id: string | null;
  invoice_number: string;
  customer: {
    id: string;
    full_name: string;
    id_number: string;
    phone_number: string;
    email: string | null;
    created_at: string;
    firearm_id: string | null;
    customer_address_id: string | null;
  } | null;
  loan_payment: {
    id: string;
    payment_amount: number;
    payment_type: string;
    payment_date: string;
  } | null;
  penalty: {
    id: string;
    penaltie_amount: number;
    date_applied: string;
    created_at: string;
    reason: string;
  } | null;
};

export interface SearchCriteria {
  full_name?: string;
  id_number?: string;
  serial_number?: string;
  stock_number?: string;
  quote_number?: string;
  invoice_number?: string;
}

export interface SearchResult<T> {
  success: boolean;
  data?: T[];
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateClientData {
  id_number: string;
  full_name: string;
  phone_number: string;
  email?: string;
  street_name: string;
  town: string;
  province: string;
  postal_code: string;
  country: string;
}

export interface CreateClientRequest {
  full_name: string;
  id_number: string;
  phone_number: string;
  email?: string | null;
  address: {
    street_name: string;
    town: string;
    province: string;
    postal_code: string;
    country: string;
  };
}

export interface SubmitClientFormData {
  id: string;
  full_name?: string;
  id_number?: string | null;
  phone_number?: string | null;
  email?: string | null;
  address?: {
    id?: string | null;
    street_name: string;
    town: string;
    province?: string | null;
    postal_code?: string | null;
    country?: string | null;
  };
}

export type FirearmWithRelations = {
  id: string;
  make_model: string | null;
  stock_number: string | null;
  serial_number: string | null;
  created_at: string;
  booked_out: boolean | null;
  booked_out_date: string | null;
  customers?: Array<{
    id: string;
    full_name: string | null;
    id_number: string | null;
    phone_number: string | null;
    email: string | null;
    address?: {
      street_name: string | null;
      town: string | null;
      province: string | null;
      postal_code: string | null;
      country: string | null;
    } | null;
  }>;
  storage?: {
    id: string;
    storage_type: string | null;
    credit: string | null;
  } | null;
  loans?: Array<{
    id: string;
    firearm_cost: number | null;
    quote_number: string | null;
    loan_amount: number | null;
    duration: string | null;
    interest: string | null;
    remain_amount: number | null;
    deposit_amount: number | null;
    start_date: string;
    status: string | null;
    completed: boolean | null;
    invoice_number: string | null;
    customer?: {
      id: string;
      full_name: string | null;
      id_number: string | null;
      phone_number: string | null;
      email: string | null;
    } | null;
    loan_payment?: {
      id: string;
      payment_amount: string | null;
      payment_type: string | null;
      payment_date: string;
    } | null;
    penalty?: {
      id: string;
      penaltie_amount: string | null;
      date_applied: string | null;
      reason: string | null;
    } | null;
  }>;
};

export type StorageItemResponse = {
  id: string;
  storage_type: string | null;
  booked_in_date: string | null;
  booked_out_date: string | null;
  firearm?: {
    id: string;
    make_model: string | null;
    stock_number: string | null;
    serial_number: string | null;
    created_at: string;
    booked_out: boolean | null;
    booked_out_date: string | null;
  } | null;
  customer?: {
    id: string;
    full_name: string | null;
    id_number: string | null;
    phone_number: string | null;
    email: string | null;
  } | null;
  loan?: {
    id: string;
    quote_number: string | null;
    invoice_number: string | null;
    start_date: string;
    status: string | null;
  } | null;
};

export interface StorageEntry {
  id: string;
  storageType: string;
  bookedInDate: string | null;
  bookedOutDate: string | null;
  firearm: {
    id: string;
    makeModel: string;
    stockNumber: string;
    serialNumber: string;
    createdAt: string;
    bookedOut: boolean;
    bookedOutDate: string | null;
  } | null;
  customer: {
    id: string;
    name: string;
    idNumber: string;
    phoneNumber: string;
    email: string;
  } | null;
  loan: {
    id: string;
    quoteNumber: string | null;
    invoiceNumber: string | null;
    startDate: string;
    status: string | null;
  } | null;
}