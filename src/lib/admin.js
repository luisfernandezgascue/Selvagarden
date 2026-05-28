export const ADMIN_EMAILS = [
  'luis.fernandez@caribedigitalconsulting.com',
  'luisfernandez11zgz@gmail.com',
];

export const isAdmin = (customer) => ADMIN_EMAILS.includes(customer?.email);
