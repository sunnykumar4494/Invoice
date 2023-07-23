import { Component } from '@angular/core';
import { FlexLayoutModule, FlexOrderDirective } from '@angular/flex-layout';

import pdfMake from "pdfmake/build/pdfmake";
import {Order} from './Models/Business.model';
import pdfFonts from "pdfmake/build/vfs_fonts";
import { GetDataService } from './Service/get-data.service';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

class Product{
  name: string;
  price: number;
  qty: number;
}
class Invoice{
  customerName: string;
  address: string;
  contactNo: number;
  email: string;
  
  products: Product[] = [];
  additionalDetails: string;

  constructor(){
    // Initially one empty product row we will show 
    this.products.push(new Product());
  }
}
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  constructor(
    public _getDataService: GetDataService,
  ) { 
    this.getMenuList();
  }
  invoice = new Invoice(); 
  MenuList:any;
  MasterMenuList:any;
  _total:number=0;
  _discount:number=0;
  OrderList:Order[]=[];
  
  generatePDF(action = 'open') {
    let docDefinition = {
      content: [
        {
          text: 'ELECTRONIC SHOP',
          fontSize: 16,
          alignment: 'center',
          color: '#047886'
        },
        {
          text: 'INVOICE',
          fontSize: 20,
          bold: true,
          alignment: 'center',
          decoration: 'underline',
          color: 'skyblue'
        },
        {
          text: 'Customer Details',
          style: 'sectionHeader'
        },
        {
          columns: [
            [
              {
                text: this.invoice.customerName,
                bold:true
              },
              { text: this.invoice.address },
              { text: this.invoice.email },
              { text: this.invoice.contactNo }
            ],
            [
              {
                text: `Date: ${new Date().toLocaleString()}`,
                alignment: 'right'
              },
              { 
                text: `Bill No : ${((Math.random() *1000).toFixed(0))}`,
                alignment: 'right'
              }
            ]
          ]
        },
        {
          text: 'Order Details',
          style: 'sectionHeader'
        },
        {
          table: {
            headerRows: 1,
            widths: ['*', 'auto', 'auto', 'auto'],
            body: [
              ['Product', 'Price', 'Quantity', 'Amount'],
              ...this.invoice.products.map(p => ([p.name, p.price, p.qty, (p.price*p.qty).toFixed(2)])),
              [{text: 'Total Amount', colSpan: 3}, {}, {}, this.invoice.products.reduce((sum, p)=> sum + (p.qty * p.price), 0).toFixed(2)]
            ]
          }
        },
        {
          text: 'Additional Details',
          style: 'sectionHeader'
        },
        {
            text: this.invoice.additionalDetails,
            margin: [0, 0 ,0, 15]          
        },
        {
          columns: [
            [{ qr: `${this.invoice.customerName}`, fit: '50' }],
            [{ text: 'Signature', alignment: 'right', italics: true}],
          ]
        },
        {
          text: 'Terms and Conditions',
          style: 'sectionHeader'
        },
        {
            ul: [
              'Order can be return in max 10 days.',
              'Warrenty of the product will be subject to the manufacturer terms and conditions.',
              'This is system generated invoice.',
            ],
        }
      ],
      styles: {
        sectionHeader: {
          bold: true,
          decoration: 'underline',
          fontSize: 14,
          margin: [0, 15,0, 15]          
        }
      }
    };

    if(action==='download'){
      pdfMake.createPdf(docDefinition).download();
    }else if(action === 'print'){
      pdfMake.createPdf(docDefinition).print();      
    }else{
      pdfMake.createPdf(docDefinition).open();      
    }

  }
  applydiscount(discount){
    this._discount=parseInt(discount);
    this._total=this._total-this._discount;
  }
  AddItem(item){
    let _id="ItemQtyprice_"+item.Id;
    var _idqty='ItemQty_'+item.Id;
    let _itmqty:number=parseFloat((<HTMLInputElement>document.getElementById(_idqty)).value);//document.getElementById(_id).value;
    let _halfPrice=item.Price.filter(x=>x.Qty=="0.5")[0]?.Price;
    let _fullPrice=item.Price.filter(x=>x.Qty=="1")[0]?.Price;
    let _intplate=Math.floor(_itmqty* 10 /10);
    let _halfplate=_itmqty%1;
    let totalSum=0;
    if(_halfPrice==(null || undefined))
     totalSum=(_fullPrice*_intplate);
     else
     totalSum=(_halfPrice*1+_fullPrice*_intplate);
    (<HTMLInputElement>document.getElementById(_id)).innerText=totalSum.toLocaleString();
    //push item to OrderList
    this._total+=totalSum;
    this.OrderList.push({
      MenuID:item.Id,
      MenuName:item.Name,
      price:totalSum,
      qty:_itmqty
    })
  }
  addProduct(){
    this.invoice.products.push(new Product());
  }
  Add(item){
    var _id='ItemQty_'+item.Id;
    let _qty:number=parseFloat((<HTMLInputElement>document.getElementById(_id)).value);//document.getElementById(_id).value;
    let _halfPrice=item.Price.filter(x=>x.Qty=="0.5")[0]?.Price;
    if(_halfPrice==(null || undefined))
    (<HTMLInputElement>document.getElementById(_id)).value=(_qty+1).toLocaleString();
    else
    (<HTMLInputElement>document.getElementById(_id)).value=(_qty+0.5).toLocaleString();
  }
  Minus(item){
    var _id='ItemQty_'+item.Id;
    let _qty:number=parseFloat((<HTMLInputElement>document.getElementById(_id)).value);//document.getElementById(_id).value;
    // if(_qty==0){
    //   (<HTMLInputElement>document.getElementById(_id)).value='0';
    // }
    // else
    // {
    //   (<HTMLInputElement>document.getElementById(_id)).value=(_qty-0.5).toLocaleString();
    // }
    let _halfPrice=item.Price.filter(x=>x.Qty=="0.5")[0]?.Price;
    if(_halfPrice==(null || undefined))
    (<HTMLInputElement>document.getElementById(_id)).value=(_qty-1).toLocaleString();
    else
    (<HTMLInputElement>document.getElementById(_id)).value=(_qty-0.5).toLocaleString();
    if(_qty<0)
    {
      (<HTMLInputElement>document.getElementById(_id)).value=(0).toLocaleString();
    }
  
  }

  getMenuList(){
    this._getDataService.getMenus().subscribe(result=>{
      this.MenuList=result;
      this.MasterMenuList=result;
      console.log(this.MenuList)
    })
  }
  RemoveItem(i,order){
    this.OrderList.splice(i,1);
    this._total=this._total-order.price;
  }

  generateBill(){
    // playground requires you to assign document definition to a variable called dd
var _tableBody=[];
var date = new Date();
// get the date as a string
var n = date.toDateString();
// get the time as a string
var time = date.toLocaleTimeString();
var _header=[{text: 'Item', style: 'orderDetails'}, 
             {text: 'Qty', style: 'orderDetails'}, 
             {text: 'Price', style: 'orderDetails'}
            ];
            _tableBody.push(_header);
this.OrderList.forEach(element => {
  var a=[];
  a.push(element.MenuName);
  a.push(element.qty);
  a.push(element.price);
  _tableBody.push(a);
});
var ordrId=Math.floor(Math.random()*(999-100+1)+100);
var dd = {
	content: [
		{
			text: 'D Eatery',
			style: 'header',
			
		},
	    {
			text: 'Mansa Palace ,Gauriya Math \n   Mithapur Patna - 800001',
			style: 'subheader',
		},
		
	    {
			text: '---------------------------------------------------',
			style: 'subheader',
		},
		{
			style: 'oderdetail',
			table: {
				body: [
					['OrderId : '+ordrId,  'Date : '+n],
          ['               ',  'Time : '+time]
				]
			},
			layout: 'noBorders'
		},
	
		 {
			text: '-------------------------------------------------',
			style: 'subheader',
		},
		{
			style: 'tableExample',
			table: {
			    widths: [60, '*','*'],
				  body: _tableBody
			},
			layout: 'noBorders'
		},
		{
			text: '--------------------------------------------------',
			style: 'subheader',
		},
   
    {
			text: 'Discount  : '+this._discount,
			style: 'discount'
		},
		{
			text: 'Total : '+this._total,
			style: 'total',
		},
		{
			text: 'Thanks For Visiting',
			style: 'message',
		},
	],
	styles: {
		header: {
			fontSize: 12,
			bold: true,
			alignment: 'center',
			italics: true
		},
		subheader: {
			fontSize: 9,
			bold: false,
			alignment: 'center',
		},
		oderdetail:{
			fontSize: 7,
			bold: false 
		},
		total:{
		   fontSize: 9, 
		   alignment: 'right',
		   bold: true,
		   margin:[0,5,15,0]
		},
    discount:{
      fontSize: 9, 
		   alignment: 'right',
		   margin:[0,0,15,0]
    },
		orderDetails:{
		    	fontSize: 8,
			    bold: true
		},
		tableExample:{
		    fontSize: 8,
		},
		message:{
		    fontSize:7,
		    alignment: 'center',
		    italics: true,
		    margin:[0,2,0,0]
		},
		quote: {
			italics: true
		},
		small: {
			fontSize: 8
		}
	},
	
		pageSize: 'A8',
		pageMargins: [ 10, 20, 10, 10 ]
	
}
pdfMake.createPdf(dd).print();   
  }
  search(searchVal){
    this.MenuList=this.MasterMenuList.filter(x=>x.Name.toLocaleLowerCase().includes(searchVal.toLocaleLowerCase()));
  }
}
