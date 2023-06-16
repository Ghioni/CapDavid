using {sap} from '@sap/cds/common';
namespace app.db;

entity client{
    key Id      : Int16;
        name    : String(50);
        surname : String(50);
        address : String(50);
        cad     : Int16;
        city    : String(50);
        Country : String(50);
    key email   : String(50);
        password: String(50);
        orders  : Association to many order on orders.client =$self;
    
    
}

entity order{
    key Id          : Int16;
        orderDate   : Date;
        shippingDate: Date;
        product     : String(50);
        price       : Int16;  
        client      : Association to client;     
}

