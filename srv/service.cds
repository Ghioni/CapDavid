using { app.db as my } from '../db/schema';

service appService{
   entity clientsTable as projection on my.client;
   entity ordersTable as projection on my.order;
}