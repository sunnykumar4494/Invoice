import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GetDataService {
   baseurl:string="https://sunnykumar4494.github.io/Invoice"
  // baseurl:string="http://localhost:4200"
  url: string = '/assets/MenuList.json';
  
  
  MenuList:any;
  constructor(private http: HttpClient) { 

  }
  getMenus(){
    return this.http.get(this.baseurl+this.url);
  }
  
}
